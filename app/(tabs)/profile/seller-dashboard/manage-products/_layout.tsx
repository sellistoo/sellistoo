import { Stack } from "expo-router";

export default function SellerDashboardLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="seller-dashboard/manage-products/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="manage-products"
        options={{ title: "Manage Products" }}
      />
    </Stack>
  );
}
