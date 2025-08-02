import { Stack } from "expo-router";

export default function ShopsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Shops", headerShown: false }}
      />
      <Stack.Screen
        name="[shopId]"
        options={{
          title: "Loading...",
        }}
      />
    </Stack>
  );
}
