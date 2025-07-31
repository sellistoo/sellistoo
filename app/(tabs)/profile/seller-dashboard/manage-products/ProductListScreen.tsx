import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  quantity: number;
  sku: string;
  images: string[];
}

export default function ProductListScreen() {
  const itemsPerPage = 5;

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Dummy data for development/testing
      const dummyData: Product[] = [
        {
          id: "1",
          name: "Sample Product 1",
          description: "Description for product 1",
          price: 1200,
          salePrice: 999,
          quantity: 10,
          sku: "SKU001",
          images: ["https://via.placeholder.com/60"],
        },
        {
          id: "2",
          name: "Sample Product 2",
          description: "Description for product 2",
          price: 800,
          salePrice: 750,
          quantity: 5,
          sku: "SKU002",
          images: ["https://via.placeholder.com/60"],
        },
      ];

      setProducts(dummyData);
      setTotal(dummyData.length);

      // Uncomment for real API call
      /*
      const url = searchQuery
        ? `/seller/elestic/products/{sellerId}/search`
        : `/seller/elestic/products/{sellerId}`;
      const res = await axios.get(url, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          query: searchQuery,
        },
      });
      setProducts(res.data.data);
      setTotal(res.data.total);
      */
    } catch (error) {
      Alert.alert("Error", "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery]);

  const totalPages = Math.ceil(total / itemsPerPage);

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: item.images?.[0] || "https://via.placeholder.com/60" }}
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.text}>{item.description}</Text>
        <Text style={styles.text}>Price: ₹{item.price}</Text>
        <Text style={styles.text}>Sale Price: ₹{item.salePrice}</Text>
        <Text style={styles.text}>Qty: {item.quantity}</Text>
        <Text style={styles.text}>SKU: {item.sku}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search..."
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={(text) => {
          setCurrentPage(1);
          setSearchQuery(text);
        }}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No products found.
            </Text>
          }
        />
      )}

      <View style={styles.pagination}>
        <TouchableOpacity
          onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={styles.pageButton}
        >
          <Text>Previous</Text>
        </TouchableOpacity>

        <Text style={styles.pageText}>
          Page {currentPage} of {totalPages || 1}
        </Text>

        <TouchableOpacity
          onPress={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          style={styles.pageButton}
        >
          <Text>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: "row",
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: "#333",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  pageButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
  },
  pageText: {
    fontSize: 14,
  },
});
