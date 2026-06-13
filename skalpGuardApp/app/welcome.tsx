import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { BackHandler, Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const BACKGROUND = '#D0DEE1';
const PRIMARY = '#344225';
const ACCENT = '#FAD979';

export const unstable_settings = { headerShown: false } as const;

export default function WelcomeScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams();
  const [name, setName] = useState<string | null>(null);
  const isExisting = type === 'existing';

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('current_user');
        if (raw) {
          const parsed = JSON.parse(raw);
          setName(parsed.displayName || parsed.email || null);
        }
      } catch {
        // ignore
      }
    })();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Return true to indicate we've handled the event (stops the back action)
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const onNext = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={BACKGROUND} />

      {/* Decorative Background Element */}
      <View style={styles.decorativeCircle} />

      <View style={styles.mainContent}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <MaterialIcons name="security" size={12} color={PRIMARY} />
            <Text style={styles.badgeText}>SECURE AI ANALYSIS</Text>
          </View>

          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="auto-awesome" size={32} color={PRIMARY} />
            </View>
            <View style={styles.iconRing} />
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {isExisting ? 'Welcome Back' : 'Welcome'}{name ? `, ${name}` : ''}
          </Text>
          <Text style={styles.subtitle}>
            {isExisting
              ? 'Ready to continue monitoring your hair health? Your data is synced and ready.'
              : 'Your AI assistant for personalized scalp health monitoring.'}
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconWrap}>
              <MaterialIcons name={isExisting ? 'history' : 'camera-alt'} size={20} color={PRIMARY} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{isExisting ? 'View History' : 'Precision Scanning'}</Text>
              <Text style={styles.featureDesc}>
                {isExisting
                  ? 'Access all your previous scans and progress charts.'
                  : 'Multi-angle capture for mapping.'}
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconWrap}>
              <MaterialIcons name={isExisting ? 'trending-up' : 'analytics'} size={20} color={PRIMARY} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{isExisting ? 'Analyze Trends' : 'Deep Analysis'}</Text>
              <Text style={styles.featureDesc}>
                {isExisting
                  ? 'Compare results over time to see improvements.'
                  : 'Neural network detection.'}
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconWrap}>
              <MaterialIcons name={isExisting ? 'account-circle' : 'history'} size={20} color={PRIMARY} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{isExisting ? 'Profile & Stats' : 'Progress Tracking'}</Text>
              <Text style={styles.featureDesc}>
                {isExisting
                  ? 'Keep your personal records and settings updated.'
                  : 'Monitor your journey with data.'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={onNext} activeOpacity={0.85}>
          <Text style={styles.buttonText}>{isExisting ? 'Go to Dashboard' : 'Start Journey'}</Text>
          <View style={styles.btnIconCircle}>
            <MaterialIcons name="arrow-forward" size={16} color={PRIMARY} />
          </View>
        </TouchableOpacity>
        <Text style={styles.footerNote}>SkalpGuard</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  decorativeCircle: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: '#C4D6D9',
    opacity: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 66, 37, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: PRIMARY,
    marginLeft: 6,
    letterSpacing: 1,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: PRIMARY,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    borderColor: 'rgba(52, 66, 37, 0.1)',
    zIndex: 1,
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '900',
    color: PRIMARY,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#4f5b50',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
    fontWeight: '500',
  },
  features: {
    gap: 10,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 66, 37, 0.03)',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: PRIMARY,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 14,
    color: '#6b756f',
    lineHeight: 18,
    fontWeight: '400',
  },
  footer: {
    padding: 24,
    paddingBottom: 30,
    backgroundColor: BACKGROUND,
  },
  button: {
    height: 52,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  buttonText: {
    color: BACKGROUND,
    fontSize: 19,
    fontWeight: '900',
    marginRight: 10,
  },
  btnIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerNote: {
    textAlign: 'center',
    marginTop: 14,
    fontSize: 9,
    color: '#7a8a7c',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
