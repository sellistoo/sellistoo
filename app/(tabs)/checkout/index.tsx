import api from "@/api";
import { useCart } from "@/hooks/useCart";
import { useUserInfo } from "@/hooks/useUserInfo";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  IconButton,
  RadioButton,
  Text,
  TextInput,
} from "react-native-paper";

// --- DATA MODELS ---
export interface Address {
  building: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  country?: string;
  zipCode: string;
  mobileNumber: string;
  isDefault: boolean;
}
export interface CartItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  sku: string;
  variant?: { size?: string; color?: string };
}
interface ShippingAPIResponse {
  totalShippingCost: number;
  breakdown: any[];
}
interface CouponAPIResponse {
  code: string;
  type: "percent" | "fixed";
  discount: number;
}
interface OrderPayload {
  userId: string;
  items: {
    productId: string;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    variant?: { size?: string; color?: string };
  }[];
  shippingAddress: string;
  shippingMethod: string;
  shippingCost: number;
  shippingBreakdown: any[];
  currency: string;
  paymentStatus: string;
  paymentMethod: string;
  couponCode?: string;
  orderNumber: string;
}
const initialAddress: Omit<Address, "isDefault"> = {
  building: "",
  street: "",
  landmark: "",
  city: "",
  state: "",
  zipCode: "",
  mobileNumber: "",
};

