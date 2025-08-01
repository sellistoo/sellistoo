import config from "@/config/config";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const handleSubmit = async () => {
    if (!email) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Error",
        text2: "Please enter your email address.",
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${config.apiUrl}/auth/forgot-password`, { email });

      await AsyncStorage.setItem("forgotEmail", email);

      Toast.show({
        type: "success",
        position: "top",
        text1: "OTP Sent",
        text2: "A verification code has been sent to your email.",
      });

      router.push("/auth/ResetPasswordScreen");
    } catch (err: any) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Failed",
        text2: err?.response?.data?.error || "Unable to send OTP.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <KeyboardAvoidingView
          style={styles.inner}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <View
            style={[
              styles.card,
              { backgroundColor: theme.cardBg, shadowColor: theme.text },
            ]}
          >
            <Text style={[styles.title, { color: theme.text }]}>
              Forgot Password
            </Text>
            <Text style={[styles.subtitle, { color: theme.mutedText }]}>
              {
                "Enter your registered email. We'll send you a 6-digit verification code."
              }
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.input,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="you@example.com"
              placeholderTextColor={theme.mutedText}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.tint },
                loading && { opacity: 0.6 },
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Sending..." : "Send OTP"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.link}
              onPress={() => router.push("/auth/LoginScreen")}
            >
              <Text style={[styles.linkText, { color: theme.text }]}>
                Remember your password?{" "}
                <Text style={[styles.linkHighlight, { color: theme.tint }]}>
                  Go back to login
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    padding: 24,
    borderRadius: 12,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
  },
  linkHighlight: {
    fontWeight: "600",
  },
});
