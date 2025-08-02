import BannerSlider from "@/components/BannerSlider";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();

  // Local state for search input value
  const [searchText, setSearchText] = useState("");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Address Bar */}
        <View
          style={[
            styles.addressContainer,
            { backgroundColor: theme.secondary },
          ]}
        >
          <TouchableOpacity
            style={[styles.addressLeftIcon, { backgroundColor: theme.accent }]}
          >
            <Ionicons name="location-outline" size={20} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.addressContent}>
            <Text style={[styles.addressLabel, { color: theme.mutedText }]}>
              Deliver to
            </Text>
            <Text style={[styles.addressValue, { color: theme.text }]}>
              92 High Street, London
            </Text>
          </View>
        </View>

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
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
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
    marginBottom: 24,
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
    paddingVertical: 16,
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
});
