import { Stack } from "expo-router";
export default function SellerOrdersLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Orders",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
