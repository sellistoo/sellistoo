import { Colors } from "@/constants/Colors";
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const dummyShops = [
  {
    _id: "shop1",
    storeName: "Gadget Zone",
    storeLogoUrl: "https://m.media-amazon.com/images/I/51DdbpI9HoL._SX679_.jpg",
    storeDescription: "Best deals on electronics, gadgets, and accessories.",
  },
  {
    _id: "shop2",
    storeName: "Fashion Fiesta",
    storeLogoUrl: "",
    storeDescription: "Trendy fashion wear for all seasons and all ages.",
  },
  {
    _id: "shop3",
    storeName: "Book Hub",
    storeLogoUrl: "",
    storeDescription: "Explore bestsellers, classics, and academic books.",
  },
  {
    _id: "shop4",
    storeName: "Home Essentials",
    storeLogoUrl: "",
    storeDescription: "Kitchenware, storage, decor & daily use items.",
  },
];

export default function ShopsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const renderItem = ({ item }: { item: (typeof dummyShops)[0] }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.cardBg, borderColor: theme.border },
      ]}
      onPress={() => {
        console.log("Pressed:", item.storeName);
      }}
    >
      <View style={styles.logoContainer}>
        <Image
          source={{
            uri:
              item.storeLogoUrl ||
              "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg",
          }}
          style={styles.logo}
        />
      </View>
      <Text style={[styles.shopName, { color: theme.text }]}>
        {item.storeName}
      </Text>
      <Text
        style={[styles.description, { color: theme.mutedText }]}
        numberOfLines={2}
      >
        {item.storeDescription}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        <Text style={[styles.title, { color: theme.text }]}>Explore Shops</Text>
        <FlatList
          data={dummyShops}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    width: "48%",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  logoContainer: {
    height: 100,
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#eee",
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  logo: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  shopName: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  description: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
});
