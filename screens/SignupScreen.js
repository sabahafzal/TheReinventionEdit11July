// screens/SignupScreen.js
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
  Linking,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, radii, gradients } from './theme';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name to create an account.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }
    if (!password) {
      Alert.alert('Password required', 'Please enter a password.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim() },
      },
    });

    if (error) {
      Alert.alert('Signup failed', error.message);
      return;
    }

    const userId = data?.user?.id;
    if (userId) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: userId, display_name: name.trim() }, { onConflict: 'id' });

      if (profileError) {
        console.warn('Failed to upsert display_name after signup:', profileError.message);
      }
    }

    Alert.alert('Account created', 'Your account has been created successfully.');
  };

  return (
    <LinearGradient
      colors={gradients.planBackground}
      style={styles.background}
      start={{ x: 1, y: 1 }}
      end={{ x: 0, y: 0 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View style={styles.form}>
            <Text style={styles.title}>Sign Up</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor={colors.caption}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.caption}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.caption}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <Text style={styles.privacyText}>
              By creating an account you agree to our{' '}
              <Text onPress={() => navigation.navigate('TermsOfService')}>Terms of Service</Text>
              {' '}and{' '}
              <Text onPress={() => navigation.navigate('PrivacyPolicy')}>Privacy Policy</Text>
            </Text>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>
                Already have an account?{' '}
                <Text style={styles.linkBold}>Log in</Text>
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
    padding: spacing.xl,
    backgroundColor: colors.overlayDark,
  },

  form: {
    backgroundColor: colors.warmWhite,
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
  },

  title: {
    ...typography.screenTitle,
    fontSize: 28,
    marginBottom: spacing.xxl,
  },

  input: {
    height: 44,
    borderColor: colors.softBorder,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    color: colors.ink,
    ...typography.body,
  },

  button: {
    backgroundColor: colors.deepRose,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  buttonText: {
    ...typography.buttonPrimary,
  },

  privacyText: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.caption,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },

  privacyLink: {
    color: colors.deepRose,
    textDecorationLine: 'underline',
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