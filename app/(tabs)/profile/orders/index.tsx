import { Colors } from "@/constants/Colors";
import { format } from "date-fns";
import React from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const dummyOrders = [
  {
    id: "ORD001",
    createdAt: "2025-07-20T09:00:00.000Z",
    total: 1999.0,
    items: [
      {
        id: "1",
        name: "Noise Smartwatch",
        quantity: 1,
        price: 1999,
        image: "https://m.media-amazon.com/images/I/61ZuLq0jKjL._SX679_.jpg",
        status: "Delivered",
      },
      {
        id: "2",
        name: "Noise Smartwatch",
        quantity: 1,
        price: 1999,
        image: "https://m.media-amazon.com/images/I/61ZuLq0jKjL._SX679_.jpg",
        status: "Delivered",
      },
    ],
  },
  {
    id: "ORD002",
    createdAt: "2025-07-18T14:30:00.000Z",
    total: 599.0,
    items: [
      {
        id: "3",
        name: "Boat Wired Earphones",
        quantity: 1,
        price: 599,
        image: "https://m.media-amazon.com/images/I/61RJXdlWr+L._SX679_.jpg",
        status: "Cancelled",
      },
    ],
  },
];

export default function OrderScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const renderItem = ({ item }: { item: (typeof dummyOrders)[0] }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.cardBg, borderColor: theme.border },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.orderId, { color: theme.text }]}>
          Order #{item.id}
        </Text>
        <Text style={{ color: theme.mutedText, fontSize: 13 }}>
          {format(new Date(item.createdAt), "dd MMM yyyy")}
        </Text>
      </View>

      {item.items.map((product) => (
        <View key={product.id} style={styles.itemRow}>
          <Image source={{ uri: product.image }} style={styles.image} />
          <View style={styles.details}>
            <Text
              style={[styles.name, { color: theme.text }]}
              numberOfLines={1}
            >
              {product.name}
            </Text>
            <Text style={{ color: theme.mutedText, fontSize: 13 }}>
              ₹{product.price} × {product.quantity}
            </Text>
            <Text
              style={{
                color:
                  product.status === "Delivered"
                    ? "green"
                    : product.status === "Cancelled"
                    ? theme.destructive
                    : theme.accent,
                fontSize: 13,
              }}
            >
              {product.status}
            </Text>
          </View>
        </View>
      ))}

      <View style={styles.footerRow}>
        <Text style={[styles.total, { color: theme.text }]}>
          Total: ₹{item.total.toFixed(2)}
        </Text>
        <TouchableOpacity>
          <Text style={{ color: theme.tint, fontWeight: "500" }}>
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]}>My Orders</Text>

      {/* Orders List */}
      <FlatList
        data={dummyOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  footerRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  total: {
    fontSize: 15,
    fontWeight: "600",
  },
});
