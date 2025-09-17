import api from "@/api";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
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

export const options = { title: "Dashboard" };

export default function SellerDashboardScreen() {
  const theme = Colors[useColorScheme() ?? "light"];
  const router = useRouter();
  const { userInfo, hasRefreshed } = useUserInfo();

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch seller dashboard stats from API
  const fetchStats = async () => {
    if (!userInfo?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/seller/dashboard/${userInfo.id}`);
      setStats(res.data);
    } catch (error) {
      console.error("Failed to load dashboard stats", error);
      setStats(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (hasRefreshed && userInfo?.id) {
      fetchStats();
    }
  }, [userInfo, hasRefreshed]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (!hasRefreshed) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
          <Text style={{ color: theme.mutedText, fontSize: 16 }}>
            Loading seller dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const cards = stats
    ? [
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
      ]
    : [];

  const actions = [
    {
      title: "Manage Products",
      description: "View, edit or remove listed products.",
      onPress: () => router.push("/profile/seller-dashboard/manage-products"),
    },
    {
      title: "Orders",
      description: "Process and manage orders.",
      onPress: () => router.push("/profile/seller-dashboard/orders"),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.tint]}
            tintColor={theme.tint}
            progressBackgroundColor={theme.input}
          />
        }
      >
        <Text style={[styles.header, { color: theme.text }]}>Dashboard</Text>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={theme.tint} style={{ marginVertical: 20 }} />
        ) : stats ? (
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
                <Text style={[styles.cardTitle, { color: theme.text }]}>{card.title}</Text>
                <Text style={[styles.cardValue, { color: card.color }]}>{card.value}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.errorText, { color: theme.mutedText }]}>
            Failed to load stats.
          </Text>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>

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
              <Text style={[styles.actionTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.actionDesc, { color: theme.mutedText }]}>{item.description}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});
