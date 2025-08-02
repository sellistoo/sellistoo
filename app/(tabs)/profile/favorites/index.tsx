import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useFavorites } from "@/hooks/useFavorites";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FavoriteScreen() {
  const theme = Colors[useColorScheme() ?? "light"];
  const { favoriteProducts, removeFromFavorites } = useFavorites();

  const addToCart = (item: any) => {
    console.log("Add to cart:", item.name);
    // implement cart logic
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        ListHeaderComponent={
          <Text style={[styles.heading, { color: theme.text }]}>
            My Favorites
          </Text>
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        data={favoriteProducts}
        keyExtractor={(item, index) => item.id?.toString() || `fav-${index}`} // ✅ Fixed
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
              },
            ]}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
              <Text
                style={[styles.title, { color: theme.text }]}
                numberOfLines={2}
              >
                {item.name}
              </Text>
              <Text style={[styles.price, { color: theme.tint }]}>
                ₹{item.price}
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => addToCart(item)}
                  style={[styles.addButton, { backgroundColor: theme.tint }]}
                >
                  <Ionicons name="cart-outline" size={18} color="#fff" />
                  <Text style={styles.addButtonText}>Add to Cart</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => removeFromFavorites(item._id)}
                  style={[
                    styles.removeButton,
                    { borderColor: theme.destructive },
                  ]}
                >
                  <Ionicons
                    name="heart-dislike-outline"
                    size={18}
                    color={theme.destructive}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: theme.text, fontSize: 16 }}>
              You haven’t added any products yet.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: "700",
    marginVertical: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 6,
  },
  actions: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  removeButton: {
    borderWidth: 1,
    borderRadius: 50,
    padding: 8,
  },
  empty: {
    marginTop: 60,
    alignItems: "center",
  },
});
