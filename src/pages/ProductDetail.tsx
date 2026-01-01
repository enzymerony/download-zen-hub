import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Check, Download, Shield, ShoppingCart, Star, Facebook, Twitter, Linkedin, Share2, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { products as staticProducts } from "@/data/products";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";
import { ProductCard } from "@/components/ProductCard";
import { BuyNowButton } from "@/components/BuyNowButton";
import { useState } from "react";

const ProductDetail = () => {
  const { id } = useParams();
  const { product: dbProduct, loading, error } = useProduct(id || '');
  const { products: allDbProducts } = useProducts();
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  // Try database first, then fallback to static
  const staticProduct = staticProducts.find((p) => p.id === id);
  const product = dbProduct || staticProduct;
  
  // For related products, use DB products if available
  const allProducts = allDbProducts.length > 0 ? allDbProducts : staticProducts;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.title} added to cart`);
  };

  const handleSubmitReview = () => {
    if (!reviewText.trim()) {
      toast.error("Please write a review");
      return;
    }
    toast.success("Review submitted successfully!");
    setReviewText("");
    setRating(5);
  };

  const shareUrl = window.location.href;
  const shareTitle = product.title;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link to="/products" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>

        {/* Product Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Gallery */}
          <div>
            <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-4">
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.slice(1).map((image, index) => (
                <div key={index} className="aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer hover-lift">
                  <img
                    src={image}
                    alt={`${product.title} ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {product.badge && (
                <Badge variant={product.badge === "sale" ? "destructive" : "default"} className="capitalize">
                  {product.badge}
                </Badge>
              )}
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium ml-1">{product.rating}</span>
                <span className="text-sm text-muted-foreground ml-1">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{product.shortDescription}</p>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-4xl font-bold">৳{product.price}</span>
              {product.originalPrice && (
                <span className="text-2xl text-muted-foreground line-through">
                  ৳{product.originalPrice}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <BuyNowButton 
                productId={product.id} 
                productTitle={product.title} 
                price={product.price} 
                className="w-full"
              />
              <Button size="lg" variant="outline" className="w-full" onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span>Instant download after purchase</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Commercial license included</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-muted-foreground" />
                <span>Free lifetime updates</span>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-2 text-sm">
              {product.version && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">{product.version}</span>
                </div>
              )}
              {product.lastUpdate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Update</span>
                  <span className="font-medium">
                    {new Date(product.lastUpdate).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{product.category}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Reviews */}
        <div className="mb-12 space-y-4">
          <Accordion type="single" collapsible defaultValue="description" className="w-full">
            <AccordionItem value="description">
              <AccordionTrigger className="text-xl font-semibold">Description</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>
                    
                    {product.features && product.features.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold mb-3">Key Features:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {product.features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.whatIncluded && product.whatIncluded.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">What's Included:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {product.whatIncluded.map((item, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="reviews">
              <AccordionTrigger className="text-xl font-semibold">
                Reviews ({product.reviewCount})
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="p-6">
                    {/* Submit Review */}
                    <div className="mb-8">
                      <h3 className="font-semibold mb-4">Write a Review</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Your Rating</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-colors"
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    star <= rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Your Review</label>
                          <Textarea
                            placeholder="Share your experience with this product..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <Button onClick={handleSubmitReview}>Submit Review</Button>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Sample Reviews */}
                    <div className="space-y-6">
                      <h3 className="font-semibold">Customer Reviews</h3>
                      <div className="space-y-4">
                        <div className="border-b pb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <span className="text-sm font-medium">Excellent Product!</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Great quality and fast delivery. Highly recommended!
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">- Customer</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Social Share */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Share:</h3>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank')}
              >
                <Twitter className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}
              >
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareTitle)}`, '_blank')}
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(`https://telegram.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank')}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
