import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Profile", headerShown: false }}
      />
      <Stack.Screen
        name="address/index"
        options={{ title: "Manage Addresses" }}
      />
      <Stack.Screen name="orders/index" options={{ title: "Orders" }} />
      <Stack.Screen name="favorites/index" options={{ title: "Favorites" }} />
      <Stack.Screen
        name="seller-dashboard/index"
        options={{ title: "Seller Dashboard" }}
      />

      {/* Remove this: */}
      {/* 
      <Stack.Screen
        name="seller-dashboard/manage-products/index"
        options={{ title: "Manage Products", headerShown: true }}
      />
      */}

      {/* ✅ Instead, disable header at the parent level: */}
      <Stack.Screen
        name="seller-dashboard/manage-products"
        options={{ headerShown: true }}
      />
    </Stack>
  );
}
