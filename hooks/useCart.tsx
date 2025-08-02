import api from "@/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Toast from "react-native-toast-message";
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
        Toast.show({
          type: "success",
          text1: "Added to cart",
          text2: `${item.name} added successfully.`,
        });
      } catch (err) {
        console.error("Failed to add to cart", err);
        Toast.show({
          type: "error",
          text1: "Add to cart failed",
          text2: "Please try again later.",
        });
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
        Toast.show({
          type: "success",
          text1: "Quantity updated",
          text2: `Quantity updated to ${quantity}.`,
        });
      } catch (err) {
        console.error("Failed to update quantity", err);
        Toast.show({
          type: "error",
          text1: "Update failed",
          text2: "Unable to update quantity, please try again.",
        });
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
        Toast.show({
          type: "success",
          text1: "Removed from cart",
          text2: `Item removed from cart.`,
        });
      } catch (err) {
        console.error("Failed to remove from cart", err);
        Toast.show({
          type: "error",
          text1: "Remove failed",
          text2: "Unable to remove item, please try again.",
        });
      }
    },
    [userId]
  );

  const clearCart = useCallback(async () => {
    if (!userId) return;
    try {
      await api.delete(`/cart/${userId}/clear`);
      setCartItems([]);
      Toast.show({
        type: "success",
        text1: "Cart cleared",
        text2: "All items removed from the cart.",
      });
    } catch (err) {
      console.error("Failed to clear cart", err);
      Toast.show({
        type: "error",
        text1: "Clear cart failed",
        text2: "Please try again later.",
      });
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
