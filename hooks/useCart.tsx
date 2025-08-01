import api from "@/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useUserInfo } from "./useUserInfo";

interface Variant {
  size?: string;
  color?: string;
}

export interface CartItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  sku: string;
  variant?: Variant;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, sku: string) => void;
  clearCart: () => void;
  updateQuantity: (productId: string, sku: string, quantity: number) => void;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  updateQuantity: () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { userInfo } = useUserInfo();
  const userId = userInfo?.id;
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const fetchCart = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/cart/${userId}`);
      const formatted: CartItem[] = res.data.map((item: any) => ({
        product: item.product._id || item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        sku: item.sku,
        variant: item.variant,
      }));
      setCartItems(formatted);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (item: CartItem) => {
      if (!userId || item.quantity < 1) return;
      try {
        const payload = {
          productId: item.product,
          quantity: item.quantity,
          image: item.image,
          price: item.price,
          sku: item.sku,
          variant: item.variant,
        };

        await api.post(`/cart/${userId}/add`, payload);

        setCartItems((prev) => {
          const match = prev.find(
            (ci) => ci.product === item.product && ci.sku === item.sku
          );
          if (match) {
            return prev.map((ci) =>
              ci.product === item.product && ci.sku === item.sku
                ? { ...ci, quantity: ci.quantity + item.quantity }
                : ci
            );
          }
          return [...prev, item];
        });
      } catch (err) {
        console.error("Failed to add to cart", err);
      }
    },
    [userId]
  );

  const updateQuantity = useCallback(
    async (productId: string, sku: string, quantity: number) => {
      if (!userId || quantity < 1) return;
      try {
        await api.post(`/cart/${userId}/update`, { productId, sku, quantity });
        setCartItems((prev) =>
          prev.map((item) =>
            item.product === productId && item.sku === sku
              ? { ...item, quantity }
              : item
          )
        );
      } catch (err) {
        console.error("Failed to update quantity", err);
      }
    },
    [userId]
  );

  const removeFromCart = useCallback(
    async (productId: string, sku: string) => {
      if (!userId) return;
      try {
        await api.post(`/cart/${userId}/remove`, { productId, sku });
        setCartItems((prev) =>
          prev.filter(
            (item) => !(item.product === productId && item.sku === sku)
          )
        );
      } catch (err) {
        console.error("Failed to remove from cart", err);
      }
    },
    [userId]
  );

  const clearCart = useCallback(async () => {
    if (!userId) return;
    try {
      await api.delete(`/cart/${userId}/clear`);
      setCartItems([]);
    } catch (err) {
      console.error("Failed to clear cart", err);
    }
  }, [userId]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
