import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BACKGROUND = '#344225'; // Dark olive green
const ACCENT = '#FAD979'; // Yellow

export const unstable_settings = { headerShown: false } as const;

export default function AuthScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [tab, setTab] = useState<'login' | 'signup'>((params.tab as 'login' | 'signup') || 'login');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<{ email?: string }>({});

    const validateEmail = (value: string) => {
        // Only accept @gmail.com addresses
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        return gmailRegex.test(value);
    };

    const handleContinue = () => {
        // Validate email
        if (!email.trim()) {
            setErrors({ email: 'Email is required' });
            return;
        }
        if (!validateEmail(email)) {
            setErrors({ email: 'Only @gmail.com accounts are allowed' });
            return;
        }

        // Navigate to next screen
        if (tab === 'signup') {
            router.push({ pathname: '/signup-name', params: { email } });
        } else {
            router.push({ pathname: '/login-password', params: { email } });
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: BACKGROUND }]}>
            <View style={styles.header}>
                <Image source={require('@/assets/images/authlogo.png')} style={styles.headerLogo} resizeMode="contain" />
            </View>

            <View style={styles.tabRow}>
                <TouchableOpacity onPress={() => setTab('login')} style={[styles.tabButton, tab === 'login' && styles.tabActive]}>
                    <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTab('signup')} style={[styles.tabButton, tab === 'signup' && styles.tabActive]}>
                    <Text style={[styles.tabText, tab === 'signup' && styles.tabTextActive]}>Create account</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.field}>
                    <View style={[styles.inputContainer, errors.email && styles.inputContainerError]}>
                        <MaterialIcons name="email" size={20} color={errors.email ? '#FF6B6B' : '#8FA79A'} style={styles.emailIcon} />
                        <TextInput
                            placeholder="Email"
                            placeholderTextColor="#8FA79A"
                            keyboardType="email-address"
                            style={styles.input}
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (errors.email) {
                                    setErrors({});
                                }
                            }}
                            autoCapitalize="none"
                            accessibilityLabel="Email"
                        />
                    </View>
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>
            </View>

            <View style={styles.bottomSection}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleContinue}
                    activeOpacity={0.9}
                >
                    <Text style={styles.submitText}>{tab === 'login' ? 'Sign In' : 'Sign Up'}</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <Text style={styles.footerAction} onPress={() => setTab(tab === 'login' ? 'signup' : 'login')}>
                            {tab === 'login' ? 'Sign up' : 'Sign in'}
                        </Text>
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'flex-start' },
    header: { alignItems: 'center', justifyContent: 'center', paddingTop: 20, paddingBottom: 40 },
    headerLogo: { width: 80, height: 80, tintColor: ACCENT },
    tabRow: { 
        flexDirection: 'row', 
        marginHorizontal: 20, 
        borderRadius: 12, 
        backgroundColor: BACKGROUND, 
        padding: 4, 
        marginBottom: 40,
        borderWidth: 1,
        borderColor: ACCENT,
    },
    tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
    tabActive: { backgroundColor: ACCENT },
    tabText: { color: ACCENT, fontSize: 15, fontWeight: '600' },
    tabTextActive: { color: BACKGROUND, fontWeight: '700' },
    form: { flex: 1, paddingHorizontal: 24 },
    inputLabel: { fontSize: 16, fontWeight: '500', color: '#fff', marginBottom: 8 },
    field: { marginBottom: 24, width: '100%' },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D0DEE1',
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D0DEE1',
    },
    emailIcon: {
        marginLeft: 16,
        marginRight: 8,
    },
    input: {
        flex: 1,
        paddingHorizontal: 8,
        color: '#222',
        fontSize: 16,
        height: '100%',
    },
    inputError: {
        borderColor: '#FF6B6B',
    },
    inputContainerError: {
        borderColor: '#FF6B6B',
    },
    errorText: { color: '#FF6B6B', marginTop: 8, fontSize: 13 },
    bottomSection: { paddingHorizontal: 24, paddingBottom: 20 },
    submitButton: { backgroundColor: ACCENT, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    submitText: { color: BACKGROUND, fontWeight: '700', fontSize: 17 },
    submitLoading: { opacity: 0.7 },
    footer: { alignItems: 'center' },
    footerText: { color: '#fff', fontSize: 15 },
    footerAction: { color: ACCENT, fontWeight: '700' },
});
