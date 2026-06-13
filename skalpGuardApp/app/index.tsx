import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect root to the splash screen so app always starts at splash
    // Delay the navigation slightly so the root layout has time to mount.
    // This avoids "Attempted to navigate before mounting the Root Layout component".
    const id = setTimeout(() => {
      try {
        router.replace('/splash');
      } catch (e) {
        // ignore navigation errors during startup
      }
    }, 50);
    return () => clearTimeout(id);
  }, [router]);

  return <View />;
}
