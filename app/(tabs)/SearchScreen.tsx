import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy product data
const products = Array.from({ length: 10 }).map((_, i) => ({
  id: `${i + 1}`,
  name: `Product ${i + 1}`,
  price: `£${(i + 1) * 99}.00`,
  image:
    "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-model-select-202309?wid=470&hei=556&fmt=png-alpha&.v=1692923810002",
}));

export default function SearchScreen() {
  const theme = Colors[useColorScheme() ?? "light"];
  const [query, setQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [loading, setLoading] = useState(false);

  const handleSearch = (text: string) => {
    setQuery(text);
    setLoading(true);
    setTimeout(() => {
      const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProducts(filtered);
      setLoading(false);
    }, 500);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: theme.secondary }]}>
          <Ionicons name="search" size={20} color={theme.icon} />
          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder="Search for products, brands..."
            placeholderTextColor={theme.icon}
            style={[styles.input, { color: theme.text }]}
          />
        </View>

        {/* Product Grid */}
        {loading ? (
          <ActivityIndicator style={{ marginTop: 30 }} color={theme.tint} />
        ) : filteredProducts.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.mutedText }]}>
            No products found
          </Text>
        ) : (
          <FlatList
            data={filteredProducts}
            numColumns={2}
            contentContainerStyle={{ paddingBottom: 100 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.cardBg }]}
              >
                <Image source={{ uri: item.image }} style={styles.image} />
                <Text style={[styles.name, { color: theme.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.price, { color: theme.tint }]}>
                  {item.price}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  grid: {
    paddingBottom: 100,
  },
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  price: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 60,
  },
});
