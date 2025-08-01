import { Stack } from "expo-router";

const AuthLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="LoginScreen"
        options={{
          title: "Sellistoo",
          headerBackVisible: false,
          headerShown: false,
        }}
      />
      <Stack.Screen name="RegisterScreen" options={{ headerShown: false }} />

      {/* ✅ Make all these normal full screens instead of modals */}
      <Stack.Screen
        name="ForgotPasswordScreen"
        options={{ title: "Forgot Password", presentation: "card" }}
      />
      <Stack.Screen
        name="ResetPasswordScreen"
        options={{ title: "Reset Password", presentation: "card" }}
      />
      <Stack.Screen
        name="TwoFAScreen"
        options={{
          title: "Two-Factor Authentication",
          presentation: "card",
        }}
      />

      <Stack.Screen name="TermsScreen" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AuthLayout;
