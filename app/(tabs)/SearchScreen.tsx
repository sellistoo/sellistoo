import api from "@/api";
import { Colors } from "@/constants/Colors";
import { useCart } from "@/hooks/useCart";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useFavorites } from "@/hooks/useFavorites";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
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

const PAGE_SIZE = 20;

export default function SearchScreen() {
  const theme = Colors[useColorScheme() ?? "light"];
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const { addToCart } = useCart();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();

  const fetchProducts = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const res = await api.get("/elestic/products/search", {
        params: {
          query,
          offset: (page - 1) * PAGE_SIZE,
          limit: PAGE_SIZE,
        },
      });

      const newProducts = res.data?.products || [];
      setProducts((prev) =>
        page === 1 ? newProducts : [...prev, ...newProducts]
      );
      if (newProducts.length < PAGE_SIZE) setHasMore(false);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  }, [query, page, hasMore, loading]);

  // Reset when query changes
  const handleSearch = (text: string) => {
    setQuery(text);
    setPage(1);
    setHasMore(true);
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadMore = () => {
    if (!loading && hasMore) setPage((prev) => prev + 1);
  };

  const renderItem = ({ item }: { item: any }) => {
    const isFav = isFavorite(item._id || item.id);
    const price = item.salePrice ?? item.price;

    return (
      <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
        <Image source={{ uri: item.images?.[0] }} style={styles.image} />

        <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.price, { color: theme.tint }]}>₹{price}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.tint }]}
            onPress={() =>
              addToCart({
                product: item._id || item.id,
                name: item.name,
                image: item.images?.[0],
                price,
                quantity: 1,
                sku: item.sku,
                variant: item.variant || {},
              })
            }
          >
            <Ionicons name="cart-outline" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              isFav
                ? removeFromFavorites(item._id || item.id)
                : addToFavorites(item._id || item.id)
            }
            style={[
              styles.iconButton,
              {
                backgroundColor: isFav ? "rgba(255,0,0,0.15)" : "#f0f0f0",
              },
            ]}
          >
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={20}
              color={isFav ? "red" : "#555"}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
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
            returnKeyType="search"
          />
        </View>

        {loading && page === 1 ? (
          <ActivityIndicator style={{ marginTop: 30 }} color={theme.tint} />
        ) : products.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.mutedText }]}>
            No products found
          </Text>
        ) : (
          <FlatList
            data={products}
            numColumns={2}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={renderItem}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              loading ? (
                <ActivityIndicator
                  color={theme.tint}
                  style={{ marginVertical: 20 }}
                />
              ) : null
            }
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
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
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
  actions: {
    flexDirection: "row",
    marginTop: 10,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 60,
  },
});
