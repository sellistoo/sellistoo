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
      <Stack.Screen
        name="ForgotPasswordScreen"
        options={{ presentation: "modal", title: "Forgot Password" }}
      />
      <Stack.Screen
        name="ResetPasswordScreen"
        options={{
          presentation: "modal",
          title: "Reset Password",
        }}
      />
      <Stack.Screen
        name="TwoFAScreen"
        options={{
          presentation: "modal",
          title: "Two-Factor Authentication",
        }}
      />
      <Stack.Screen name="TermsScreen" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AuthLayout;
