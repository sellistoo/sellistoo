import { Colors } from "@/constants/Colors";
import { useUserInfo } from "@/hooks/useUserInfo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { userInfo, logout } = useUserInfo();

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            Toast.show({
              type: "success",
              text1: "Logged out successfully",
            });
            router.replace("/auth/LoginScreen");
          } catch (err) {
            Toast.show({
              type: "error",
              text1: "Logout failed",
              text2: "Please try again",
            });
          }
        },
      },
    ]);
  };

  const isSeller =
    userInfo?.sellerInfo?.status === "active" ||
    userInfo?.accountType === "both";
  const isAdmin = userInfo?.role === "admin";

  const SectionButton = ({
    icon,
    title,
    subtitle,
    href,
  }: {
    icon: any;
    title: string;
    subtitle: string;
    href: string;
  }) => (
    <TouchableOpacity
      onPress={() => router.push(href as any)}
      style={[
        styles.card,
        { backgroundColor: theme.cardBg, borderColor: theme.border },
      ]}
    >
      <View style={styles.cardContent}>
        <Ionicons
          name={icon}
          size={24}
          color={theme.tint}
          style={styles.icon}
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.cardSubtitle, { color: theme.mutedText }]}>
            {subtitle}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.icon} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: theme.text }]}>
            My Profile
          </Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              size={22}
              color={theme.destructive}
            />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.label, { color: theme.mutedText }]}>Name</Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {userInfo.name || "—"}
          </Text>
          <Text
            style={[styles.label, { color: theme.mutedText, marginTop: 10 }]}
          >
            Email
          </Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {userInfo.email || "—"}
          </Text>
        </View>

        {/* Navigation Cards */}
        <SectionButton
          icon="location-outline"
          title="Manage Addresses"
          subtitle="View or update your delivery addresses"
          href="/(tabs)/profile/address"
        />
        <SectionButton
          icon="cube-outline"
          title="Order History"
          subtitle="View and track your orders"
          href="/(tabs)/profile/orders"
        />
        <SectionButton
          icon="heart-outline"
          title="Favorites"
          subtitle="See your saved items"
          href="/(tabs)/profile/favorites"
        />

        {isSeller && (
          <SectionButton
            icon="storefront-outline"
            title="Seller Dashboard"
            subtitle="Manage your products and orders"
            href="/(tabs)/profile/seller-dashboard"
          />
        )}

        {isAdmin && (
          <SectionButton
            icon="shield-checkmark-outline"
            title="Admin Panel"
            subtitle="Manage users, products & orders"
            href="/(tabs)/profile/admin-dashboard"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "700",
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 14,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  icon: {
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
