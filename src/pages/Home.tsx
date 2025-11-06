import { Link } from "react-router-dom";
import { ArrowRight, Check, Download, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";

const Home = () => {
  const featuredProducts = products.filter(p => p.featured).slice(0, 6);
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Premium Digital Products
              <span className="text-gradient block mt-2">
                For Modern Creators
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover high-quality UI kits, templates, and design resources to accelerate your next project. 
              Instant downloads with commercial licenses included.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button variant="hero" size="lg" className="w-full sm:w-auto">
                  Browse Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/products?filter=featured">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Featured
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            <div className="text-2xl font-bold">Stripe</div>
            <div className="text-2xl font-bold">Figma</div>
            <div className="text-2xl font-bold">React</div>
            <div className="text-2xl font-bold">TypeScript</div>
            <div className="text-2xl font-bold">Tailwind</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build amazing digital products
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Downloads</h3>
                <p className="text-muted-foreground">
                  Get immediate access to your purchases with secure download links and license keys.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Commercial License</h3>
                <p className="text-muted-foreground">
                  All products include a commercial license. Use them in unlimited client and personal projects.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Free Updates</h3>
                <p className="text-muted-foreground">
                  Receive free updates and improvements for the lifetime of the product you purchased.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Our most popular digital products</p>
            </div>
            <Link to="/products">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
              <p className="text-xl text-muted-foreground">
                Premium quality at an affordable price
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Instant downloads after purchase",
                "Commercial license included",
                "Free lifetime updates",
                "Professional documentation",
                "Regular new releases",
                "Priority support available",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-success" />
                  </div>
                  <span className="text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Building?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Browse our collection of premium digital products and take your projects to the next level.
            </p>
            <Link to="/products">
              <Button variant="secondary" size="lg">
                Explore Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
