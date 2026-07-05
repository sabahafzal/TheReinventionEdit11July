// CongratsScreen.js — elaborated with richer visuals, all colours from theme.js

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { identityStatements } from '../config/configidentityStatements';
import { colors, typography, spacing, radii, shadows, tokens } from './theme';

// ─── Data ──────────────────────────────────────────────────────────────────────

const roadmapLabels = {
  new_city:          'Starting Over in a New City',
  tech_switch:       'Switching Into Tech',
  financial_glow_up: 'Financial Glow-Up',
  physical_glow_up:  'Physical Glow-Up',
  mental_glow_up:    'Mental Glow-Up',
};

// Per-roadmap celebratory data: icon, milestone label, short motivational line
const roadmapMeta = {
  new_city: {
    icon: '🏙️',
    milestoneLabel: 'New roots, new story',
    quote: 'You chose yourself and that took courage.',
  },
  tech_switch: {
    icon: '💻',
    milestoneLabel: 'Career redirected',
    quote: 'You built new skills from scratch. That is rare.',
  },
  financial_glow_up: {
    icon: '✨',
    milestoneLabel: 'Money mindset unlocked',
    quote: 'Understanding your money is the most powerful thing you can do.',
  },
  physical_glow_up: {
    icon: '🌿',
    milestoneLabel: 'Body reconnected',
    quote: 'You showed up for yourself, again and again.',
  },
  mental_glow_up: {
    icon: '🧠',
    milestoneLabel: 'Mind transformed',
    quote: 'You did the inner work. Most people never start.',
  },
};

const STATS = [
  { label: 'Tasks\nCompleted', valueKey: 'tasks' },
  { label: 'Weeks\nActive',    valueKey: 'weeks'  },
  { label: 'Themes\nExplored', valueKey: 'themes' },
];

const buildCongratsShareMessage = ({ roadmapName, identity }) =>
  `👑 Roadmap completed\n\nI completed the "${roadmapName}" roadmap in The Reinvention Edit.\n\nThis is not just progress, this is proof that I can follow through on my next chapter.\n\n${identity ? `"${identity}"\n\n` : ''}#TheReinventionEdit\nStart your own reinvention:\nthereinventionedit.com`;

// ─── Decorative ornament row ───────────────────────────────────────────────────

function OrnamentRow() {
  return (
    <View style={ornStyles.row}>
      <View style={ornStyles.dot} />
      <View style={ornStyles.line} />
      <View style={[ornStyles.dot, ornStyles.dotLg]} />
      <View style={ornStyles.line} />
      <View style={ornStyles.dot} />
    </View>
  );
}

const ornStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
    marginVertical: spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.clayRule,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.dustyRose,
  },
  dotLg: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.deepRose,
    opacity: 0.55,
  },
});

// ─── Stat pill ─────────────────────────────────────────────────────────────────

function StatPill({ label, value }) {
  return (
    <View style={statStyles.pill}>
      <Text style={statStyles.value}>{value ?? '—'}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.offWhite,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.softBorder,
    marginHorizontal: 4,
  },
  value: {
    fontFamily: typography.fontDisplay,
    fontSize: 22,
    color: colors.deepRose,
    fontWeight: '400',
    marginBottom: 2,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.clay,
    textAlign: 'center',
    lineHeight: 13,
  },
});

// ─── Next step card ────────────────────────────────────────────────────────────

