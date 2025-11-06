import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Check, Download, Shield, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { products } from "@/data/products";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";
import { ProductCard } from "@/components/ProductCard";

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);

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

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.title} added to cart`);
  };

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
              <span className="text-4xl font-bold">${product.price}</span>
              {product.originalPrice && (
                <span className="text-2xl text-muted-foreground line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>

            <Button size="lg" className="w-full mb-4" onClick={handleAddToCart}>
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>

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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">{product.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Update</span>
                <span className="font-medium">
                  {new Date(product.lastUpdate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{product.category}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Tabs */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <Tabs defaultValue="description">
              <TabsList className="mb-6">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="includes">What's Included</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </TabsContent>

              <TabsContent value="includes">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.whatIncluded.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="features">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="requirements">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">System Requirements</h3>
                    <ul className="space-y-2">
                      {product.requirements.map((req, index) => (
                        <li key={index} className="text-muted-foreground">• {req}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Compatibility</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.compatibility.map((item, index) => (
                        <Badge key={index} variant="secondary">{item}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">File Formats</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.fileFormat.map((format, index) => (
                        <Badge key={index} variant="outline">{format}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
