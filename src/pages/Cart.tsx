import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCart, removeFromCart, updateQuantity, getCartTotal, clearCart } from "@/lib/cart";
import { CartItem } from "@/types/product";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { supabase } from "@/integrations/supabase/client";

const Cart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [instructions, setInstructions] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const { balance, refetch } = useWallet();
  const navigate = useNavigate();

  const handleInstructionsChange = (productId: string, value: string) => {
    setInstructions(prev => ({ ...prev, [productId]: value }));
  };

  useEffect(() => {
    const updateCart = () => setCart(getCart());
    updateCart();
    window.addEventListener("cart-updated", updateCart);
    return () => window.removeEventListener("cart-updated", updateCart);
  }, []);

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
    toast.success("Item removed from cart");
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared");
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/auth");
      return;
    }

    if (balance < total) {
      toast.error("Insufficient balance. Please top up first.");
      navigate("/topup");
      return;
    }

    setIsCheckingOut(true);

    try {
      // Process each item in cart
      for (const item of cart) {
        const { data, error } = await supabase.rpc('deduct_balance', {
          p_user_id: user.id,
          p_amount: item.product.price * item.quantity,
          p_product_id: item.product.id,
          p_product_title: item.product.title,
          p_customer_instructions: instructions[item.product.id] || null
        });

        if (error || !data) {
          throw new Error(`Failed to process ${item.product.title}`);
        }
      }

      clearCart();
      refetch();
      toast.success("Order completed successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Checkout failed");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const subtotal = getCartTotal(cart);
  const total = subtotal;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Discover amazing digital products to get started
          </p>
          <Link to="/products">
            <Button size="lg">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Link to="/products" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Continue Shopping
        </Link>

        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.product.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product.id}`}>
                        <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors">
                          {item.product.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.product.shortDescription}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xl font-bold">
                            ৳{(item.product.price * item.quantity).toFixed(0)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {/* Order Instructions Input */}
                      <div className="mt-4 pt-4 border-t border-dashed border-primary/30">
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          📝 অর্ডার ইন্সট্রাকশন / লিংক পেস্ট করুন
                        </label>
                        <Textarea
                          placeholder="এখানে আপনার অর্ডার ইন্সট্রাকশন লিখুন অথবা লিংক পেস্ট করুন (যেমন: আপনার Facebook প্রোফাইল লিংক)"
                          value={instructions[item.product.id] || ''}
                          onChange={(e) => handleInstructionsChange(item.product.id, e.target.value)}
                          className="min-h-[80px] text-base border-2 border-primary/20 focus:border-primary bg-primary/5 placeholder:text-muted-foreground/70"
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground mt-1.5">
                          ⚡ টিপ: যদি কোনো লিংক পেস্ট করেন, সেটি অটোমেটিক ক্লিকযোগ্য হয়ে যাবে
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" onClick={handleClearCart}>
              Clear Cart
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>৳{total.toFixed(0)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Input placeholder="Coupon code" />
                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Proceed to Checkout"
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Secure checkout • Instant download
                  </p>
                </div>

                <Separator className="my-6" />

                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Instant access after payment</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Commercial license included</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Free lifetime updates</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
