// screens/PhysicalGlowUpRoadmapScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography, spacing, radii, shadows, tokens } from './theme';

const TRACK_KEY = 'physicalGlowUpTrack';

const trackLabel = (id) => {
  if (id === 'gym') return 'Working out in a gym';
  if (id === 'home') return 'Working out at home';
  return null;
};

export default function PhysicalGlowUpRoadmapScreen() {
  const navigation = useNavigation();
  const [track, setTrack] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(TRACK_KEY).then((val) => setTrack(val));
    const unsub = navigation.addListener('focus', async () => {
      const val = await AsyncStorage.getItem(TRACK_KEY);
      setTrack(val);
    });
    return unsub;
  }, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* --- HEADER --- */}
      <Text style={styles.title}>Physical Glow-Up</Text>
      <Text style={styles.subtitle}>
        Build energy, confidence, and strength — tailored to your workout style.
      </Text>

      {/* --- TRACK QUESTION CARD --- */}
      <TouchableOpacity
        style={styles.questionCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('PhysicalGlowUpTrack')}
      >
        <View style={styles.row}>
          <Ionicons name="barbell-outline" size={20} color={colors.deepRose} style={{ marginRight: spacing.sm }} />
          <Text style={styles.qTitle}>
            Are you going to work out in the gym or at home?
          </Text>
        </View>
        <View style={styles.qFooter}>
          <Text style={styles.qAnswer}>
            {track ? trackLabel(track) : 'Tap to choose your path'}
          </Text>
          <Text style={styles.qChange}>Change →</Text>
        </View>
      </TouchableOpacity>

      {/* --- SECTION EYEBROW --- */}
      <View style={tokens.eyebrowRow}>
        <Text style={typography.eyebrow}>What you'll work on</Text>
        <View style={tokens.eyebrowRule} />
      </View>
      <Text style={styles.sectionSubtitle}>
        Your plan covers 9 core themes, personalised to your workout style.
      </Text>

      {/* --- THEME CARDS --- */}
      {[
        { icon: '📊', title: 'Baseline & Goals',            desc: 'Measure where you are and set clear, realistic targets to aim for.' },
        { icon: '📅', title: 'Habits & Tracking',           desc: 'Build consistent daily habits and log progress to stay accountable.' },
        { icon: '🤸', title: 'Mobility & Posture',          desc: 'Improve flexibility, reduce injury risk, and move with ease every day.' },
        { icon: '🥗', title: 'Nutrition Fundamentals',      desc: 'Fuel your body with the right foods to support energy and recovery.' },
        { icon: '😴', title: 'Sleep & Recovery',            desc: 'Optimise rest so your body can repair, grow, and perform at its best.' },
        {
          icon:  track === 'home' ? '💪' : '🏋️',
          title: track === 'home' ? 'Bodyweight & Minimal Equipment' : 'Strength Training (Gym)',
          desc:  track === 'home'
            ? 'Effective routines using your bodyweight, resistance bands, or basic kit.'
            : 'Progressive overload, compound lifts, and smart programming for real gains.',
        },
        { icon: '🏃', title: 'Cardio & Conditioning',       desc: 'Build your aerobic base and keep your heart strong and your energy high.' },
        { icon: '🌱', title: 'General Wellness',            desc: 'Stress management, hydration, and the small habits that compound over time.' },
        { icon: '✨', title: 'Style & Confidence',          desc: 'Dress for your new body, carry yourself with confidence, and own the glow-up.' },
      ].map((item, i) => (
        <View key={i} style={styles.themeCard}>
          <Text style={styles.themeIcon}>{item.icon}</Text>
          <View style={styles.themeTextWrap}>
            <Text style={styles.themeTitle}>{item.title}</Text>
            <Text style={styles.themeDesc}>{item.desc}</Text>
          </View>
        </View>
      ))}

      {/* --- CTA --- */}
      <TouchableOpacity
        style={styles.ctaButton}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('PhysicalGlowUpTrack')}
      >
        <Text style={styles.ctaText}>
          {track ? '💪 Continue my plan' : '💪 Start the Physical Glow-Up'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: spacing.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.screenPaddingH,
    paddingTop: spacing.lg,
    backgroundColor: colors.warmWhite,
  },

  // Header
  title: {
    ...typography.screenTitle,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.bodyMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  // Track question card
  questionCard: {
    ...tokens.infoCard,
    ...shadows.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  qTitle: {
    ...typography.actionLabel,
    fontSize: 15,
    flex: 1,
    lineHeight: 21,
  },
  qFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qAnswer: {
    ...typography.caption,
    color: colors.deepRose,
    fontSize: 13,
  },
  qChange: {
    ...typography.caption,
    color: colors.deepRose,
    fontWeight: '700',
    fontSize: 13,
  },

  // Section
  sectionSubtitle: {
    ...typography.body,
    color: colors.bodyMuted,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },

  // Theme cards
  themeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    ...shadows.card,
  },
  themeIcon: {
    fontSize: 22,
    marginTop: 1,
  },
  themeTextWrap: {
    flex: 1,
  },
  themeTitle: {
    ...typography.actionLabel,
    fontSize: 14,
    marginBottom: 3,
  },
  themeDesc: {
    ...typography.actionSub,
    fontSize: 13,
    lineHeight: 18,
  },

  // CTA
  ctaButton: {
    ...tokens.buttonPrimary,
    marginTop: spacing.sm,
  },
  ctaText: {
    ...typography.buttonPrimary,
    fontSize: 13,
  },
});