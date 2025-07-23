import { Stack } from 'expo-router';

const AuthLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="LoginScreen" options={{ title: 'Login' }} />
      <Stack.Screen name="RegisterScreen" options={{ title: 'Register' }} />
      <Stack.Screen name="ForgotPasswordScreen" options={{ title: 'Forgot Password' }} />
    </Stack>
  );
};

export default AuthLayout;