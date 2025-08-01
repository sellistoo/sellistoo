import { useUserInfo } from "@/hooks/useUserInfo";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Index() {
  const { userInfo, hasRefreshed } = useUserInfo();

  if (!hasRefreshed) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00AA55" />
      </View>
    );
  }

  return userInfo.isLoggedIn ? (
    <Redirect href="/(tabs)/HomeScreen" />
  ) : (
    <Redirect href="/auth/LoginScreen" />
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
