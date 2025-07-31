import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
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

const TwoFAScreen = () => {
  const [code, setCode] = useState("");
  const router = useRouter();

  const email =
    typeof window !== "undefined"
      ? localStorage.getItem("registerEmail")
      : null;

  useEffect(() => {
    if (!email) {
      router.replace("/auth/RegisterScreen");
    }
  }, [email]);

  const handleVerify = async () => {
    if (!code || !email) {
      Alert.alert("Invalid Request", "Missing verification code or email.");
      return;
    }

    try {
      await axios.post(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/register-verify`,
        {
          email,
          otp: code,
        }
      );

      Alert.alert(
        "Success",
        "Verification successful! Redirecting to login..."
      );

      localStorage.removeItem("registerEmail");
      setTimeout(() => {
        router.push("/auth/LoginScreen");
      }, 1000);
    } catch (err: any) {
      Alert.alert(
        "Verification Failed",
        err.response?.data?.error || "Invalid or expired code."
      );
    }
  };

  const handleResend = async () => {
    try {
      await axios.post(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/register-resend`,
        { email }
      );
      Alert.alert("Success", "A new OTP has been sent to your email.");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.error || "Failed to resend OTP."
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.inner}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Two-Factor Authentication</Text>
            <Text style={styles.subtitle}>
              Please enter the verification code sent to your email.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit code"
              maxLength={6}
              keyboardType="numeric"
              value={code}
              onChangeText={setCode}
              placeholderTextColor="#999"
            />

            <TouchableOpacity style={styles.button} onPress={handleVerify}>
              <Text style={styles.buttonText}>Verify</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resend} onPress={handleResend}>
              <Text style={styles.resendText}>
                {"Didn't receive a code? Resend"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default TwoFAScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
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
    marginBottom: 10,
    textAlign: "center",
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#f1f1f1",
    marginBottom: 20,
    color: "#222",
  },
  button: {
    backgroundColor: "#00AA55",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resend: {
    marginTop: 20,
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    color: "#00AA55",
    fontWeight: "500",
  },
});
