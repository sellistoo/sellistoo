import { Ionicons } from "@expo/vector-icons";
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

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.wrapper}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Branding */}
          <Text style={styles.brand}>Sellistoo</Text>

          {/* Professional Welcome Text */}
          <Text style={styles.title}>Welcome Back 👋</Text>

          {/* Inputs */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#999"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={setEmail}
              value={email}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#999"
              style={styles.input}
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
                color="#999"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => router.push("/auth/ForgotPasswordScreen")}
          >
            <Text style={styles.linkText}>Forgot your password?</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity
            style={styles.createAccount}
            onPress={() => router.push("/auth/RegisterScreen")}
          >
            <Text style={styles.createAccountText}>
              Don’t have an account?{" "}
              <Text style={styles.createAccountLink}>Create one</Text>
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};
export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  wrapper: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  brand: {
    fontSize: 26,
    fontWeight: "700",
    color: "#00AA55",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    color: "#222",
    marginBottom: 28,
    textAlign: "center",
  },
  inputContainer: {
    position: "relative",
    marginBottom: 18,
  },
  input: {
    backgroundColor: "#f1f1f1",
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#222",
  },
  icon: {
    position: "absolute",
    right: 16,
    top: 15,
  },
  button: {
    backgroundColor: "#00AA55",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#00AA55",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
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
    color: "#00AA55",
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
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: "#999",
  },
  createAccount: {
    alignSelf: "center",
  },
  createAccountText: {
    fontSize: 15,
    color: "#444",
  },
  createAccountLink: {
    color: "#00AA55",
    fontWeight: "600",
  },
});
