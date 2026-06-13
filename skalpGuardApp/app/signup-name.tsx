import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BACKGROUND = '#D0DEE1'; // light blue-grey
const PRIMARY = '#344225'; // dark olive green

export const unstable_settings = { headerShown: false } as const;

export default function SignupNameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (text: string) => {
    // Only allow letters and spaces
    const filteredText = text.replace(/[^a-zA-Z\s]/g, '');
    setName(filteredText);
    if (error) setError('');
  };

  const onNext = () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    router.push({ pathname: '/signup-gender', params: { email, name } });
  };

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
        <Text style={styles.question}>What's your name?</Text>
        <View style={[styles.inputWrap, error && styles.inputWrapError]}>
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#8FA79A"
            style={styles.input}
            value={name}
            onChangeText={handleNameChange}
            accessibilityLabel="Full Name"
          />
        </View>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity style={[styles.primaryButton, loading && styles.primaryButtonLoading]} onPress={onNext} activeOpacity={0.9} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Continue</Text>}
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
  question: { color: PRIMARY, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  inputWrap: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A9B8BB',
  },
  inputWrapError: { borderColor: '#FF6B6B' },
  input: { height: 44, paddingHorizontal: 12, color: '#111' },
  errorText: { color: '#FF6B6B', marginTop: 8, fontSize: 13, fontWeight: '600' },

  bottom: { paddingHorizontal: 18, paddingBottom: 18 },
  primaryButton: {
    height: 48,
    borderRadius: 6,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonLoading: { opacity: 0.75 },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 0.6 },
});
