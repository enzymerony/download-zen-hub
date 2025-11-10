import { Link } from "react-router-dom";
import { ArrowRight, Check, Download, Shield, Zap, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import heroImage from "@/assets/hero-digital-services.png";

const Home = () => {
  const featuredProducts = products.filter(p => p.featured).slice(0, 10);
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-hero pt-6 md:pt-8 pb-12 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            {/* Left Content */}
            <div className="space-y-4 pl-6 md:pl-12">
              <h1 className="text-2xl md:text-4xl font-bold leading-tight">
                Digital Product Services
                <span className="text-gradient block mt-1">
                  For Daily Essential
                </span>
              </h1>
              
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                আমরা প্রদান করি সম্পূর্ণ ডিজিটাল সেবা যা আপনার দৈনন্দিন প্রয়োজন পূরণ করে। সিম অফার থেকে শুরু করে সোশ্যাল মিডিয়া সার্ভিস, ওয়েবসাইট এবং প্রফেশনাল সিভি - সব কিছুই পাবেন এক জায়গায়।
              </p>

              <div className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">আমাদের সেবাসমূহ:</h3>
                <ul className="space-y-1.5 text-xs md:text-sm">
                  <li className="flex items-start gap-1.5">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>যেকোনো সিমের ইন্টারনেট এবং মিনিট এর বান্ডেল প্যাকেজ ইত্যাদি।</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>ফেসবুক ফলোয়ার, লাইক, রিএকশন, কমেন্টস, শেয়ার ইত্যাদি।</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>YouTube subscriber, ওয়াচ টাইম, লাইক, কমেন্টস, শেয়ার।</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>টিকটক ফলোয়ার, লাইক, ভিউ ইত্যাদি।</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>ইনস্টাগ্রাম টেলিগ্রাম সহ সকল সোশ্যাল মিডিয়ার সকল সার্ভিস।</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>ওয়েবসাইটের যেকোনো দেশের ট্রাফিক সার্ভিস।</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>NID, E-Tin, জন্ম নিবন্ধন, Bkash/Nagad স্টেটমেন্ট ইত্যাদি।</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>নাম্বার বায়োমেট্রিক এবং IMEI সার্ভিস।</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>প্রফেশনাল সিভি তৈরি।</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/products">
                  <Button variant="hero" size="default" className="w-full sm:w-auto">
                    Browse Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/products?filter=featured">
                  <Button variant="outline" size="default" className="w-full sm:w-auto">
                    View Featured
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex justify-center items-center">
              <img 
                src={heroImage} 
                alt="Digital Services Illustration" 
                className="w-full max-w-md h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">ক্যাটাগরি</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse our services by category
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Top Selling Products */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <Flame className="h-8 w-8 text-orange-500" />
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Top Selling Product</h2>
                <p className="text-muted-foreground">Our most popular products</p>
              </div>
            </div>
            <Link to="/products">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-6">
            {featuredProducts.slice(0, 5).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {featuredProducts.slice(5, 10).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for your digital needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Delivery</h3>
                <p className="text-muted-foreground">
                  Get immediate access to your services with instant delivery and support.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Trusted</h3>
                <p className="text-muted-foreground">
                  All services are secure and reliable. Your satisfaction is our priority.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                <p className="text-muted-foreground">
                  Round-the-clock customer support to help you with any questions or issues.
                </p>
              </CardContent>
            </Card>
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
