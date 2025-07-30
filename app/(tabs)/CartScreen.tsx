import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface CartItem {
  product: string;
  sku: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: { size?: string; color?: string };
}

const initialCartItems: CartItem[] = [
  {
    product: "p1",
    sku: "sku-p1",
    name: "iPhone 15 Pro 128GB",
    image:
      "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-model-select-202309?wid=470&hei=556&fmt=png-alpha&.v=1692923810002",
    price: 699,
    quantity: 1,
    variant: { color: "Black", size: "128GB" },
  },
  {
    product: "p2",
    sku: "sku-p2",
    name: "Samsung Galaxy Buds Pro",
    image:
      "https://images.samsung.com/is/image/samsung/assets/uk/audio/galaxy-buds/galaxy-buds-pro/galaxy-buds-pro_kv_mo.jpg",
    price: 69,
    quantity: 2,
  },
];

export default function CartScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);

  const updateQuantity = (sku: string, newQty: number) => {
    if (newQty <= 0) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.sku === sku ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeItem = (sku: string) => {
    setCartItems((prev) => prev.filter((item) => item.sku !== sku));
  };

  const clearCart = () => {
    Alert.alert("Clear Cart", "Are you sure you want to remove all items?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", onPress: () => setCartItems([]) },
    ]);
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={{ padding: 16 }}
      >
        <Text style={[styles.title, { color: theme.text }]}>Shopping Cart</Text>

        {cartItems.length === 0 ? (
          <Text style={{ color: theme.mutedText }}>Your cart is empty.</Text>
        ) : (
          <>
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item.sku}
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
                      £{item.price.toFixed(2)}
                    </Text>
                    {item.variant && (
                      <Text
                        style={[styles.variant, { color: theme.mutedText }]}
                      >
                        {item.variant.size && `Size: ${item.variant.size}`}
                        {item.variant.color && `  Color: ${item.variant.color}`}
                      </Text>
                    )}

                    <View style={styles.quantityRow}>
                      <TouchableOpacity
                        onPress={() =>
                          updateQuantity(item.sku, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        style={[
                          styles.qtyBtn,
                          { backgroundColor: theme.accent },
                        ]}
                      >
                        <Text style={styles.qtyText}>−</Text>
                      </TouchableOpacity>
                      <Text style={[styles.qtyCount, { color: theme.text }]}>
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          updateQuantity(item.sku, item.quantity + 1)
                        }
                        style={[
                          styles.qtyBtn,
                          { backgroundColor: theme.accent },
                        ]}
                      >
                        <Text style={styles.qtyText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => removeItem(item.sku)}>
                    <Feather name="trash-2" size={18} color={theme.icon} />
                  </TouchableOpacity>
                </View>
              )}
            />

            {/* Total & Actions */}
            <View style={styles.footer}>
              <Text style={[styles.totalText, { color: theme.text }]}>
                Total: £{total.toFixed(2)}
              </Text>
              <TouchableOpacity
                onPress={clearCart}
                style={[styles.clearBtn, { backgroundColor: theme.errorBg }]}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Clear Cart
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.checkoutBtn, { backgroundColor: theme.tint }]}
                onPress={() => {
                  // Redirect to checkout
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Proceed to Checkout
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
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
  footer: { marginTop: 24 },
  totalText: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  clearBtn: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  checkoutBtn: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
});
