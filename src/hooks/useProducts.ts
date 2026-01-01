import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

interface DBProduct {
  id: string;
  title: string;
  description: string | null;
  short_description: string | null;
  price: number;
  original_price: number | null;
  category: string;
  subcategory: string | null;
  tags: string[] | null;
  rating: number | null;
  review_count: number | null;
  image_url: string | null;
  featured: boolean | null;
  badge: string | null;
  what_included: string[] | null;
  features: string[] | null;
  compatibility: string[] | null;
  version: string | null;
  last_update: string | null;
  file_format: string[] | null;
  requirements: string[] | null;
  created_at: string;
  updated_at: string;
}

// Convert database product to frontend Product type
const mapDBProductToProduct = (dbProduct: DBProduct): Product => ({
  id: dbProduct.id,
  title: dbProduct.title,
  description: dbProduct.description || '',
  shortDescription: dbProduct.short_description || '',
  price: Number(dbProduct.price),
  originalPrice: dbProduct.original_price ? Number(dbProduct.original_price) : undefined,
  category: dbProduct.category,
  subcategory: dbProduct.subcategory || undefined,
  tags: dbProduct.tags || [],
  rating: dbProduct.rating ? Number(dbProduct.rating) : 5,
  reviewCount: dbProduct.review_count || 0,
  images: dbProduct.image_url ? [dbProduct.image_url] : ['/placeholder.svg'],
  featured: dbProduct.featured || false,
  badge: dbProduct.badge as Product['badge'],
  whatIncluded: dbProduct.what_included || undefined,
  features: dbProduct.features || undefined,
  compatibility: dbProduct.compatibility || undefined,
  version: dbProduct.version || undefined,
  lastUpdate: dbProduct.last_update || undefined,
  fileFormat: dbProduct.file_format || undefined,
  requirements: dbProduct.requirements || undefined,
});

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      if (import.meta.env.DEV) {
        console.error('Error fetching products:', fetchError);
      }
      setError('Failed to load products');
      setProducts([]);
    } else {
      setProducts((data || []).map(mapDBProductToProduct));
    }

    setLoading(false);
  };

  const refetch = () => {
    fetchProducts();
  };

  return { products, loading, error, refetch };
}

export function useProductsByCategory(category: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching products by category:', error);
        }
        setProducts([]);
      } else {
        setProducts((data || []).map(mapDBProductToProduct));
      }

      setLoading(false);
    };

    fetchProducts();
  }, [category]);

  return { products, loading };
}

export function useFeaturedProducts(limit = 10) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching featured products:', error);
        }
        setProducts([]);
      } else {
        setProducts((data || []).map(mapDBProductToProduct));
      }

      setLoading(false);
    };

    fetchProducts();
  }, [limit]);

  return { products, loading };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) {
        if (import.meta.env.DEV) {
          console.error('Error fetching product:', fetchError);
        }
        setError('Failed to load product');
        setProduct(null);
      } else if (data) {
        setProduct(mapDBProductToProduct(data));
      } else {
        setError('Product not found');
        setProduct(null);
      }

      setLoading(false);
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return { product, loading, error };
}
