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
      className="p-6 text-center"
      onClick={handleClick}
    >
      <div className="mb-4 flex justify-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-2xl overflow-hidden bg-muted/50 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <img
              src={iconPath}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
        {category.name}
      </h3>
      
      {category.subcategories && (
        <>
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <span>{category.subcategories.length} subcategories</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
          
          {isExpanded && (
            <div className="mt-4 pt-4 border-t animate-fade-in">
              <div className="space-y-2">
                {category.subcategories.map((sub, index) => (
                  <div
                    key={index}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors py-1 px-2 rounded hover:bg-muted/50"
                  >
                    {sub}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </CardContent>
  );

  if (category.id === "pdf-to-image") {
    return (
      <Link to="/pdf-to-image">
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
