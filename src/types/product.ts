export interface Product {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  images: string[];
  featured?: boolean;
  badge?: 'new' | 'bestseller' | 'sale';
  whatIncluded?: string[];
  features?: string[];
  compatibility?: string[];
  version?: string;
  lastUpdate?: string;
  fileFormat?: string[];
  requirements?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
