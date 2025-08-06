import api from "@/api";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useFeaturedCategories } from "@/hooks/useFeaturedCategories";
import { useUserInfo } from "@/hooks/useUserInfo";
import { Ionicons } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const UNITS = ["cm", "inch"];

// ---- Image Compression + Upload Helper ----
async function compressAndUploadImageAsync(localUri: any, backendBaseUrl: any) {
  // 1. Compress
  const result = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: 1024 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  const resp = await fetch(result.uri);
  const blob = await resp.blob();
  const filename = `product-image/${Date.now()}-product.jpg`;

  // 2. Get signed upload URL from backend
  const { data } = await api.get("/upload/generateUploadURL", {
    params: { filename, contentType: "image/jpeg" },
  });

  // 3. Upload to GCS
  const uploadRes = await fetch(data.url, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg" },
    body: blob,
  });
  if (!uploadRes.ok) throw new Error("Image upload failed");
  return data.publicUrl;
}

// ---- Shared Form Field ----
function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  editable = true,
  multiline = false,
  style,
  ...props
}: any) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.input,
            borderColor: theme.border,
          },
          !editable && styles.disabledInput,
          multiline ? { minHeight: 70, textAlignVertical: "top" } : null,
          style,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.mutedText}
        keyboardType={keyboardType}
        editable={editable}
        multiline={multiline}
        {...props}
      />
    </View>
  );
}

