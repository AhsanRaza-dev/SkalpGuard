import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BACKGROUND = '#D0DEE1';
const PRIMARY = '#344225';
const ACCENT = '#FAD979';
const MUTED = '#4f5b50';

export default function HomeScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        try {
          const currentRaw = await AsyncStorage.getItem('current_user');
          if (currentRaw) {
            const current = JSON.parse(currentRaw);
            setDisplayName(current.displayName || '');
          }
        } catch (error) {
          console.error('Home load error:', error);
        }
      };
      loadUser();
    }, [])
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const greeting = getGreeting();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}, {displayName || 'Welcome Back'}!</Text>
          <Text style={styles.subtitle}>SkalpGuard-AI Hair Disease Detection Assistant</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="health-and-safety" size={32} color={PRIMARY} />
            <Text style={styles.cardTitle}>AI Hair Disease Detection</Text>
          </View>
          <Text style={styles.cardBody}>
            Use advanced AI to instantly detect early signs of hair loss, scalp infections, and follicular issues.
            Get personalized routines and treatment recommendations backed by dermatologist-level insights.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(tabs)/scan')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="camera-alt" size={20} color={BACKGROUND} style={styles.btnIcon} />
            <Text style={styles.primaryButtonText}>Start New Scan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.stepCard}>
            <View style={styles.stepIconWrap}>
              <MaterialIcons name="aspect-ratio" size={22} color={PRIMARY} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>1. Capture Angles</Text>
              <Text style={styles.stepDesc}>Take 3 photos covering the top, sides, and back of your scalp for comprehensive coverage.</Text>
            </View>
          </View>
          <View style={styles.stepCard}>
            <View style={styles.stepIconWrap}>
              <MaterialIcons name="memory" size={22} color={PRIMARY} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>2. AI Processing</Text>
              <Text style={styles.stepDesc}>Our neural networks analyze follicular density, redness, scaling, and structural damage.</Text>
            </View>
          </View>
          <View style={styles.stepCard}>
            <View style={styles.stepIconWrap}>
              <MaterialIcons name="medical-services" size={22} color={PRIMARY} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>3. Treatment Plan</Text>
              <Text style={styles.stepDesc}>Receive a detailed diagnosis report along with a recommended personalized treatment regimen.</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 90,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: PRIMARY,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#4f5b50',
    fontWeight: '500',
  },
  card: {
    backgroundColor: ACCENT,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: PRIMARY,
    marginLeft: 12,
    flex: 1,
  },
  cardBody: {
    fontSize: 15,
    color: '#3a433e',
    lineHeight: 22,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: BACKGROUND,
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: PRIMARY,
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    marginHorizontal: 4,
  },
  stepIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#e6ede8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    color: '#6b756f',
    lineHeight: 20,
  },
});