function NextStepCard({ icon, title, subtitle, onPress }) {
  return (
    <TouchableOpacity
      style={nextStyles.card}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <View style={nextStyles.iconBox}>
        <Text style={nextStyles.icon}>{icon}</Text>
      </View>
      <View style={nextStyles.text}>
        <Text style={nextStyles.title}>{title}</Text>
        <Text style={nextStyles.subtitle}>{subtitle}</Text>
      </View>
      <Text style={nextStyles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const nextStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.linen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: { fontSize: 18 },
  text: { flex: 1 },
  title: {
    ...typography.actionLabel,
    marginBottom: 2,
  },
  subtitle: {
    ...typography.actionSub,
  },
  chevron: {
    fontSize: 20,
    color: colors.champagne,
    marginLeft: spacing.sm,
    lineHeight: 24,
  },
});

// ─── Main component ────────────────────────────────────────────────────────────

export default function CongratsScreen({ route, navigation }) {
  const roadmapKey  = route?.params?.roadmap;
  const roadmapName = roadmapLabels[roadmapKey] || 'your roadmap';
  const meta        = roadmapMeta[roadmapKey] || {
    icon: '👑',
    milestoneLabel: 'Roadmap complete',
    quote: 'You followed through and that changes everything.',
  };

  const [identity, setIdentity] = useState('');
  const [sharing,  setSharing]  = useState(false);
  const [stats,    setStats]    = useState({ tasks: null, weeks: null, themes: null });

  // Entry animation
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 520, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.timing(slideAnim, { toValue: 0, duration: 520, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 55, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Load identity statement ───────────────────────────────────────────────
  useEffect(() => {
    const loadIdentity = async () => {
      try {
        if (roadmapKey === 'tech_switch') {
          const track = await AsyncStorage.getItem('techSwitchTrack');
          setIdentity(identityStatements.tech_switch?.[track] || '');
          return;
        }
        if (roadmapKey === 'new_city') {
          const trackRaw  = await AsyncStorage.getItem('newCityTrack');
          const jobStatus = await AsyncStorage.getItem('newCityJobStatus');
          const track     = trackRaw === 'moving_city_only' ? 'moving_city' : trackRaw;
          if (jobStatus === 'job_secured') {
            setIdentity(identityStatements.new_city.job_secured);
          } else if (jobStatus === 'job_needed') {
            setIdentity(identityStatements.new_city.job_needed);
          } else {
            setIdentity(identityStatements.new_city?.[track] || '');
          }
          return;
        }
        if (roadmapKey === 'physical_glow_up') {
          const track = await AsyncStorage.getItem('physicalGlowUpTrack');
          setIdentity(identityStatements.physical_glow_up?.[track] || '');
          return;
        }
        setIdentity(identityStatements[roadmapKey] || '');
      } catch (e) {
        console.warn('Failed to load identity statement', e);
      }
    };
    loadIdentity();
  }, [roadmapKey]);

  // ── Load lightweight stats from AsyncStorage ──────────────────────────────
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [tasksRaw, weeksRaw, themesRaw] = await Promise.all([
          AsyncStorage.getItem(`completedTasks_${roadmapKey}`),
          AsyncStorage.getItem(`weeksActive_${roadmapKey}`),
          AsyncStorage.getItem(`themesExplored_${roadmapKey}`),
        ]);
        setStats({
          tasks:  tasksRaw  ? JSON.parse(tasksRaw).length  : null,
          weeks:  weeksRaw  ? parseInt(weeksRaw,  10)      : null,
          themes: themesRaw ? parseInt(themesRaw, 10)      : null,
        });
      } catch (e) {
        // non-critical — silently skip
      }
    };
    if (roadmapKey) loadStats();
  }, [roadmapKey]);

  // ── Share ─────────────────────────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    if (sharing) return;
    try {
      setSharing(true);
      await Share.share({ message: buildCongratsShareMessage({ roadmapName, identity }) });
    } catch (e) {
      console.warn('Failed to share congrats card', e);
      Alert.alert('Could not share right now', 'Please try again in a moment.');
    } finally {
      setSharing(false);
    }
  }, [sharing, roadmapName, identity]);

  const hasStats = Object.values(stats).some(v => v !== null);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.warmWhite} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Wordmark ── */}
        <Text style={styles.wordmark}>The Reinvention Edit</Text>

        {/* ── Animated hero block ── */}
        <Animated.View style={[styles.heroBlock, {
          opacity:   fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        }]}>

          {/* Crown circle */}
          <View style={styles.crownCircle}>
            <Text style={styles.crownEmoji}>{meta.icon}</Text>
          </View>

          {/* Milestone label */}
          <View style={styles.milestonePill}>
            <Text style={styles.milestoneText}>{meta.milestoneLabel.toUpperCase()}</Text>
          </View>

          {/* Ornament */}
          <OrnamentRow />

          {/* Headline */}
          <Text style={styles.headline}>You did it.</Text>

          {/* Subtitle quote */}
          <Text style={styles.metaQuote}>{meta.quote}</Text>

        </Animated.View>

        {/* ── Eyebrow rule ── */}
        <View style={styles.eyebrowRow}>
          <View style={styles.rule} />
          <Text style={styles.eyebrow}>ROADMAP COMPLETE</Text>
          <View style={styles.rule} />
        </View>

        {/* ── Roadmap name pill ── */}
        <View style={styles.roadmapPill}>
          <Text style={styles.roadmapPillText}>{roadmapName}</Text>
        </View>

        {/* ── Body copy ── */}
        <Text style={styles.body}>
          This isn't just progress, it's proof that you can follow through on your next chapter.
          Take a moment to acknowledge how far you have come.
        </Text>

        {/* ── Stats row (shown only when data exists) ── */}
        {hasStats && (
          <>
            <View style={styles.sectionEyebrowRow}>
              <View style={styles.rule} />
              <Text style={styles.eyebrow}>YOUR JOURNEY</Text>
              <View style={styles.rule} />
            </View>
            <View style={styles.statsRow}>
              {STATS.map(({ label, valueKey }) => (
                <StatPill key={valueKey} label={label} value={stats[valueKey]} />
              ))}
            </View>
          </>
        )}

        {/* ── Identity card ── */}
        {!!identity && (
          <>
            <View style={[styles.sectionEyebrowRow, { marginTop: spacing.xxl }]}>
              <View style={styles.rule} />
              <Text style={styles.eyebrow}>YOUR REINVENTION IDENTITY</Text>
              <View style={styles.rule} />
            </View>

            <View style={styles.identityCard}>
              {/* Top ornamental bar */}
              <View style={styles.identityAccentBar} />
              <Text style={styles.identityText}>"{identity}"</Text>
              <View style={styles.identityFooterRow}>
                <View style={styles.identityDot} />
                <Text style={styles.identityCaption}>Carry this with you</Text>
                <View style={styles.identityDot} />
              </View>
            </View>
          </>
        )}

        {/* ── What's next ── */}
        <View style={[styles.sectionEyebrowRow, { marginTop: spacing.xxl }]}>
          <View style={styles.rule} />
          <Text style={styles.eyebrow}>WHAT'S NEXT</Text>
          <View style={styles.rule} />
        </View>

        <View style={styles.nextStepsBlock}>
          <NextStepCard
            icon="🗺️"
            title="Start a new roadmap"
            subtitle="Choose your next reinvention track"
            onPress={() => navigation.navigate('RoadmapScreen')}
          />
          <NextStepCard
            icon="💬"
            title="Share in the Circle"
            subtitle="Tell the community about your win"
            onPress={() => navigation.navigate('ReinventionCircle')}
          />
          <NextStepCard
            icon="📖"
            title="Explore your themes"
            subtitle="Go deeper into what you have completed"
            onPress={() => navigation.navigate('MainTabs')}
          />
        </View>

        {/* ── Actions ── */}
        <View style={styles.actionsBlock}>

          <TouchableOpacity
            style={[styles.btnShare, sharing && styles.btnDisabled]}
            onPress={handleShare}
            activeOpacity={0.82}
            disabled={sharing}
          >
            <Text style={styles.btnShareText}>
              {sharing ? 'Preparing share…' : '✦  Share your win'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnHome}
            onPress={() => navigation.navigate('MainTabs')}
            activeOpacity={0.7}
          >
            <Text style={styles.btnHomeText}>Back to Home</Text>
          </TouchableOpacity>

        </View>

        {/* ── Footer ── */}
        <OrnamentRow />
        <Text style={styles.nudge}>
          The Reinvention Edit. Because your next chapter deserves your full attention.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: colors.warmWhite,
  },

  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.screenPaddingH,
    paddingTop: spacing.screenPaddingTop,
    paddingBottom: 56,
  },

  // ── Wordmark ──────────────────────────────────────────────────────────────
  wordmark: {
    ...typography.brandWordmark,
    marginBottom: spacing.xxl,
  },

  // ── Hero block ─────────────────────────────────────────────────────────────
  heroBlock: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  crownCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.linen,
    borderWidth: 2,
    borderColor: colors.fawn,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.card,
  },

  crownEmoji: {
    fontSize: 44,
    lineHeight: 52,
  },

  milestonePill: {
    backgroundColor: colors.roseTint08,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.roseTint15,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },

  milestoneText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: colors.deepRose,
  },

  headline: {
    fontFamily: typography.fontDisplay,
    fontSize: 42,
    fontWeight: '400',
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },

  metaQuote: {
    fontFamily: typography.fontDisplayItalic,
    fontStyle: 'italic',
    fontSize: 15,
    color: colors.bodyMuted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
    letterSpacing: 0.2,
  },

  // ── Eyebrow rule ──────────────────────────────────────────────────────────
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    width: '100%',
  },

  sectionEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    width: '100%',
  },

  rule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.clayRule,
  },

  eyebrow: {
    ...typography.eyebrow,
  },

  // ── Roadmap pill ──────────────────────────────────────────────────────────
  roadmapPill: {
    ...tokens.badge,
    marginBottom: spacing.xl,
  },

  roadmapPillText: {
    ...typography.badge,
  },

  // ── Body copy ─────────────────────────────────────────────────────────────
  body: {
    ...typography.bodyLarge,
    textAlign: 'center',
    color: colors.bodyMuted,
    marginBottom: spacing.xxl,
    maxWidth: 310,
    lineHeight: 26,
  },

  // ── Stats row ──────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: spacing.xxl,
  },

  // ── Identity card ─────────────────────────────────────────────────────────
  identityCard: {
    width: '100%',
    backgroundColor: colors.offWhite,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.roseTint18,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    ...shadows.card,
  },

  identityAccentBar: {
    height: 3,
    backgroundColor: colors.deepRose,
    opacity: 0.25,
    marginBottom: spacing.xl,
  },

  identityText: {
    fontFamily: typography.fontDisplayItalic,
    fontStyle: 'italic',
    fontSize: 18,
    color: colors.deepRose,
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: 0.2,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },

  identityFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },

  identityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.dustyRose,
    opacity: 0.7,
  },

  identityCaption: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.clay,
    opacity: 0.8,
  },

  // ── Next steps block ──────────────────────────────────────────────────────
  nextStepsBlock: {
    width: '100%',
    marginBottom: spacing.xxl,
  },

  // ── Actions block ─────────────────────────────────────────────────────────
  actionsBlock: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },

  btnShare: {
    ...tokens.buttonPrimary,
    width: '100%',
    paddingVertical: 17,
  },

  btnDisabled: {
    opacity: 0.5,
  },

  btnShareText: {
    ...typography.buttonPrimary,
    letterSpacing: 2.5,
  },

  btnHome: {
    ...tokens.buttonDanger,
    width: '100%',
    paddingVertical: 14,
  },

  btnHomeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: colors.deepRose,
    opacity: 0.65,
  },

  // ── Footer nudge ──────────────────────────────────────────────────────────
  nudge: {
    ...typography.caption,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
});