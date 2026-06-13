import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from './api/client';

const BACKGROUND = '#D0DEE1'; // light blue-grey
const PRIMARY = '#344225'; // dark olive green

export const unstable_settings = { headerShown: false } as const;

export default function SignupProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const name = params.name as string;
  const password = params.password as string;
  const gender = params.gender as string;

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your photos to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'] as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfilePhoto(result.assets[0].uri);
      }
    } catch (error: any) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSignUp = async () => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('password_confirmation', password);
      formData.append('gender', gender);

      if (profilePhoto) {
        const filename = profilePhoto.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('profile_photo', {
          uri: profilePhoto,
          name: filename,
          type,
        } as any);
      }

      const response = await api.post('/users', formData, true);

      if (response.success) {
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

        setShowSuccess(true);
      } else {
        Alert.alert('Error', response.message || 'Signup failed');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      Alert.alert('Error', err?.message || 'Signup failed. Please try again.');
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
        <Text style={styles.question}>Upload a profile photo</Text>

        <View style={styles.photoSection}>
          {profilePhoto ? (
            <View style={styles.photoPreviewContainer}>
              <View style={styles.imageFrame}>
                <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
                <TouchableOpacity style={styles.removeBadge} onPress={() => setProfilePhoto(null)} activeOpacity={0.8}>
                   <MaterialIcons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.changeButton} onPress={pickImage} activeOpacity={0.8}>
                <MaterialIcons name="photo-library" size={18} color={PRIMARY} style={{ marginRight: 6 }} />
                <Text style={styles.changeButtonText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.modernUploadArea} onPress={pickImage} activeOpacity={0.7}>
              <View style={styles.uploadIconCircle}>
                <MaterialIcons name="cloud-upload" size={32} color={PRIMARY} />
              </View>
              <Text style={styles.uploadMainText}>Tap to upload photo</Text>
              <Text style={styles.uploadSubText}>PNG, JPG up to 5MB</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.primaryButtonLoading]}
          onPress={handleSignUp}
          activeOpacity={0.9}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Continue</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipWrap} onPress={handleSignUp} disabled={loading} activeOpacity={0.8}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successAvatarWrap}>
              {profilePhoto ? (
                <Image
                  source={{ uri: profilePhoto }}
                  key={profilePhoto}
                  style={styles.successAvatar}
                />
              ) : (
                <View style={styles.successIconFallback}>
                  <MaterialIcons name="check-circle" size={54} color={PRIMARY} />
                </View>
              )}
            </View>
            <Text style={styles.successTitle}>
              {name ? `Hey, ${name}!` : 'Account Created!'}
            </Text>
            <Text style={styles.successMessage}>
              Your SkalpGuard account has been successfully set up. Welcome to the journey!
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowSuccess(false);
                router.replace('/welcome?type=new');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.successButtonText}>Get Started</Text>
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
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  logoWrap: { alignItems: 'center', marginTop: 8 },
  logo: { width: 82, height: 82, tintColor: PRIMARY },

  content: { flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  question: { color: PRIMARY, fontSize: 18, fontWeight: '800', marginBottom: 12 },

  photoSection: { alignItems: 'center', marginTop: 20 },
  
  // New Modern Upload Area
  modernUploadArea: {
    width: '100%',
    height: 180,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 2,
    borderColor: PRIMARY,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: PRIMARY,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  uploadMainText: {
    fontSize: 16,
    fontWeight: '800',
    color: PRIMARY,
    marginBottom: 4,
  },
  uploadSubText: {
    fontSize: 13,
    color: '#6A7F73',
    fontWeight: '500',
  },

  // Enhanced Photo Preview
  photoPreviewContainer: {
    alignItems: 'center',
    width: '100%',
  },
  imageFrame: {
    position: 'relative',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 60,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: PRIMARY,
  },
  profileImage: { 
    width: 100, 
    height: 100, 
    borderRadius: 50,
  },
  removeBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B6B',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A9B8BB',
  },
  changeButtonText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '800',
  },

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
  skipWrap: { marginTop: 10, alignItems: 'center' },
  skipText: { color: PRIMARY, fontSize: 14, fontWeight: '800' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(52, 66, 37, 0.4)',
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
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: PRIMARY,
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
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  successButtonText: {
    color: BACKGROUND,
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
