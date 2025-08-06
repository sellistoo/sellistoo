import api from "@/api";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useUserInfo } from "@/hooks/useUserInfo";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
  _id: string;
  productId: string;
  name: string;
  quantity: number;
  sku: string;
  price: number;
  salePrice: number;
  image: string;
  orderStatus: OrderStatus;
}
interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  createdAt: string;
  shippingAddress: string;
  totalPayable: number;
  items: OrderItem[];
}

const itemsPerPage = 8;

export default function SellerOrdersScreen() {
  const { userInfo } = useUserInfo();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [userInfo?.id, currentPage]);

  const fetchOrders = async () => {
    if (!userInfo?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/order/seller/${userInfo.id}`, {
        params: { page: currentPage, limit: itemsPerPage },
      });
      setOrders(res.data.orders || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch seller orders.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [userInfo?.id, currentPage]);

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  // Order status badge color
  const getStatusBadgeColor = (status: OrderStatus) => {
    switch (status) {
      case "processing":
        return { backgroundColor: theme.accent, color: "#fff" };
      case "shipped":
        return { backgroundColor: theme.success, color: "#fff" };
      case "delivered":
        return { backgroundColor: theme.info, color: "#fff" };
      case "cancelled":
        return { backgroundColor: theme.destructive, color: "#fff" };
      default:
        return { backgroundColor: theme.secondary, color: theme.text };
    }
  };

  // Update status (PATCH)
  const handleStatusChange = async (
    orderId: string,
    itemId: string,
    newStatus: OrderStatus
  ) => {
    try {
      await api.patch(`/order/seller/item/${orderId}/${itemId}`, { newStatus });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? {
                ...order,
                items: order.items.map((item) =>
                  item._id === itemId
                    ? { ...item, orderStatus: newStatus }
                    : item
                ),
              }
            : order
        )
      );
      Toast.show({
        type: "success",
        text1: "Order Status Updated",
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Failed",
        text2: "Unable to update status.",
      });
    }
  };

  // Fetch and open order details modal
  const handleViewDetails = async (orderId: string) => {
    setOpenModal(true);
    setModalLoading(true);
    try {
      const res = await api.get(
        `/order/seller/details/${orderId}/${userInfo?.id}`
      );
      setSelectedDetails(res.data || null);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Load Failed",
        text2: "Unable to fetch order details.",
      });
      setSelectedDetails(null);
    } finally {
      setModalLoading(false);
    }
  };

  // Render a single order row
  const renderOrder = (order: Order) => (
    <View
      key={order._id}
      style={[
        styles.orderCard,
        { backgroundColor: theme.cardBg, borderColor: theme.border },
      ]}
    >
      <View style={styles.rowBetween}>
        <Text style={[styles.orderId, { color: theme.text }]}>
          Order #{order.orderNumber}
        </Text>
        <Text style={[styles.date, { color: theme.mutedText }]}>
          {new Date(order.createdAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Text>
      </View>
      <View style={{ marginBottom: 8 }}>
        <Text style={[styles.address, { color: theme.mutedText }]}>
          To: {order.shippingAddress}
        </Text>
        <Text style={[styles.customer, { color: theme.mutedText }]}>
          Customer ID: {order.userId.slice(-6)}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
      >
        {order.items.map((item) => (
          <View
            key={item._id}
            style={[
              styles.itemBox,
              { borderColor: theme.border, backgroundColor: theme.background },
            ]}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.productImg}
              resizeMode="cover"
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.itemName, { color: theme.text }]}
                numberOfLines={2}
              >
                {item.name}
              </Text>
              <Text style={{ color: theme.mutedText, fontSize: 12 }}>
                SKU: {item.sku} | Qty: {item.quantity}
              </Text>
              <Text style={{ color: theme.mutedText, fontSize: 12 }}>
                ₹{item.salePrice ?? item.price}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 6,
                }}
              >
                <OrderStatusDropdown
                  value={item.orderStatus}
                  onChange={(newStatus: OrderStatus) =>
                    handleStatusChange(order._id, item._id, newStatus)
                  }
                  theme={theme}
                />
                <View
                  style={[
                    styles.statusBadge,
                    getStatusBadgeColor(item.orderStatus),
                  ]}
                >
                  <Text style={styles.statusText}>{item.orderStatus}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={[styles.rowBetween, { marginTop: 12 }]}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: theme.input, borderColor: theme.border },
          ]}
          onPress={() => handleViewDetails(order._id)}
        >
          <Text style={{ color: theme.text, fontWeight: "bold" }}>Details</Text>
        </TouchableOpacity>
        <Text style={{ color: theme.text, fontWeight: "700" }}>
          ₹{order.totalPayable.toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>Manage Orders</Text>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 90 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.tint]}
              tintColor={theme.tint}
              progressBackgroundColor={theme.input}
            />
          }
        >
          {loading && !refreshing ? (
            <ActivityIndicator
              size="large"
              color={theme.tint}
              style={{ marginTop: 32 }}
            />
          ) : orders.length === 0 ? (
            <Text style={[styles.empty, { color: theme.mutedText }]}>
              No orders yet.
            </Text>
          ) : (
            orders.map(renderOrder)
          )}

          {/* Pagination */}
          {orders.length > 0 && (
            <View style={styles.paginationFooter}>
              <TouchableOpacity
                style={[
                  styles.paginationBtn,
                  { backgroundColor: theme.tint },
                  currentPage === 1 && styles.paginationBtnDisabled,
                ]}
                disabled={currentPage === 1}
                onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <Text style={styles.paginationBtnLabel}>Previous</Text>
              </TouchableOpacity>
              <Text style={[styles.pageText, { color: theme.text }]}>
                Page {currentPage} of {totalPages}
              </Text>
              <TouchableOpacity
                style={[
                  styles.paginationBtn,
                  { backgroundColor: theme.tint },
                  currentPage === totalPages && styles.paginationBtnDisabled,
                ]}
                disabled={currentPage === totalPages}
                onPress={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                <Text style={styles.paginationBtnLabel}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Order Details Modal */}
        <Modal
          visible={openModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setOpenModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
            >
              <TouchableOpacity
                onPress={() => setOpenModal(false)}
                style={styles.closeBtn}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    color: theme.destructive,
                    fontSize: 19,
                  }}
                >
                  ×
                </Text>
              </TouchableOpacity>
              {modalLoading ? (
                <ActivityIndicator size="large" color={theme.tint} />
              ) : !selectedDetails ? (
                <Text style={[styles.modalEmpty, { color: theme.text }]}>
                  No details available.
                </Text>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={{ marginTop: 8 }}
                >
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    Order #{selectedDetails.orderNumber}
                  </Text>
                  <Text style={[styles.modalDesc, { color: theme.mutedText }]}>
                    Placed on{" "}
                    {new Date(selectedDetails.createdAt).toLocaleDateString()} |
                    Payment: {selectedDetails.paymentMethod} (
                    {selectedDetails.paymentStatus})
                  </Text>
                  {selectedDetails.sellerItems?.map((item: any) => (
                    <View
                      key={item._id}
                      style={[styles.detailItem, { borderColor: theme.border }]}
                    >
                      <Image
                        source={{ uri: item.image }}
                        style={styles.detailImg}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "600", color: theme.text }}>
                          {item.name}
                        </Text>
                        <Text style={{ color: theme.mutedText, fontSize: 13 }}>
                          Qty: {item.quantity} | Price: ₹
                          {(item.salePrice ?? item.price).toFixed(2)}
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            getStatusBadgeColor(item.orderStatus),
                            { alignSelf: "flex-start", marginTop: 2 },
                          ]}
                        >
                          <Text style={styles.statusText}>
                            {item.orderStatus}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                  {selectedDetails.transaction && (
                    <View
                      style={[
                        styles.transactionBox,
                        {
                          borderColor: theme.border,
                          backgroundColor: theme.bannerBg,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.transactionTitle, { color: theme.text }]}
                      >
                        Transaction Summary
                      </Text>
                      <Text
                        style={[styles.transactionLine, { color: theme.text }]}
                      >
                        <Text style={{ fontWeight: "bold" }}>Invoice:</Text>{" "}
                        {selectedDetails.transaction.invoiceNumber}
                      </Text>
                      <Text style={styles.transactionLine}>
                        <Text style={{ fontWeight: "bold" }}>
                          Final Payout:
                        </Text>{" "}
                        ₹
                        {selectedDetails.transaction.finalSellerPayout.toFixed(
                          2
                        )}
                      </Text>
                      <Text style={styles.transactionLine}>
                        <Text style={{ fontWeight: "bold" }}>
                          Commission (incl. GST):
                        </Text>{" "}
                        ₹
                        {selectedDetails.transaction.totalCommissionWithGST.toFixed(
                          2
                        )}
                      </Text>
                      <Text style={styles.transactionLine}>
                        <Text style={{ fontWeight: "bold" }}>TCS:</Text> ₹
                        {selectedDetails.transaction.tcsAmount.toFixed(2)}
                      </Text>
                      <Text style={styles.transactionLine}>
                        <Text style={{ fontWeight: "bold" }}>
                          Payout Status:
                        </Text>{" "}
                        {selectedDetails.transaction.payoutStatus}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

// ------- OrderStatusDropdown (Mobile)
function OrderStatusDropdown({
  value,
  onChange,
  theme,
}: {
  value: OrderStatus;
  onChange: (v: OrderStatus) => void;
  theme: any;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ position: "relative", marginRight: 6 }}>
      <TouchableOpacity
        style={{
          backgroundColor: theme.input,
          borderRadius: 6,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderWidth: 1,
          borderColor: theme.border,
          minWidth: 85,
        }}
        onPress={() => setOpen((prev) => !prev)}
        activeOpacity={0.86}
      >
        <Text style={{ fontSize: 13, color: theme.text }}>
          {capitalize(value)}
        </Text>
      </TouchableOpacity>
      {open && (
        <View
          style={{
            position: "absolute",
            top: 36,
            left: 0,
            right: 0,
            backgroundColor: theme.cardBg,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 8,
            elevation: 6,
            zIndex: 99,
          }}
        >
          {(
            ["processing", "shipped", "delivered", "cancelled"] as OrderStatus[]
          ).map((stat) => (
            <TouchableOpacity
              key={stat}
              style={{
                padding: 10,
                backgroundColor:
                  stat === value ? theme.secondary : theme.cardBg,
              }}
              onPress={() => {
                setOpen(false);
                if (stat !== value) onChange(stat);
              }}
            >
              <Text style={{ fontSize: 13, color: theme.text }}>
                {capitalize(stat)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
const capitalize = (v: string) =>
  v ? v.charAt(0).toUpperCase() + v.substring(1) : v;

// ----------------------------- Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, paddingTop: 0 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.1,
    marginVertical: 14,
    marginLeft: 5,
  },
  empty: {
    marginTop: 42,
    color: "#555",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "400",
  },
  orderCard: {
    borderRadius: 13,
    marginBottom: 17,
    padding: 15,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#222",
    shadowOpacity: 0.05,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  orderId: { fontWeight: "600", fontSize: 16 },
  date: { fontSize: 13.7 },
  address: { fontSize: 13, marginBottom: 4 },
  customer: { fontSize: 13, marginBottom: 8 },
  itemBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 7,
    borderRadius: 10,
    minWidth: 220,
    minHeight: 80,
    borderWidth: 1,
    marginRight: 3,
    gap: 9,
  },
  productImg: {
    width: 48,
    height: 48,
    borderRadius: 7,
    marginRight: 7,
    backgroundColor: "#e6e6e6",
  },
  itemName: { fontSize: 14.7, fontWeight: "500", marginBottom: 2 },
  statusBadge: {
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  statusText: { fontSize: 13, fontWeight: "bold", textTransform: "capitalize" },
  actionBtn: {
    paddingHorizontal: 17,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  paginationFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    gap: 18,
    marginBottom: 8,
  },
  paginationBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 11,
    marginHorizontal: 5,
  },
  paginationBtnDisabled: { opacity: 0.5 },
  paginationBtnLabel: { color: "#fff", fontWeight: "600", fontSize: 15 },
  pageText: { fontSize: 15.1, fontWeight: "500", marginHorizontal: 9 },
  // Modal (Details)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(24,24,20,0.19)",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  modalContent: {
    width: "97%",
    maxHeight: "93%",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    alignSelf: "center",
    elevation: 8,
  },
  closeBtn: { position: "absolute", right: 13, top: 5, zIndex: 10 },
  modalTitle: { fontSize: 19, fontWeight: "bold", marginBottom: 3 },
  modalDesc: { fontSize: 13.5, marginBottom: 10 },
  modalEmpty: { textAlign: "center", marginTop: 52, fontSize: 16 },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 9,
    padding: 9,
    marginBottom: 11,
    gap: 10,
  },
  detailImg: {
    width: 56,
    height: 56,
    borderRadius: 7,
    marginRight: 8,
    backgroundColor: "#e8e8e8",
  },
  transactionBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 13,
    marginTop: 14,
  },
  transactionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 7 },
  transactionLine: { fontSize: 14, marginBottom: 2 },
});
