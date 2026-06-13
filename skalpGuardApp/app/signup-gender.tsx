import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BACKGROUND = '#D0DEE1'; // light blue-grey
const PRIMARY = '#344225'; // dark olive green

export const unstable_settings = { headerShown: false } as const;

export default function SignupGenderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const name = params.name as string;

  const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(null);

  const onNext = () => {
    if (!gender) return;
    router.push({ 
      pathname: '/signup-password', 
      params: { email, name, gender } 
    });
  };

  const GenderOption = ({ type, label, emoji }: { type: 'male' | 'female' | 'other', label: string, emoji: string }) => (
    <TouchableOpacity
      style={[styles.genderCard, gender === type && styles.genderCardSelected]}
      onPress={() => setGender(type)}
      activeOpacity={0.8}
    >
      <Text style={styles.genderLabel}>{label}</Text>
      <Text style={styles.genderEmoji}>{emoji}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BACKGROUND }]} edges={['top', 'bottom']}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
          <View style={styles.backButtonCircle}>
            <Text style={styles.backButtonText}>←</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.topRowSpacer} />
      </View>

      <View style={styles.logoWrap}>
        <Image source={require('@/assets/images/authlogo.png')} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.content}>
        <Text style={styles.question}>What's your Gender?</Text>
        <Text style={styles.subtitle}>We will use this to provide more personalized health insights.</Text>

        <View style={styles.optionsContainer}>
          <GenderOption type="male" label="Male" emoji="🧔" />
          <GenderOption type="female" label="Female" emoji="👧" />
        </View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity 
          style={[styles.primaryButton, !gender && styles.primaryButtonDisabled]} 
          onPress={onNext} 
          activeOpacity={0.9} 
          disabled={!gender}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  topRowSpacer: { flex: 1 },
  backButton: { padding: 4 },
  backButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  logoWrap: { alignItems: 'center', marginTop: 8 },
  logo: { width: 82, height: 82, tintColor: PRIMARY },

  content: { flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  question: { color: PRIMARY, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#6A7F73', fontSize: 13, marginBottom: 24 },

  optionsContainer: { gap: 12 },
  genderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#A9B8BB',
  },
  genderCardSelected: {
    backgroundColor: '#fff',
    borderColor: PRIMARY,
    borderWidth: 1.5,
  },
  genderLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY,
  },
  genderEmoji: {
    fontSize: 28,
  },

  bottom: { paddingHorizontal: 18, paddingBottom: 18 },
  primaryButton: {
    height: 48,
    borderRadius: 6,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 0.6 },
});
