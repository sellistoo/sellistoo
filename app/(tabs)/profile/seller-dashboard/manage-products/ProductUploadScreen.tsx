import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Mock data for categories (replace with actual API fetch)
const mockCategories = [
  { _id: "cat1", name: "Electronics" },
  { _id: "cat2", name: "Clothing" },
  { _id: "cat3", name: "Books" },
  { _id: "cat4", name: "Home Appliances" },
  { _id: "cat5", name: "Sports" },
];

// Define types to strictly match your web codebase
interface Dimensions {
  length: string;
  width: string;
  height: string;
  unit: "cm" | "inch";
}

// Updated ProductVariant to include all fields from web Variant interface
interface ProductVariant {
  sku: string;
  size?: string; // Optional as per web, but included in UI
  color?: string; // Optional as per web, but included in UI
  price: string; // Using string for TextInput
  salePrice?: string; // Optional, using string for TextInput
  quantity: string; // Using string for TextInput
  images: (string | null)[];
}

// Updated FormData structure to strictly match web's FormDataType
interface FormData {
  basic: {
    name: string;
    description: string;
    categoryId: string;
    categoryName?: string; // Optional as per web
    sellerId: string;
    brand?: string; // Optional as per web
    isReturnable: boolean;
    returnWindow: string; // Using string for TextInput
  };
  pricing: {
    price: string; // Using string for TextInput
    salePrice: string; // Using string for TextInput
    quantity: string; // Using string for TextInput
    sku: string;
  };
  tax: {
    gstPercentage: string; // Using string for TextInput
    hsnCode: string; // Optional as per web
  };
  shipping: {
    shippingWeight: string; // Using string for TextInput
    dimensions: Dimensions;
    isFreeShipping: boolean;
    fixedShippingCost: string; // Using string for TextInput
  };
  // Variants are managed separately but included in the final payload structure
}

