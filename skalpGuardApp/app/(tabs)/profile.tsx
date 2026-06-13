import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';

const BACKGROUND = '#D0DEE1';
const PRIMARY = '#344225';
const ACCENT = '#FAD979';
const MUTED = '#4f5b50';

const BASE_SERVER_URL = 'https://avelina-unstaunch-nonreflectively.ngrok-free.dev';

function getFullImageUrl(url: string | null | undefined) {
  if (!url) return null;
  
  // If it's already a full URL but pointing to localhost, swap it for the ngrok URL
  if (url.startsWith('http')) {
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      return url.replace(/http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, BASE_SERVER_URL);
    }
    return url;
  }
  
  // Handle relative paths from backend (laravel storage etc)
  return `${BASE_SERVER_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&q=80&w=200');
  const [initializing, setInitializing] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [createdAt, setCreatedAt] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [hashedPassword, setHashedPassword] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isBlockedUser, setIsBlockedUser] = useState(false);

  const [userId, setUserId] = useState<number | null>(null);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const pickImage = async () => {
    if (!isEditing) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images' as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setAvatar(result.assets[0].uri);
      setImageError(false);
    }
  };

  const loadProfile = useCallback(async () => {
    setInitializing(true);
    setImageError(false);
    try {
      const storedUserRaw = await AsyncStorage.getItem('current_user');
      let currentId = userId;

      if (storedUserRaw) {
        const stored = JSON.parse(storedUserRaw);
        if (!currentId) {
          currentId = stored.id;
          setUserId(currentId);
        }
        // Hydrate from cache immediately
        if (stored.displayName) setName(stored.displayName);
        if (stored.email) setEmail(stored.email);
        if (stored.profilePhoto) setAvatar(getFullImageUrl(stored.profilePhoto) || '');
      }

      const endpoint = currentId ? `/users/${currentId}` : '/user';
      const response = await api.get(endpoint);

      const userData = response.data || response;
      if (userData) {
        setUserId(userData.id);
        setEmail(userData.email);
        setName(userData.name);
        setCreatedAt(userData.created_at);
        setIsBlocked(userData.is_blocked || false);
        setHashedPassword(userData.password || '');
        if (userData.profile_photo_url) {
          setAvatar(getFullImageUrl(userData.profile_photo_url) || '');
        }

        if (userData.is_blocked) {
          setIsBlockedUser(true);
          setErrorModalMessage('Your account is blocked by admin. Contact at saif@gmail.com to admin.');
          setShowErrorModal(true);
        }

        await AsyncStorage.setItem('current_user', JSON.stringify({
          id: userData.id,
          email: userData.email,
          displayName: userData.name,
          profilePhoto: userData.profile_photo_url || null,
        }));
      }
    } catch (error: any) {
      console.error('Load profile error:', error);
      const msg = error.message || '';
      if (msg.includes('Unauthenticated.')) {
        handleLogout(true);
      } else if (msg.toLowerCase().includes('not found')) {
        setIsBlockedUser(false);
        setErrorModalMessage(msg);
        setShowErrorModal(true);
      } else if (msg.toLowerCase().includes('blocked')) {
        setIsBlockedUser(true);
        setErrorModalMessage('Your account is blocked by admin. Contact at saif@gmail.com to admin.');
        setShowErrorModal(true);
      }
    } finally {
      setInitializing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleUpdateProfile = async () => {
    if (!name.trim() || !email.trim()) {
      setErrorModalMessage('Please provide your name and email to continue.');
      setShowErrorModal(true);
      return;
    }
    if (!userId) {
      setErrorModalMessage('User identity not found. Please log in again.');
      setShowErrorModal(true);
      return;
    }

    if (!currentPassword.trim()) {
      setErrorModalMessage('Please enter your current password to save changes.');
      setShowErrorModal(true);
      return;
    }

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('current_password', currentPassword);

      if (selectedImage) {
        const filename = selectedImage.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append('profile_photo', {
          uri: selectedImage,
          name: filename,
          type,
        } as any);
      }

      if (password.trim()) {
        formData.append('password', password);
        formData.append('password_confirmation', password);
      }

      const response = await api.put(`/users/${userId}`, formData, true);

      if (response.success) {
        setSelectedImage(null);
        await AsyncStorage.setItem('current_user', JSON.stringify({
          id: response.data.id,
          email: response.data.email,
          displayName: response.data.name,
          profilePhoto: response.data.profile_photo_url || null,
        }));

        // Immediately update local states to reflect changes in UI
        setName(response.data.name);
        setEmail(response.data.email);
        setCurrentPassword('');
        if (response.data.profile_photo_url) {
          setAvatar(getFullImageUrl(response.data.profile_photo_url) || '');
          setImageError(false);
        }

        setShowSuccessModal(true);
        setIsEditing(false);
      }
    } catch (error: any) {
      const msg = error?.message || 'Failed to update profile.';
      if (msg.toLowerCase().includes('not found')) {
        setErrorModalMessage(msg);
        setShowErrorModal(true);
      } else {
        Alert.alert('Error', msg);
        setErrorModalMessage(msg);
        setShowErrorModal(true);
      }
    } finally {
      setProcessing(false);
    }
  };

  const confirmDeleteAccount = async () => {
    if (!userId) return;
    setProcessing(true);
    setShowDeleteModal(false);
    try {
      await api.delete(`/users/${userId}`);
      await AsyncStorage.multiRemove(['current_user', 'user_token']);
      router.replace('/auth');
    } catch (error: any) {
      setErrorModalMessage(error?.message || 'Unable to delete account at this time.');
      setShowErrorModal(true);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleLogout = (silent = false) => {
    if (silent) {
      AsyncStorage.multiRemove(['current_user', 'user_token']).then(() => router.replace('/auth'));
      return;
    }
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setLogoutLoading(true);
    setShowLogoutModal(false);
    try {
      await AsyncStorage.multiRemove(['current_user', 'user_token']);
      router.replace('/auth');
    } catch (error: any) {
      setErrorModalMessage(error?.message || 'Unable to log out.');
      setShowErrorModal(true);
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View style={styles.headerBlock}>
              <Text style={styles.screenTitle}>My Profile</Text>
              <Text style={styles.screenSubtitle}>Manage your personal information</Text>
            </View>
            <View style={styles.actionIcons}>
              {initializing && <ActivityIndicator color={PRIMARY} size="small" style={{ marginRight: 12 }} />}
              <TouchableOpacity
                style={[styles.iconButton, isEditing && styles.iconButtonActive]}
                onPress={() => setIsEditing(!isEditing)}
                activeOpacity={0.8}
                accessibilityLabel="Edit profile">
                <MaterialIcons name={isEditing ? 'close' : 'edit'} size={20} color={isEditing ? '#fff' : PRIMARY} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarCircle}>
                {avatar && !imageError ? (
                  <>
                    <Image 
                      source={{ uri: avatar }} 
                      key={avatar} 
                      style={styles.avatarImage} 
                      onError={() => {
                        console.log('Avatar load failed:', avatar);
                        setImageError(true);
                        setImageLoading(false);
                      }}
                      onLoadStart={() => {
                        setImageError(false);
                        setImageLoading(true);
                      }}
                      onLoadEnd={() => setImageLoading(false)}
                    />
                    {imageLoading && (
                      <View style={StyleSheet.absoluteFill}>
                        <ActivityIndicator color={ACCENT} style={{ flex: 1 }} />
                      </View>
                    )}
                  </>
                ) : (
                  <Text style={styles.avatarInitial}>
                    {name ? name.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : '?')}
                  </Text>
                )}
              </View>
              {isEditing && (
                <TouchableOpacity style={styles.avatarEditBadge} activeOpacity={0.9} onPress={pickImage}>
                  <MaterialIcons name="photo-camera" size={16} color={PRIMARY} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.ProfileName}>{name || 'SkalpGuard User'}</Text>
            <Text style={styles.ProfileEmail}>{email}</Text>
            {createdAt && (
              <View style={styles.memberSinceBadge}>
                <MaterialIcons name="event" size={14} color={PRIMARY} />
                <Text style={styles.memberSinceText}>
                  Member since {formatDate(createdAt)}
                </Text>
              </View>
            )}
          </View>

          {/* Form Section */}
          <View style={styles.formCard}>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <View style={[styles.inputWrapper, isEditing && styles.inputWrapperActive]}>
                <MaterialIcons name="person-outline" size={22} color={PRIMARY} style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter your full name"
                  placeholderTextColor="#7f8f85"
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  editable={isEditing}
                />
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={[styles.inputWrapper, isEditing && styles.inputWrapperActive]}>
                <MaterialIcons name="mail-outline" size={22} color={PRIMARY} style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#7f8f85"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={isEditing}
                />
              </View>
            </View>

            {isEditing && (
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Current Password (Required to Save)</Text>
                <View style={[styles.inputWrapper, styles.inputWrapperActive, { borderColor: ACCENT }]}>
                  <MaterialIcons name="vpn-key" size={22} color={PRIMARY} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Confirm with current password"
                    placeholderTextColor="#7f8f85"
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    autoCapitalize="none"
                    secureTextEntry
                  />
                </View>
              </View>
            )}

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>New Password (Optional)</Text>
              <View style={[styles.inputWrapper, isEditing && styles.inputWrapperActive]}>
                <MaterialIcons name="lock-outline" size={22} color={PRIMARY} style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter new password"
                  placeholderTextColor="#7f8f85"
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  secureTextEntry
                  editable={isEditing}
                />
              </View>
            </View>

            {/* Account Metadata (Read-only) */}
            <View style={[styles.fieldWrap, { marginTop: 10 }]}>
              <Text style={styles.fieldLabel}>Account Info</Text>
              <View style={styles.metadataCard}>
                <View style={styles.metaItem}>
                  <MaterialIcons name="calendar-today" size={16} color={PRIMARY} />
                  <Text style={styles.metaLabel}>Member Since</Text>
                  <Text style={styles.metaValue}>
                    {formatDate(createdAt)}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialIcons name="info-outline" size={16} color={PRIMARY} />
                  <Text style={styles.metaLabel}>Status</Text>
                  <Text style={[styles.metaValue, { color: isBlocked ? '#d32f2f' : '#2e7d32' }]}>
                    {isBlocked ? 'Blocked' : 'Active'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          {isEditing ? (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.primaryButton, processing && styles.btnDisabled]}
                onPress={handleUpdateProfile}
                disabled={processing}
                activeOpacity={0.8}
              >
                {processing ? <ActivityIndicator color={BACKGROUND} /> : <Text style={styles.primaryButtonText}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.viewActions}>
              <TouchableOpacity
                style={[styles.logoutButton, logoutLoading && styles.logoutButtonDisabled]}
                onPress={() => handleLogout()}
                disabled={logoutLoading}
                activeOpacity={0.7}
                accessibilityLabel="Log out"
              >
                <MaterialIcons name="logout" size={20} color={PRIMARY} style={styles.btnIconLeft} />
                {logoutLoading ? (
                  <ActivityIndicator color={PRIMARY} />
                ) : (
                  <Text style={styles.logoutText}>Log Out</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => setShowDeleteModal(true)}
                activeOpacity={0.7}
                accessibilityLabel="Delete profile"
              >
                <MaterialIcons name="delete-outline" size={18} color="#d32f2f" style={styles.btnIconLeft} />
                <Text style={styles.deleteText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error Modal (Record Not Found or Blocked) */}
      <Modal visible={showErrorModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <MaterialIcons name={isBlockedUser ? "block" : "person-off"} size={54} color={PRIMARY} />
            </View>
            <Text style={styles.successTitle}>{isBlockedUser ? 'Account Blocked' : 'Record Not Found'}</Text>
            <Text style={styles.successMessage}>
              {errorModalMessage || (isBlockedUser ? "Your account is temporarily restricted. Please contact support." : "We couldn't find the requested record.")}
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowErrorModal(false);
                if (isBlockedUser || !initializing) {
                  handleLogout(true);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.successButtonText}>{isBlockedUser ? 'Okay' : 'Continue'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successAvatarWrap}>
              {avatar ? (
                <Image
                  source={{ uri: avatar }}
                  key={avatar}
                  style={styles.successAvatar}
                />
              ) : (
                <View style={styles.successIconFallback}>
                  <MaterialIcons name="auto-awesome" size={54} color={PRIMARY} />
                </View>
              )}
            </View>
            <Text style={styles.successTitle}>
              {name ? `Welcome, ${name}!` : 'Profile Updated!'}
            </Text>
            <Text style={styles.successMessage}>
              Your changes have been securely saved to our system.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => setShowSuccessModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.successButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <MaterialIcons name="delete-forever" size={54} color={PRIMARY} />
            </View>
            <Text style={styles.successTitle}>Delete Account?</Text>
            <Text style={styles.successMessage}>
              This action is permanent and cannot be undone. All your scan history will be lost.
            </Text>
            <View style={styles.confirmRow}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: BACKGROUND }]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: PRIMARY }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.successButton, { flex: 1, marginTop: 0 }]}
                onPress={confirmDeleteAccount}
              >
                <Text style={styles.successButtonText}>Confirm Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.logoutIconWrap}>
              <MaterialIcons name="logout" size={54} color={PRIMARY} />
            </View>
            <Text style={styles.successTitle}>Log Out?</Text>
            <Text style={styles.successMessage}>
              Are you sure you want to end your current session?
            </Text>
            <View style={styles.confirmRow}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: BACKGROUND }]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: PRIMARY }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.successButton, { flex: 1, marginTop: 0 }]}
                onPress={confirmLogout}
              >
                <Text style={styles.successButtonText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  keyboardView: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerBlock: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: PRIMARY,
  },
  screenSubtitle: {
    fontSize: 14,
    color: MUTED,
    marginTop: 4,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconButtonActive: {
    backgroundColor: PRIMARY,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: ACCENT,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: '800',
    color: BACKGROUND,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: ACCENT,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: BACKGROUND,
  },
  ProfileName: {
    fontSize: 24,
    fontWeight: '800',
    color: PRIMARY,
    marginBottom: 4,
  },
  ProfileEmail: {
    fontSize: 15,
    color: MUTED,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  fieldWrap: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5fbf7',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 58,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputWrapperActive: {
    borderColor: '#b4c9bc',
    backgroundColor: '#fafefc',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY,
    height: '100%',
  },
  editActions: {
    marginTop: 8,
  },
  primaryButton: {
    height: 60,
    borderRadius: 18,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryButtonText: {
    color: BACKGROUND,
    fontSize: 17,
    fontWeight: '800',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  viewActions: {
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  logoutText: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: '800',
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  btnIconLeft: {
    marginRight: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ffcdd2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: '#d32f2f',
    fontSize: 15,
    fontWeight: '700',
  },
  memberSinceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 66, 37, 0.1)',
  },
  memberSinceText: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY,
    marginLeft: 6,
  },
  metadataCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e6ede8',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 13,
    color: MUTED,
    marginLeft: 8,
    flex: 1,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },
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
  successIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoutIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f5fbf7',
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
  confirmRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#f6f8f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: MUTED,
  },
  confirmDeleteButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#d32f2f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
});