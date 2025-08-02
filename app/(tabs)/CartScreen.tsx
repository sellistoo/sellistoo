import { Colors } from "@/constants/Colors";
import { useCart } from "@/hooks/useCart";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CartScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleClearCart = () => {
    Alert.alert("Clear Cart", "Are you sure you want to remove all items?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", onPress: () => clearCart() },
    ]);
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1 }}>
        <Text
          style={[styles.title, { color: theme.text, paddingHorizontal: 16 }]}
        >
          Shopping Cart
        </Text>

        {cartItems.length === 0 ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ color: theme.mutedText, marginTop: 20 }}>
              Your cart is empty.
            </Text>
          </View>
        ) : (
          <FlatList
            data={cartItems}
            keyExtractor={(item) => `${item.product}-${item.sku}`}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 110, // enough for bottom bar
            }}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.item,
                  {
                    backgroundColor: theme.cardBg,
                    shadowColor: theme.border,
                  },
                ]}
              >
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.details}>
                  <Text style={[styles.name, { color: theme.text }]}>
                    {item.name}
                  </Text>
                  <Text style={{ color: theme.mutedText }}>
                    ₹{item.price.toFixed(2)}
                  </Text>
                  {item.variant && (
                    <Text style={[styles.variant, { color: theme.mutedText }]}>
                      {item.variant.size && `Size: ${item.variant.size}`}
                      {item.variant.color && `  Color: ${item.variant.color}`}
                    </Text>
                  )}
                  <View style={styles.quantityRow}>
                    <TouchableOpacity
                      onPress={() =>
                        updateQuantity(
                          item.product,
                          item.sku,
                          item.quantity - 1
                        )
                      }
                      disabled={item.quantity <= 1}
                      style={[
                        styles.qtyBtn,
                        {
                          backgroundColor: theme.accent,
                          opacity: item.quantity <= 1 ? 0.5 : 1,
                        },
                      ]}
                    >
                      <Text style={styles.qtyText}>−</Text>
                    </TouchableOpacity>
                    <Text style={[styles.qtyCount, { color: theme.text }]}>
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
                      style={[styles.qtyBtn, { backgroundColor: theme.accent }]}
                    >
                      <Text style={styles.qtyText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => removeFromCart(item.product, item.sku)}
                >
                  <Feather name="trash-2" size={18} color={theme.icon} />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
      {cartItems.length > 0 && (
        <View
          style={[
            styles.summaryBar,
            {
              backgroundColor: theme.cardBg,
              shadowColor: theme.border,
              // "Platform.OS === 'ios'" for extra iPhone bottom space
              paddingBottom: Platform.OS === "ios" ? 100 : 100,
            },
          ]}
        >
          <Text style={[styles.totalText, { color: theme.text }]}>
            Total: ₹{total.toFixed(2)}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={handleClearCart}
              style={[styles.clearBtn, { backgroundColor: theme.errorBg }]}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.checkoutBtn, { backgroundColor: theme.tint }]}
              onPress={() => {
                // Navigate to checkout
              }}
            >
              <Text
                style={{ color: "#fff", fontWeight: "600" }}
                onPress={() => {
                  router.push("/checkout");
                }}
              >
                Checkout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  image: { width: 70, height: 70, borderRadius: 8, marginRight: 12 },
  details: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600" },
  variant: { fontSize: 12, marginTop: 4 },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: { color: "#fff", fontSize: 16 },
  qtyCount: { marginHorizontal: 12, fontSize: 15 },
  summaryBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 15,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -3 },
  },
  totalText: { fontSize: 16, fontWeight: "600" },
  clearBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginRight: 12,
    marginLeft: 16,
  },
  checkoutBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginLeft: 8,
  },
});
