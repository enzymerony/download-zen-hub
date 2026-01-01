import { Star } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface FilterOptions {
  priceRange: [number, number];
  minRating: number;
  selectedCategory: string;
}

interface ProductFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: Array<{ id: string; name: string; count: number }>;
  maxPrice: number;
}

export const ProductFilters = ({
  filters,
  onFiltersChange,
  categories,
  maxPrice,
}: ProductFiltersProps) => {
  const handlePriceChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({ ...filters, minRating: rating });
  };

  const handleCategoryChange = (categoryId: string) => {
    onFiltersChange({ ...filters, selectedCategory: categoryId });
  };

  const handleReset = () => {
    onFiltersChange({
      priceRange: [0, maxPrice],
      minRating: 0,
      selectedCategory: "all",
    });
  };

  const ratingOptions = [
    { value: 0, label: "All Ratings" },
    { value: 4, label: "4+ Stars" },
    { value: 4.5, label: "4.5+ Stars" },
    { value: 4.8, label: "4.8+ Stars" },
  ];

  return (
    <Card className="sticky top-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Filters</CardTitle>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Price Range</Label>
          <div className="space-y-3">
            <Slider
              min={0}
              max={maxPrice}
              step={10}
              value={filters.priceRange}
              onValueChange={handlePriceChange}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>৳{filters.priceRange[0]}</span>
              <span>৳{filters.priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Rating Filter */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Minimum Rating</Label>
          <div className="space-y-2">
            {ratingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleRatingChange(option.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-colors ${
                  filters.minRating === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted"
                }`}
              >
                <span className="text-sm">{option.label}</span>
                {option.value > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{option.value}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Categories</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={filters.selectedCategory === category.id ? "default" : "outline"}
                className="cursor-pointer hover-lift"
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
