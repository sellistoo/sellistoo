import api from "@/api";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useUserInfo } from "@/hooks/useUserInfo";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  quantity: number;
  sku: string;
  images: string[];
}
const itemsPerPage = 6;

export default function ProductListScreen() {
  const { userInfo } = useUserInfo();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedFields, setEditedFields] = useState<Partial<Product>>({});
  const [refreshing, setRefreshing] = useState(false);
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});

  // Fetch products from backend
  const fetchProducts = async () => {
    if (!userInfo?.id) return;
    setLoading(true);
    try {
      const url = searchQuery
        ? `/seller/elestic/products/${userInfo.id}/search`
        : `/seller/elestic/products/${userInfo.id}`;
      const res = await api.get(url, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          query: searchQuery,
        },
      });
      setProducts(res.data.data || []);
      setTotal(res.data.total.value || 0);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load products.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery, userInfo?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  // Optimistic update for edit (immediate UI update)
  const handleSave = async (id: string) => {
    try {
      await api.put(`/product/${id}`, editedFields);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                ...editedFields,
                price: Number(editedFields.price ?? p.price),
                salePrice:
                  editedFields.salePrice !== undefined
                    ? Number(editedFields.salePrice)
                    : p.salePrice,
                quantity: Number(editedFields.quantity ?? p.quantity),
                name: editedFields.name ?? p.name,
                description: editedFields.description ?? p.description,
                sku: p.sku,
              }
            : p
        )
      );

      setEditingId(null);
      setEditedFields({});
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Product updated successfully",
      });

      setTimeout(() => {
        fetchProducts();
      }, 1800);
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Could not update product.",
      });
    }
  };

  // Optimistic update for delete (immediate UI update)
  const handleDelete = (id: string) => {
    Toast.show({
      type: "info",
      text1: "Deleting...",
      text2: "Deleting product, please wait.",
    });

    setProducts((prev) => prev.filter((p) => p.id !== id));
    setTotal((prev) => (prev > 0 ? prev - 1 : 0));

    setTimeout(async () => {
      try {
        await api.delete(`/product/${id}`);
        setTimeout(() => {
          fetchProducts();
        }, 1800);
        Toast.show({
          type: "success",
          text1: "Deleted",
          text2: "Product deleted successfully",
        });
      } catch (e) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Unable to delete product.",
        });
        setTimeout(() => {
          fetchProducts();
        }, 1800);
      }
    }, 600);
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setEditedFields({
      name: p.name,
      description: p.description,
      price: p.price,
      salePrice: p.salePrice,
      quantity: p.quantity,
      sku: p.sku,
    });
    setTimeout(() => {
      inputRefs.current["description"]?.focus();
    }, 120);
  };

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  // Renders each product (edit or view mode)
  const renderProduct = (item: Product) => {
    const editing = editingId === item.id;
    const hasSale =
      item.salePrice != null &&
      item.salePrice !== 0 &&
      item.salePrice !== item.price;
    const mainPrice =
      item.salePrice != null && item.salePrice !== 0
        ? item.salePrice
        : item.price;

    return (
      <View
        style={[
          styles.itemContainer,
          { backgroundColor: theme.cardBg, shadowColor: theme.icon },
        ]}
        key={item.id}
      >
        <Image
          source={{ uri: item.images?.[0] || "https://via.placeholder.com/60" }}
          style={styles.image}
        />
        <View style={styles.infoContainer}>
          <Text style={[styles.title, { color: theme.text }]}>{item.name}</Text>
          {editing ? (
            <>
              <View style={{ marginBottom: 6 }}>
                <Text style={[styles.inputLabel, { color: theme.mutedText }]}>
                  Description
                </Text>
                <TextInput
                  ref={(r) => {
                    inputRefs.current["description"] = r;
                  }}
                  style={[
                    styles.editInput,
                    {
                      backgroundColor: theme.input,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  value={editedFields.description ?? ""}
                  onChangeText={(v) =>
                    setEditedFields((prev) => ({ ...prev, description: v }))
                  }
                  placeholder="Description"
                  placeholderTextColor={theme.mutedText}
                />
              </View>
              <View style={styles.editRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: theme.mutedText }]}>
                    Price
                  </Text>
                  <TextInput
                    style={[
                      styles.editField,
                      {
                        backgroundColor: theme.input,
                        color: theme.text,
                        borderColor: theme.border,
                      },
                    ]}
                    value={String(editedFields.price ?? "")}
                    onChangeText={(v) =>
                      setEditedFields((prev) => ({ ...prev, price: +v }))
                    }
                    placeholder="Price"
                    placeholderTextColor={theme.mutedText}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: theme.mutedText }]}>
                    Sale Price
                  </Text>
                  <TextInput
                    style={[
                      styles.editField,
                      {
                        backgroundColor: theme.input,
                        color: theme.text,
                        borderColor: theme.border,
                      },
                    ]}
                    value={String(editedFields.salePrice ?? "")}
                    onChangeText={(v) =>
                      setEditedFields((prev) => ({
                        ...prev,
                        salePrice: +v,
                      }))
                    }
                    placeholder="Sale Price"
                    placeholderTextColor={theme.mutedText}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: theme.mutedText }]}>
                    Qty
                  </Text>
                  <TextInput
                    style={[
                      styles.editField,
                      {
                        backgroundColor: theme.input,
                        color: theme.text,
                        borderColor: theme.border,
                      },
                    ]}
                    value={String(editedFields.quantity ?? "")}
                    onChangeText={(v) =>
                      setEditedFields((prev) => ({ ...prev, quantity: +v }))
                    }
                    placeholder="Qty"
                    placeholderTextColor={theme.mutedText}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={{ marginTop: 6 }}>
                <Text style={[styles.inputLabel, { color: theme.mutedText }]}>
                  SKU
                </Text>
                <TextInput
                  style={[
                    styles.editInput,
                    styles.disabledInput,
                    {
                      backgroundColor: theme.input,
                      color: theme.mutedText,
                      borderColor: theme.border,
                    },
                  ]}
                  value={editedFields.sku}
                  editable={false}
                  selectTextOnFocus={false}
                  pointerEvents="none"
                  placeholder="SKU"
                  placeholderTextColor={theme.mutedText}
                />
              </View>
              <View style={{ flexDirection: "row", marginTop: 10 }}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.success }]}
                  onPress={() => handleSave(item.id)}
                >
                  <Text style={styles.actionBtnLabel}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.border }]}
                  onPress={() => {
                    setEditingId(null);
                    setEditedFields({});
                  }}
                >
                  <Text
                    style={[styles.actionBtnLabel, { color: theme.mutedText }]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text
                style={[styles.text, { color: theme.text }]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
              <View style={styles.priceRow}>
                <Text style={[styles.priceText, { color: theme.tint }]}>
                  ₹{mainPrice}
                </Text>
                {hasSale && (
                  <Text
                    style={[styles.salePriceText, { color: theme.mutedText }]}
                  >
                    ₹{item.price}
                  </Text>
                )}
                <Text style={[styles.qtyText, { color: theme.text }]}>
                  Qty: {item.quantity}
                </Text>
              </View>
              <Text style={[styles.text, { color: theme.text }]}>
                SKU: {item.sku}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 7,
                  gap: 9,
                }}
              >
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.tint }]}
                  onPress={() => handleEdit(item)}
                >
                  <Text style={styles.actionBtnLabel}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: theme.destructive },
                  ]}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.actionBtnLabel}>Delete</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.header, { color: theme.text }]}>
          Your Products
        </Text>
        <TextInput
          placeholder="Search by title, SKU or description..."
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.input,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          value={searchQuery}
          onChangeText={(text) => {
            setCurrentPage(1);
            setSearchQuery(text);
          }}
          placeholderTextColor={theme.mutedText}
          autoCorrect={false}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 110 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              colors={[theme.tint]}
              tintColor={theme.tint}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              progressBackgroundColor={theme.input}
            />
          }
        >
          {loading && products.length === 0 ? (
            <ActivityIndicator
              size="large"
              color={theme.tint}
              style={{ marginTop: 32 }}
            />
          ) : products.length === 0 ? (
            <Text style={[styles.empty, { color: theme.mutedText }]}>
              No products found.
            </Text>
          ) : (
            products.map((item) => renderProduct(item))
          )}
          {/* Pagination */}
          <View style={styles.paginationFooter}>
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[
                  styles.pageBtn,
                  { backgroundColor: theme.tint },
                  currentPage === 1 && styles.pageBtnDisabled,
                ]}
                disabled={currentPage === 1}
                onPress={() => setCurrentPage((cur) => Math.max(1, cur - 1))}
              >
                <Text style={styles.pageBtnLabel}>Previous</Text>
              </TouchableOpacity>
              <Text style={[styles.pageText, { color: theme.text }]}>
                Page {currentPage} of {totalPages}
              </Text>
              <TouchableOpacity
                style={[
                  styles.pageBtn,
                  { backgroundColor: theme.tint },
                  currentPage === totalPages && styles.pageBtnDisabled,
                ]}
                disabled={currentPage === totalPages}
                onPress={() =>
                  setCurrentPage((cur) => Math.min(totalPages, cur + 1))
                }
              >
                <Text style={styles.pageBtnLabel}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 13,
    fontSize: 15.5,
  },
  itemContainer: {
    flexDirection: "row",
    borderRadius: 12,
    marginBottom: 13,
    elevation: 1,
    padding: 13,
    alignItems: "flex-start",
    shadowOpacity: 0.07,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 9,
    marginRight: 13,
    backgroundColor: "#ececec",
  },
  infoContainer: { flex: 1, justifyContent: "center" },
  title: {
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
    flexWrap: "wrap",
    gap: 10,
  },
  priceText: {
    fontSize: 15.5,
    fontWeight: "700",
    marginRight: 7,
  },
  salePriceText: {
    textDecorationLine: "line-through",
    marginRight: 7,
    fontSize: 13.4,
  },
  qtyText: { marginLeft: 0, fontSize: 13.9 },
  text: { fontSize: 14.2, marginBottom: 2 },
  editInput: {
    borderRadius: 9,
    borderWidth: 1,
    paddingHorizontal: 9,
    marginBottom: 5,
    fontSize: 14,
  },
  editRow: { flexDirection: "row", gap: 7, marginVertical: 2 },
  editField: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 7,
    marginRight: 6,
    fontSize: 13.5,
  },
  actionBtn: {
    paddingVertical: 7,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginRight: 5,
  },
  actionBtnLabel: { color: "#fff", fontWeight: "bold", fontSize: 14.7 },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 17,
    marginTop: 6,
    paddingBottom: 16,
    backgroundColor: "transparent",
  },
  pageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    marginHorizontal: 4,
  },
  pageBtnDisabled: { opacity: 0.5 },
  pageBtnLabel: { color: "#fff", fontWeight: "700", fontSize: 14 },
  pageText: { fontSize: 15.1, fontWeight: "500" },
  empty: {
    marginTop: 42,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "400",
  },
  paginationFooter: {
    backgroundColor: "transparent",
    paddingBottom: 20,
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 12.7,
    fontWeight: "500",
    marginBottom: 2,
    marginLeft: 2,
    letterSpacing: 0.07,
  },
  disabledInput: { opacity: 0.85 },
});
