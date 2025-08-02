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
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
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
  const { addToCart } = useCart();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Main filter state used for API query and rendering
  const [filters, setFilters] = useState({
    brand: [] as string[],
    category: [] as string[],
    price: {
      min: undefined as number | undefined,
      max: undefined as number | undefined,
    },
    availability: [] as string[],
    sort: "",
  });

  // Draft filter state inside the modal (applied only on pressing Apply)
  const [filterDraft, setFilterDraft] = useState(filters);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Debounce query input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
      setHasMore(true);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch products when filters, debounced query or page changes
  const fetchProducts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const params: any = {
        query: debouncedQuery,
        offset: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        brands: filters.brand.join(","),
        categories: filters.category.join(","),
        availability: filters.availability.join(","),
        sort: filters.sort,
      };
      if (filters.price.min !== undefined && filters.price.min !== null)
        params.priceMin = filters.price.min;
      if (filters.price.max !== undefined && filters.price.max !== null)
        params.priceMax = filters.price.max;

      const res = await api.get("/elestic/products/search", { params });

      const newProducts = res.data?.products || [];
      if (page === 1) {
        setProducts(newProducts);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
      }

      setAvailableBrands(res.data.availableBrands || []);
      setAvailableCategories(res.data.availableCategories || []);

      setHasMore(newProducts.length === PAGE_SIZE);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, page, filters, hasMore, loading]);

  useEffect(() => {
    fetchProducts();
  }, [debouncedQuery, page, filters]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const removeFilter = (type: string, value?: string) => {
    setFilters((prev) => {
      if (type === "brand") {
        return { ...prev, brand: prev.brand.filter((b) => b !== value) };
      } else if (type === "category") {
        return { ...prev, category: prev.category.filter((c) => c !== value) };
      } else if (type === "availability") {
        return {
          ...prev,
          availability: prev.availability.filter((a) => a !== value),
        };
      } else if (type === "priceMin") {
        return { ...prev, price: { ...prev.price, min: undefined } };
      } else if (type === "priceMax") {
        return { ...prev, price: { ...prev.price, max: undefined } };
      } else if (type === "sort") {
        return { ...prev, sort: "" };
      }
      return prev;
    });
    setPage(1);
  };

  const renderItem = ({ item }: { item: any }) => {
    const isFav = isFavorite(item._id || item.id);
    const price = item.salePrice ?? item.price;

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBg, position: "relative" },
        ]}
      >
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

  // Active filters compact display
  const hasActiveFilters =
    filters.brand.length ||
    filters.category.length ||
    filters.availability.length ||
    filters.price.min !== undefined ||
    filters.price.max !== undefined ||
    filters.sort;

  const activeFilterTags = (
    <View
      style={{
        height: 32,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        overflow: "visible",
      }}
    >
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{ marginVertical: 2, marginBottom: 2 }}
        contentContainerStyle={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 0,
          paddingVertical: 0,
          marginVertical: 0,
        }}
      >
        {filters.brand.map((b) => (
          <View style={styles.activeTag} key={`brand-${b}`}>
            <Text style={styles.activeTagText}>Brand: {b}</Text>
            <TouchableOpacity onPress={() => removeFilter("brand", b)}>
              <Ionicons name="close" size={14} color="#7c3aed" />
            </TouchableOpacity>
          </View>
        ))}
        {filters.category.map((c) => (
          <View style={styles.activeTag} key={`category-${c}`}>
            <Text style={styles.activeTagText}>Category: {c}</Text>
            <TouchableOpacity onPress={() => removeFilter("category", c)}>
              <Ionicons name="close" size={14} color="#7c3aed" />
            </TouchableOpacity>
          </View>
        ))}
        {filters.availability.map((a) => (
          <View style={styles.activeTag} key={`availability-${a}`}>
            <Text style={styles.activeTagText}>
              Availability: {a.replace("_", " ")}
            </Text>
            <TouchableOpacity onPress={() => removeFilter("availability", a)}>
              <Ionicons name="close" size={14} color="#7c3aed" />
            </TouchableOpacity>
          </View>
        ))}
        {filters.price.min !== undefined && (
          <View style={styles.activeTag} key="priceMin">
            <Text style={styles.activeTagText}>Min ₹{filters.price.min}</Text>
            <TouchableOpacity onPress={() => removeFilter("priceMin")}>
              <Ionicons name="close" size={14} color="#7c3aed" />
            </TouchableOpacity>
          </View>
        )}
        {filters.price.max !== undefined && (
          <View style={styles.activeTag} key="priceMax">
            <Text style={styles.activeTagText}>Max ₹{filters.price.max}</Text>
            <TouchableOpacity onPress={() => removeFilter("priceMax")}>
              <Ionicons name="close" size={14} color="#7c3aed" />
            </TouchableOpacity>
          </View>
        )}
        {filters.sort && (
          <View style={styles.activeTag} key="sortTag">
            <Text style={styles.activeTagText}>
              Sort:{" "}
              {filters.sort === "price:asc"
                ? "Price: Low to High"
                : filters.sort === "price:desc"
                ? "Price: High to Low"
                : "Newest First"}
            </Text>
            <TouchableOpacity onPress={() => removeFilter("sort")}>
              <Ionicons name="close" size={14} color="#7c3aed" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: theme.secondary }]}>
          <Ionicons name="search" size={20} color={theme.icon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search for products, brands..."
            placeholderTextColor={theme.icon}
            style={[styles.input, { color: theme.text }]}
            returnKeyType="search"
          />
        </View>

        {/* Filter & Sort Buttons */}
        <View style={{ flexDirection: "row", marginBottom: 8 }}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              setFilterDraft(filters); // Load current filters into draft
              setFilterModalVisible(true);
            }}
          >
            <Ionicons name="options-outline" size={16} color="#222" />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, { marginLeft: 12 }]}
            onPress={() => setSortModalVisible(true)}
          >
            <Ionicons name="swap-vertical-outline" size={16} color="#222" />
            <Text style={styles.filterButtonText}>Sort</Text>
          </TouchableOpacity>
        </View>

        {/* Active Filters */}
        {hasActiveFilters && activeFilterTags}

        {/* Product list */}
        <View style={{ flex: 1 }}>
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
              contentContainerStyle={{ paddingBottom: 120 }}
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
              style={{ flex: 1 }}
            />
          )}
        </View>
      </View>

      {/* --- FILTER MODAL AS BOTTOM CARD WITH CLOSE BUTTON --- */}
      <Modal
        visible={filterModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.33)",
          }}
        >
          <View style={styles.bottomSheetCard}>
            {/* Header with title and close button */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>Filters</Text>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={26} color="#555" />
              </TouchableOpacity>
            </View>

            {/* Brands */}
            <Text style={{ fontWeight: "600", marginVertical: 6 }}>Brand</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {availableBrands.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={{
                    backgroundColor: filterDraft.brand.includes(b)
                      ? "#7c3aed22"
                      : "#eee",
                    paddingVertical: 5,
                    paddingHorizontal: 12,
                    marginRight: 8,
                    borderRadius: 19,
                  }}
                  onPress={() => {
                    setFilterDraft((prev) => ({
                      ...prev,
                      brand: prev.brand.includes(b)
                        ? prev.brand.filter((x) => x !== b)
                        : [...prev.brand, b],
                    }));
                  }}
                >
                  <Text>
                    {b}
                    {filterDraft.brand.includes(b) ? " ✔️" : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Categories */}
            <Text style={{ fontWeight: "600", marginVertical: 6 }}>
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {availableCategories.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={{
                    backgroundColor: filterDraft.category.includes(c)
                      ? "#7c3aed22"
                      : "#eee",
                    paddingVertical: 5,
                    paddingHorizontal: 12,
                    marginRight: 8,
                    borderRadius: 19,
                  }}
                  onPress={() => {
                    setFilterDraft((prev) => ({
                      ...prev,
                      category: prev.category.includes(c)
                        ? prev.category.filter((x) => x !== c)
                        : [...prev.category, c],
                    }));
                  }}
                >
                  <Text>
                    {c}
                    {filterDraft.category.includes(c) ? " ✔️" : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Price */}
            <Text style={{ fontWeight: "600", marginVertical: 6 }}>Price</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 6,
              }}
            >
              <Text>Min </Text>
              <TextInput
                style={styles.priceInput}
                keyboardType="numeric"
                value={
                  filterDraft.price.min !== undefined &&
                  filterDraft.price.min !== null
                    ? String(filterDraft.price.min)
                    : ""
                }
                onChangeText={(val) => {
                  setFilterDraft((prev) => ({
                    ...prev,
                    price: {
                      ...prev.price,
                      min:
                        val === ""
                          ? undefined
                          : /^\d+$/.test(val)
                          ? Number(val)
                          : prev.price.min,
                    },
                  }));
                }}
                placeholder="0"
                maxLength={7}
                inputMode="numeric"
              />
              <Text style={{ marginLeft: 8 }}>Max </Text>
              <TextInput
                style={styles.priceInput}
                keyboardType="numeric"
                value={
                  filterDraft.price.max !== undefined &&
                  filterDraft.price.max !== null
                    ? String(filterDraft.price.max)
                    : ""
                }
                onChangeText={(val) => {
                  setFilterDraft((prev) => ({
                    ...prev,
                    price: {
                      ...prev.price,
                      max:
                        val === ""
                          ? undefined
                          : /^\d+$/.test(val)
                          ? Number(val)
                          : prev.price.max,
                    },
                  }));
                }}
                placeholder="∞"
                maxLength={7}
                inputMode="numeric"
              />
            </View>

            {/* Availability */}
            <Text style={{ fontWeight: "600", marginVertical: 6 }}>
              Availability
            </Text>
            <View style={{ flexDirection: "row", marginBottom: 8 }}>
              {["in_stock", "out_of_stock"].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={{
                    backgroundColor: filterDraft.availability.includes(opt)
                      ? "#7c3aed22"
                      : "#eee",
                    paddingVertical: 5,
                    paddingHorizontal: 12,
                    marginRight: 8,
                    borderRadius: 19,
                  }}
                  onPress={() => {
                    setFilterDraft((prev) => ({
                      ...prev,
                      availability: prev.availability.includes(opt)
                        ? prev.availability.filter((x) => x !== opt)
                        : [...prev.availability, opt],
                    }));
                  }}
                >
                  <Text>
                    {opt.replace("_", " ")}
                    {filterDraft.availability.includes(opt) ? " ✔️" : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Buttons Apply / Clear */}
            <View style={{ flexDirection: "row", marginTop: 12 }}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  { backgroundColor: "#7c3aed", flex: 1 },
                ]}
                onPress={() => {
                  setFilters(filterDraft);
                  setPage(1);
                  setFilterModalVisible(false);
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, { marginLeft: 10 }]}
                onPress={() => {
                  setFilterDraft({
                    brand: [],
                    category: [],
                    price: { min: undefined, max: undefined },
                    availability: [],
                    sort: "",
                  });
                }}
              >
                <Text>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* SORT MODAL */}
      <Modal
        visible={sortModalVisible}
        animationType="fade" // same as filters modal
        transparent={true}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.33)",
          }}
        >
          <View style={styles.bottomSheetCardSort}>
            {/* Header with title and close cross icon */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <Text style={{ fontWeight: "600", fontSize: 20 }}>Sort</Text>
              <TouchableOpacity
                onPress={() => setSortModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={26} color="#555" />
              </TouchableOpacity>
            </View>

            {["price:asc", "price:desc", "newest"].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 13,
                }}
                onPress={() => {
                  setFilters((prev) => ({ ...prev, sort: opt }));
                  setSortModalVisible(false);
                  setPage(1);
                }}
              >
                <Ionicons
                  name={filters.sort === opt ? "checkmark" : ("" as any)}
                  size={18}
                  color="#7c3aed"
                  style={{ marginRight: 10 }}
                />
                <Text style={{ fontSize: 16 }}>
                  {opt === "price:asc"
                    ? "Price: Low to High"
                    : opt === "price:desc"
                    ? "Price: High to Low"
                    : "Newest First"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
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
    marginBottom: 8,
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
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "#f4f4f4",
    elevation: 1,
  },
  filterButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#222",
    fontWeight: "500",
  },
  activeTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ece9fe",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 19,
    marginRight: 8,
    marginBottom: 2,
  },
  activeTagText: {
    fontSize: 13,
    color: "#6d28d9",
    marginRight: 3,
  },
  bottomSheetCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 32,
    minHeight: 360,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -5 },
  },
  bottomSheetCardSort: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 14,
    minHeight: 200,
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.13,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -6 },
  },
  bottomSheetDragIndicator: {
    width: 46,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 3,
    marginVertical: 6,
    marginBottom: 12,
  },
  priceInput: {
    borderBottomWidth: 1,
    minWidth: 56,
    marginRight: 3,
    fontSize: 16,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
});
