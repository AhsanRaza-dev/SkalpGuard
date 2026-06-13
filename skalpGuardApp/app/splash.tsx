import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BACKGROUND = '#FAD979';
const FOREGROUND = '#344225';

export default function SplashScreen() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const detailOpacity = useRef(new Animated.Value(0)).current;
  const detailTranslate = useRef(new Animated.Value(25)).current;

  const startSequence = useCallback(() => {
    setShowDetails(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setShowDetails(true), 4000);
  }, []);

  useEffect(() => {
    startSequence();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [startSequence]);

  useEffect(() => {
    if (showDetails) {
      detailOpacity.setValue(0);
      detailTranslate.setValue(25);
      Animated.parallel([
        Animated.timing(detailOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(detailTranslate, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showDetails, detailOpacity, detailTranslate]);

  const handleContinue = () => {
    // Always go to auth screen - let auth screen handle the rest
    router.replace('/auth');
  };

  if (!showDetails) {
    return (
      <SafeAreaView style={[styles.initialSplash, { backgroundColor: BACKGROUND }]}>
        <Text style={styles.initialTitle}>SkalpGuard</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BACKGROUND }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: detailOpacity,
            transform: [{ translateY: detailTranslate }],
          },
        ]}>
        <Image
          source={require('@/assets/images/authlogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>SkalpGuard</Text>
      </Animated.View>
      <Animated.View
        style={{
          opacity: detailOpacity,
          transform: [{ translateY: detailTranslate }],
        }}>
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  initialSplash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialTitle: {
    fontSize: 50,
    fontWeight: '800',
    color: FOREGROUND,
    fontFamily: 'Times New Roman',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 24,
    tintColor: FOREGROUND,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 34,
    fontWeight: '700',
    color: FOREGROUND,
    fontFamily: 'Times New Roman',
  },
  button: {
    height: 56,
    borderRadius: 18,
    backgroundColor: FOREGROUND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: BACKGROUND,
    fontSize: 17,
    fontWeight: '700',
  },
});
