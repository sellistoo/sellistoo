import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Stats {
  totalSales: number;
  productCount: number;
  totalOrders: number;
  totalEarnings: number;
}

export default function SellerDashboardScreen() {
  const theme = Colors[useColorScheme() ?? "light"];
  const router = useRouter();

  const [stats, setStats] = useState<Stats>({
    totalSales: 150000,
    productCount: 42,
    totalOrders: 128,
    totalEarnings: 135000,
  });

  const cards = [
    {
      title: "Total Sales",
      value: `₹${stats.totalSales.toLocaleString()}`,
      color: theme.success ?? "#22c55e",
    },
    {
      title: "Active Products",
      value: stats.productCount.toString(),
      color: theme.info ?? "#3b82f6",
    },
    {
      title: "Orders Received",
      value: stats.totalOrders.toString(),
      color: theme.warning ?? "#f59e0b",
    },
    {
      title: "Total Earnings",
      value: `₹${stats.totalEarnings.toLocaleString()}`,
      color: theme.purple ?? "#8b5cf6",
    },
  ];

  const actions = [
    {
      title: "Manage Products",
      description: "View, edit or remove listed products.",
      onPress: () => router.push("/profile/seller-dashboard/manage-products"),
    },
    {
      title: "Orders",
      description: "Process and manage orders.",
      onPress: () => router.push("/profile/orders"),
    },
    {
      title: "Payout Settings",
      description: "Manage your payout and bank info.",
      //   onPress: () => router.push("/profile/seller-dashboard/payout-settings"),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.header, { color: theme.text }]}>Dashboard</Text>

        <View style={styles.grid}>
          {cards.map((card, idx) => (
            <View
              key={idx}
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {card.title}
              </Text>
              <Text style={[styles.cardValue, { color: card.color }]}>
                {card.value}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Quick Actions
        </Text>

        <View style={styles.actionList}>
          {actions.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={item.onPress}
              style={[
                styles.actionCard,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.actionTitle, { color: theme.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.actionDesc, { color: theme.mutedText }]}>
                {item.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 60,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    width: "48%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  actionList: {
    gap: 12,
  },
  actionCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionDesc: {
    fontSize: 13,
    marginTop: 4,
  },
});
