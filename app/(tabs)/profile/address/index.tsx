import api from "@/api";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useUserInfo } from "@/hooks/useUserInfo";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Address {
  building: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  country?: string;
  zipCode: string;
  mobileNumber: string;
  isDefault: boolean;
}

export default function AddressScreen() {
  const theme = Colors[useColorScheme() ?? "light"];
  const { userInfo } = useUserInfo();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState<Omit<Address, "isDefault">>({
    building: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    mobileNumber: "",
  });

  const fetchAddresses = async () => {
    if (!userInfo?.id) return;
    try {
      const res = await api.get(`/address/${userInfo.id}`);
      setAddresses(res.data);
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [userInfo?.id]);

  const handleInputChange = (key: keyof typeof newAddress, value: string) => {
    setNewAddress((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddOrUpdate = async () => {
    const { building, street, city, state, zipCode, mobileNumber } = newAddress;
    if (!building || !street || !city || !state || !zipCode || !mobileNumber) {
      Alert.alert("Missing Fields", "Please fill all required fields.");
      return;
    }

    try {
      if (editIndex !== null) {
        await api.put(`/address/${userInfo?.id}/${editIndex}`, newAddress);
        setEditIndex(null);
      } else {
        await api.post(`/address/${userInfo?.id}`, {
          ...newAddress,
          isDefault: addresses.length === 0,
        });
      }

      setNewAddress({
        building: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
        mobileNumber: "",
        landmark: "",
      });

      fetchAddresses();
    } catch (err) {
      Alert.alert("Error", "Failed to save address.");
    }
  };

  const handleSetDefault = async (index: number) => {
    try {
      await api.put(`/address/${userInfo?.id}/default/${index}`, {});
      fetchAddresses();
    } catch {
      Alert.alert("Error", "Failed to set default address.");
    }
  };

  const handleDelete = async (index: number) => {
    Alert.alert("Confirm", "Delete this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/address/${userInfo?.id}/${index}`);
            fetchAddresses();
          } catch {
            Alert.alert("Error", "Failed to delete.");
          }
        },
      },
    ]);
  };

  const handleEdit = (index: number) => {
    setNewAddress({ ...addresses[index] });
    setEditIndex(index);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={[styles.heading, { color: theme.text }]}>
          Manage Your Addresses
        </Text>

        {addresses.map((address, index) => (
          <View
            key={index}
            style={[styles.card, { borderColor: theme.border }]}
          >
            <View style={styles.cardRow}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {address.building}
              </Text>
              {address.isDefault && (
                <Text style={[styles.defaultBadge, { color: theme.tint }]}>
                  Default
                </Text>
              )}
            </View>
            <Text style={[styles.subText, { color: theme.mutedText }]}>
              {address.street}, {address.city}, {address.state},{" "}
              {address.zipCode}
            </Text>
            <Text style={[styles.subText, { color: theme.mutedText }]}>
              Mobile: {address.mobileNumber}
            </Text>
            {address.landmark && (
              <Text style={[styles.subText, { color: theme.mutedText }]}>
                Landmark: {address.landmark}
              </Text>
            )}

            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => handleSetDefault(index)}
                disabled={address.isDefault}
              >
                <Text style={[styles.link, { color: theme.tint }]}>
                  Set Default
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleEdit(index)}>
                <Text style={[styles.link, { color: theme.tint }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(index)}>
                <Text style={[styles.link, { color: theme.destructive }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <Text style={[styles.subHeading, { color: theme.text }]}>
          {editIndex !== null ? "Edit Address" : "Add New Address"}
        </Text>

        <View style={{ gap: 10, marginHorizontal: 16, marginBottom: 60 }}>
          {[
            { label: "Flat / House", key: "building" },
            { label: "Street", key: "street" },
            { label: "Landmark", key: "landmark" },
            { label: "City", key: "city" },
            { label: "State", key: "state" },
            { label: "Zip Code", key: "zipCode" },
            { label: "Mobile", key: "mobileNumber" },
          ].map((item) => (
            <TextInput
              key={item.key}
              placeholder={item.label}
              value={newAddress[item.key as keyof typeof newAddress]}
              onChangeText={(text) =>
                handleInputChange(item.key as keyof typeof newAddress, text)
              }
              style={[
                styles.input,
                {
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor: theme.cardBg,
                },
              ]}
              keyboardType={
                item.key === "zipCode" || item.key === "mobileNumber"
                  ? "numeric"
                  : "default"
              }
            />
          ))}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.tint }]}
            onPress={handleAddOrUpdate}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              {editIndex !== null ? "Update Address" : "Save Address"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: "700",
    margin: 16,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 16,
    marginTop: 30,
    marginBottom: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  defaultBadge: {
    fontSize: 12,
    fontWeight: "600",
  },
  subText: {
    fontSize: 13,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
  },
  link: {
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  saveButton: {
    marginTop: 10,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
});
