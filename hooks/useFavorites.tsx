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
  favoriteProducts: any[];
  isFavorite: (productId: string) => boolean;
  addToFavorites: (productId: string) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  refreshFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  favoriteProducts: [],
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
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);

  const refreshFavorites = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await api.get(`/wishlist/${userId}`);
      const ids = res.data.map((p: any) => p._id || p.id);
      setFavorites(ids);
      if (ids.length > 0) {
        try {
          const products = await Promise.all(
            ids.map((id: any) =>
              api.get(`/product/${id}`).then((res) => res.data)
            )
          );
          setFavoriteProducts(products);
        } catch (error) {
          console.error("Failed to load favorite products", error);
          setFavoriteProducts([]);
        }
      } else {
        setFavoriteProducts([]);
      }
    } catch (err) {
      console.error("Failed to refresh favorites", err);
      setFavorites([]);
      setFavoriteProducts([]);
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
        refreshFavorites(); // Refresh product details
      } catch (err) {
        console.error("Failed to add to wishlist", err);
        Toast.show({
          type: "error",
          text1: "Failed to add favorite",
          text2: "Please try again later",
        });
      }
    },
    [userId, refreshFavorites]
  );

  const removeFromFavorites = useCallback(
    async (productId: string) => {
      if (!userId) return;
      try {
        await api.post(`/wishlist/${userId}/remove`, {
          productId,
        });
        Toast.show({
          type: "success",
          text1: "Removed from Favorites",
          text2: "The product was removed from your favorites",
        });

        await refreshFavorites(); // ✅ full sync from backend
      } catch (err) {
        console.error("Failed to remove from wishlist", err);
        Toast.show({
          type: "error",
          text1: "Failed to remove favorite",
          text2: "Please try again later",
        });
      }
    },
    [userId, refreshFavorites]
  );

  const isFavorite = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteProducts,
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
