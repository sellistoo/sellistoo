import { Stack } from "expo-router";

export default function ManageProductsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Manage Products",
        }}
      />
      <Stack.Screen
        name="ProductUploadScreen"
        options={{
          title: "Upload Product",
        }}
      />
      <Stack.Screen
        name="ProductListScreen"
        options={{
          title: "Product List",
        }}
      />
    </Stack>
  );
}
