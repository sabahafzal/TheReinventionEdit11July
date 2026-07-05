// screens/PostQuizUpsellScreen.js
//
// Shown immediately after the onboarding quiz completes, before navigating
// to MainTabs. Receives the quiz result via route.params and shows the user
// their personalised plan preview with a 7-day free trial offer.
//
// Route params expected:
//   winner          – string  roadmap key e.g. 'financial_glow_up'
//   weeklyHours     – number  e.g. 7.5
//   roadmapLabel    – string  e.g. 'Financial Glow-Up'
//
// How to wire it up:
//   1. Add <Stack.Screen name="PostQuizUpsell" component={PostQuizUpsellScreen} />
//      to AppNavigator.js (before MainTabs).
//   2. In OnboardingQuizScreen.js, replace the Alert + goToHomeTab call with:
//        navigation.navigate('PostQuizUpsell', {
//          winner,
//          weeklyHours: effectiveWeeklyTotal,
//          roadmapLabel: LABELS[winner],
//        });
//   3. The "Start free trial" and "Maybe later" buttons both call goToHomeTab.

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { buyPremium, getProducts, PRODUCT_ID_MONTHLY } from '../lib/iap';
import { colors, typography, spacing, radii, shadows, tokens } from './theme';

// ─── Roadmap meta ──────────────────────────────────────────────────────────────
const ROADMAP_META = {
  new_city: {
    emoji: '🏙️',
    tagline: 'Land smoothly, build your social life, become a local fast.',
    themes: ['Admin & Visa Setup', 'Finding a Home', 'Making Friends', 'Exploring & Culture', 'The New You'],
    color: '#dde3d8',   // sage tint
    accentDot: colors.sage,
  },
  tech_switch: {
    emoji: '💻',
    tagline: 'Break into tech with portfolio projects and a clear career path.',
    themes: ['Mindset & Foundations', 'Role Discovery', 'Core Skills', 'Portfolio & GitHub', 'Interview Prep'],
    color: '#ddd8e3',   // lavender tint
    accentDot: '#8b7baa',
  },
  financial_glow_up: {
    emoji: '💳',
    tagline: 'Budget smarter, clear debt, invest, and build real wealth.',
    themes: ['Budgeting Basics', 'Debt & Credit', 'Saving & Emergency Fund', 'Wealth Mindset', 'Investing'],
    color: '#e8ddd0',   // warm fawn tint
    accentDot: colors.clay,
  },
  physical_glow_up: {
    emoji: '✨',
    tagline: 'Build the fitness habits, energy, and confidence of your life.',
    themes: ['Baseline & Goals', 'Nutrition Fundamentals', 'Sleep & Recovery', 'Strength Training', 'Style & Confidence'],
    color: '#ecdcd8',   // blush tint
    accentDot: colors.dustyRose,
  },
  mental_glow_up: {
    emoji: '🧠',
    tagline: 'Calm the noise, sharpen your mindset, and build real resilience.',
    themes: ['Self Awareness', 'Mindfulness', 'Cognitive Habits (CBT)', 'Emotional Resilience', 'Confidence Mindset'],
    color: '#d8e0dd',   // sage-white tint
    accentDot: colors.sage,
  },
};

const PRO_BULLETS = [
  { icon: 'infinite-outline',       text: 'Unlimited roadmap hours — no cap, ever' },
  { icon: 'refresh-circle-outline', text: 'AI weekly plan adaptation as your life changes' },
  { icon: 'calendar-outline',       text: 'Calendar export — your plan in your diary' },
  { icon: 'bar-chart-outline',      text: 'Advanced analytics & reflection insights' },
  { icon: 'people-outline',         text: 'Reinvention Circles accountability groups' },
  { icon: 'diamond-outline',        text: 'Exclusive guides: style, career & life' },
];

const TAB_CONTAINER_NAME = 'MainTabs';
const HOME_TAB_NAME      = 'Home';

