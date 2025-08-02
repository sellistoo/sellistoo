import { Stack } from "expo-router";

export default function checkoutLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Checkout", headerShown: false }}
      />
    </Stack>
  );
}