// ---- Variant Block ----
function VariantFields({ variant, onChange, onRemove, canRemove }: any) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const pickVariantImage = async (imgIdx: any) => {
    try {
      Toast.show({ type: "info", text1: "Uploading image..." });
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (!result.canceled && result.assets.length) {
        const publicUrl = await compressAndUploadImageAsync(
          result.assets[0].uri,
          process.env.EXPO_PUBLIC_API_BASE_URL
        );
        const updated = [...(variant.images || [])];
        updated[imgIdx] = publicUrl;
        onChange({ ...variant, images: updated });
        Toast.show({ type: "success", text1: "Image uploaded" });
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Image upload failed" });
    }
  };

  return (
    <View style={styles.variantBlock}>
      <View style={styles.rowCenterSpace}>
        <Text style={styles.variantTitle}>Variant</Text>

        <TouchableOpacity
          onPress={onRemove}
          accessibilityLabel="Remove variant"
          style={styles.variantRemoveBtn}
          hitSlop={10}
        >
          <Ionicons name="trash-outline" size={20} color={theme.destructive} />
        </TouchableOpacity>
      </View>
      <FormField
        label="SKU*"
        value={variant.sku}
        onChangeText={(v: any) => onChange({ ...variant, sku: v })}
        placeholder="SKU"
      />
      <FormField
        label="Size"
        value={variant.size}
        onChangeText={(v: any) => onChange({ ...variant, size: v })}
        placeholder="e.g. M, 128GB"
      />
      <FormField
        label="Color"
        value={variant.color}
        onChangeText={(v: any) => onChange({ ...variant, color: v })}
        placeholder="e.g. Black"
      />
      <View style={styles.rowFields}>
        <FormField
          label="Price*"
          value={variant.price ? String(variant.price) : ""}
          onChangeText={(v: any) => onChange({ ...variant, price: Number(v) })}
          placeholder="₹"
          keyboardType="numeric"
          style={{ flex: 1, marginRight: 6 }}
        />
        <FormField
          label="Sale Price"
          value={variant.salePrice ? String(variant.salePrice) : ""}
          onChangeText={(v: any) =>
            onChange({ ...variant, salePrice: Number(v) })
          }
          placeholder="₹"
          keyboardType="numeric"
          style={{ flex: 1 }}
        />
      </View>
      <FormField
        label="Quantity*"
        value={variant.quantity ? String(variant.quantity) : ""}
        onChangeText={(v: any) => onChange({ ...variant, quantity: Number(v) })}
        placeholder="Qty"
        keyboardType="numeric"
      />
      <View style={styles.variantImagesRow}>
        {[0, 1, 2, 3].map((i) => (
          <TouchableOpacity
            key={i}
            style={styles.imageUpload}
            onPress={() => pickVariantImage(i)}
          >
            {variant.images && variant.images[i] ? (
              <Image
                source={{ uri: variant.images[i] }}
                style={styles.imageThumb}
              />
            ) : (
              <Text style={styles.uploadText}>+</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ---- Main Upload Screen ----
export default function ProductUploadScreen({ onProductUploadSuccess }: any) {
  const { userInfo } = useUserInfo();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { featuredCategories, loading: catLoading } = useFeaturedCategories();
  // const navigation = useNavigation();
  const router = useRouter();

  const [fields, setFields] = useState({
    name: "",
    description: "",
    categoryId: "",
    brand: "",
    isReturnable: false,
    returnWindow: "",
    price: "",
    salePrice: "",
    quantity: "",
    sku: "",
    gstPercentage: "",
    hsnCode: "",
    shippingWeight: "",
    isFreeShipping: true,
    fixedShippingCost: "",
    length: "",
    width: "",
    height: "",
    unit: UNITS[0],
    images: [null, null, null, null],
  });
  const [variants, setVariants] = useState<any>([]);
  const [uploading, setUploading] = useState(false);

  // Main Image Upload (now uses cloud upload and stores URL, not file uri)
  const pickMainImage = async (imgIdx: any) => {
    try {
      Toast.show({ type: "info", text1: "Uploading image..." });
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (!result.canceled && result.assets.length) {
        const publicUrl = await compressAndUploadImageAsync(
          result.assets[0].uri,
          process.env.EXPO_PUBLIC_API_BASE_URL
        );
        const newImgs = [...fields.images];
        newImgs[imgIdx] = publicUrl;
        setFields((prev) => ({ ...prev, images: newImgs }));
        Toast.show({ type: "success", text1: "Image uploaded" });
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Image upload failed" });
    }
  };

  // Variants logic
  const updateVariant = (idx: any, updated: any) => {
    setVariants((prev: any) => {
      const copy: any = [...prev];
      copy[idx] = updated;
      return copy;
    });
  };
  const addVariant = () =>
    setVariants([
      ...variants,
      {
        sku: "",
        size: "",
        color: "",
        price: "",
        salePrice: "",
        quantity: "",
        images: [null, null, null, null],
      },
    ] as any);
  const removeVariant = (idx: any) =>
    setVariants(variants.filter((_: any, i: any) => i !== idx));

  // Validate before save
  const validate = () => {
    if (!fields.name.trim()) return "Product name required";
    if (!fields.categoryId) return "Select a category";
    if (!fields.description.trim()) return "Description required";
    if (!fields.sku.trim()) return "SKU required";
    if (!fields.price) return "Base price required";
    if (!fields.quantity) return "Quantity required";
    if (!fields.gstPercentage) return "GST % required";
    if (!fields.shippingWeight) return "Shipping weight required";
    if (fields.isReturnable && !fields.returnWindow)
      return "Return window required";
    if (fields.images.every((x) => !x)) return "At least 1 image required";
    for (let v of variants) {
      if (!v.sku) return "Each variant needs its own SKU";
      if (!v.price) return "Each variant needs price";
      if (!v.quantity) return "Each variant needs quantity";
      if (!v.images || v.images.every((img: any) => !img))
        return "Each variant needs at least 1 image";
    }
    return "";
  };

  // Final Upload
  const onUpload = async () => {
    const errorMsg = validate();
    if (errorMsg) {
      Toast.show({ type: "error", text1: errorMsg });
      return;
    }
    setUploading(true);
    const payload = {
      name: fields.name,
      description: fields.description,
      categoryId: fields.categoryId,
      brand: fields.brand,
      isReturnable: fields.isReturnable,
      returnWindow: fields.isReturnable ? Number(fields.returnWindow) : 0,
      price: Number(fields.price),
      salePrice: fields.salePrice ? Number(fields.salePrice) : undefined,
      quantity: Number(fields.quantity),
      sku: fields.sku,
      gstPercentage: Number(fields.gstPercentage),
      hsnCode: fields.hsnCode,
      shippingWeight: Number(fields.shippingWeight),
      isFreeShipping: fields.isFreeShipping,
      fixedShippingCost: fields.isFreeShipping
        ? 0
        : Number(fields.fixedShippingCost),
      dimensions: {
        length: Number(fields.length),
        width: Number(fields.width),
        height: Number(fields.height),
        unit: fields.unit,
      },
      images: fields.images.filter(Boolean),
      sellerId: userInfo?.id,
      variants: variants.map((v: any) => ({
        sku: v.sku,
        size: v.size,
        color: v.color,
        price: Number(v.price),
        salePrice: v.salePrice ? Number(v.salePrice) : undefined,
        quantity: Number(v.quantity),
        images: v.images.filter(Boolean),
      })),
    };
    try {
      await api.post("/product", payload);
      Toast.show({ type: "success", text1: "Product uploaded!" });
      setFields({
        name: "",
        description: "",
        categoryId: "",
        brand: "",
        isReturnable: false,
        returnWindow: "",
        price: "",
        salePrice: "",
        quantity: "",
        sku: "",
        gstPercentage: "",
        hsnCode: "",
        shippingWeight: "",
        isFreeShipping: true,
        fixedShippingCost: "",
        length: "",
        width: "",
        height: "",
        unit: UNITS[0],
        images: [null, null, null, null],
      });
      setVariants([]);
      // setTimeout(() => {
      //   router.push("./ProductListScreen");
      // }, 1100); // 1.1 seconds
      setTimeout(() => {
        if (onProductUploadSuccess) onProductUploadSuccess();
      }, 1000);
    } catch {
      Toast.show({ type: "error", text1: "Could not upload product." });
    } finally {
      setUploading(false);
    }
  };

  // ---------------- UI -----------------
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 200 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.header, { color: theme.text }]}>
          Upload New Product
        </Text>
        {/* ----- Basic Section ----- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <FormField
            label="Product Name*"
            value={fields.name}
            onChangeText={(v: any) => setFields((f) => ({ ...f, name: v }))}
            placeholder="Name"
          />
          <FormField
            label="Brand"
            value={fields.brand}
            onChangeText={(v: any) => setFields((f) => ({ ...f, brand: v }))}
            placeholder="Brand"
          />
          <Text style={styles.label}>Category*</Text>
          <View style={styles.pickerRow}>
            {catLoading ? (
              <Text style={{ color: theme.mutedText }}>Loading…</Text>
            ) : featuredCategories.length === 0 ? (
              <Text style={{ color: theme.destructive }}>No categories</Text>
            ) : (
              featuredCategories.map((c) => (
                <TouchableOpacity
                  key={c._id}
                  style={[
                    styles.catBtn,
                    fields.categoryId === c._id && styles.catBtnActive,
                  ]}
                  onPress={() =>
                    setFields((f) => ({ ...f, categoryId: c._id }))
                  }
                >
                  <Text
                    style={[
                      styles.catBtnLabel,
                      fields.categoryId === c._id && styles.catBtnLabelActive,
                    ]}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
          <FormField
            label="Description*"
            value={fields.description}
            onChangeText={(v: any) =>
              setFields((f) => ({ ...f, description: v }))
            }
            placeholder="Description"
            multiline
          />
          <Text style={styles.label}>Is Returnable?</Text>
          <View style={styles.pickerRow}>
            {["No", "Yes"].map((opt, i) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.catBtn,
                  (i === 1) === !!fields.isReturnable && styles.catBtnActive,
                  { minWidth: 60 },
                ]}
                onPress={() =>
                  setFields((f) => ({ ...f, isReturnable: i === 1 }))
                }
              >
                <Text
                  style={[
                    styles.catBtnLabel,
                    (i === 1) === !!fields.isReturnable &&
                      styles.catBtnLabelActive,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <FormField
            label="Return Window (days)"
            value={fields.returnWindow}
            onChangeText={(v: any) =>
              setFields((f) => ({
                ...f,
                returnWindow: v.replace(/[^0-9]/g, ""),
              }))
            }
            keyboardType="numeric"
            editable={fields.isReturnable}
            placeholder="Days allowed for return"
          />
        </View>

        {/* ----- Pricing ----- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Inventory</Text>
          <FormField
            label="Price*"
            value={fields.price}
            onChangeText={(v: any) =>
              setFields((f) => ({ ...f, price: v.replace(/[^0-9.]/g, "") }))
            }
            keyboardType="numeric"
            placeholder="₹"
          />
          <FormField
            label="Sale Price"
            value={fields.salePrice}
            onChangeText={(v: any) =>
              setFields((f) => ({ ...f, salePrice: v.replace(/[^0-9.]/g, "") }))
            }
            keyboardType="numeric"
            placeholder="₹"
          />
          <FormField
            label="Quantity*"
            value={fields.quantity}
            onChangeText={(v: any) =>
              setFields((f) => ({ ...f, quantity: v.replace(/[^0-9]/g, "") }))
            }
            keyboardType="numeric"
            placeholder="Stock"
          />
          <FormField
            label="SKU*"
            value={fields.sku}
            onChangeText={(v: any) => setFields((f) => ({ ...f, sku: v }))}
            placeholder="Unique SKU"
          />
        </View>

        {/* ----- Tax ----- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tax Information</Text>
          <FormField
            label="GST Percentage*"
            value={fields.gstPercentage}
            onChangeText={(v: any) =>
              setFields((f) => ({
                ...f,
                gstPercentage: v.replace(/[^0-9]/g, ""),
              }))
            }
            keyboardType="numeric"
            placeholder="e.g. 18"
          />
          <FormField
            label="HSN Code"
            value={fields.hsnCode}
            onChangeText={(v: any) => setFields((f) => ({ ...f, hsnCode: v }))}
            placeholder="Optional"
          />
        </View>

        {/* ----- Shipping ----- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Info</Text>
          <FormField
            label="Shipping Weight (grams)*"
            value={fields.shippingWeight}
            onChangeText={(v: any) =>
              setFields((f) => ({
                ...f,
                shippingWeight: v.replace(/[^0-9]/g, ""),
              }))
            }
            keyboardType="numeric"
            placeholder="Weight in grams"
          />
          <View style={styles.rowFields}>
            <FormField
              label="Length"
              value={fields.length}
              onChangeText={(v: any) =>
                setFields((f) => ({ ...f, length: v.replace(/[^0-9.]/g, "") }))
              }
              keyboardType="numeric"
              placeholder="Length"
              style={{ flex: 1, marginRight: 6 }}
            />
            <FormField
              label="Width"
              value={fields.width}
              onChangeText={(v: any) =>
                setFields((f) => ({ ...f, width: v.replace(/[^0-9.]/g, "") }))
              }
              keyboardType="numeric"
              placeholder="Width"
              style={{ flex: 1, marginRight: 6 }}
            />
            <FormField
              label="Height"
              value={fields.height}
              onChangeText={(v: any) =>
                setFields((f) => ({ ...f, height: v.replace(/[^0-9.]/g, "") }))
              }
              keyboardType="numeric"
              placeholder="Height"
              style={{ flex: 1 }}
            />
          </View>
          <Text style={styles.label}>Dimension Unit</Text>
          <View style={styles.pickerRow}>
            {UNITS.map((u) => (
              <TouchableOpacity
                key={u}
                style={[
                  styles.catBtn,
                  fields.unit === u && styles.catBtnActive,
                  { minWidth: 60 },
                ]}
                onPress={() => setFields((f) => ({ ...f, unit: u }))}
              >
                <Text
                  style={[
                    styles.catBtnLabel,
                    fields.unit === u && styles.catBtnLabelActive,
                  ]}
                >
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Free Shipping?</Text>
          <View style={styles.pickerRow}>
            {["No", "Yes"].map((opt, i) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.catBtn,
                  (i === 1) === !!fields.isFreeShipping && styles.catBtnActive,
                  { minWidth: 60 },
                ]}
                onPress={() =>
                  setFields((f) => ({ ...f, isFreeShipping: i === 1 }))
                }
              >
                <Text
                  style={[
                    styles.catBtnLabel,
                    (i === 1) === !!fields.isFreeShipping &&
                      styles.catBtnLabelActive,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <FormField
            label="Fixed Shipping Cost (₹)"
            value={fields.fixedShippingCost}
            onChangeText={(v: any) =>
              setFields((f) => ({
                ...f,
                fixedShippingCost: v.replace(/[^0-9.]/g, ""),
              }))
            }
            keyboardType="numeric"
            editable={!fields.isFreeShipping}
            placeholder="₹ Shipping cost"
          />
        </View>

        {/* ----- Product Images ----- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Images</Text>
          <View style={styles.imagesRow}>
            {[0, 1, 2, 3].map((i) => (
              <TouchableOpacity
                key={i}
                style={styles.imageUpload}
                onPress={() => pickMainImage(i)}
              >
                {fields.images[i] ? (
                  <Image
                    source={{ uri: fields.images[i] }}
                    style={styles.imageThumb}
                  />
                ) : (
                  <Text style={styles.uploadText}>+</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ----- Variants ----- */}
        <View style={styles.section}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.sectionTitle}>Variants</Text>
            <TouchableOpacity style={styles.addVariantBtn} onPress={addVariant}>
              <Text style={styles.addVariantTxt}>+ Add Variant</Text>
            </TouchableOpacity>
          </View>
          {variants.map((v: any, idx: any) => (
            <VariantFields
              key={idx}
              variant={v}
              onChange={(updated: any) => updateVariant(idx, updated)}
              onRemove={() => removeVariant(idx)}
            />
          ))}
        </View>
        <TouchableOpacity
          style={[
            styles.uploadBtn,
            uploading && { backgroundColor: theme.border, opacity: 0.8 },
          ]}
          onPress={onUpload}
          disabled={uploading}
        >
          <Text
            style={[
              styles.uploadBtnLabel,
              uploading && { color: theme.mutedText },
            ]}
          >
            {uploading ? "Uploading..." : "Upload Product"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  section: { marginBottom: 27 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 7,
    letterSpacing: 0.1,
  },
  label: { fontSize: 13.4, fontWeight: "600", marginBottom: 4 },
  input: {
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  disabledInput: { backgroundColor: "#ececec", color: "#aaa", opacity: 0.8 },
  pickerRow: {
    flexDirection: "row",
    marginBottom: 13,
    gap: 8,
    flexWrap: "wrap",
  },
  catBtn: {
    backgroundColor: "#ede9fe",
    borderRadius: 19,
    paddingHorizontal: 15,
    paddingVertical: 7,
    marginRight: 5,
  },
  catBtnActive: { backgroundColor: "#6d28d9" },
  catBtnLabel: { color: "#6d28d9", fontWeight: "600", fontSize: 13.7 },
  catBtnLabelActive: { color: "#fff" },
  rowFields: { flexDirection: "row", gap: 10 },
  imagesRow: { flexDirection: "row", gap: 11, marginBottom: 8 },
  imageUpload: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: "#d1d1d1",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5fd",
  },
  uploadText: { fontSize: 30, color: "#b8b8eb" },
  imageThumb: { width: "100%", height: "100%", borderRadius: 7 },
  variantBlock: {
    padding: 10,
    backgroundColor: "#fafafe",
    borderRadius: 13,
    marginBottom: 13,
    borderColor: "#dfd3f9",
    borderWidth: 1,
  },
  variantTitle: { fontWeight: "700", color: "#6d28d9", fontSize: 14 },
  variantRemove: {
    color: "#f43f5e",
    fontWeight: "bold",
    marginLeft: 12,
    fontSize: 12,
  },
  rowCenterSpace: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  groupedField: { marginBottom: 8 },
  variantImagesRow: { flexDirection: "row", gap: 9, marginBottom: 7 },
  addVariantBtn: { padding: 7, borderRadius: 9, backgroundColor: "#ede9fe" },
  addVariantTxt: { color: "#6d28d9", fontWeight: "500" },
  uploadBtn: {
    backgroundColor: "#6d28d9",
    borderRadius: 22,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 20,
  },
  uploadBtnLabel: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  variantRemoveBtn: { padding: 4, marginLeft: 8, alignSelf: "center" },
});
