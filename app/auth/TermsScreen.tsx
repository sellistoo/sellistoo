import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const navigation = useNavigation();

  const sections = [
    {
      title: "1. Introduction",
      content:
        "Sellistoo is a technology platform that connects buyers and sellers. We provide tools to facilitate commerce, but we do not own, sell, or guarantee any product listed by third-party sellers on the platform.",
    },
    {
      title: "2. Our Role",
      content:
        "Sellistoo acts solely as an enabler and facilitator. We are not liable for product quality, delivery, disputes, or any damages. Sellers are responsible for listings and fulfillment. Buyers are responsible for verifying products before purchase.",
    },
    {
      title: "3. Buyer Responsibilities",
      content:
        "Buyers agree to provide accurate information, make lawful payments, and contact sellers directly for product or order-related concerns. Sellistoo will assist in resolution but is not liable for outcomes.",
    },
    {
      title: "4. Seller Responsibilities",
      content:
        "Sellers must comply with applicable laws and ensure accurate listings, fulfillment, and post-sale support. Sellistoo does not control inventory or pricing.",
    },
    {
      title: "5. Limitation of Liability",
      content:
        "Sellistoo is not liable for indirect, incidental, or consequential damages. We do not assume responsibility for transactions between users. You use the platform at your own risk.",
    },
    {
      title: "6. Intellectual Property",
      content:
        "All platform content is owned by Sellistoo or its licensors. Unauthorized use is prohibited.",
    },
    {
      title: "7. Modifications",
      content:
        "These Terms may be updated anytime. Continued use implies agreement to updated terms.",
    },
    {
      title: "8. Governing Law",
      content:
        "These Terms are governed by Indian law. Disputes will be handled in courts located in Bengaluru, India.",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Terms & Conditions
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.updated, { color: theme.mutedText ?? "#666" }]}>
          Last Updated: July 31, 2025
        </Text>

        {sections.map((section, index) => (
          <View key={index}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {section.title}
            </Text>
            <Text style={[styles.paragraph, { color: theme.text }]}>
              {section.content}
            </Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          9. Contact Us
        </Text>
        <Text style={[styles.paragraph, { color: theme.text }]}>
          For questions or concerns:
        </Text>
        <Text style={[styles.paragraph, { color: theme.text }]}>
          📧 support@sellistoo.com
        </Text>
        <Text style={[styles.paragraph, { color: theme.text }]}>
          🌐 www.sellistoo.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  updated: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "justify",
    marginBottom: 10,
  },
});