export default function ProductUploadScreen() {
  const [formData, setFormData] = useState<FormData>({
    basic: {
      name: "",
      description: "",
      categoryId: "",
      categoryName: "", // Will be set based on categoryId
      sellerId: "mockSeller123", // Replace with actual seller ID from context
      brand: "",
      isReturnable: false,
      returnWindow: "0", // Initialize as string "0" for numeric input
    },
    pricing: { price: "0", salePrice: "0", quantity: "0", sku: "" }, // Initialize as strings "0"
    tax: { gstPercentage: "0", hsnCode: "" }, // Initialize as string "0"
    shipping: {
      shippingWeight: "0", // Initialize as string "0"
      dimensions: { length: "0", width: "0", height: "0", unit: "cm" }, // Initialize as strings "0"
      isFreeShipping: true,
      fixedShippingCost: "0", // Initialize as string "0"
    },
  });

  const [images, setImages] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [variants, setVariants] = useState<ProductVariant[]>([]); // State for variants
  const [categories, setCategories] = useState(mockCategories);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Effect to set categoryName when categoryId changes
  useEffect(() => {
    const matchedCategory = categories.find(
      (cat) => cat._id === formData.basic.categoryId
    );
    if (matchedCategory) {
      setFormData((prev) => ({
        ...prev,
        basic: { ...prev.basic, categoryName: matchedCategory.name },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        basic: { ...prev.basic, categoryName: "" },
      }));
    }
  }, [formData.basic.categoryId, categories]);

  // Generic handler for main form fields
  const handleChange = (
    section: keyof FormData,
    key: string,
    value: string | boolean | "cm" | "inch"
  ) => {
    setFormData((prev) => {
      const updatedSection = { ...prev[section] };

      if (key.includes(".")) {
        const [parentKey, childKey] = key.split(".");
        (updatedSection as any)[parentKey] = {
          ...((updatedSection as any)[parentKey] || {}),
          [childKey]: value,
        };
      } else {
        (updatedSection as any)[key] = value;
      }

      return {
        ...prev,
        [section]: updatedSection,
      };
    });
    // Clear error for the field being changed
    if (formErrors[`${section}.${key}`]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${key}`];
        return newErrors;
      });
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId) {
      const selectedCategory = categories.find((cat) => cat._id === categoryId);
      if (selectedCategory) {
        handleChange("basic", "categoryId", categoryId);
      }
    } else {
      handleChange("basic", "categoryId", ""); // Allow clearing selection
    }
  };

  const handleMainImagePick = async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please grant media library permissions to upload images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      setImages((prevImages) => {
        const updatedImages = [...prevImages];
        updatedImages[index] = uri;
        return updatedImages;
      });

      // Clear main image errors
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`images.${index}`]; // Specific image error
        // Re-check general "at least one image" error
        const currentImages = [...images]; // Use current images state for check
        currentImages[index] = uri; // Simulate the new image being there
        if (newErrors["images.0"] && currentImages.filter(Boolean).length > 0) {
          delete newErrors["images.0"];
        }
        return newErrors;
      });
    }
  };

  // Handler for variant fields
  const handleVariantChange = (
    index: number,
    field: keyof ProductVariant,
    value: string
  ) => {
    setVariants((prevVariants) => {
      const updatedVariants = [...prevVariants];
      if (updatedVariants[index]) {
        updatedVariants[index] = { ...updatedVariants[index], [field]: value };
      }
      return updatedVariants;
    });
    // Clear error for variant field
    if (formErrors[`variants.${index}.${field}`]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`variants.${index}.${field}`];
        return newErrors;
      });
    }
  };

  const addVariant = () => {
    setVariants((prevVariants) => [
      ...prevVariants,
      {
        sku: "",
        size: "",
        color: "",
        price: "0",
        salePrice: "0",
        quantity: "0",
        images: [null], // Start with one empty image slot for variant
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((prevVariants) => {
      const updatedVariants = [...prevVariants];
      updatedVariants.splice(index, 1);
      return updatedVariants;
    });
    // Clean up variant-related errors
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((errorKey) => {
        if (errorKey.startsWith(`variants.${index}.`)) {
          delete newErrors[errorKey];
        }
      });
      return newErrors;
    });
  };

  const handleVariantImagePick = async (
    variantIndex: number,
    imageIndex: number
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please grant media library permissions to upload images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      setVariants((prevVariants) => {
        const updatedVariants = [...prevVariants];
        if (!updatedVariants[variantIndex]) {
          return prevVariants; // Safety check
        }
        const updatedVariantImages = [...updatedVariants[variantIndex].images];
        updatedVariantImages[imageIndex] = uri;
        updatedVariants[variantIndex] = {
          ...updatedVariants[variantIndex],
          images: updatedVariantImages,
        };
        return updatedVariants;
      });
      // Clear variant image error
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`variants.${variantIndex}.images.${imageIndex}`];
        // Check if the general variant image error can be cleared
        if (newErrors[`variants.${variantIndex}.images`]) {
          const currentVariantImages = [...variants[variantIndex].images]; // Use current state
          currentVariantImages[imageIndex] = uri; // Simulate new image being there
          if (currentVariantImages.filter(Boolean).length > 0) {
            delete newErrors[`variants.${variantIndex}.images`];
          }
        }
        return newErrors;
      });
    }
  };

  const addVariantImageSlot = (variantIndex: number) => {
    setVariants((prevVariants) => {
      const updatedVariants = [...prevVariants];
      if (updatedVariants[variantIndex]) {
        updatedVariants[variantIndex].images.push(null);
      }
      return updatedVariants;
    });
  };

  const removeVariantImageSlot = (variantIndex: number, imageIndex: number) => {
    setVariants((prevVariants) => {
      const updatedVariants = [...prevVariants];
      if (updatedVariants[variantIndex]) {
        updatedVariants[variantIndex].images.splice(imageIndex, 1);
      }
      return updatedVariants;
    });
    // Clean up error if it was for the removed slot
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`variants.${variantIndex}.images.${imageIndex}`];
      // If no images left after removal, add general error back
      if (variants[variantIndex]?.images.filter(Boolean).length === 0) {
        newErrors[`variants.${variantIndex}.images`] = `Variant ${
          variantIndex + 1
        } requires at least one image.`;
      }
      return newErrors;
    });
  };

  const validateAndSubmit = () => {
    const errors: Record<string, string> = {};

    // Basic Details Validation
    if (!formData.basic.name.trim())
      errors["basic.name"] = "Product name is required.";
    if (!formData.basic.description.trim())
      errors["basic.description"] = "Description is required.";
    if (!formData.basic.categoryId)
      errors["basic.categoryId"] = "Category is required.";
    const returnWindowNum = parseInt(formData.basic.returnWindow);
    if (
      formData.basic.isReturnable &&
      (isNaN(returnWindowNum) || returnWindowNum <= 0)
    )
      errors["basic.returnWindow"] =
        "Return window must be a number greater than 0.";

    // Pricing Validation
    const priceNum = parseFloat(formData.pricing.price);
    if (isNaN(priceNum) || priceNum <= 0)
      errors["pricing.price"] = "Price is required and must be greater than 0.";
    const quantityNum = parseInt(formData.pricing.quantity);
    if (isNaN(quantityNum) || quantityNum <= 0)
      errors["pricing.quantity"] =
        "Quantity is required and must be greater than 0.";
    if (!formData.pricing.sku.trim())
      errors["pricing.sku"] = "SKU is required.";

    // Tax Validation
    const gstPercentageNum = parseFloat(formData.tax.gstPercentage);
    if (isNaN(gstPercentageNum) || gstPercentageNum < 0) {
      errors["tax.gstPercentage"] =
        "GST percentage is required and cannot be negative.";
    }

    // Shipping Validation
    const shippingWeightNum = parseFloat(formData.shipping.shippingWeight);
    if (isNaN(shippingWeightNum) || shippingWeightNum <= 0)
      errors["shipping.shippingWeight"] =
        "Shipping weight is required and must be greater than 0.";
    const fixedShippingCostNum = parseFloat(
      formData.shipping.fixedShippingCost
    );
    if (
      !formData.shipping.isFreeShipping &&
      (isNaN(fixedShippingCostNum) || fixedShippingCostNum < 0)
    ) {
      errors["shipping.fixedShippingCost"] =
        "Fixed shipping cost is required and cannot be negative if not free shipping.";
    }
    const dimensions = formData.shipping.dimensions;
    if (dimensions.length && isNaN(parseFloat(dimensions.length))) {
      errors["shipping.dimensions.length"] = "Length must be a number.";
    }
    if (dimensions.width && isNaN(parseFloat(dimensions.width))) {
      errors["shipping.dimensions.width"] = "Width must be a number.";
    }
    if (dimensions.height && isNaN(parseFloat(dimensions.height))) {
      errors["shipping.dimensions.height"] = "Height must be a number.";
    }

    // Main Images Validation
    if (images.every((img) => !img || !img.trim())) {
      errors["images.0"] =
        "At least one product image is required for the main product.";
    }

    // Variants Validation
    variants.forEach((variant, idx) => {
      if (!variant.sku?.trim()) {
        errors[`variants.${idx}.sku`] = `Variant ${idx + 1} SKU is required.`;
      }
      const variantPriceNum = parseFloat(variant.price);
      if (isNaN(variantPriceNum) || variantPriceNum <= 0) {
        errors[`variants.${idx}.price`] = `Variant ${
          idx + 1
        } price is required and must be greater than 0.`;
      }
      const variantQuantityNum = parseInt(variant.quantity);
      if (isNaN(variantQuantityNum) || variantQuantityNum <= 0) {
        errors[`variants.${idx}.quantity`] = `Variant ${
          idx + 1
        } quantity is required and must be greater than 0.`;
      }
      if (variant.images.every((img) => !img?.trim())) {
        errors[`variants.${idx}.images`] = `Variant ${
          idx + 1
        } requires at least one image.`;
      }
      // No strict validation for size/color being present unless explicitly needed by your backend
      // You can add: if (!variant.size?.trim()) errors[`variants.${idx}.size`] = `Variant ${idx + 1} size is required.`;
      // if (!variant.color?.trim()) errors[`variants.${idx}.color`] = `Variant ${idx + 1} color is required.`;
    });

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      Alert.alert(
        "Validation Error",
        "Please correct the highlighted fields and try again."
      );
      return;
    }

    Alert.alert("Success", "Product submitted successfully (simulated).");
    console.log("Final Form Data:", formData);
    console.log("Main Product Images:", images);
    console.log("Product Variants:", variants); // Log variants as well
  };

  const renderError = (field: string) => {
    if (formErrors[field]) {
      return <Text style={styles.errorText}>{formErrors[field]}</Text>;
    }
    return null;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Upload New Product</Text>

      {/* Basic Details */}
      <Text style={styles.sectionTitle}>Basic Details</Text>
      <TextInput
        style={[styles.input, formErrors["basic.name"] && styles.inputError]}
        placeholder="Product Name"
        value={formData.basic.name}
        onChangeText={(text) => handleChange("basic", "name", text)}
      />
      {renderError("basic.name")}
      <TextInput
        style={[
          styles.input,
          { height: 80 },
          formErrors["basic.description"] && styles.inputError,
        ]}
        multiline
        placeholder="Description"
        value={formData.basic.description}
        onChangeText={(text) => handleChange("basic", "description", text)}
      />
      {renderError("basic.description")}
      <TextInput
        style={styles.input}
        placeholder="Brand (optional)"
        value={formData.basic.brand || ""} // Ensure it's not undefined for controlled component
        onChangeText={(text) => handleChange("basic", "brand", text)}
      />

      <Text style={styles.label}>Category</Text>
      <View
        style={[
          styles.pickerContainer,
          formErrors["basic.categoryId"] && styles.inputError,
        ]}
      >
        <Picker
          selectedValue={formData.basic.categoryId}
          onValueChange={(itemValue) => handleCategoryChange(String(itemValue))}
          style={styles.picker}
        >
          <Picker.Item label="Select Category" value="" />
          {categories.map((cat) => (
            <Picker.Item key={cat._id} label={cat.name} value={cat._id} />
          ))}
        </Picker>
      </View>
      {renderError("basic.categoryId")}

      <Text style={styles.label}>Is Returnable?</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.buttonOption,
            formData.basic.isReturnable && styles.selectedButtonOption,
          ]}
          onPress={() => handleChange("basic", "isReturnable", true)}
        >
          <Text
            style={[
              styles.buttonOptionText,
              formData.basic.isReturnable && styles.selectedButtonOptionText,
            ]}
          >
            Yes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.buttonOption,
            !formData.basic.isReturnable && styles.selectedButtonOption,
          ]}
          onPress={() => handleChange("basic", "isReturnable", false)}
        >
          <Text
            style={[
              styles.buttonOptionText,
              !formData.basic.isReturnable && styles.selectedButtonOptionText,
            ]}
          >
            No
          </Text>
        </TouchableOpacity>
      </View>
      {formData.basic.isReturnable && (
        <>
          <TextInput
            style={[
              styles.input,
              formErrors["basic.returnWindow"] && styles.inputError,
            ]}
            placeholder="Return Window (days)"
            keyboardType="numeric"
            value={formData.basic.returnWindow}
            onChangeText={(text) => handleChange("basic", "returnWindow", text)}
          />
          {renderError("basic.returnWindow")}
        </>
      )}

      <View style={styles.separator} />

      {/* Pricing & Inventory */}
      <Text style={styles.sectionTitle}>Pricing & Inventory</Text>
      <TextInput
        style={[styles.input, formErrors["pricing.price"] && styles.inputError]}
        placeholder="Price (Inclusive of GST)"
        keyboardType="numeric"
        value={formData.pricing.price}
        onChangeText={(text) => handleChange("pricing", "price", text)}
      />
      {renderError("pricing.price")}
      <TextInput
        style={styles.input}
        placeholder="Sale Price (Inclusive of GST) (optional)"
        keyboardType="numeric"
        value={formData.pricing.salePrice}
        onChangeText={(text) => handleChange("pricing", "salePrice", text)}
      />
      <TextInput
        style={[
          styles.input,
          formErrors["pricing.quantity"] && styles.inputError,
        ]}
        placeholder="Quantity"
        keyboardType="numeric"
        value={formData.pricing.quantity}
        onChangeText={(text) => handleChange("pricing", "quantity", text)}
      />
      {renderError("pricing.quantity")}
      <TextInput
        style={[styles.input, formErrors["pricing.sku"] && styles.inputError]}
        placeholder="SKU"
        value={formData.pricing.sku}
        onChangeText={(text) => handleChange("pricing", "sku", text)}
      />
      {renderError("pricing.sku")}

      <View style={styles.separator} />

      {/* Tax Information */}
      <Text style={styles.sectionTitle}>Tax Information</Text>
      <TextInput
        style={[
          styles.input,
          formErrors["tax.gstPercentage"] && styles.inputError,
        ]}
        placeholder="GST Percentage"
        keyboardType="numeric"
        value={formData.tax.gstPercentage}
        onChangeText={(text) => handleChange("tax", "gstPercentage", text)}
      />
      {renderError("tax.gstPercentage")}
      <TextInput
        style={styles.input}
        placeholder="HSN Code (optional)"
        value={formData.tax.hsnCode}
        onChangeText={(text) => handleChange("tax", "hsnCode", text)}
      />

      <View style={styles.separator} />

      {/* Shipping Info */}
      <Text style={styles.sectionTitle}>Shipping Info</Text>
      <TextInput
        style={[
          styles.input,
          formErrors["shipping.shippingWeight"] && styles.inputError,
        ]}
        placeholder="Shipping Weight (grams)"
        keyboardType="numeric"
        value={formData.shipping.shippingWeight}
        onChangeText={(text) =>
          handleChange("shipping", "shippingWeight", text)
        }
      />
      {renderError("shipping.shippingWeight")}

      <Text style={styles.label}>Free Shipping?</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.buttonOption,
            formData.shipping.isFreeShipping && styles.selectedButtonOption,
          ]}
          onPress={() => handleChange("shipping", "isFreeShipping", true)}
        >
          <Text
            style={[
              styles.buttonOptionText,
              formData.shipping.isFreeShipping &&
                styles.selectedButtonOptionText,
            ]}
          >
            Yes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.buttonOption,
            !formData.shipping.isFreeShipping && styles.selectedButtonOption,
          ]}
          onPress={() => handleChange("shipping", "isFreeShipping", false)}
        >
          <Text
            style={[
              styles.buttonOptionText,
              !formData.shipping.isFreeShipping &&
                styles.selectedButtonOptionText,
            ]}
          >
            No
          </Text>
        </TouchableOpacity>
      </View>
      {!formData.shipping.isFreeShipping && (
        <>
          <TextInput
            style={[
              styles.input,
              formErrors["shipping.fixedShippingCost"] && styles.inputError,
            ]}
            placeholder="Fixed Shipping Cost (₹)"
            keyboardType="numeric"
            value={formData.shipping.fixedShippingCost}
            onChangeText={(text) =>
              handleChange("shipping", "fixedShippingCost", text)
            }
          />
          {renderError("shipping.fixedShippingCost")}
        </>
      )}

      <Text style={styles.label}>Dimensions</Text>
      <TextInput
        style={[
          styles.input,
          formErrors["shipping.dimensions.length"] && styles.inputError,
        ]}
        placeholder="Length"
        keyboardType="numeric"
        value={formData.shipping.dimensions.length}
        onChangeText={(text) =>
          handleChange("shipping", "dimensions.length", text)
        }
      />
      {renderError("shipping.dimensions.length")}
      <TextInput
        style={[
          styles.input,
          formErrors["shipping.dimensions.width"] && styles.inputError,
        ]}
        placeholder="Width"
        keyboardType="numeric"
        value={formData.shipping.dimensions.width}
        onChangeText={(text) =>
          handleChange("shipping", "dimensions.width", text)
        }
      />
      {renderError("shipping.dimensions.width")}
      <TextInput
        style={[
          styles.input,
          formErrors["shipping.dimensions.height"] && styles.inputError,
        ]}
        placeholder="Height"
        keyboardType="numeric"
        value={formData.shipping.dimensions.height}
        onChangeText={(text) =>
          handleChange("shipping", "dimensions.height", text)
        }
      />
      {renderError("shipping.dimensions.height")}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.shipping.dimensions.unit}
          onValueChange={(itemValue: "cm" | "inch") =>
            handleChange("shipping", "dimensions.unit", itemValue)
          }
          style={styles.picker}
        >
          <Picker.Item label="cm" value="cm" />
          <Picker.Item label="inch" value="inch" />
        </Picker>
      </View>

      <View style={styles.separator} />

      {/* Product Images (Main) */}
      <Text style={styles.sectionTitle}>Product Images (Main)</Text>
      <View style={styles.imageGrid}>
        {images.map((img, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handleMainImagePick(idx)}
            style={[
              styles.imageBox,
              formErrors[`images.${idx}`] && styles.imageBoxError,
              idx === 0 &&
                formErrors["images.0"] &&
                !images[0] &&
                styles.imageBoxError, // Highlight first box if general image error and it's empty
            ]}
          >
            {img ? (
              <Image source={{ uri: img }} style={styles.image} />
            ) : (
              <Text style={styles.imagePlaceholderText}>
                Select Image {idx + 1}
              </Text>
            )}
            {/* Render specific image error if it exists */}
            {renderError(`images.${idx}`)}
          </TouchableOpacity>
        ))}
      </View>
      {/* Render general image error if images[0] is missing and that error is present */}
      {renderError("images.0") &&
        images.every((img) => !img || !img.trim()) && (
          <Text style={styles.errorText}>{formErrors["images.0"]}</Text>
        )}

      <View style={styles.separator} />

      {/* Product Variants */}
      <Text style={styles.sectionTitle}>Product Variants</Text>
      {variants.map((variant, idx) => (
        <View key={idx} style={styles.variantContainer}>
          <Text style={styles.variantTitle}>Variant {idx + 1}</Text>
          <TextInput
            style={[
              styles.input,
              formErrors[`variants.${idx}.sku`] && styles.inputError,
            ]}
            placeholder="Variant SKU"
            value={variant.sku}
            onChangeText={(text) => handleVariantChange(idx, "sku", text)}
          />
          {renderError(`variants.${idx}.sku`)}
          <TextInput
            style={styles.input}
            placeholder="Variant Size (e.g., S, M, L)"
            value={variant.size || ""} // Ensure controlled component
            onChangeText={(text) => handleVariantChange(idx, "size", text)}
          />
          {/* Add validation error for size if needed */}
          <TextInput
            style={styles.input}
            placeholder="Variant Color (e.g., Red, Blue)"
            value={variant.color || ""} // Ensure controlled component
            onChangeText={(text) => handleVariantChange(idx, "color", text)}
          />
          {/* Add validation error for color if needed */}
          <TextInput
            style={[
              styles.input,
              formErrors[`variants.${idx}.price`] && styles.inputError,
            ]}
            placeholder="Variant Price (Inclusive of GST)"
            keyboardType="numeric"
            value={variant.price}
            onChangeText={(text) => handleVariantChange(idx, "price", text)}
          />
          {renderError(`variants.${idx}.price`)}
          <TextInput
            style={styles.input}
            placeholder="Variant Sale Price (optional)"
            keyboardType="numeric"
            value={variant.salePrice || ""} // Ensure controlled component
            onChangeText={(text) => handleVariantChange(idx, "salePrice", text)}
          />
          <TextInput
            style={[
              styles.input,
              formErrors[`variants.${idx}.quantity`] && styles.inputError,
            ]}
            placeholder="Variant Quantity"
            keyboardType="numeric"
            value={variant.quantity}
            onChangeText={(text) => handleVariantChange(idx, "quantity", text)}
          />
          {renderError(`variants.${idx}.quantity`)}

          <Text style={styles.label}>Variant Images</Text>
          <View style={styles.imageGrid}>
            {variant.images.map((img, imgIdx) => (
              <TouchableOpacity
                key={`${idx}-${imgIdx}`} // Unique key for image slot
                onPress={() => handleVariantImagePick(idx, imgIdx)}
                style={[
                  styles.imageBox,
                  formErrors[`variants.${idx}.images.${imgIdx}`] &&
                    styles.imageBoxError,
                  formErrors[`variants.${idx}.images`] &&
                  styles.imageBoxError &&
                  variant.images.filter(Boolean).length === 0
                    ? styles.imageBoxError
                    : null, // Highlight if general variant image error and no images are selected
                ]}
              >
                {img ? (
                  <Image source={{ uri: img }} style={styles.image} />
                ) : (
                  <Text style={styles.imagePlaceholderText}>Select</Text>
                )}
                {/* Option to remove image slot */}
                {variant.images.length > 1 && ( // Allow removing if more than one image
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeVariantImageSlot(idx, imgIdx)}
                  >
                    <Text style={styles.removeImageButtonText}>X</Text>
                  </TouchableOpacity>
                )}
                {renderError(`variants.${idx}.images.${imgIdx}`)}
              </TouchableOpacity>
            ))}
            {/* Add More Image Slot Button for Variants */}
            <TouchableOpacity
              onPress={() => addVariantImageSlot(idx)}
              style={styles.addMoreImageBox}
            >
              <Text style={styles.addMoreImageText}>+</Text>
            </TouchableOpacity>
          </View>
          {renderError(`variants.${idx}.images`)}
          <Button
            title="Remove Variant"
            onPress={() => removeVariant(idx)}
            color="#dc3545"
          />
        </View>
      ))}
      <Button title="Add Variant" onPress={addVariant} />

      <View style={{ height: 20 }} />

      <Button title="Upload Product" onPress={validateAndSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 60,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#343a40",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    color: "#495057",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    color: "#343a40",
  },
  inputError: {
    borderColor: "#dc3545",
    borderWidth: 2,
  },
  label: {
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 8,
    fontSize: 16,
    color: "#343a40",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    overflow: "hidden", // To make border radius work
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
    marginTop: 5,
  },
  buttonOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  selectedButtonOption: {
    backgroundColor: "#007bff",
  },
  buttonOptionText: {
    color: "#007bff",
    fontWeight: "bold",
    fontSize: 16,
  },
  selectedButtonOptionText: {
    color: "#fff",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
    justifyContent: "flex-start",
  },
  imageBox: {
    width: 90,
    height: 90,
    backgroundColor: "#e9ecef",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ced4da",
    position: "relative", // For absolute positioning of remove button
  },
  imageBoxError: {
    borderColor: "#dc3545",
    borderWidth: 2,
  },
  imagePlaceholderText: {
    color: "#6c757d",
    textAlign: "center",
    fontSize: 12,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    resizeMode: "cover",
  },
  addMoreImageBox: {
    width: 90,
    height: 90,
    backgroundColor: "#e9ecef",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderStyle: "dashed",
  },
  addMoreImageText: {
    fontSize: 30,
    color: "#6c757d",
  },
  removeImageButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  removeImageButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginBottom: 5,
    marginLeft: 5,
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 25,
  },
  variantContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  variantTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#343a40",
  },
});