const CheckoutScreen: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { userInfo } = useUserInfo();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showAddAddress, setShowAddAddress] = useState<boolean>(false);
  const [newAddress, setNewAddress] =
    useState<Omit<Address, "isDefault">>(initialAddress);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [shippingBreakdown, setShippingBreakdown] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string>("");
  const [couponError, setCouponError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch Addresses
  useEffect(() => {
    const fn = async () => {
      if (!userInfo?.id) return;
      try {
        setLoading(true);
        const res = await api.get<Address[]>(`/address/${userInfo.id}`);
        setAddresses(res.data ?? []);
        // Auto-select default if any:
        const defIdx = (res.data ?? []).findIndex((a) => a.isDefault);
        setSelectedIdx(defIdx !== -1 ? defIdx : 0);
      } catch (e) {
        Alert.alert("Error", "Failed to get addresses");
      } finally {
        setLoading(false);
      }
    };
    fn();
  }, [userInfo?.id]);

  // Recalculate shipping
  useEffect(() => {
    const fn = async () => {
      if (
        selectedIdx === null ||
        addresses.length === 0 ||
        cartItems.length === 0
      )
        return;
      try {
        setLoading(true);
        const selected = addresses[selectedIdx];
        const res = await api.post<ShippingAPIResponse>(`/shipping`, {
          buyerPincode: selected.zipCode,
          products: cartItems.map((item) => ({
            productId: item.product,
            quantity: item.quantity,
          })),
        });
        setShippingCost(res.data.totalShippingCost ?? 0);
        setShippingBreakdown(res.data.breakdown ?? []);
      } catch (e) {
        setShippingCost(0);
      } finally {
        setLoading(false);
      }
    };
    fn();
  }, [selectedIdx, addresses, cartItems]);

  // Coupon validate
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setLoading(true);
      const total = calculateTotal();
      const res = await api.post<CouponAPIResponse>(`/coupons/validate`, {
        code: couponCode,
        amount: total,
      });
      const coupon = res.data;
      const discount =
        coupon.type === "percent"
          ? +(total * (coupon.discount / 100)).toFixed(2)
          : coupon.discount;
      setDiscountAmount(discount);
      setAppliedCoupon(coupon.code);
      setCouponError("");
    } catch (e: any) {
      setDiscountAmount(0);
      setAppliedCoupon("");
      setCouponError(e?.response?.data?.message || "Invalid coupon");
    } finally {
      setLoading(false);
    }
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!userInfo?.id || selectedIdx === null || addresses.length === 0) return;
    const selectedAddress = addresses[selectedIdx];
    const shippingAddress = `${selectedAddress.building}, ${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.zipCode}`;
    const items = cartItems.map((item) => ({
      productId: item.product,
      name: item.name,
      sku: item.sku,
      price: item.price,
      quantity: item.quantity,
      variant: item.variant ?? undefined,
    }));

    const payload: OrderPayload = {
      userId: userInfo.id,
      items,
      shippingAddress,
      shippingMethod: "Standard",
      shippingCost,
      shippingBreakdown,
      currency: "INR",
      paymentStatus: "pending",
      paymentMethod: "cod",
      couponCode: appliedCoupon || undefined,
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    try {
      setLoading(true);
      await api.post(`/order`, payload);
      Alert.alert("Success", "Order placed successfully.");
      // Optionally clear cart here
    } catch (e) {
      Alert.alert("Error", "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  // Total calc
  const calculateTotal = () => {
    const subtotal = cartItems.reduce(
      (total, item) => total + (item.price ?? 0) * (item.quantity ?? 1),
      0
    );
    return subtotal + shippingCost;
  };

  // Add address
  const handleAddAddress = async () => {
    try {
      setLoading(true);
      await api.post(`/address/${userInfo?.id}`, newAddress);
      setShowAddAddress(false);
      setNewAddress(initialAddress);
      // Refresh address list
      const res = await api.get<Address[]>(`/address/${userInfo?.id}`);
      setAddresses(res.data ?? []);
    } catch (e) {
      Alert.alert("Error", "Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  // --------------- UI RENDER ---------------
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: "#fafaff" }}
        contentContainerStyle={s.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          variant="headlineMedium"
          style={{ marginBottom: 12, marginTop: 16 }}
        >
          Checkout
        </Text>

        {/* Address Section */}
        <Card style={s.card}>
          <Card.Title title="Delivery Address" />
          <Card.Content>
            {addresses.length === 0 ? (
              <Text>No address found. Please add one below.</Text>
            ) : (
              addresses.map((address, idx) => (
                <Card
                  key={idx}
                  style={[
                    s.addrCard,
                    selectedIdx === idx && {
                      borderColor: "#6200ee",
                      backgroundColor: "#ede7f6",
                    },
                  ]}
                  onPress={() => setSelectedIdx(idx)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={s.addr}>
                        {address.building}, {address.street}
                      </Text>
                      <Text style={s.addrSmall}>
                        {address.city}, {address.state}, {address.zipCode}
                      </Text>
                      <Text style={s.addrSmall}>📞 {address.mobileNumber}</Text>
                    </View>
                    {address.isDefault && (
                      <Text
                        style={{
                          color: "#6200ee",
                          fontWeight: "bold",
                          fontSize: 12,
                          backgroundColor: "#ede7f6",
                          padding: 2,
                          borderRadius: 3,
                        }}
                      >
                        Default
                      </Text>
                    )}
                    <RadioButton
                      value={String(idx)}
                      status={selectedIdx === idx ? "checked" : "unchecked"}
                      onPress={() => setSelectedIdx(idx)}
                    />
                  </View>
                </Card>
              ))
            )}

            {showAddAddress ? (
              <View style={{ marginTop: 16 }}>
                {(
                  Object.keys(initialAddress) as (keyof typeof initialAddress)[]
                ).map((field) => (
                  <TextInput
                    key={field}
                    style={{ marginBottom: 8, backgroundColor: "#fff" }}
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    placeholder={
                      field === "landmark" ? "(Optional) " + field : field
                    }
                    value={newAddress[field] ?? ""}
                    keyboardType={
                      field === "mobileNumber" || field === "zipCode"
                        ? "number-pad"
                        : "default"
                    }
                    maxLength={
                      field === "mobileNumber"
                        ? 10
                        : field === "zipCode"
                        ? 6
                        : undefined
                    }
                    onChangeText={(val: string) => {
                      let txt = val;
                      if (field === "mobileNumber" || field === "zipCode")
                        txt = txt.replace(/\D/g, "");
                      setNewAddress({ ...newAddress, [field]: txt });
                    }}
                  />
                ))}

                <Button
                  icon="content-save"
                  mode="contained"
                  style={{ marginTop: 10 }}
                  onPress={handleAddAddress}
                  loading={loading}
                >
                  Save Address
                </Button>
                <Button
                  style={{ marginTop: 4 }}
                  mode="text"
                  onPress={() => setShowAddAddress(false)}
                >
                  Cancel
                </Button>
              </View>
            ) : (
              <Button
                style={{ marginTop: 14 }}
                icon="plus"
                mode="outlined"
                onPress={() => setShowAddAddress(true)}
              >
                Add New Address
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Order summary list */}
        <Card style={s.card}>
          <Card.Title title="Order Summary" />
          <Card.Content>
            {cartItems.length === 0 ? (
              <Text>Your cart is empty.</Text>
            ) : (
              cartItems.map((item, idx) => (
                <View key={item.product + (item.sku ?? "")} style={s.cartRow}>
                  <Image source={{ uri: item.image }} style={s.cartImg} />
                  <View style={{ flex: 1, marginHorizontal: 12 }}>
                    <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                    <Text style={{ color: "#888" }}>
                      ₹{item.price} × {item.quantity}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginVertical: 3,
                      }}
                    >
                      <Button
                        icon="close"
                        mode="text"
                        compact
                        onPress={() => removeFromCart(item.product, item.sku)}
                        labelStyle={{ color: "red" }}
                        accessibilityLabel="Remove item"
                      >
                        {""}
                      </Button>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginVertical: 3,
                      }}
                    >
                      <IconButton
                        icon="minus"
                        disabled={item.quantity <= 1}
                        onPress={() =>
                          updateQuantity(
                            item.product,
                            item.sku,
                            item.quantity - 1
                          )
                        }
                        accessibilityLabel="Decrease quantity"
                        size={20}
                        style={{ marginRight: 2 }}
                      />

                      <Text
                        style={{
                          minWidth: 28,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {item.quantity}
                      </Text>

                      <IconButton
                        icon="plus"
                        onPress={() =>
                          updateQuantity(
                            item.product,
                            item.sku,
                            item.quantity + 1
                          )
                        }
                        accessibilityLabel="Increase quantity"
                        size={20}
                        style={{ marginLeft: 2 }}
                      />

                      <IconButton
                        icon="close"
                        onPress={() => removeFromCart(item.product, item.sku)}
                        accessibilityLabel="Remove item"
                        size={20}
                        style={{ marginLeft: 2 }}
                        iconColor="red"
                      />
                    </View>
                  </View>
                  <Text style={{ fontWeight: "bold" }}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Payment & Price Summary */}
        <Card style={s.card}>
          <Card.Title title="Payment & Price Summary" />
          <Card.Content>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text>Subtotal:</Text>
              <Text>
                ₹
                {cartItems
                  .reduce((t, x) => t + x.price * x.quantity, 0)
                  .toFixed(2)}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text>Shipping:</Text>
              <Text>₹{shippingCost.toFixed(2)}</Text>
            </View>
            <Divider style={{ marginVertical: 8 }} />
            {/* Coupon */}
            <TextInput
              label="Apply Coupon"
              placeholder="Enter coupon code"
              value={couponCode}
              onChangeText={setCouponCode}
              style={{ marginBottom: 4, backgroundColor: "#fff" }}
              right={<TextInput.Icon icon="tag" />}
            />
            <Button
              mode="outlined"
              onPress={handleApplyCoupon}
              loading={loading}
              style={{ marginBottom: 4 }}
            >
              Apply
            </Button>
            {couponError ? (
              <Text style={{ color: "red" }}>{couponError}</Text>
            ) : null}
            {appliedCoupon ? (
              <Text style={{ color: "green" }}>
                `Coupon {appliedCoupon} applied. Saved ₹{discountAmount}`
              </Text>
            ) : null}
            {discountAmount > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: "green", fontWeight: "bold" }}>
                  Discount:
                </Text>
                <Text style={{ color: "green", fontWeight: "bold" }}>
                  - ₹{discountAmount.toFixed(2)}
                </Text>
              </View>
            )}
            <Divider style={{ marginVertical: 8 }} />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text variant="titleMedium">Total Payable:</Text>
              <Text variant="titleMedium">
                ₹{(calculateTotal() - discountAmount).toFixed(2)}
              </Text>
            </View>
            <Button
              mode="contained"
              style={{ marginTop: 14 }}
              onPress={handlePlaceOrder}
              loading={loading}
              disabled={cartItems.length === 0 || selectedIdx === null}
            >
              Place Order
            </Button>
          </Card.Content>
        </Card>

        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 15 }} />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  card: {
    marginBottom: 18,
    borderRadius: 16,
    overflow: "hidden",
  },
  addrCard: {
    borderWidth: 2,
    borderColor: "#eee",
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 10,
    padding: 12,
  },
  addr: { fontWeight: "600", fontSize: 15 },
  addrSmall: { color: "#686868", fontSize: 13 },
  cartRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    borderBottomWidth: 0.7,
    borderBottomColor: "#ebebeb",
    paddingBottom: 8,
  },
  cartImg: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#ddd",
  },
  container: { padding: 18 },
});

export default CheckoutScreen;
