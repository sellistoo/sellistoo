import BannerSlider from "@/components/BannerSlider";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Address Bar */}
      <View
        style={[styles.addressContainer, { backgroundColor: theme.secondary }]}
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
        <TouchableOpacity style={styles.addressRightIcon}>
          <Feather name="bell" size={20} color={theme.icon} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.secondary }]}>
          <Ionicons name="search" size={20} color={theme.icon} />
          <TextInput
            placeholder="Search for phones, laptops, accessories..."
            placeholderTextColor={theme.icon}
            style={[styles.searchInput, { color: theme.text }]}
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
        <TouchableOpacity>
          <Text style={[styles.seeAll, { color: theme.tint }]}>See all</Text>
        </TouchableOpacity>
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
        <TouchableOpacity>
          <Text style={[styles.seeAll, { color: theme.tint }]}>See all</Text>
        </TouchableOpacity>
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
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  addressLeftIcon: {
    marginRight: 10,
    padding: 8,
    borderRadius: 20,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  addressValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  addressRightIcon: {
    marginLeft: "auto",
    padding: 6,
  },

  searchBarContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchInput: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },

  bannerContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  bannerText: {
    fontSize: 16,
    fontWeight: "500",
  },
  bannerImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginLeft: "auto",
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontWeight: "600",
    fontSize: 18,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "500",
  },

  categoryList: {
    paddingLeft: 16,
    paddingBottom: 16,
  },
  categoryCard: {
    alignItems: "center",
    marginRight: 16,
    padding: 12,
    borderRadius: 12,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  categoryIcon: {
    fontSize: 36,
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "500",
  },

  flashList: {
    paddingLeft: 16,
    paddingBottom: 30,
  },
  productCard: {
    width: 180,
    marginRight: 16,
    borderRadius: 12,
    padding: 12,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 130,
    borderRadius: 10,
    marginBottom: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  oldPrice: {
    fontSize: 14,
    textDecorationLine: "line-through",
    marginLeft: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
