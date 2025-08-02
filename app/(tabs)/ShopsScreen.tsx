import api from "@/api";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Shop {
  _id: string;
  storeName: string;
  storeLogoUrl?: string;
  storeDescription: string;
}

export default function ShopsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/sellers/shop");
        setShops(res.data || []);
      } catch (err) {
        setError("Failed to fetch shops");
        console.error("Failed to fetch shops", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  const renderItem = ({ item }: { item: Shop }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.cardBg, borderColor: theme.border },
      ]}
      onPress={() => {
        router.push({
          pathname: "/shops/[shopId]",
          params: { shopId: item._id },
        });
      }}
    >
      <View style={styles.logoContainer}>
        <Image
          source={{
            uri:
              item.storeLogoUrl ||
              "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg",
          }}
          style={styles.logo}
        />
      </View>
      <Text style={[styles.shopName, { color: theme.text }]}>
        {item.storeName}
      </Text>
      <Text
        style={[styles.description, { color: theme.mutedText }]}
        numberOfLines={2}
      >
        {item.storeDescription}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        <Text style={[styles.title, { color: theme.text }]}>Explore Shops</Text>

        {loading && (
          <ActivityIndicator
            size="large"
            color={theme.tint}
            style={{ marginTop: 20 }}
          />
        )}

        {error && (
          <Text style={{ textAlign: "center", color: "red", marginTop: 20 }}>
            {error}
          </Text>
        )}

        {!loading && !error && (
          <FlatList
            data={shops}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 20,
                  color: theme.mutedText,
                }}
              >
                No shops found.
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  card: {
    width: "48%",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  logoContainer: {
    height: 100,
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#eee",
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  logo: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  shopName: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  description: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
});
