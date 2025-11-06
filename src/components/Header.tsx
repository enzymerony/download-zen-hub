import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getCart, getCartCount } from "@/lib/cart";

export const Header = () => {
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = getCart();
      setCartCount(getCartCount(cart));
    };

    updateCartCount();
    window.addEventListener("cart-updated", updateCartCount);
    return () => window.removeEventListener("cart-updated", updateCartCount);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary" />
            <span className="text-xl font-bold">10 ANA Digital</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="text-sm font-medium transition-colors hover:text-primary">
              Products
            </Link>
            <Link to="/products?filter=featured" className="text-sm font-medium transition-colors hover:text-primary">
              Featured
            </Link>
            <Link to="/products" className="text-sm font-medium transition-colors hover:text-primary">
              Categories
            </Link>
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center">
              <Input
                type="search"
                placeholder="Search products..."
                className="w-64"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t">
            <Link 
              to="/products" 
              className="block text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link 
              to="/products?filter=featured" 
              className="block text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Featured
            </Link>
            <Link 
              to="/products" 
              className="block text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Categories
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
