import api from "@/api";
import { Colors } from "@/constants/Colors";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart } = useCart();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    api
      .get(`/product/${id}`)
      .then((res) => {
        if (!mounted) return;
        setProduct(res.data);
        setSelectedImage(res.data?.images?.[0] ?? "");
      })
      .catch(() => Alert.alert("Error", "Could not load product."))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/related-products/${id}?limit=10`)
      .then((res) => setRelatedProducts(res.data ?? []))
      .catch(() => {});
  }, [id]);

  const fav = product ? isFavorite(product._id || product.id) : false;
  const variant = selectedVariant;
  const finalPrice =
    variant?.salePrice ??
    variant?.price ??
    product?.salePrice ??
    product?.price;
  const availableQuantity = variant?.quantity ?? product?.quantity ?? 0;

  function onAddToCart() {
    if (!product) return;
    const sku = variant?.sku || product.sku;
    addToCart({
      product: product._id,
      name: product.name,
      image: variant?.images?.[0] || product.images?.[0],
      price: finalPrice,
      quantity,
      sku,
      variant: variant
        ? { size: variant.size, color: variant.color }
        : undefined,
    });
    Alert.alert("Added!", "This item is now in your cart.");
  }
  function onBuyNow() {
    if (!product) return;
    const params: Record<string, string> = {
      productId: product._id,
      quantity: String(quantity),
      sku: variant?.sku || product.sku,
    };
    if (variant?.size) params.size = variant.size;
    if (variant?.color) params.color = variant.color;
    const query = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    router.push(`/checkout?${query}`);
  }
  function onToggleFavorite() {
    if (!product) return;
    const prodId = product._id || product.id;
    fav ? removeFromFavorites(prodId) : addToFavorites(prodId);
  }

  if (loading || !product) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  const mainImages: string[] = variant?.images || product.images || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* HEADER */}
      <View
        style={[
          s.header,
          {
            borderBottomColor: theme.border,
            backgroundColor: theme.background,
          },
        ]}
      >
        <TouchableOpacity onPress={router.back} style={s.headerBack}>
          <Ionicons name="arrow-back" size={26} color={theme.tint} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.text }]} numberOfLines={1}>
          {product.name}
        </Text>
        <TouchableOpacity onPress={onToggleFavorite} style={{ padding: 8 }}>
          <MaterialCommunityIcons
            name={fav ? "heart" : "heart-outline"}
            size={24}
            color={fav ? theme.destructive : theme.icon}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* MAIN IMAGE CAROUSEL */}
        <FlatList
          data={mainImages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item}
              onPress={() => {
                setSelectedImage(item);
                setModalVisible(true);
              }}
            >
              <Image
                source={{ uri: item }}
                style={s.productImg}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
          style={{ maxHeight: 320, marginTop: 14 }}
        />
        {/* Image Thumbs */}
        <View
          style={{
            flexDirection: "row",
            gap: 7,
            marginTop: 7,
            marginBottom: 5,
            alignSelf: "center",
          }}
        >
          {mainImages.map((img: string) => (
            <TouchableOpacity
              key={img}
              onPress={() => setSelectedImage(img)}
              style={[
                s.thumbImgWrap,
                {
                  borderColor:
                    selectedImage === img ? theme.tint : theme.border,
                },
              ]}
            >
              <Image
                source={{ uri: img }}
                style={s.thumbImg}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* MODAL ZOOM */}
        <Modal
          transparent
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          {/* Overlay catch: press anywhere to close, but close button on top */}
          <Pressable
            style={s.modalOverlay}
            onPress={() => setModalVisible(false)}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={{ uri: selectedImage }}
                style={s.modalImg}
                resizeMode="contain"
              />
              {/* Absolutely positioned top right so it's above content on all devices */}
              <TouchableOpacity
                style={s.modalCloseBtn}
                onPress={() => setModalVisible(false)}
                hitSlop={16}
              >
                <Ionicons name="close" size={32} color="#fff" />
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* PRODUCT DETAILS */}
        <View style={{ paddingHorizontal: 18, marginTop: 7 }}>
          <Text style={[s.prodBrand, { color: theme.mutedText }]}>
            Brand: {product.brand}
          </Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}
          >
            <Text style={[s.prodPrice, { color: theme.tint }]}>
              ₹{finalPrice}
            </Text>
            {product.salePrice && !variant && (
              <Text style={[s.oldPrice, { color: theme.mutedText }]}>
                ₹{product.price}
              </Text>
            )}
          </View>
          <Text
            style={[s.prodDesc, { color: theme.text, opacity: 0.91 }]}
            numberOfLines={7}
          >
            {product.description}
          </Text>
          {/* VARIANT PICKER */}
          {product.variants?.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text
                style={{
                  color: theme.text,
                  fontWeight: "500",
                  marginBottom: 5,
                }}
              >
                Select Variant
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexDirection: "row", gap: 9 }}
              >
                {product.variants.map((variantOpt: any) => (
                  <TouchableOpacity
                    key={variantOpt.sku}
                    onPress={() => {
                      setSelectedVariant(variantOpt);
                      setSelectedImage(
                        variantOpt.images?.[0] || product.images?.[0]
                      );
                    }}
                    style={[
                      s.variantBtn,
                      {
                        backgroundColor:
                          selectedVariant?.sku === variantOpt.sku
                            ? theme.tint
                            : theme.secondary,
                        borderColor:
                          selectedVariant?.sku === variantOpt.sku
                            ? theme.tint
                            : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          selectedVariant?.sku === variantOpt.sku
                            ? "#fff"
                            : theme.text,
                      }}
                    >
                      {variantOpt.color && `${variantOpt.color} `}
                      {variantOpt.size && `(${variantOpt.size})`}
                      {!variantOpt.color &&
                        !variantOpt.size &&
                        `SKU: ${variantOpt.sku}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          {/* Availability, Shipping, Return Policy, Stepper, Action Buttons, Specs ... */}
          {/* ... same as your code before ... */}
          {/* ... OMITTED FOR BREVITY. Paste your previous code for these sections here ... */}
          {/* Availability · Free Shipping · Return Policy */}
          <View style={{ flexDirection: "row", gap: 16, marginTop: 14 }}>
            <View>
              <Text
                style={{ fontWeight: "600", color: theme.text, fontSize: 13 }}
              >
                Availability:{" "}
              </Text>
              <Text
                style={{
                  color:
                    availableQuantity > 0 ? theme.success : theme.destructive,
                  fontSize: 13,
                }}
              >
                {availableQuantity > 0 ? "In Stock" : "Out of Stock"}
              </Text>
            </View>
            {product.isFreeShipping && (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
              >
                <Feather name="truck" color={theme.success} size={15} />
                <Text style={{ color: theme.success, fontSize: 12 }}>
                  Free Shipping
                </Text>
              </View>
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 3,
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontWeight: "600", color: theme.text, fontSize: 13 }}
            >
              Return Policy:
            </Text>
            <Text
              style={{
                color: product.isReturnable ? theme.info : theme.destructive,
                fontSize: 13,
              }}
            >
              {product.isReturnable
                ? product.returnWindow + " days"
                : "No Returns"}
            </Text>
          </View>
          {/* Quantity Control */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              marginTop: 14,
            }}
          >
            <Text
              style={{ fontWeight: "500", color: theme.text, fontSize: 15 }}
            >
              Quantity:
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                disabled={quantity <= 1}
                onPress={() => setQuantity((v) => Math.max(1, v - 1))}
                style={[
                  s.qtyBtn,
                  {
                    backgroundColor: quantity <= 1 ? theme.border : theme.tint,
                  },
                ]}
              >
                <Feather
                  name="minus"
                  color={quantity <= 1 ? theme.mutedText : "#fff"}
                  size={16}
                />
              </TouchableOpacity>
              <TextInput
                value={String(quantity)}
                style={s.qtyInput}
                onChangeText={(v) =>
                  setQuantity(
                    Math.min(Math.max(1, parseInt(v) || 1), availableQuantity)
                  )
                }
                keyboardType="numeric"
                maxLength={3}
                textAlign="center"
              />
              <TouchableOpacity
                disabled={quantity >= availableQuantity}
                onPress={() =>
                  setQuantity((v) => Math.min(v + 1, availableQuantity))
                }
                style={[
                  s.qtyBtn,
                  {
                    backgroundColor:
                      quantity >= availableQuantity ? theme.border : theme.tint,
                    marginLeft: 3,
                  },
                ]}
              >
                <Feather
                  name="plus"
                  color={
                    quantity >= availableQuantity ? theme.mutedText : "#fff"
                  }
                  size={16}
                />
              </TouchableOpacity>
            </View>
            <Text
              style={{ marginLeft: 7, fontSize: 12, color: theme.mutedText }}
            >
              (Max {availableQuantity})
            </Text>
          </View>
          {/* Buttons */}
          <View style={{ flexDirection: "row", gap: 14, marginTop: 18 }}>
            <TouchableOpacity
              style={[
                s.actionBtn,
                availableQuantity < 1 && { backgroundColor: theme.border },
              ]}
              onPress={onAddToCart}
              disabled={availableQuantity < 1}
            >
              <Feather name="shopping-cart" size={18} color="#fff" />
              <Text style={s.actionBtnText}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                s.actionBtn,
                { backgroundColor: theme.accent },
                availableQuantity < 1 && { backgroundColor: theme.border },
              ]}
              onPress={onBuyNow}
              disabled={availableQuantity < 1}
            >
              <Ionicons name="flash-outline" size={18} color="#fff" />
              <Text style={s.actionBtnText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
          {/* Specs */}
          <View
            style={{
              marginTop: 28,
              borderTopWidth: 1,
              borderTopColor: theme.border,
              paddingTop: 18,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                marginBottom: 7,
                color: theme.text,
              }}
            >
              Specifications
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              <Spec label="SKU" value={variant?.sku || product.sku} />
              <Spec label="HSN" value={product.hsnCode || "N/A"} />
              <Spec label="GST" value={product.gstPercentage + "%"} />
              <Spec label="Condition" value={product.condition || "New"} />
              <Spec label="Weight" value={product.shippingWeight + " kg"} />
              {product.dimensions && (
                <Spec
                  label="Dimensions"
                  value={`${product.dimensions.length}x${product.dimensions.width}x${product.dimensions.height} ${product.dimensions.unit}`}
                />
              )}
            </View>
          </View>
        </View>
        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <View style={{ marginTop: 40, marginBottom: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginHorizontal: 16,
                marginBottom: 11,
              }}
            >
              <Text
                style={{ color: theme.text, fontWeight: "700", fontSize: 17.5 }}
              >
                You might also like
              </Text>
            </View>
            <FlatList
              horizontal
              data={relatedProducts}
              keyExtractor={(x) => x._id}
              showsHorizontalScrollIndicator={false}
              snapToInterval={180}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 14 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => router.push(`/product/${item.id}`)}
                  style={[
                    s.relProdCard,
                    {
                      backgroundColor: theme.cardBg,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Image
                    source={{ uri: item.images?.[0] }}
                    style={s.relProdImg}
                  />
                  <Text
                    style={{
                      fontWeight: "600",
                      fontSize: 13.5,
                      color: theme.text,
                    }}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      color: theme.tint,
                      fontWeight: "700",
                      marginTop: 2,
                    }}
                  >
                    ₹{item.salePrice ?? item.price}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ minWidth: "44%", marginBottom: 8 }}>
      <Text style={{ color: "#888", fontWeight: "500", fontSize: 13.5 }}>
        {label}:
      </Text>
      <Text style={{ color: "#333", fontSize: 13.5 }}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 58,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerBack: {
    marginRight: 5,
    padding: 7,
    borderRadius: 100,
  },
  headerTitle: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 20,
    marginLeft: 2,
  },
  productImg: { width: width, height: 290, backgroundColor: "#fafafd" },
  thumbImgWrap: {
    borderWidth: 2,
    borderRadius: 8,
    marginRight: 7,
    padding: 2,
    width: 45,
    height: 45,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  thumbImg: { width: 41, height: 41, borderRadius: 6 },
  modalOverlay: {
    backgroundColor: "#000c",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseBtn: {
    position: "absolute",
    top: 38,
    right: 26,
    zIndex: 9001,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 30,
    padding: 2,
  },
  modalImg: {
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignSelf: "center",
  },
  prodBrand: { fontSize: 13.4, marginBottom: 2, fontWeight: "600" },
  prodPrice: { fontSize: 25, fontWeight: "bold", marginRight: 11 },
  oldPrice: {
    fontSize: 16,
    textDecorationLine: "line-through",
    marginLeft: 5,
    fontWeight: "500",
    opacity: 0.62,
  },
  prodDesc: { fontSize: 14.8, marginVertical: 7, lineHeight: 21 },
  variantBtn: {
    marginRight: 9,
    minWidth: 48,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1.2,
    marginBottom: 1,
    alignItems: "center",
    marginTop: 3,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    marginRight: 2,
  },
  qtyInput: {
    width: 35,
    height: 28,
    fontSize: 15,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: "#dedede",
    marginHorizontal: 1,
    borderRadius: 8,
    textAlign: "center",
    backgroundColor: "#fafafa",
    color: "#333",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 24,
    backgroundColor: "#5B7A22",
    borderRadius: 20,
    gap: 8,
    shadowOpacity: 0.06,
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15.2,
    letterSpacing: 0.3,
    marginLeft: 2,
  },
  relProdCard: {
    width: 145,
    borderRadius: 12,
    borderWidth: 1.1,
    padding: 9,
    marginRight: 12,
    alignItems: "center",
    elevation: 0.5,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  relProdImg: {
    width: 110,
    height: 90,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: "#f2f3f6",
  },
});
