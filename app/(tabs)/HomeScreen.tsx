import React from "react";
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const featuredProducts = [
  {
    id: "1",
    name: "Nike Air Max",
    price: "₹4,999",
    image: {
      uri: "https://images.unsplash.com/photo-1586796676072-d1a2014f61f7?w=600",
    },
  },
  {
    id: "2",
    name: "Adidas Ultraboost",
    price: "₹5,299",
    image: {
      uri: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3e?w=600",
    },
  },
  {
    id: "3",
    name: "Vans Red",
    price: "₹3,899",
    image: {
      uri: "https://images.unsplash.com/photo-1519741491158-3c8166e3c424?w=600",
    },
  },
];

const shops = [
  {
    id: "nike",
    name: "Nike",
    image: { uri: "https://img.icons8.com/color/96/nike.png" },
  },
  {
    id: "adidas",
    name: "Adidas",
    image: { uri: "https://img.icons8.com/color/96/adidas.png" },
  },
  {
    id: "gucci",
    name: "Gucci",
    image: { uri: "https://img.icons8.com/color/96/gucci.png" },
  },
];

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <Image
          style={styles.banner}
          source={{
            uri: "https://images.unsplash.com/photo-1600185365483-26d7c481c959?w=1080",
          }}
          resizeMode="cover"
        />

        {/* Shops */}
        <Text style={styles.sectionTitle}>Popular Shops</Text>
        <View style={styles.shopRow}>
          {shops.map((shop) => (
            <TouchableOpacity key={shop.id} style={styles.shopCard}>
              <Image source={shop.image} style={styles.shopImage} />
              <Text style={styles.shopName}>{shop.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured Products */}
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <FlatList
          data={featuredProducts}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.productList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.productCard}>
              <Image source={item.image} style={styles.productImage} />
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>{item.price}</Text>
            </TouchableOpacity>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },
  container: {
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  banner: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  shopRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  shopCard: {
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  shopImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 6,
  },
  shopName: {
    fontSize: 13,
    fontWeight: "500",
  },
  productList: {
    paddingHorizontal: 16,
  },
  productCard: {
    width: 160,
    marginRight: 16,
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  productName: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
    textAlign: "center",
  },
  productPrice: {
    fontSize: 14,
    color: "#2CB9B0",
    fontWeight: "bold",
  },
});

export default HomeScreen;
