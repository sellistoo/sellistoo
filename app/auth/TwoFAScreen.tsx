import config from "@/config/config";
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

const TwoFAScreen = () => {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const storedEmail = await AsyncStorage.getItem("registerEmail");
      if (!storedEmail) {
        router.replace("/auth/RegisterScreen");
      } else {
        setEmail(storedEmail);
      }
    })();
  }, []);

  const handleVerify = async () => {
    if (!code || !email) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Invalid Request",
        text2: "Missing verification code or email.",
      });
      return;
    }

    try {
      await axios.post(`${config.apiUrl}/auth/register-verify`, {
        email,
        otp: code,
      });

      Toast.show({
        type: "success",
        position: "top",
        text1: "Verification Successful",
        text2: "Redirecting to login...",
      });

      await AsyncStorage.removeItem("registerEmail");
      setTimeout(() => router.push("/auth/LoginScreen"), 1000);
    } catch (err: any) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Verification Failed",
        text2: err?.response?.data?.error || "Invalid or expired code.",
      });
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      await axios.post(`${config.apiUrl}/auth/register-resend`, { email });
      Toast.show({
        type: "success",
        position: "top",
        text1: "OTP Resent",
        text2: "A new OTP has been sent to your email.",
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Resend Failed",
        text2: err?.response?.data?.error || "Could not resend OTP.",
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.inner}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
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

        {/*  Toast should be placed at the bottom to ensure visibility */}
        <Toast />
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
