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

interface FavoritesContextType {
  favorites: string[];
  isFavorite: (productId: string) => boolean;
  addToFavorites: (productId: string) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  refreshFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isFavorite: () => false,
  addToFavorites: async () => {},
  removeFromFavorites: async () => {},
  refreshFavorites: () => {},
});

export const FavoritesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { userInfo } = useUserInfo();
  const userId = userInfo?.id;
  const [favorites, setFavorites] = useState<string[]>([]);

  const refreshFavorites = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/wishlist/${userId}`);
      const ids = res.data.map((p: any) => p._id || p.id);
      setFavorites(ids);
    } catch {
      setFavorites([]);
    }
  }, [userId]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const addToFavorites = useCallback(
    async (productId: string) => {
      if (!userId) return;
      try {
        await api.post(`/wishlist/${userId}/add`, { productId });
        setFavorites((prev) => [...new Set([...prev, productId])]);
        Toast.show({
          type: "success",
          text1: "Added to Favorites",
          text2: "The product was added to your favorites",
        });
      } catch (err) {
        console.error("Failed to add to wishlist", err);
        Toast.show({
          type: "error",
          text1: "Failed to add favorite",
          text2: "Please try again later",
        });
      }
    },
    [userId]
  );

  const removeFromFavorites = useCallback(
    async (productId: string) => {
      if (!userId) return;
      try {
        await api.post(`/wishlist/${userId}/remove`, { productId });
        setFavorites((prev) => prev.filter((id) => id !== productId));
        Toast.show({
          type: "success",
          text1: "Removed from Favorites",
          text2: "The product was removed from your favorites",
        });
      } catch (err) {
        console.error("Failed to remove from wishlist", err);
        Toast.show({
          type: "error",
          text1: "Failed to remove favorite",
          text2: "Please try again later",
        });
      }
    },
    [userId]
  );

  const isFavorite = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        addToFavorites,
        removeFromFavorites,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
