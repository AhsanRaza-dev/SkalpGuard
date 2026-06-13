import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from './api/client';

const BACKGROUND = '#344225'; // Dark olive green
const ACCENT = '#FAD979'; // Yellow
const PRIMARY = ACCENT; // Re-using for compatibility with some styles if needed

export const unstable_settings = { headerShown: false } as const;

export default function LoginPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/verify', {
        email,
        password,
      });

      if (response.success) {
        if (response.data.is_blocked) {
          setIsBlocked(true);
          setErrorModalMessage('Your account is blocked by admin. Contact at saif@gmail.com to admin.');
          setShowErrorModal(true);
          return;
        }

        // Store token for future requests
        await AsyncStorage.setItem('user_token', response.token);

        // Store current user data
        await AsyncStorage.setItem(
          'current_user',
          JSON.stringify({
            id: response.data.id,
            email: response.data.email,
            displayName: response.data.name,
            profilePhoto: response.data.profile_photo_url || null,
          })
        );

        setDisplayName(response.data.name || '');
        setProfilePhoto(response.data.profile_photo_url || null);
        setShowSuccess(true);
      } else {
        const msg = response.message || 'Login failed';
        if (msg.toLowerCase().includes('blocked')) {
          setIsBlocked(true);
          setErrorModalMessage('Your account is blocked by admin. Contact at saif@gmail.com to admin.');
          setShowErrorModal(true);
        } else {
          setError(msg);
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err?.message || 'Login failed. Please check your credentials.';
      if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('user does not exist')) {
        setIsBlocked(false);
        setErrorModalMessage(msg);
        setShowErrorModal(true);
      } else if (msg.toLowerCase().includes('blocked')) {
        setIsBlocked(true);
        setErrorModalMessage('Your account is blocked by admin. Contact at saif@gmail.com to admin.');
        setShowErrorModal(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.question}>Enter your password</Text>

        <View style={[styles.inputWrap, error && styles.inputWrapError]}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#8FA79A"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) setError('');
            }}
            autoCapitalize="none"
            accessibilityLabel="Password"
          />
        </View>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.primaryButtonLoading]}
          onPress={handleSignIn}
          activeOpacity={0.9}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={BACKGROUND} /> : <Text style={styles.primaryButtonText}>Sign In</Text>}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <MaterialIcons name="auto-awesome" size={54} color={PRIMARY} />
            </View>
            <Text style={styles.successTitle}>
              {displayName ? `Welcome Back, ${displayName}!` : 'Welcome Back!'}
            </Text>
            <Text style={styles.successMessage}>
              Successfully authenticated. We're glad to see you again!
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowSuccess(false);
                router.replace('/welcome?type=existing');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.successButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showErrorModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <MaterialIcons name={isBlocked ? "block" : "person-off"} size={54} color={PRIMARY} />
            </View>
            <Text style={styles.successTitle}>{isBlocked ? 'Account Blocked' : 'Record Not Found'}</Text>
            <Text style={styles.successMessage}>
              {errorModalMessage || (isBlocked ? "Your account is temporarily restricted. Please contact support." : "We couldn't find an account matching these details.")}
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowErrorModal(false);
                router.back();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.successButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: { color: BACKGROUND, fontSize: 18, fontWeight: '700' },

  logoWrap: { alignItems: 'center', marginTop: 8 },
  logo: { width: 82, height: 82, tintColor: ACCENT },

  content: { flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  question: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  inputWrap: {
    backgroundColor: '#D0DEE1',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0DEE1',
    height: 56,
    justifyContent: 'center',
  },
  inputWrapError: { borderColor: '#FF6B6B' },
  input: { paddingHorizontal: 16, color: '#111', fontSize: 16 },
  errorText: { color: '#FF6B6B', marginTop: 8, fontSize: 13, fontWeight: '600' },

  bottom: { paddingHorizontal: 18, paddingBottom: 18 },
  primaryButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonLoading: { opacity: 0.75 },
  primaryButtonText: { color: BACKGROUND, fontSize: 17, fontWeight: '700' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  successIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#D0DEE1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#344225',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 15,
    color: '#4f5b50',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  successButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#344225',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#344225',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  successButtonText: {
    color: '#FAD979',
    fontSize: 16,
    fontWeight: '800',
  },
  successAvatarWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 4,
    borderColor: PRIMARY,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  successAvatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  successIconFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