// ─── Main component ────────────────────────────────────────────────────────────
export default function PostQuizUpsellScreen() {
  const navigation = useNavigation();
  const route      = useRoute();

  const { winner = 'financial_glow_up', weeklyHours = 5, roadmapLabel = 'Your Roadmap' } =
    route.params || {};

  const meta = ROADMAP_META[winner] || ROADMAP_META.financial_glow_up;

  // ── Live price from the store ─────────────────────────────────────────────────
  const [monthlyPrice, setMonthlyPrice] = useState(null);

  useEffect(() => {
    getProducts()
      .then((list) => {
        const p = list.find((x) => x.productId === PRODUCT_ID_MONTHLY);
        if (p) setMonthlyPrice(p.localizedPrice);
      })
      .catch(() => {});
  }, []);

  // ── Animations ────────────────────────────────────────────────────────────────
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(28)).current;
  const cardAnim   = useRef(new Animated.Value(0)).current;
  const cardSlide  = useRef(new Animated.Value(20)).current;
  const ctaAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 520, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 520, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(ctaAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Navigation ────────────────────────────────────────────────────────────────
  const goToHomeTab = () => {
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: TAB_CONTAINER_NAME }] }));
    navigation.dispatch(CommonActions.navigate({ name: TAB_CONTAINER_NAME, params: { screen: HOME_TAB_NAME } }));
  };

  const handleStartTrial = async () => {
    try {
      await buyPremium();
    } catch {}
    goToHomeTab();
  };

  const handleMaybeLater = () => goToHomeTab();

  // ── Weeks estimate ────────────────────────────────────────────────────────────
  const weeksLabel = (() => {
    const wk = weeklyHours > 0 ? Math.round(120 / weeklyHours) : 24;
    if (wk <= 8)  return `~${wk} weeks`;
    if (wk <= 16) return `~${wk} weeks`;
    return '~6 months';
  })();

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* Tinted top band — matches quiz tint system */}
      <View style={[styles.topBand, { backgroundColor: meta.color }]} />

      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── Hero section ──────────────────────────────────────────────── */}
          <Animated.View
            style={[
              styles.hero,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Eyebrow */}
            <View style={styles.eyebrowRow}>
              <Text style={styles.eyebrow}>YOUR PLAN IS READY</Text>
              <View style={styles.eyebrowRule} />
            </View>

            <Text style={styles.heroEmoji}>{meta.emoji}</Text>
            <Text style={styles.heroTitle}>{roadmapLabel}</Text>
            <Text style={styles.heroTagline}>{meta.tagline}</Text>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statPill}>
                <Text style={styles.statValue}>{weeklyHours}h</Text>
                <Text style={styles.statLabel}>per week</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statPill}>
                <Text style={styles.statValue}>{weeksLabel}</Text>
                <Text style={styles.statLabel}>to complete</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statPill}>
                <Text style={styles.statValue}>100%</Text>
                <Text style={styles.statLabel}>personalised</Text>
              </View>
            </View>
          </Animated.View>

          {/* ── Plan preview card ──────────────────────────────────────────── */}
          <Animated.View
            style={[
              styles.previewCard,
              { opacity: cardAnim, transform: [{ translateY: cardSlide }] },
            ]}
          >
            {/* Section label */}
            <View style={styles.cardEyebrowRow}>
              <View style={[styles.accentDot, { backgroundColor: meta.accentDot }]} />
              <Text style={styles.cardEyebrow}>ROADMAP PREVIEW</Text>
            </View>

            {/* Theme list — partially blurred to tease content */}
            {meta.themes.map((theme, i) => {
              const isLocked = i >= 2; // first 2 visible, rest locked
              return (
                <View
                  key={theme}
                  style={[
                    styles.themeRow,
                    i < meta.themes.length - 1 && styles.themeRowBorder,
                    isLocked && styles.themeRowLocked,
                  ]}
                >
                  <View style={[styles.themeDot, isLocked && styles.themeDotLocked]} />
                  <Text style={[styles.themeText, isLocked && styles.themeTextLocked]}>
                    {isLocked ? '████████████' : theme}
                  </Text>
                  {isLocked && (
                    <View style={styles.lockBadge}>
                      <Ionicons name="lock-closed" size={9} color={colors.champagne} />
                      <Text style={styles.lockLabel}>PRO</Text>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Unlock nudge */}
            <View style={styles.unlockNudge}>
              <Ionicons name="diamond-outline" size={13} color={colors.deepRose} />
              <Text style={styles.unlockNudgeText}>
                Unlock your full roadmap with a free trial
              </Text>
            </View>
          </Animated.View>

          {/* ── Pro bullets ───────────────────────────────────────────────── */}
          <Animated.View
            style={[
              styles.bulletsCard,
              { opacity: ctaAnim },
            ]}
          >
            <Text style={styles.bulletsHeading}>
              Everything in{' '}
              <Text style={styles.bulletsHeadingAccent}>Premium</Text>
            </Text>

            {PRO_BULLETS.map((b) => (
              <View key={b.text} style={styles.bulletRow}>
                <View style={styles.bulletIconBox}>
                  <Ionicons name={b.icon} size={15} color={colors.deepRose} />
                </View>
                <Text style={styles.bulletText}>{b.text}</Text>
              </View>
            ))}
          </Animated.View>

          {/* ── CTA block ─────────────────────────────────────────────────── */}
          <Animated.View style={[styles.ctaBlock, { opacity: ctaAnim }]}>
            {/* Trial badge */}
            <View style={styles.trialBadge}>
              <Text style={styles.trialBadgeText}>7-DAY FREE TRIAL</Text>
            </View>

            {/* Primary CTA */}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleStartTrial}
              activeOpacity={0.82}
            >
              <Text style={styles.ctaButtonText}>START YOUR FREE TRIAL</Text>
            </TouchableOpacity>

            {/* Price note — live from the store, falls back gracefully while loading */}
            <Text style={styles.priceNote}>
              {monthlyPrice
                ? `Then ${monthlyPrice} / month · Cancel anytime`
                : 'Cancel anytime'}
            </Text>

            {/* Secondary skip */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleMaybeLater}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Maybe later — start with free access</Text>
            </TouchableOpacity>

            {/* Fine print */}
            <Text style={styles.finePrint}>
              Free access includes up to 20 hours of roadmap tasks.{'\n'}
              No payment required to explore.
            </Text>
          </Animated.View>

          {/* bottom breathing room */}
          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: colors.warmWhite,
  },

  topBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },

  safe: {
    flex: 1,
  },

  scroll: {
    paddingHorizontal: spacing.screenPaddingH,
    paddingTop: spacing.screenPaddingTop,
    paddingBottom: spacing.lg,
  },

  // ── Hero ───────────────────────────────────────────────────────────────────
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
    marginBottom: spacing.lg,
  },

  eyebrow: {
    ...typography.eyebrow,
  },

  eyebrowRule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.clayRule,
  },

  heroEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },

  heroTitle: {
    fontFamily: 'DancingScript',
    fontSize: 30,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: 0.2,
  },

  heroTagline: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.bodyMuted,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignSelf: 'stretch',
    ...shadows.card,
  },

  statPill: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },

  statValue: {
    fontFamily: 'serif',
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.3,
  },

  statLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: colors.caption,
    letterSpacing: 0.3,
  },

  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.subtleBorder,
  },

  // ── Plan preview card ──────────────────────────────────────────────────────
  previewCard: {
    ...tokens.linenCard,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  cardEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },

  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  cardEyebrow: {
    ...typography.eyebrow,
    color: colors.clay,
  },

  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: spacing.sm,
  },

  themeRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
  },

  themeRowLocked: {
    opacity: 0.5,
  },

  themeDot: {
    width: 5,
    height: 5,
    borderRadius: radii.dot,
    backgroundColor: colors.dustyRose,
  },

  themeDotLocked: {
    backgroundColor: colors.fawn,
  },

  themeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
    color: colors.ink,
    letterSpacing: 0.1,
  },

  themeTextLocked: {
    color: colors.fawn,
    letterSpacing: 2,
  },

  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.offWhite,
    borderWidth: 1,
    borderColor: colors.fawn,
  },

  lockLabel: {
    ...typography.lockLabel,
  },

  unlockNudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.roseTint15,
  },

  unlockNudgeText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.deepRose,
    fontStyle: 'italic',
    flex: 1,
  },

  // ── Bullets card ───────────────────────────────────────────────────────────
  bulletsCard: {
    ...tokens.infoCard,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },

  bulletsHeading: {
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.2,
    marginBottom: spacing.md,
  },

  bulletsHeadingAccent: {
    color: colors.deepRose,
    fontStyle: 'italic',
  },

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
  },

  bulletIconBox: {
    ...tokens.actionIconBox,
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.roseTint08,
  },

  bulletText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
    color: colors.bodyLight,
    lineHeight: 19,
  },

  // ── CTA block ──────────────────────────────────────────────────────────────
  ctaBlock: {
    alignItems: 'center',
  },

  trialBadge: {
    ...tokens.badge,
    marginBottom: spacing.md,
  },

  ctaButton: {
    ...tokens.buttonPrimary,
    alignSelf: 'stretch',
    marginBottom: spacing.sm,
  },

  ctaButtonText: {
    ...typography.buttonPrimary,
  },

  priceNote: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.caption,
    letterSpacing: 0.2,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  skipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },

  skipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.bodyMuted,
    letterSpacing: 0.2,
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: colors.fawn,
    textAlign: 'center',
  },

  finePrint: {
    fontSize: 10,
    fontWeight: '300',
    color: colors.caption,
    letterSpacing: 0.1,
    textAlign: 'center',
    lineHeight: 15,
    paddingHorizontal: spacing.lg,
  },
});