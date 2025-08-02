import api from "@/api";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useUserInfo } from "@/hooks/useUserInfo";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface OrderItem {
  _id: string;
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  salePrice?: number;
  orderStatus: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  totalGST: number;
  shippingCost?: number;
  couponDiscount: number;
  finalPayable: number;
  items: OrderItem[];
}

const ITEMS_PER_PAGE = 10;

export default function OrderScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const { userInfo } = useUserInfo();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!userInfo?.id) return;
    setLoading(true);
    api
      .get(
        `/order/my/${userInfo.id}?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
      )
      .then((res) => {
        setOrders(res.data.orders ?? []);
        setTotal(res.data.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userInfo?.id, currentPage]);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  function formatDate(date: string) {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function statusColor(status: string): string {
    switch (status) {
      case "processing":
        return theme.accent;
      case "shipped":
        return "#0277BD";
      case "delivered":
        return theme.success;
      case "cancelled":
        return theme.destructive;
      default:
        return theme.info;
    }
  }

  const renderOrder = ({ item }: { item: Order }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.cardBg, borderColor: theme.border },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.orderNumber, { color: theme.tint }]}>
          Order: {item.orderNumber}
        </Text>
        <Text style={{ color: theme.mutedText, fontSize: 13 }}>
          {formatDate(item.createdAt)}
        </Text>
      </View>

      <View style={{ marginBottom: 6 }}>
        <Text style={{ color: theme.text, fontSize: 14, fontWeight: "500" }}>
          Paid:{" "}
          <Text style={{ fontWeight: "bold", color: theme.success }}>
            ₹{item.finalPayable.toFixed(2)}
          </Text>
        </Text>
        <Text style={[styles.orderMeta, { color: theme.mutedText }]}>
          Shipping: ₹{item.shippingCost?.toFixed(2) ?? "0.00"} | GST: ₹
          {item.totalGST.toFixed(2)}
        </Text>
        {item.couponDiscount > 0 ? (
          <Text style={[styles.orderMeta, { color: theme.accent }]}>
            Coupon: -₹{item.couponDiscount.toFixed(2)}
          </Text>
        ) : null}
      </View>

      {/* Order Items */}
      {item.items.map((product) => (
        <View key={product._id} style={styles.itemRow}>
          <Image
            source={{ uri: product.image || "https://via.placeholder.com/80" }}
            style={styles.productImg}
          />
          <View style={styles.details}>
            <Text
              numberOfLines={1}
              style={[styles.productName, { color: theme.text }]}
            >
              {product.name}
            </Text>
            <Text style={{ color: theme.mutedText, fontSize: 13 }}>
              Qty: {product.quantity} | ₹
              {(product.salePrice ?? product.price).toFixed(2)}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 3,
                gap: 8,
              }}
            >
              <View
                style={{
                  backgroundColor: statusColor(product.orderStatus),
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}
                >
                  {product.orderStatus.charAt(0).toUpperCase() +
                    product.orderStatus.slice(1)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  // TODO: navigate to product screen/product details
                }}
                hitSlop={10}
              >
                <Text
                  style={{ color: theme.tint, fontSize: 13, fontWeight: "500" }}
                >
                  View Item
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        <Text style={[styles.title, { color: theme.text }]}>My Orders</Text>
        {loading ? (
          <ActivityIndicator
            color={theme.accent}
            style={{ marginTop: 42 }}
            size="large"
          />
        ) : orders.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 56 }}>
            <Text
              style={{ color: theme.mutedText, fontSize: 16, marginBottom: 7 }}
            >
              You have no orders yet.
            </Text>
            <TouchableOpacity
              onPress={() => {
                /* TODO: navigate home */
              }}
            >
              <Text
                style={{ color: theme.tint, fontWeight: "bold", fontSize: 15 }}
              >
                Browse Products
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={orders}
              keyExtractor={(item) => item._id}
              renderItem={renderOrder}
              ListFooterComponent={
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginVertical: 16,
                    alignItems: "center",
                    gap: 18,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={[
                      styles.paginateBtn,
                      {
                        backgroundColor:
                          currentPage === 1 ? theme.border : theme.accent,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: currentPage === 1 ? theme.mutedText : "#fff",
                      }}
                    >
                      Previous
                    </Text>
                  </TouchableOpacity>
                  <Text style={{ color: theme.mutedText, fontSize: 14 }}>
                    Page {currentPage} of {totalPages}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    style={[
                      styles.paginateBtn,
                      {
                        backgroundColor:
                          currentPage === totalPages
                            ? theme.border
                            : theme.accent,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          currentPage === totalPages ? theme.mutedText : "#fff",
                      }}
                    >
                      Next
                    </Text>
                  </TouchableOpacity>
                </View>
              }
              scrollEnabled={false}
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 18,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    shadowColor: "#d7d7d7",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 9,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: "700",
  },
  orderMeta: {
    fontSize: 12.7,
    marginRight: 9,
    marginTop: 1,
  },
  itemRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
    gap: 9,
  },
  productImg: {
    width: 55,
    height: 55,
    borderRadius: 8,
    backgroundColor: "#f1f2f4",
    marginRight: 7,
  },
  details: {
    flex: 1,
    gap: 2,
  },
  productName: {
    fontSize: 14.2,
    fontWeight: "600",
    marginBottom: 1.5,
  },
  footerRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
  },
  paginateBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 7,
    alignItems: "center",
    minWidth: 80,
    backgroundColor: "#eee",
  },
});
