import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BACKGROUND = '#D0DEE1'; // light blue-grey
const PRIMARY = '#344225'; // dark olive green

export const unstable_settings = { headerShown: false } as const;

export default function SignupPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const name = params.name as string;
  const gender = params.gender as string;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  const validatePassword = (value: string) => {
    if (value.length < 6) return false;
    
    // Must contain at least one letter
    const hasLetter = /[a-zA-Z]/.test(value);
    // Must contain at least one number
    const hasNumber = /[0-9]/.test(value);
    // Must contain at least one special character
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    
    return hasLetter && hasNumber && hasSpecialChar;
  };

  const onNext = () => {
    const nextErrors: { password?: string; confirm?: string } = {};

    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    } else if (!validatePassword(password)) {
      nextErrors.password = 'Password must contain letters, at least one number, and one special character';
    }

    if (!confirm) {
      nextErrors.confirm = 'Please confirm your password';
    } else if (password !== confirm) {
      nextErrors.confirm = 'Passwords do not match';
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    router.push({ pathname: '/signup-profile', params: { email, name, gender, password } });
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
        <Text style={styles.question}>Create a password</Text>

        <View style={[styles.inputWrap, errors.password && styles.inputWrapError]}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#8FA79A"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            autoCapitalize="none"
            accessibilityLabel="Password"
          />
        </View>
        {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        <View style={[styles.inputWrap, styles.inputWrapSpacing, errors.confirm && styles.inputWrapError]}>
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#8FA79A"
            secureTextEntry
            style={styles.input}
            value={confirm}
            onChangeText={(text) => {
              setConfirm(text);
              if (errors.confirm) setErrors((prev) => ({ ...prev, confirm: undefined }));
            }}
            autoCapitalize="none"
            accessibilityLabel="Confirm Password"
          />
        </View>
        {!!errors.confirm && <Text style={styles.errorText}>{errors.confirm}</Text>}
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
  inputWrapSpacing: { marginTop: 14 },
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
