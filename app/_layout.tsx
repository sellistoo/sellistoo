import { CartProvider } from "@/hooks/useCart";
import { useColorScheme } from "@/hooks/useColorScheme";
import { FavoritesProvider } from "@/hooks/useFavorites";
import { FeaturedCategoriesProvider } from "@/hooks/useFeaturedCategories";
import { UserInfoProvider } from "@/hooks/useUserInfo";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <UserInfoProvider>
          <FeaturedCategoriesProvider>
            <CartProvider>
              <FavoritesProvider>
                <Slot />
                <StatusBar style="auto" />
                <Toast />
              </FavoritesProvider>
            </CartProvider>
          </FeaturedCategoriesProvider>
        </UserInfoProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
