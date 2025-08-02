import api from "@/api";
import { useCart } from "@/hooks/useCart";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
const shopBannerPlaceholder = require("@/assets/images/shopbanner.png");
interface Product {
  _id: string;
  id: string;
  name: string;
  images: string[];
  price: number;
  salePrice?: number;
  sku: string;
}

interface Shop {
  _id: string;
  storeName: string;
  storeBannerUrl?: string;
  storeDescription?: string;
  userId: string;
}

const itemsPerPage = 20;

export default function ShopScreen() {
  const { shopId } = useLocalSearchParams();
  const navigation = useNavigation();
  const { addToCart } = useCart();

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Fetch shop info
  useEffect(() => {
    const fetchShop = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/sellers/shop/${shopId}`);
        setShop(res.data);
      } catch (e) {
        setShop(null);
        console.error("Failed to fetch shop:", e);
      } finally {
        setLoading(false);
      }
    };
    if (shopId) fetchShop();
  }, [shopId]);

  // Update native header title after shop data loaded
  useEffect(() => {
    if (shop?.storeName) {
      navigation.setOptions({ title: shop.storeName });
    }
  }, [shop?.storeName, navigation]);

  // Fetch products for the shop
  const loadProducts = useCallback(
    async (reset = false) => {
      if (!shop?.userId) return;
      if (reset) setPage(1);

      const currentPage = reset ? 1 : page;
      const baseUrl = `/seller/elestic/products/${shop.userId}`;

      setLoading(reset || currentPage === 1);
      setFetchingMore(!reset && currentPage !== 1);

      try {
        const res = await api.get(
          debouncedSearchTerm ? `${baseUrl}/search` : baseUrl,
          {
            params: {
              query: debouncedSearchTerm || undefined,
              page: currentPage,
              limit: itemsPerPage,
            },
          }
        );

        const data = res.data;
        setProducts((prev) =>
          reset || currentPage === 1
            ? data?.data || []
            : [...prev, ...(data?.data || [])]
        );
        setTotal(data?.total?.value || 0);
      } catch (e) {
        console.error("Failed to fetch products:", e);
        if (reset || currentPage === 1) setProducts([]);
        setTotal(0);
      } finally {
        setLoading(false);
        setFetchingMore(false);
      }
    },
    [shop?.userId, debouncedSearchTerm, page]
  );

  // Reload products on userId or search term change
  useEffect(() => {
    if (shop?.userId) {
      loadProducts(true);
    }
  }, [shop?.userId, debouncedSearchTerm]);

  // Load more products on page increment
  useEffect(() => {
    if (shop?.userId && page > 1) {
      loadProducts();
    }
  }, [page]);

  // Handle add to cart
  const onAddToCart = (product: Product) => {
    addToCart({
      product: product._id || product.id,
      name: product.name,
      image: product.images?.[0] ?? "",
      price: product.salePrice ?? product.price,
      quantity: 1,
      sku: product.sku,
    });
  };

  if (loading && !shop) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={styles.centered}>
        <Text>Shop not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Banner, description, and search section */}
      <View>
        <Image
          source={
            shop.storeBannerUrl
              ? { uri: shop.storeBannerUrl }
              : shopBannerPlaceholder
          }
          style={styles.banner}
          resizeMode="cover"
        />
        <View style={styles.shopInfoContainer}>
          {!!shop.storeDescription && (
            <Text style={styles.shopDesc}>{shop.storeDescription}</Text>
          )}
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search products..."
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Scrollable product list */}
      {loading && products.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
      ) : products.length === 0 ? (
        <View style={styles.centered}>
          <Text>No products found.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id || item._id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          onEndReached={() => {
            if (products.length < total && !fetchingMore) {
              setPage((prev) => prev + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            fetchingMore ? <ActivityIndicator style={{ margin: 12 }} /> : null
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={{ uri: item.images?.[0] ?? "https://placehold.co/150" }}
                style={styles.productImg}
                resizeMode="cover"
              />
              <Text style={styles.pName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {item.salePrice ? (
                  <>
                    <Text style={styles.pSale}>₹{item.salePrice}</Text>
                    <Text style={styles.pPrice}>₹{item.price}</Text>
                  </>
                ) : (
                  <Text style={styles.pSale}>₹{item.price}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => onAddToCart(item)}
              >
                <Text style={styles.addBtnText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  banner: {
    width: "100%",
    height: 120,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  shopInfoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  shopDesc: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: "#f7f7f7",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eee",
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 70,
  },
  card: {
    flex: 1,
    margin: 7,
    backgroundColor: "#fafbfc",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    elevation: 1,
  },
  productImg: {
    width: 110,
    height: 110,
    borderRadius: 10,
    marginBottom: 7,
    backgroundColor: "#ececec",
  },
  pName: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 14,
    textAlign: "center",
  },
  pSale: {
    color: "#6d28d9",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 5,
  },
  pPrice: {
    textDecorationLine: "line-through",
    fontSize: 13,
    color: "#888",
  },
  addBtn: {
    backgroundColor: "#6d28d9",
    borderRadius: 16,
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 24,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    padding: 50,
  },
});
