import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getCart, getCartCount } from "@/lib/cart";
import { OrderTrackDialog } from "@/components/OrderTrackDialog";
import { categories } from "@/data/categories";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export const Header = () => {
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOrderTrackOpen, setIsOrderTrackOpen] = useState(false);

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
          <nav className="hidden md:flex items-center space-x-0.5">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary px-3 py-2">
              HOME
            </Link>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium h-auto py-2 px-3">
                    OUR SHOP
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[600px] p-4">
                      <div className="grid grid-cols-2 gap-4">
                        {categories.map((category) => (
                          <div key={category.id} className="space-y-2">
                            <Link 
                              to={`/products?category=${category.id}`}
                              className="font-semibold text-sm hover:text-primary block"
                            >
                              {category.name}
                            </Link>
                            {category.subcategories && (
                              <ul className="space-y-1 pl-3">
                                {category.subcategories.map((sub) => (
                                  <li key={sub}>
                                    <Link
                                      to={`/products?category=${category.id}&subcategory=${sub}`}
                                      className="text-sm text-muted-foreground hover:text-primary block"
                                    >
                                      {sub}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <Link to="/blog" className="text-sm font-medium transition-colors hover:text-primary px-3 py-2">
              BLOG
            </Link>
            
            <button 
              onClick={() => setIsOrderTrackOpen(true)}
              className="text-sm font-medium transition-colors hover:text-primary px-3 py-2 text-[hsl(30,100%,50%)]"
            >
              ORDER TRACK
            </button>
            
            <Link to="/about" className="text-sm font-medium transition-colors hover:text-primary px-3 py-2">
              ABOUT
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
              to="/" 
              className="block text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              HOME
            </Link>
            <Link 
              to="/products" 
              className="block text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              OUR SHOP
            </Link>
            <Link 
              to="/blog" 
              className="block text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              BLOG
            </Link>
            <button 
              onClick={() => {
                setIsOrderTrackOpen(true);
                setIsMenuOpen(false);
              }}
              className="block text-sm font-medium transition-colors hover:text-primary text-[hsl(30,100%,50%)]"
            >
              ORDER TRACK
            </button>
            <Link 
              to="/about" 
              className="block text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              ABOUT
            </Link>
          </div>
        )}
      </div>
      
      <OrderTrackDialog open={isOrderTrackOpen} onOpenChange={setIsOrderTrackOpen} />
    </header>
  );
};
