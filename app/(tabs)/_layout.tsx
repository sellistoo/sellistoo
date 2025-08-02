import { Tabs } from "expo-router";
import React from "react";
import { Platform, Text, View } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useCart } from "@/hooks/useCart"; // ✅ import hook
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { cartItems } = useCart(); // ✅ get cart items

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="house.fill" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="SearchScreen"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="magnifyingglass" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shops"
        options={{
          title: "Shops",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="bag.fill" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="CartScreen"
        options={{
          title: "Cart",
          tabBarIcon: ({ color }) => (
            <View>
              <IconSymbol name="cart.fill" size={28} color={color} />
              {totalCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -10,
                    backgroundColor: "red",
                    borderRadius: 8,
                    paddingHorizontal: 5,
                    minWidth: 16,
                    height: 16,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 10, fontWeight: "bold" }}
                  >
                    {totalCount > 99 ? "99+" : totalCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person.fill" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="checkout"
        options={{
          // Hide from tab bar (not shown as a tab), but still routable.
          href: null,
          // optionally: headerShown: false, etc.
        }}
      />
      <Tabs.Screen
        name="product/[id]" // The dynamic route filename: product/[id].tsx
        options={{
          href: null, // Hidden from tab bar, still routable!
          // Optionally: headerShown: false,
        }}
      />
    </Tabs>
  );
}
