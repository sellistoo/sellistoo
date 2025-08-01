import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useUserInfo } from "@/hooks/useUserInfo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
import Toast from "react-native-toast-message";

const LoginScreen = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const router = useRouter();
  const { login } = useUserInfo();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please enter both email and password.",
      });
      return;
    }

    try {
      await login({ email, password });

      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: `Welcome back, ${email} 👋`,
      });

      router.replace("/(tabs)/HomeScreen");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error.message || "Something went wrong.",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
              <Text style={[styles.brand, { color: theme.accent }]}>
                Sellistoo
              </Text>
              <Text style={[styles.title, { color: theme.text }]}>
                Welcome Back 👋
              </Text>

              {/* Email input */}
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Email"
                  placeholderTextColor={theme.mutedText}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.input,
                      color: theme.text,
                    },
                  ]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={setEmail}
                  value={email}
                />
              </View>

              {/* Password input */}
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Password"
                  placeholderTextColor={theme.mutedText}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.input,
                      color: theme.text,
                    },
                  ]}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  onChangeText={setPassword}
                  value={password}
                />
                <TouchableOpacity
                  onPress={() => setShowPass(!showPass)}
                  style={styles.icon}
                >
                  <Ionicons
                    name={showPass ? "eye-off" : "eye"}
                    size={20}
                    color={theme.icon}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.tint }]}
                onPress={handleLogin}
              >
                <Text style={styles.buttonText}>Log In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.link}
                onPress={() => router.push("/auth/ForgotPasswordScreen")}
              >
                <Text style={[styles.linkText, { color: theme.tint }]}>
                  Forgot your password?
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View
                  style={[styles.line, { backgroundColor: theme.border }]}
                />
                <Text style={[styles.dividerText, { color: theme.mutedText }]}>
                  or
                </Text>
                <View
                  style={[styles.line, { backgroundColor: theme.border }]}
                />
              </View>

              <TouchableOpacity
                style={styles.createAccount}
                onPress={() => router.push("/auth/RegisterScreen")}
              >
                <Text style={[styles.createAccountText, { color: theme.text }]}>
                  Don’t have an account?{" "}
                  <Text style={{ color: theme.tint, fontWeight: "600" }}>
                    Create one
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  brand: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 28,
    textAlign: "center",
  },
  inputContainer: {
    position: "relative",
    marginBottom: 18,
  },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  icon: {
    position: "absolute",
    right: 16,
    top: 15,
  },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  link: {
    marginTop: 14,
    alignSelf: "center",
  },
  linkText: {
    fontSize: 14,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  line: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
  },
  createAccount: {
    alignSelf: "center",
  },
  createAccountText: {
    fontSize: 15,
  },
});
