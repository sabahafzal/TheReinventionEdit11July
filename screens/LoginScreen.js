// screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, radii, gradients } from './theme';

const IS_IPAD = Platform.OS === 'ios' && Platform.isPad;

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      Alert.alert('Login failed', error.message);
    }
    // Don't set quizCompleted here — App.js clears AsyncStorage for new users
    // and sets quizCompleted='false', which routes them to OnboardingQuiz.
    // For returning users, their existing quizCompleted='true' is preserved.
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Enter email', 'Please enter your email address first.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'reinventionedit://reset-password',
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert(
        'Password reset email sent',
        'Check your email for a link to reset your password.'
      );
    }
  };

  return (
    <LinearGradient colors={gradients.planBackground} style={styles.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View style={styles.form}>
            <Text style={styles.title}>Welcome Back</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.caption}
              autoCapitalize="none"
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.caption}
              onChangeText={setPassword}
              value={password}
              secureTextEntry
            />

            <TouchableOpacity onPress={handleResetPassword}>
              <Text style={styles.forgotPassword}>Forgot your password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.link}>
                Don't have an account?{' '}
                <Text style={styles.linkBold}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    padding: IS_IPAD ? spacing.xxl * 2 : spacing.xl,
    backgroundColor: colors.overlayDark,
  },

  form: {
    backgroundColor: colors.warmWhite,
    padding: IS_IPAD ? spacing.xxl : spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    // Constrain width on iPad so the form doesn't stretch edge-to-edge
    maxWidth: IS_IPAD ? 520 : undefined,
    width: '100%',
    alignSelf: 'center',
  },

  title: {
    ...typography.screenTitle,
    fontSize: IS_IPAD ? 34 : 28,
    marginBottom: spacing.xxl,
  },

  input: {
    height: IS_IPAD ? 52 : 44,
    borderColor: colors.softBorder,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    color: colors.ink,
    ...typography.body,
    fontSize: IS_IPAD ? 16 : 14,
  },

  forgotPassword: {
    ...typography.caption,
    textAlign: 'right',
    marginBottom: spacing.md,
    textDecorationLine: 'underline',
    color: colors.bodyMuted,
  },

  button: {
    backgroundColor: colors.deepRose,
    borderRadius: radii.md,
    paddingVertical: IS_IPAD ? 18 : 14,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  buttonText: {
    ...typography.buttonPrimary,
  },

  link: {
    marginTop: spacing.md,
    ...typography.body,
    textAlign: 'center',
    color: colors.bodyMuted,
  },

  linkBold: {
    fontWeight: '700',
    color: colors.deepRose,
  },
});