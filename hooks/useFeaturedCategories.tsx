// hooks/useFeaturedCategories.tsx
import api from "@/api";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface ICategory {
  _id: string;
  googleId: number;
  name: string;
  fullPath: string;
  parent?: string | null;
  level: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeaturedCategoriesContextType {
  featuredCategories: ICategory[];
  loading: boolean;
  error: string | null;
}

const FeaturedCategoriesContext = createContext<FeaturedCategoriesContextType>({
  featuredCategories: [],
  loading: true,
  error: null,
});

export const FeaturedCategoriesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [featuredCategories, setFeaturedCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/allcategories/featured");
        setFeaturedCategories(response.data || []);
      } catch (err) {
        setError("Failed to fetch featured categories.");
        setFeaturedCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedCategories();
  }, []);

  return (
    <FeaturedCategoriesContext.Provider
      value={{ featuredCategories, loading, error }}
    >
      {children}
    </FeaturedCategoriesContext.Provider>
  );
};

// Use this hook to consume the featured categories anywhere in your app
export const useFeaturedCategories = () =>
  useContext(FeaturedCategoriesContext);
