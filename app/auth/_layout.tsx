import { Stack } from "expo-router";

const AuthLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // 🔒 Apply to all screens in this stack
      }}
    >
      <Stack.Screen name="LoginScreen" />
      <Stack.Screen name="RegisterScreen" />
      <Stack.Screen name="ForgotPasswordScreen" />
      <Stack.Screen name="ResetPasswordScreen" />
      <Stack.Screen name="TwoFAScreen" />
      <Stack.Screen name="TermsScreen" />
    </Stack>
  );
};

export default AuthLayout;
