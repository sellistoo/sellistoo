import api from "@/api";
import { Colors } from "@/constants/Colors";
import { useCart } from "@/hooks/useCart";
import { useUserInfo } from "@/hooks/useUserInfo";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  Text,
  TextInput,
} from "react-native-paper";

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

  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  // Fetch Addresses
  useEffect(() => {
    const fn = async () => {
      if (!userInfo?.id) return;
      try {
        setLoading(true);
        const res = await api.get<Address[]>(`/address/${userInfo.id}`);
        setAddresses(res.data ?? []);
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

  // -------- UI RENDER --------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.background }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            style.container,
            { backgroundColor: theme.background },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}
          <View style={style.headerRow}>
            <Ionicons
              name="cart-outline"
              size={32}
              color={theme.tint}
              style={{ marginRight: 8 }}
            />
            <Text
              variant="headlineMedium"
              style={[style.headline, { color: theme.text }]}
            >
              Checkout
            </Text>
          </View>

          {/* Address Section */}
          <View style={{ marginBottom: 18 }}>
            <Text style={[style.sectionTitle, { color: theme.tint }]}>
              Delivery Address
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginVertical: 8 }}
            >
              {addresses.length === 0 ? (
                <View style={style.emptyState}>
                  <Feather name="map-pin" size={24} color={theme.border} />
                  <Text style={{ color: theme.mutedText, marginLeft: 7 }}>
                    No address. Add below!
                  </Text>
                </View>
              ) : (
                addresses.map((address, idx) => (
                  <TouchableOpacity
                    activeOpacity={0.87}
                    key={address.building + address.street + idx}
                    style={[
                      style.addrBubble,
                      {
                        borderColor:
                          selectedIdx === idx ? theme.tint : theme.border,
                        backgroundColor:
                          selectedIdx === idx ? theme.tint : theme.cardBg,
                        shadowColor: selectedIdx === idx ? theme.tint : "#EEE",
                        shadowOpacity: selectedIdx === idx ? 0.17 : 0.07,
                      },
                    ]}
                    onPress={() => setSelectedIdx(idx)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          style.addr,
                          selectedIdx === idx && { color: theme.background },
                        ]}
                      >
                        {address.building}, {address.street}
                      </Text>
                      <Text
                        style={[
                          style.addrSmall,
                          selectedIdx === idx && { color: theme.secondary },
                        ]}
                      >
                        {address.city}, {address.state}, {address.zipCode}
                      </Text>
                      <Text
                        style={[
                          style.addrSmall,
                          selectedIdx === idx && { color: theme.secondary },
                        ]}
                      >
                        📞 {address.mobileNumber}
                      </Text>
                    </View>
                    {selectedIdx === idx && (
                      <MaterialCommunityIcons
                        name="check-decagram"
                        size={22}
                        color={theme.success}
                        style={style.addrSelectedIcon}
                      />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Button
                mode="text"
                icon="plus-circle-outline"
                onPress={() => setShowAddAddress((p) => !p)}
                labelStyle={{ color: theme.accent, fontWeight: "600" }}
              >
                Add Address
              </Button>
            </View>
            {showAddAddress && (
              <Card
                style={[
                  style.addAddressCard,
                  { borderColor: theme.tint },
                  { backgroundColor: theme.secondary },
                ]}
              >
                <Card.Content>
                  {(
                    Object.keys(
                      initialAddress
                    ) as (keyof typeof initialAddress)[]
                  ).map((field) => (
                    <TextInput
                      key={field}
                      mode="outlined"
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
                      style={{
                        backgroundColor: theme.cardBg,
                        marginBottom: 7,
                        fontSize: 15,
                      }}
                      outlineColor={theme.border}
                      activeOutlineColor={theme.tint}
                    />
                  ))}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      gap: 10,
                    }}
                  >
                    <Button
                      mode="contained"
                      icon="content-save"
                      buttonColor={theme.success}
                      textColor={theme.background}
                      style={{ borderRadius: 20 }}
                      onPress={handleAddAddress}
                      loading={loading}
                    >
                      Save
                    </Button>
                    <Button
                      mode="text"
                      onPress={() => setShowAddAddress(false)}
                    >
                      Cancel
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            )}
          </View>

          {/* Order Summary List */}
          <View style={{ marginBottom: 18 }}>
            <Text style={[style.sectionTitle, { color: theme.tint }]}>
              Order Summary
            </Text>
            <Card
              style={[
                style.card,
                {
                  marginBottom: 2,
                  borderRadius: 20,
                  backgroundColor: theme.cardBg,
                },
              ]}
            >
              <Card.Content>
                {cartItems.length === 0 ? (
                  <View style={style.emptyState}>
                    <MaterialCommunityIcons
                      name="shopping-outline"
                      size={24}
                      color={theme.border}
                    />
                    <Text style={{ color: theme.mutedText, marginLeft: 6 }}>
                      Your cart is empty.
                    </Text>
                  </View>
                ) : (
                  cartItems.map((item, idx) => (
                    <View
                      key={item.product + (item.sku ?? "")}
                      style={[
                        style.cartRow,
                        {
                          backgroundColor: theme.secondary,
                          borderRadius: 18,
                          marginBottom: 8,
                          minHeight: 85,
                          elevation: 1,
                          shadowColor: "#282828",
                          shadowOpacity: 0.05,
                          shadowRadius: 7,
                        },
                      ]}
                    >
                      <Image
                        source={{ uri: item.image }}
                        style={style.cartImg}
                        resizeMode="cover"
                      />
                      <View
                        style={{
                          flex: 1,
                          marginHorizontal: 10,
                          paddingRight: 7,
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "bold",
                            fontSize: 15,
                            color: theme.text,
                          }}
                        >
                          {item.name}
                        </Text>
                        <Text
                          style={{
                            color: theme.mutedText,
                            marginTop: 1,
                            marginBottom: 3,
                          }}
                        >
                          ₹{item.price} × {item.quantity}
                        </Text>
                        {(item?.variant?.size || item?.variant?.color) && (
                          <Text style={{ fontSize: 13, color: theme.tint }}>
                            {item?.variant?.size
                              ? `Size: ${item.variant.size} `
                              : ""}
                            {item?.variant?.color
                              ? `Color: ${item.variant.color}`
                              : ""}
                          </Text>
                        )}
                        <View style={style.cartControlRow}>
                          <TouchableOpacity
                            disabled={item.quantity <= 1}
                            onPress={() =>
                              updateQuantity(
                                item.product,
                                item.sku,
                                item.quantity - 1
                              )
                            }
                            style={[
                              style.stepperBtn,
                              {
                                backgroundColor:
                                  item.quantity <= 1
                                    ? theme.border
                                    : theme.tint,
                              },
                            ]}
                          >
                            <Feather
                              name="minus"
                              size={18}
                              color={theme.cardBg}
                            />
                          </TouchableOpacity>
                          <Text style={style.quantityText}>
                            {item.quantity}
                          </Text>
                          <TouchableOpacity
                            onPress={() =>
                              updateQuantity(
                                item.product,
                                item.sku,
                                item.quantity + 1
                              )
                            }
                            style={[
                              style.stepperBtn,
                              { backgroundColor: theme.accent },
                            ]}
                          >
                            <Feather name="plus" size={18} color="#fff" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              removeFromCart(item.product, item.sku)
                            }
                            style={style.deleteBtn}
                          >
                            <MaterialCommunityIcons
                              name="delete"
                              size={20}
                              color={theme.destructive}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 16,
                          alignSelf: "flex-end",
                          color: theme.text,
                        }}
                      >
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  ))
                )}
              </Card.Content>
            </Card>
          </View>

          {/* Payment & Price Summary */}
          <View>
            <Text style={[style.sectionTitle, { color: theme.tint }]}>
              Payment & Price Summary
            </Text>
            <Card
              style={[
                style.card,
                { borderRadius: 20, backgroundColor: theme.cardBg },
              ]}
            >
              <Card.Content>
                <View style={style.summaryRow}>
                  <Text style={{ color: theme.mutedText }}>Subtotal</Text>
                  <Text style={style.summaryValue}>
                    ₹
                    {cartItems
                      .reduce((t, x) => t + x.price * x.quantity, 0)
                      .toFixed(2)}
                  </Text>
                </View>
                <View style={style.summaryRow}>
                  <Text style={{ color: theme.mutedText }}>Shipping</Text>
                  <Text style={style.summaryValue}>
                    ₹{shippingCost.toFixed(2)}
                  </Text>
                </View>
                <Divider
                  style={{ marginVertical: 6, backgroundColor: theme.border }}
                />
                {/* Coupon */}
                <View style={style.couponBar}>
                  <TextInput
                    mode="outlined"
                    label="Coupon"
                    placeholder="Have a code?"
                    value={couponCode}
                    onChangeText={setCouponCode}
                    style={{
                      backgroundColor: theme.input,
                      flex: 1,
                      borderRadius: 10,
                    }}
                    outlineColor={theme.border}
                    activeOutlineColor={theme.tint}
                    right={
                      <TextInput.Icon
                        icon={() => (
                          <Feather name="tag" size={18} color={theme.accent} />
                        )}
                      />
                    }
                  />
                  <Button
                    mode="contained"
                    style={{
                      borderRadius: 14,
                      marginLeft: 8,
                      backgroundColor: theme.success,
                      height: 38,
                    }}
                    onPress={handleApplyCoupon}
                    loading={loading}
                    labelStyle={{ fontWeight: "600", color: theme.cardBg }}
                  >
                    Apply
                  </Button>
                </View>
                {couponError ? (
                  <Text style={{ color: theme.destructive, marginTop: 4 }}>
                    {couponError}
                  </Text>
                ) : null}
                {appliedCoupon ? (
                  <Text
                    style={{
                      color: theme.success,
                      marginTop: 3,
                      fontWeight: "bold",
                    }}
                  >
                    ✓ Coupon {appliedCoupon} applied. Saved ₹{discountAmount}
                  </Text>
                ) : null}
                {discountAmount > 0 && (
                  <View style={style.summaryRow}>
                    <Text style={{ color: theme.success, fontWeight: "bold" }}>
                      Discount
                    </Text>
                    <Text style={{ color: theme.success, fontWeight: "bold" }}>
                      -₹{discountAmount.toFixed(2)}
                    </Text>
                  </View>
                )}
                <Divider
                  style={{ marginVertical: 5, backgroundColor: theme.border }}
                />
                <View style={style.summaryRow}>
                  <Text
                    variant="titleMedium"
                    style={{ fontWeight: "bold", color: theme.text }}
                  >
                    Total Payable
                  </Text>
                  <Text
                    variant="titleMedium"
                    style={{ fontWeight: "bold", color: theme.text }}
                  >
                    ₹{(calculateTotal() - discountAmount).toFixed(2)}
                  </Text>
                </View>
                <Button
                  mode="contained"
                  style={{
                    marginTop: 16,
                    borderRadius: 23,
                    height: 48,
                    backgroundColor: theme.tint,
                    shadowOpacity: 0.13,
                  }}
                  onPress={handlePlaceOrder}
                  loading={loading}
                  disabled={cartItems.length === 0 || selectedIdx === null}
                  labelStyle={{
                    fontSize: 18,
                    fontWeight: "700",
                    letterSpacing: 0.5,
                    color: theme.background,
                  }}
                  icon={() => (
                    <Ionicons
                      name="flash-outline"
                      size={22}
                      color={theme.background}
                    />
                  )}
                >
                  Place Order
                </Button>
              </Card.Content>
            </Card>
          </View>
          {loading && (
            <ActivityIndicator
              color={theme.tint}
              size="large"
              style={{ marginTop: 16 }}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ----------- STYLES -----------
const style = StyleSheet.create({
  container: {
    padding: 14,
    paddingBottom: 32,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    marginBottom: 7,
  },
  headline: {
    fontWeight: "800",
    fontSize: 28,
    letterSpacing: -1,
  },
  sectionTitle: {
    fontSize: 19,
    marginBottom: 7,
    fontWeight: "700",
    paddingLeft: 1,
    letterSpacing: -0.5,
  },
  addrBubble: {
    minWidth: 195,
    maxWidth: 250,
    minHeight: 78,
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 20,
    padding: 12,
    marginRight: 12,
    marginBottom: 2,
    borderWidth: 1,
    elevation: 2,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
    position: "relative",
  },
  addr: {
    fontWeight: "700",
    fontSize: 15.5,
    marginBottom: 2,
  },
  addrSmall: {
    fontSize: 13.2,
  },
  addrSelectedIcon: {
    position: "absolute",
    top: 4,
    right: -12,
  },
  addAddressCard: {
    borderRadius: 20,
    borderWidth: 1.2,
    marginTop: 5,
    marginHorizontal: 1,
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 1,
  },
  card: {
    borderRadius: 18,
    shadowColor: "#282828",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 7,
  },
  emptyState: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingLeft: 2,
    opacity: 0.7,
  },
  cartRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    minHeight: 75,
  },
  cartImg: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#e9eaee",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#fafbfc",
  },
  cartControlRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    marginRight: 9,
    gap: 6,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0,
    marginHorizontal: 1,
  },
  quantityText: {
    width: 28,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
  },
  deleteBtn: {
    marginLeft: 6,
    padding: 4,
    borderRadius: 13,
    shadowOpacity: 0.04,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE9E9",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
    alignItems: "center",
  },
  summaryValue: {
    fontWeight: "600",
    fontSize: 15.5,
  },
  couponBar: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 7,
    gap: 5,
  },
});

export default CheckoutScreen;
