// Polyfills required for Firebase web SDK to run reliably in React Native (Expo)
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-get-random-values';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  initialRouteName: 'splash',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="signup-name" options={{ gestureEnabled: false }} />
        <Stack.Screen name="signup-password" options={{ gestureEnabled: false }} />
        <Stack.Screen name="signup-profile" options={{ gestureEnabled: false }} />
        <Stack.Screen name="login-password" />
        <Stack.Screen name="welcome" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="modal" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
