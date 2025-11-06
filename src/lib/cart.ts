import { Product } from "@/types/product";
import { CartItem } from "@/types/product";

const CART_STORAGE_KEY = "10ana-cart";

export const getCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const cart = localStorage.getItem(CART_STORAGE_KEY);
  return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart: CartItem[]) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
};

export const addToCart = (product: Product) => {
  const cart = getCart();
  const existingItem = cart.find(item => item.product.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ product, quantity: 1 });
  }
  
  saveCart(cart);
};

export const removeFromCart = (productId: string) => {
  const cart = getCart();
  const updatedCart = cart.filter(item => item.product.id !== productId);
  saveCart(updatedCart);
};

export const updateQuantity = (productId: string, quantity: number) => {
  const cart = getCart();
  const item = cart.find(item => item.product.id === productId);
  
  if (item) {
    item.quantity = Math.max(1, quantity);
    saveCart(cart);
  }
};

export const clearCart = () => {
  saveCart([]);
};

export const getCartTotal = (cart: CartItem[]): number => {
  return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};

export const getCartCount = (cart: CartItem[]): number => {
  return cart.reduce((count, item) => count + item.quantity, 0);
};
