import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { Category } from "@/data/categories";
import { Link } from "react-router-dom";

// Import category icons
import simOfferIcon from "@/assets/categories/sim-offer.png";
import socialMediaIcon from "@/assets/categories/social-media.png";
import websiteServicesIcon from "@/assets/categories/website-services.png";
import smartCvIcon from "@/assets/categories/smart-cv.png";
import digitalServicesIcon from "@/assets/categories/digital-services.png";

const iconMap: Record<string, string> = {
  "sim-offer.png": simOfferIcon,
  "social-media.png": socialMediaIcon,
  "website-services.png": websiteServicesIcon,
  "smart-cv.png": smartCvIcon,
  "digital-services.png": digitalServicesIcon,
};

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const iconPath = iconMap[category.icon];
  
  const handleClick = () => {
    if (category.subcategories) {
      setIsExpanded(!isExpanded);
    }
  };

  const cardContent = (
    <CardContent 
      className="p-3 text-center"
      onClick={handleClick}
    >
      <div className="mb-2 flex justify-center">
        <div className="relative">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-muted/50 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <img
              src={iconPath}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      
      <h3 className="text-xs md:text-sm font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
        {category.name}
      </h3>
      
      {category.subcategories && (
        <>
          <div className="flex items-center justify-center gap-0.5 text-[10px] md:text-xs text-muted-foreground">
            <span>{category.subcategories.length}</span>
            <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
          
          {isExpanded && (
            <div className="mt-2 pt-2 border-t animate-fade-in">
              <div className="flex flex-wrap gap-1 justify-center">
                {category.subcategories.map((sub, index) => (
                  <Link
                    key={index}
                    to={`/products?category=${category.id}&subcategory=${encodeURIComponent(sub)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center px-2 py-1 rounded-full text-[10px] md:text-xs font-semibold 
                      bg-gradient-to-r from-primary/10 to-primary/20 
                      text-primary border border-primary/30
                      hover:from-primary hover:to-primary hover:text-primary-foreground
                      transition-all duration-300 hover:scale-105 hover:shadow-lg
                      cursor-pointer"
                  >
                    {sub}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </CardContent>
  );

  if (category.id === "pdf-to-image" || category.id === "ai-photo-enhancer" || category.id === "remove-watermark") {
    const route = category.id === "pdf-to-image" ? "/pdf-to-image" : category.id === "remove-watermark" ? "/remove-watermark" : "/ai-photo-enhancer";
    return (
      <Link to={route}>
        <Card className="group hover-lift cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl border-2">
          {cardContent}
        </Card>
      </Link>
    );
  }

  return (
    <Card className="group hover-lift cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl border-2">
      {cardContent}
    </Card>
  );
};
