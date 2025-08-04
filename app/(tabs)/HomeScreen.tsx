import api from "@/api";
import BannerSlider from "@/components/BannerSlider";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useUserInfo } from "@/hooks/useUserInfo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const shopImagePlaceholder = require("@/assets/images/shop.jpg");

// Dummy Data
const categories = [
  { id: "1", name: "Phones", icon: "📱" },
  { id: "2", name: "Consoles", icon: "🎮" },
  { id: "3", name: "Laptops", icon: "💻" },
  { id: "4", name: "Cameras", icon: "📷" },
  { id: "5", name: "Audio", icon: "🎧" },
];

const flashSale = [
  {
    id: "1",
    name: "Apple iPhone 15 Pro 128GB",
    price: "£699.00",
    oldPrice: "£739.00",
    image:
      "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-model-select-202309?wid=470&hei=556&fmt=png-alpha&.v=1692923810002",
  },
  {
    id: "2",
    name: "Samsung Galaxy Buds Pro",
    price: "£69.00",
    oldPrice: "£85.00",
    image:
      "https://images.samsung.com/is/image/samsung/assets/uk/audio/galaxy-buds/galaxy-buds-pro/galaxy-buds-pro_kv_mo.jpg",
  },
];

const banners = [
  {
    id: "1",
    title: "Delivery is",
    discountText: "50% OFF",
    image: "https://images.unsplash.com/photo-1600185365483-26d7c481c959?w=600",
  },
  {
    id: "2",
    title: "Mega Deals",
    discountText: "20% OFF",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
  },
  {
    id: "3",
    title: "New Arrivals",
    discountText: "30% OFF",
    image: "https://images.unsplash.com/photo-1598515214213-7c603db7ed1e?w=600",
  },
];
interface Shop {
  _id: string;
  storeName: string;
  storeLogoUrl?: string;
  storeDescription: string;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const { userInfo } = useUserInfo();
  const [userAddress, setUserAddress] = useState<string>("");
  // Shops state & loading/error
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [shopsError, setShopsError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const fetchDefaultAddress = async () => {
        console.log("inside address");

        if (!userInfo?.id) return;
        try {
          // Fetch all addresses
          const res = await api.get(`/address/${userInfo.id}`);
          const addresses = res.data || [];
          // Find default address
          const defaultAddr = addresses.find((item: any) => item.isDefault);
          if (defaultAddr) {
            // Compose a user-friendly string from address fields
            setUserAddress(
              `${defaultAddr.building}, ${defaultAddr.street}, ${defaultAddr.city} - ${defaultAddr.zipCode}`
            );
          } else if (addresses.length > 0) {
            // If not marked, fallback to first
            const adr = addresses[0];
            setUserAddress(
              `${adr.building}, ${adr.street}, ${adr.city} - ${adr.zipCode}`
            );
          } else {
            setUserAddress(""); // No address found
          }
        } catch {
          setUserAddress("");
        }
      };
      fetchDefaultAddress();
    }, [userInfo?.id])
  );

  // Shops fetch on mount/focus
  useFocusEffect(
    useCallback(() => {
      const fetchShops = async () => {
        setShopsLoading(true);
        setShopsError(null);
        try {
          const res = await api.get("/sellers/shop");
          setShops(res.data || []);
        } catch (err) {
          setShopsError("Failed to fetch shops");
        } finally {
          setShopsLoading(false);
        }
      };
      fetchShops();
    }, [])
  );

  // Render individual shop card (horizontal)
  const renderShopCard = ({ item }: { item: Shop }) => (
    <TouchableOpacity
      style={[
        styles.shopCard,
        { backgroundColor: theme.cardBg, borderColor: theme.border },
      ]}
      onPress={() =>
        router.push({
          pathname: "/shops/[shopId]",
          params: { shopId: item._id },
        })
      }
    >
      <View style={styles.logoContainer}>
        <Image
          source={
            item.storeLogoUrl && item.storeLogoUrl.trim() !== ""
              ? { uri: item.storeLogoUrl }
              : shopImagePlaceholder
          }
          style={styles.logo}
        />
      </View>
      <Text style={[styles.shopName, { color: theme.text }]}>
        {item.storeName}
      </Text>
      <Text
        style={[styles.shopDescription, { color: theme.mutedText }]}
        numberOfLines={2}
      >
        {item.storeDescription}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* HEADER: fixed delivery address & search */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        {/* Address Bar */}
        {userAddress && (
          <View
            style={[
              styles.addressContainer,
              { backgroundColor: theme.secondary },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.addressLeftIcon,
                { backgroundColor: theme.accent },
              ]}
            >
              <Ionicons name="location-outline" size={20} color={theme.text} />
            </TouchableOpacity>
            <View style={styles.addressContent}>
              <Text style={[styles.addressLabel, { color: theme.mutedText }]}>
                Deliver to
              </Text>
              <Text style={[styles.addressValue, { color: theme.text }]}>
                {userAddress || "--"}
              </Text>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <View
            style={[styles.searchBar, { backgroundColor: theme.secondary }]}
          >
            <Ionicons name="search" size={20} color={theme.icon} />
            <TextInput
              placeholder="Search for phones, laptops, accessories..."
              placeholderTextColor={theme.icon}
              style={[styles.searchInput, { color: theme.text }]}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={() => {
                if (searchText.trim().length > 0) {
                  router.push({
                    pathname: "/SearchScreen",
                    params: { initialQuery: searchText.trim() },
                  });
                }
              }}
              returnKeyType="search"
              blurOnSubmit={true}
            />
          </View>
        </View>
      </View>

      {/* SCROLLABLE main content */}
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <BannerSlider banners={banners} />

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Categories
          </Text>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          contentContainerStyle={styles.categoryList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.categoryCard,
                { backgroundColor: theme.secondary, shadowColor: theme.border },
              ]}
            >
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text style={[styles.categoryName, { color: theme.text }]}>
                {item.name}
              </Text>
            </View>
          )}
        />

        {/* Shops Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Shops
          </Text>
        </View>
        {shopsLoading ? (
          <ActivityIndicator
            color={theme.tint}
            style={{ marginVertical: 18 }}
          />
        ) : shopsError ? (
          <Text style={{ textAlign: "center", color: "red", marginBottom: 16 }}>
            {shopsError}
          </Text>
        ) : (
          <FlatList
            data={shops}
            horizontal
            keyExtractor={(item) => item._id}
            renderItem={renderShopCard}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shopList}
            ListEmptyComponent={
              <Text
                style={{
                  color: theme.mutedText,
                  textAlign: "center",
                  paddingVertical: 18,
                }}
              >
                No shops found.
              </Text>
            }
          />
        )}

        {/* Flash Sale */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Flash Sale
          </Text>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={flashSale}
          contentContainerStyle={styles.flashList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.productCard,
                {
                  backgroundColor: theme.cardBg,
                  shadowColor: theme.border,
                },
              ]}
            >
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <Text style={[styles.productName, { color: theme.text }]}>
                {item.name}
              </Text>
              <View style={styles.priceRow}>
                <Text style={[styles.productPrice, { color: theme.text }]}>
                  {item.price}
                </Text>
                <Text style={[styles.oldPrice, { color: theme.mutedText }]}>
                  {item.oldPrice}
                </Text>
              </View>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 0,
    // To make sure it stands apart visually from scroll:
    backgroundColor: "#fff",
    zIndex: 10,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  addressLeftIcon: {
    marginRight: 12,
    padding: 8,
    borderRadius: 20,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.7,
  },
  addressValue: {
    fontSize: 15,
    fontWeight: "600",
  },

  searchBarContainer: {
    marginHorizontal: 16,
    marginTop: 9,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
  },
  searchInput: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  categoryList: {
    paddingLeft: 16,
    paddingBottom: 20,
  },
  categoryCard: {
    alignItems: "center",
    marginRight: 16,
    padding: 14,
    borderRadius: 16,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 34,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "500",
  },

  flashList: {
    paddingLeft: 16,
    paddingBottom: 32,
  },
  productCard: {
    width: 170,
    marginRight: 16,
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 130,
    borderRadius: 12,
    marginBottom: 10,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  oldPrice: {
    fontSize: 13,
    textDecorationLine: "line-through",
    marginLeft: 6,
    opacity: 0.6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  // --- SHOPS styles ---
  shopList: {
    paddingLeft: 16,
    paddingBottom: 20,
  },
  shopCard: {
    width: 160,
    marginRight: 15,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logoContainer: {
    height: 80,
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#eee",
    marginBottom: 7,
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
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  shopDescription: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 2,
  },
});
