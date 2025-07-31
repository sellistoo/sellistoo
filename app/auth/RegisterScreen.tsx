import axios from "axios";
import Checkbox from "expo-checkbox";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const RegisterScreen = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phoneNumber || !password) {
      Alert.alert("Missing Fields", "All fields are required.");
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      Alert.alert("Invalid Phone", "Phone number must be exactly 10 digits.");
      return;
    }

    if (!acceptTerms) {
      Alert.alert(
        "Terms Not Accepted",
        "You must accept the terms to continue."
      );
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "https://your-api.com/auth/register-init", // Replace with actual endpoint
        { name, email, phone: phoneNumber, password }
      );
      router.replace("/auth/LoginScreen");
    } catch (error: any) {
      const msg =
        error.response?.data?.error || "Failed to send OTP. Try again.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.title}>Create Account</Text>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#999"
                onChangeText={setName}
                value={name}
              />
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={setEmail}
                value={email}
              />
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={10}
                value={phoneNumber}
                onChangeText={(text) => {
                  const clean = text.replace(/\D/g, "").slice(0, 10);
                  setPhoneNumber(clean);
                }}
              />
              <Text style={styles.helperText}>Must be exactly 10 digits</Text>
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry
                onChangeText={setPassword}
                value={password}
              />
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsRow}>
              <Checkbox
                value={acceptTerms}
                onValueChange={setAcceptTerms}
                color={acceptTerms ? "#007bff" : undefined}
              />
              <Text style={styles.termsText}>
                {"  "}I agree to{" "}
                <Text
                  style={styles.linkHighlight}
                  onPress={() => router.push("/auth/TermsScreen")}
                >
                  Terms & Conditions
                </Text>
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, !acceptTerms && { opacity: 0.5 }]}
              onPress={handleRegister}
              disabled={loading || !acceptTerms}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.link}
              onPress={() => router.replace("/auth/LoginScreen")}
            >
              <Text style={styles.linkText}>
                Already have an account?{" "}
                <Text style={styles.linkHighlight}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default RegisterScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    padding: 24,
    paddingTop: 40, // less top space
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    color: "#222",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 18,
  },
  input: {
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    fontSize: 16,
    color: "#222",
  },
  helperText: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
    marginLeft: 5,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  termsText: {
    fontSize: 14,
    color: "#444",
    flexShrink: 1,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#007bff",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  link: {
    marginTop: 20,
    alignSelf: "center",
  },
  linkText: {
    fontSize: 14,
    color: "#444",
  },
  linkHighlight: {
    color: "#007bff",
    fontWeight: "600",
  },
});
