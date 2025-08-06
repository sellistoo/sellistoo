import api from "@/api";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
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
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedFields, setEditedFields] = useState<Partial<Product>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [version, setVersion] = useState(0);
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});

  // Fetch products (search & pagination aware)
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

  // Always fetch latest when this screen (as a tab or stack page) is focused
  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [userInfo?.id, currentPage, searchQuery])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
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

  const handleSave = async (id: string) => {
    try {
      await api.put(`/product/${id}`, editedFields);

      // Optimistically update the product in the visible list for instant UI feedback
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

      // Now refresh in background (for server truth)
      setTimeout(() => {
        fetchProducts();
      }, 800);
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Could not update product.",
      });
    }
  };

  const handleDelete = (id: string) => {
    Toast.show({
      type: "info",
      text1: "Deleting...",
      text2: "Deleting product, please wait.",
    });
    setTimeout(async () => {
      try {
        await api.delete(`/product/${id}`);
        await fetchProducts();
        setVersion((v) => v + 1); // ensure UI refresh after deletion
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
      }
    }, 600);
  };

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  const renderProduct = ({ item }: { item: Product }) => {
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
      <View style={styles.itemContainer}>
        <Image
          source={{ uri: item.images?.[0] || "https://via.placeholder.com/60" }}
          style={styles.image}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{item.name}</Text>
          {editing ? (
            <>
              <View style={{ marginBottom: 6 }}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  ref={(r) => {
                    inputRefs.current["description"] = r;
                  }}
                  style={styles.editInput}
                  value={editedFields.description ?? ""}
                  onChangeText={(v) =>
                    setEditedFields((prev) => ({ ...prev, description: v }))
                  }
                  placeholder="Description"
                />
              </View>
              <View style={styles.editRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Price</Text>
                  <TextInput
                    style={styles.editField}
                    value={String(editedFields.price ?? "")}
                    onChangeText={(v) =>
                      setEditedFields((prev) => ({ ...prev, price: +v }))
                    }
                    placeholder="Price"
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Sale Price</Text>
                  <TextInput
                    style={styles.editField}
                    value={String(editedFields.salePrice ?? "")}
                    onChangeText={(v) =>
                      setEditedFields((prev) => ({ ...prev, salePrice: +v }))
                    }
                    placeholder="Sale Price"
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Qty</Text>
                  <TextInput
                    style={styles.editField}
                    value={String(editedFields.quantity ?? "")}
                    onChangeText={(v) =>
                      setEditedFields((prev) => ({ ...prev, quantity: +v }))
                    }
                    placeholder="Qty"
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={{ marginTop: 6 }}>
                <Text style={styles.inputLabel}>SKU</Text>
                <TextInput
                  style={[styles.editInput, styles.disabledInput]}
                  value={editedFields.sku}
                  editable={false}
                  selectTextOnFocus={false}
                  pointerEvents="none"
                  placeholder="SKU"
                />
              </View>
              <View style={{ flexDirection: "row", marginTop: 10 }}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#10b981" }]}
                  onPress={() => handleSave(item.id)}
                >
                  <Text style={styles.actionBtnLabel}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#e5e7eb" }]}
                  onPress={() => {
                    setEditingId(null);
                    setEditedFields({});
                  }}
                >
                  <Text style={[styles.actionBtnLabel, { color: "#666" }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.text} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceText}>₹{mainPrice}</Text>
                {hasSale && (
                  <Text style={styles.salePriceText}>₹{item.price}</Text>
                )}
                <Text style={styles.qtyText}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.text}>SKU: {item.sku}</Text>
              <View style={{ flexDirection: "row", marginTop: 7, gap: 9 }}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#6366f1" }]}
                  onPress={() => handleEdit(item)}
                >
                  <Text style={styles.actionBtnLabel}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#f43f5e" }]}
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
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.container}>
        <Text style={styles.header}>Your Products</Text>
        <TextInput
          placeholder="Search by title, SKU or description..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={(text) => {
            setCurrentPage(1);
            setSearchQuery(text);
          }}
          autoCorrect={false}
        />
        {loading && products.length === 0 ? (
          <ActivityIndicator
            size="large"
            color="#6366f1"
            style={{ marginTop: 32 }}
          />
        ) : (
          <FlatList
            key={version}
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={renderProduct}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <Text style={styles.empty}>No products found.</Text>
            }
            ListFooterComponent={
              <View style={styles.paginationFooter}>
                <View style={styles.pagination}>
                  <TouchableOpacity
                    style={[
                      styles.pageBtn,
                      currentPage === 1 && styles.pageBtnDisabled,
                    ]}
                    disabled={currentPage === 1}
                    onPress={() =>
                      setCurrentPage((cur) => Math.max(1, cur - 1))
                    }
                  >
                    <Text style={styles.pageBtnLabel}>Previous</Text>
                  </TouchableOpacity>
                  <Text style={styles.pageText}>
                    Page {currentPage} of {totalPages}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.pageBtn,
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
            }
            contentContainerStyle={{ paddingBottom: 110 }}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7fb", padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    color: "#22223b",
    letterSpacing: 0.1,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#dedede",
    borderRadius: 14,
    padding: 12,
    marginBottom: 13,
    backgroundColor: "#fff",
    fontSize: 15.5,
  },
  itemContainer: {
    flexDirection: "row",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 13,
    elevation: 1,
    padding: 13,
    alignItems: "flex-start",
    shadowColor: "#111",
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
    color: "#22223b",
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
    color: "#6366f1",
    fontWeight: "700",
    marginRight: 7,
  },
  salePriceText: {
    textDecorationLine: "line-through",
    color: "#7c7c7c",
    marginRight: 7,
    fontSize: 13.4,
  },
  qtyText: { marginLeft: 0, fontSize: 13.9, color: "#22223b" },
  text: { fontSize: 14.2, color: "#22223b", marginBottom: 2 },
  editInput: {
    backgroundColor: "#f5f5fd",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 9,
    marginBottom: 5,
    fontSize: 14,
    color: "#22223b",
  },
  editRow: { flexDirection: "row", gap: 7, marginVertical: 2 },
  editField: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 9,
    paddingHorizontal: 7,
    marginRight: 6,
    backgroundColor: "#f5f5fd",
    fontSize: 13.5,
    color: "#22223b",
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
    backgroundColor: "#6366f1",
    borderRadius: 999,
    marginHorizontal: 4,
  },
  pageBtnDisabled: { backgroundColor: "#c7d1f7" },
  pageBtnLabel: { color: "#fff", fontWeight: "700", fontSize: 14 },
  pageText: { fontSize: 15.1, color: "#22223b", fontWeight: "500" },
  empty: {
    marginTop: 42,
    color: "#555",
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
    color: "#4b5563",
    fontWeight: "500",
    marginBottom: 2,
    marginLeft: 2,
    letterSpacing: 0.07,
  },
  disabledInput: { backgroundColor: "#ececec", color: "#aaa", opacity: 0.85 },
});
