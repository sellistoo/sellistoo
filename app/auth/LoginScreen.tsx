import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    // Implement your login logic here
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.title}>Welcome Back 👋</Text>
        <Text style={styles.subtitle}>Login to your account</Text>

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

        <TouchableOpacity style={styles.link}>
          <Text style={styles.linkText}>Forgot your password?</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  wrapper: {
    padding: 20,
    marginTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  inputContainer: {
    position: "relative",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#f1f1f1",
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#222",
  },
  icon: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  button: {
    backgroundColor: "#00AA55",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#00AA55",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  link: {
    marginTop: 15,
    alignSelf: "center",
  },
  linkText: {
    color: "#00AA55",
    fontSize: 14,
  },
});
