import config from "@/config/config";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

const ResetPasswordScreen = () => {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? "light"];

  useEffect(() => {
    (async () => {
      const storedEmail = await AsyncStorage.getItem("forgotEmail");
      if (!storedEmail) {
        router.replace("/auth/ForgotPasswordScreen");
      } else {
        setEmail(storedEmail);
      }
    })();
  }, []);

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Error",
        text2: "All fields are required.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Error",
        text2: "Passwords do not match.",
      });
      return;
    }

    try {
      await axios.post(`${config.apiUrl}/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });

      Toast.show({
        type: "success",
        position: "top",
        text1: "Success",
        text2: "Password reset successfully. Redirecting...",
      });

      await AsyncStorage.removeItem("forgotEmail");
      setTimeout(() => router.replace("/auth/LoginScreen"), 1000);
    } catch (error: any) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Reset Failed",
        text2: error?.response?.data?.error || "Invalid OTP or expired code.",
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.inner}
        >
          <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.title, { color: theme.text }]}>
              Reset Password
            </Text>
            <Text style={[styles.subtitle, { color: theme.mutedText }]}>
              Enter the OTP sent to your email and your new password below.
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.input,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Enter 6-digit OTP"
              placeholderTextColor={theme.mutedText}
              keyboardType="numeric"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
            />

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.input,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Enter new password"
              placeholderTextColor={theme.mutedText}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.input,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Confirm new password"
              placeholderTextColor={theme.mutedText}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.tint }]}
              onPress={handleResetPassword}
            >
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <Toast />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default ResetPasswordScreen;

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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 18,
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
});
