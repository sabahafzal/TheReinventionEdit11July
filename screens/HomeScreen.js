// screens/HomeScreen.js
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
  Animated,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { getDayOfYear } from 'date-fns';
import { dailyReminders } from './DailyReminderScreen';
import { roadmapsConfig } from '../config/roadmapsConfig';
import { roadmapTasksFree, roadmapTasksPremium } from './roadmapTasks';
import { supabase } from '../lib/supabase';
import PremiumUpsellModal from '../components/PremiumUpsellModal';
import WelcomeGuideModal from './WelcomeGuideModal';
import { bucketTasksByWeek } from '../utils/taskUtils';
import { useRoadmapProgress } from '../hooks/useRoadmapProgress';
import { isProUser } from '../lib/paywall';
import { evaluateTriggeredRoadmapNudges } from '../lib/roadmapReminders';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from './theme';
import { calculateReinventionScore } from './ProfileScreen';

// ─── Constants ────────────────────────────────────────────────────────────────
const TECH_TRACK_KEY       = 'techSwitchTrack';
const NEWCITY_TRACK_KEY    = 'newCityTrack';
const NEWCITY_JOB_KEY      = 'newCityJobStatus';
const PHYSICAL_TRACK_KEY   = 'physicalGlowUpTrack';
const INTRO_KEY            = 'intro.v1.seen';
const QUIZ_DONE_KEY        = 'onboarding.quizDone';
const FIRST_LOGIN_KEY      = 'auth.firstLogin.seen';
const HOME_COACH_KEY       = 'hint.homeScreen.coach.v1.seen';
const DEFAULT_WEEKLY_HOURS = 4;
const MOMENTUM_TRIGGER_MISSED   = 5;
const MOMENTUM_QUICK_MAX_HOURS  = 0.5;
const STREAK_COUNT_KEY          = 'streak_count';
const STREAK_BEST_KEY           = 'streak_best';
const STREAK_LAST_DATE_KEY      = 'streak_last_date';
const STREAK_MILESTONES         = [7, 30];
const LAST_STREAK_MILESTONE_KEY = 'last_streak_milestone_shown';

// ─── Streak freeze constants ──────────────────────────────────────────────────
const STREAK_FREEZE_KEY         = 'streak_freeze_count';
const STREAK_FREEZE_LAST_RESET  = 'streak_freeze_last_reset';
const FREE_FREEZE_MONTHLY_LIMIT = 1;
const PRO_FREEZE_UNLIMITED      = 999;

// ─── Coach mark steps ─────────────────────────────────────────────────────────
const HOME_COACH_STEPS = [
  {
    emoji: '🗺️',
    title: 'Your personalised journey',
    body: 'The themes shown here were chosen based on your quiz answers.They form a curated path, not a menu to pick from freely.',
  },
  {
    emoji: '✅',
    title: 'Work through themes in order',
    body: 'Each theme builds on the last. Tap the theme progress card to open your roadmap and start ticking off tasks.',
  },
  {
    emoji: '🔓',
    title: 'Want to customise?',
    body: 'Premium members can explore all themes and choose tasks freely across the full roadmap.',
  },
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────
const startOfDayISO = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
};

const daysBetween = (fromISO, to = new Date()) => {
  const f = new Date(fromISO);
  const a = new Date(f.getFullYear(), f.getMonth(), f.getDate()).getTime();
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.max(0, Math.floor((b - a) / 86400000));
};

const weeksBetween = (fromISO, to = new Date()) =>
  Math.floor(daysBetween(fromISO, to) / 7);

const prettyHours = (h) => {
  const n = Number(h || 0);
  return Number.isFinite(n) ? Number(n.toFixed(2)) : 0;
};

const getStreakMilestoneMessage = (count) => {
  switch (count) {
    case 7:  return '7-day streak! One full week of showing up for yourself 🔥';
    case 30: return '30-day streak!This is a full reinvention rhythm now 👑';
    default: return `${count}-day streak! keep going ✨`;
  }
};

const VALID_ROADMAP_KEYS = new Set([
  'new_city', 'tech_switch', 'financial_glow_up', 'physical_glow_up', 'mental_glow_up',
]);

const labelToKey = {
  'starting over in a new city': 'new_city',
  'switching into tech':         'tech_switch',
  'financial glow-up':           'financial_glow_up',
  'physical glow-up':            'physical_glow_up',
  'mental glow-up':              'mental_glow_up',
};

const normalizeRoadmapKey = (raw) => {
  if (!raw) return null;
  const key = String(raw).trim().toLowerCase();
  if (VALID_ROADMAP_KEYS.has(key)) return key;
  if (labelToKey[key]) return labelToKey[key];
  return null;
};

const normalizeNewCityTrackKey = (id) =>
  id === 'moving_city_only' ? 'moving_city' : id;

const newCityTrackLabel = (id) => {
  if (id === 'moving_country')  return 'Moving Country';
  if (id === 'moving_city_only') return 'Moving City (same country)';
  if (id === 'moving_city')     return 'Moving City (same country)';
  return null;
};

const physicalTrackLabel = (id) => {
  if (id === 'gym')  return 'Working out in a gym';
  if (id === 'home') return 'Working out at home';
  return null;
};

const getTaskRuntimeKey = (taskObj) => `${taskObj.themeKey}:${taskObj.__taskIndex}`;

const deriveThemesFor = (roadmapKey, roleOrTrack) => {
  const cfg = roadmapKey ? roadmapsConfig[roadmapKey] : null;
  if (!cfg) return [];
  if (Array.isArray(cfg.themes)) return cfg.themes;

  if (roadmapKey === 'tech_switch') {
    if (roleOrTrack && cfg.tracks?.[roleOrTrack]?.themes)
      return cfg.tracks[roleOrTrack].themes.map((t) => ({ key: t.key, label: t.title }));
    if (Array.isArray(cfg.generalThemes))
      return cfg.generalThemes.map((t) => ({ key: t.key, label: t.title }));
    return [];
  }

  if (roadmapKey === 'new_city') {
    const normalizedTrack = normalizeNewCityTrackKey(roleOrTrack);
    if (normalizedTrack && cfg.tracks?.[normalizedTrack]?.themes)
      return cfg.tracks[normalizedTrack].themes.map((t) => ({ key: t.key, label: t.title }));
    if (cfg.tracks) {
      const all = Object.values(cfg.tracks)
        .flatMap((tr) => tr?.themes || [])
        .map((t) => ({ key: t.key, label: t.title }));
      const seen = new Set();
      return all.filter((t) => (seen.has(t.key) ? false : (seen.add(t.key), true)));
    }
  }

  if (roadmapKey === 'physical_glow_up') {
    if (roleOrTrack && cfg.tracks?.[roleOrTrack]?.themes)
      return cfg.tracks[roleOrTrack].themes.map((t) => ({ key: t.key, label: t.title }));
    if (cfg.tracks) {
      const all = Object.values(cfg.tracks)
        .flatMap((tr) => tr?.themes || [])
        .map((t) => ({ key: t.key, label: t.title }));
      const seen = new Set();
      return all.filter((t) => (seen.has(t.key) ? false : (seen.add(t.key), true)));
    }
  }

  return [];
};

function getTasksForTheme(groups, roadmap, themeKey, role) {
  const raw = groups?.[roadmap]?.[themeKey];
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (role && Array.isArray(raw[role])) return raw[role];
  if (Array.isArray(raw.shared)) return raw.shared;
  return Object.values(raw).flat().filter(Boolean);
}

function getThemeKeysForRoadmap({ roadmapKey, trackKey, jobStatusKey }) {
  const cfg = roadmapsConfig?.[roadmapKey] || {};

  if (roadmapKey === 'new_city') {
    const tKey = normalizeNewCityTrackKey(trackKey);
    const baseThemes =
      (tKey && cfg?.tracks?.[tKey]?.themes?.map((t) => t.key)) ||
      (cfg?.themes?.map((t) => t.key)) ||
      Object.keys(roadmapTasksFree?.[roadmapKey] || {});
    const jobCfg = cfg?.jobStatus;
    const opt = jobCfg?.options?.find((o) => o.key === jobStatusKey);
    const prepend = opt?.presets?.prependThemes || [];
    const hide    = opt?.presets?.hideThemes    || [];
    const seen = new Set();
    const ordered = [];
    [...prepend, ...baseThemes].forEach((k) => {
      if (k && !seen.has(k)) { seen.add(k); ordered.push(k); }
    });
    const hideSet = new Set(hide);
    const filtered = ordered.filter((k) => !hideSet.has(k));
    const groups = roadmapTasksFree?.[roadmapKey] || {};
    return filtered.filter((k) => !!groups[k]);
  }

  if (roadmapKey === 'tech_switch') {
    if (trackKey && cfg?.tracks?.[trackKey]?.themes)
      return cfg.tracks[trackKey].themes.map((t) => t.key);
    if (Array.isArray(cfg?.generalThemes)) return cfg.generalThemes.map((t) => t.key);
    return Object.keys(roadmapTasksFree?.[roadmapKey] || {});
  }

  if (roadmapKey === 'physical_glow_up') {
    if (trackKey && cfg?.tracks?.[trackKey]?.themes)
      return cfg.tracks[trackKey].themes.map((t) => t.key);
    return Object.keys(roadmapTasksFree?.[roadmapKey] || {});
  }

  if (Array.isArray(cfg?.themes)) return cfg.themes.map((t) => t.key);
  return Object.keys(roadmapTasksFree?.[roadmapKey] || {});
}

function pickMomentumTasks(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) return [];
  const quick =
    tasks.find((t) => Number(t?.duration || 0) <= MOMENTUM_QUICK_MAX_HOURS) || tasks[0];
  const core =
    tasks.find(
      (t) =>
        getTaskRuntimeKey(t) !== getTaskRuntimeKey(quick) &&
        Number(t?.duration || 0) > MOMENTUM_QUICK_MAX_HOURS
    ) ||
    tasks.find((t) => getTaskRuntimeKey(t) !== getTaskRuntimeKey(quick)) ||
    null;
  return [quick, core].filter(Boolean);
}

// ─── HintButton ───────────────────────────────────────────────────────────────
function HintButton({ title, body, light = false, style }) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        style={[hintStyles.btn, light ? hintStyles.btnLight : hintStyles.btnDark, style]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel={`Help: ${title}`}
        accessibilityRole="button"
      >
        <Text style={[hintStyles.btnText, light ? hintStyles.btnTextLight : hintStyles.btnTextDark]}>?</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)} statusBarTranslucent>
        <Pressable style={hintStyles.scrim} onPress={() => setVisible(false)}>
          <Pressable style={hintStyles.card} onPress={() => {}}>
            <View style={hintStyles.pip} />
            <Text style={hintStyles.cardTitle}>{title}</Text>
            <Text style={hintStyles.cardBody}>{body}</Text>
            <TouchableOpacity style={hintStyles.closeBtn} onPress={() => setVisible(false)} activeOpacity={0.8}>
              <Text style={hintStyles.closeBtnText}>Got it</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const hintStyles = StyleSheet.create({
  btn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLight: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  btnDark: {
    backgroundColor: colors.roseTint08,
    borderWidth: 1,
    borderColor: colors.roseTint18,
  },
  btnText: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  btnTextLight: { color: 'rgba(255,255,255,0.85)' },
  btnTextDark:  { color: colors.deepRose },
  scrim: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  card: {
    width: '100%',
    backgroundColor: colors.warmWhite,
    borderRadius: radii.xxl,
    padding: spacing.xxl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    ...shadows.modal,
  },
  pip: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.dustyRose,
    marginBottom: spacing.lg,
    opacity: 0.7,
  },
  cardTitle: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 18,
    color: colors.ink,
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.bodyMuted,
    marginBottom: spacing.xl,
  },
  closeBtn: {
    backgroundColor: colors.deepRose,
    borderRadius: radii.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  closeBtnText: { ...typography.buttonPrimary },
});

// ─── CoachMarkOverlay ─────────────────────────────────────────────────────────
function CoachMarkOverlay({ visible, onDone, steps = [] }) {
  const [stepIndex, setStepIndex] = useState(0);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (visible) {
      setStepIndex(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(24);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      ]).start();
    }
  }, [visible]);

  const animateNext = useCallback((afterAnim) => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -16, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      afterAnim();
      slideAnim.setValue(24);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      ]).start();
    });
  }, [fadeAnim, slideAnim]);

  const handleNext = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      animateNext(() => setStepIndex((i) => i + 1));
    } else {
      onDone?.();
    }
  }, [stepIndex, steps.length, animateNext, onDone]);

  if (!visible || steps.length === 0) return null;

  const step   = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onDone}>
      <View style={coachStyles.scrim}>
        <Animated.View style={[coachStyles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Step dots */}
          {steps.length > 1 && (
            <View style={coachStyles.dots}>
              {steps.map((_, i) => (
                <View key={i} style={[coachStyles.dot, i === stepIndex && coachStyles.dotActive]} />
              ))}
            </View>
          )}

          {step.emoji
            ? <Text style={coachStyles.emoji}>{step.emoji}</Text>
            : <View style={coachStyles.pip} />
          }

          <Text style={coachStyles.title}>{step.title}</Text>
          <Text style={coachStyles.body}>{step.body}</Text>

          <View style={coachStyles.actions}>
            {!isLast && (
              <TouchableOpacity onPress={onDone} activeOpacity={0.6}>
                <Text style={coachStyles.skipText}>Skip</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[coachStyles.nextBtn, isLast && coachStyles.nextBtnFull]}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={coachStyles.nextBtnText}>{isLast ? "Let's go" : 'Next'}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const coachStyles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xxl,
    paddingBottom: 48,
  },
  card: {
    backgroundColor: colors.warmWhite,
    borderRadius: radii.xxl,
    padding: spacing.xxl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    ...shadows.modal,
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.fawn,
  },
  dotActive: {
    backgroundColor: colors.dustyRose,
    width: 18,
  },
  pip: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.dustyRose,
    marginBottom: spacing.lg,
    opacity: 0.7,
  },
  emoji: {
    fontSize: 30,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 20,
    color: colors.ink,
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.bodyMuted,
    marginBottom: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.md,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.8,
    color: colors.caption,
    textTransform: 'uppercase',
  },
  nextBtn: {
    backgroundColor: colors.deepRose,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  nextBtnFull: { flex: 1 },
  nextBtnText: { ...typography.buttonPrimary },
});

// ─── Reinvention Score Card ───────────────────────────────────────────────────

function getScoreTier(score) {
  if (score >= 91) return { label: 'Reinvention mode',   color: colors.sage };
  if (score >= 76) return { label: 'On a roll',          color: colors.sage };
  if (score >= 56) return { label: 'Strong momentum',    color: colors.clay };
  if (score >= 31) return { label: 'Building momentum',  color: colors.clay };
  return               { label: 'Just getting started', color: colors.caption };
}

function ReinventionScoreCard({ score, breakdown, delta }) {
  const animValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animValue, {
      toValue: score / 100,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const tier = getScoreTier(score);

  const pillars = [
    { label: 'Task completion', pts: breakdown.completion, color: colors.deepRose },
    { label: 'Streak',          pts: breakdown.streak,     color: colors.sage },
    { label: 'Weekly momentum', pts: breakdown.momentum,   color: colors.clay },
    { label: 'Life breadth',    pts: breakdown.breadth,    color: colors.midRose },
  ];

  const deltaStr =
    delta === null ? null
    : delta > 0    ? `+${delta} pts this week`
    : delta < 0    ? `${delta} pts this week`
    : 'No change this week';

  const deltaColor =
    delta > 0  ? colors.sage
    : delta < 0 ? colors.deepRose
    : colors.caption;

  return (
    <View style={scoreStyles.card}>
      {/* Header row with hint button */}
      <View style={scoreStyles.headerRow}>
        <View style={scoreStyles.ringWrap}>
          <View style={scoreStyles.ringBg} />
          <View style={scoreStyles.ringCenter}>
            <Text style={scoreStyles.ringNumber}>{score}</Text>
            <Text style={scoreStyles.ringDenom}>/100</Text>
          </View>
        </View>
        <View style={scoreStyles.titleWrap}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Text style={scoreStyles.cardEye}>Personal Reinvention Score</Text>
            <HintButton
              title="Reinvention Score"
              body="Your score reflects your streak, task completion, weekly momentum, and how many life areas you are actively working on. It updates as you make progress."
            />
          </View>
          <Text style={[scoreStyles.tierLabel, { color: tier.color }]}>{tier.label}</Text>
          {deltaStr && (
            <View style={scoreStyles.deltaRow}>
              <View style={[scoreStyles.deltaDot, { backgroundColor: deltaColor }]} />
              <Text style={[scoreStyles.deltaText, { color: deltaColor }]}>{deltaStr}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={scoreStyles.divider} />
      <View style={scoreStyles.breakdown}>
        {pillars.map((p) => (
          <View key={p.label} style={scoreStyles.pillarRow}>
            <View style={scoreStyles.pillarLabelRow}>
              <Text style={scoreStyles.pillarLabel}>{p.label}</Text>
              <Text style={scoreStyles.pillarPts}>{p.pts}/25</Text>
            </View>
            <View style={scoreStyles.barTrack}>
              <View
                style={[
                  scoreStyles.barFill,
                  { width: `${Math.round((p.pts / 25) * 100)}%`, backgroundColor: p.color },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const scoreStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 14,
  },
  ringWrap: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ringBg: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 6,
    borderColor: colors.subtleBorder,
  },
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringNumber: {
    fontFamily: 'serif',
    fontSize: 24,
    fontWeight: '700',
    color: colors.deepRose,
    lineHeight: 28,
  },
  ringDenom: {
    fontSize: 10,
    fontWeight: '400',
    color: colors.caption,
    letterSpacing: 0.2,
    lineHeight: 13,
  },
  titleWrap: { flex: 1 },
  cardEye: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.caption,
  },
  tierLabel: {
    fontFamily: 'serif',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  deltaDot: {
    width: 5,
    height: 5,
    borderRadius: radii.dot,
  },
  deltaText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.subtleBorder,
    marginBottom: 14,
  },
  breakdown: { gap: 10 },
  pillarRow: { gap: 4 },
  pillarLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pillarLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.caption,
    letterSpacing: 0.1,
  },
  pillarPts: {
    fontFamily: 'serif',
    fontSize: 11,
    fontWeight: '500',
    color: colors.ink,
  },
  barTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.subtleBorder,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },

// ── Locked score teaser ───────────────────────────────────────────────────
lockedCard: {
  borderRadius: radii.xl,
  borderWidth: 1.5,
  borderColor: colors.softBorder,
  marginBottom: spacing.md,
  overflow: 'hidden',
  backgroundColor: colors.card,
},
lockedBlur: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 16,
  padding: spacing.lg,
  paddingBottom: 10,
  opacity: 0.2,
},
lockedRingWrap: {
  width: 76,
  height: 76,
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
},
lockedRingBg: {
  position: 'absolute',
  width: 76,
  height: 76,
  borderRadius: 38,
  borderWidth: 6,
  borderColor: colors.deepRose,
},
lockedRingCenter: {
  alignItems: 'center',
  justifyContent: 'center',
},
lockedRingNumber: {
  fontFamily: 'serif',
  fontSize: 24,
  fontWeight: '700',
  color: colors.deepRose,
  lineHeight: 28,
},
lockedRingDenom: {
  fontSize: 10,
  fontWeight: '400',
  color: colors.caption,
  letterSpacing: 0.2,
  lineHeight: 13,
},
lockedEye: {
  fontSize: 9,
  fontWeight: '700',
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: colors.caption,
  marginBottom: 4,
},
lockedTierLabel: {
  fontFamily: 'serif',
  fontSize: 17,
  fontWeight: '700',
  color: colors.sage,
  letterSpacing: -0.2,
  marginBottom: 5,
},
lockedDeltaRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 5,
},
lockedDeltaDot: {
  width: 5,
  height: 5,
  borderRadius: 3,
  backgroundColor: colors.sage,
},
lockedDeltaText: {
  fontSize: 11,
  fontWeight: '500',
  color: colors.sage,
},
lockedDivider: {
  height: 1,
  backgroundColor: colors.subtleBorder,
  marginHorizontal: spacing.lg,
  opacity: 0.2,
},
lockedPillarsBlock: {
  padding: spacing.lg,
  paddingTop: 10,
  gap: 10,
  opacity: 0.2,
},
lockedPillarRow: { gap: 4 },
lockedPillarLabelRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
lockedPillarLabel: {
  fontSize: 12,
  fontWeight: '400',
  color: colors.caption,
  letterSpacing: 0.1,
},
lockedPillarPts: {
  fontFamily: 'serif',
  fontSize: 11,
  fontWeight: '500',
  color: colors.ink,
},
lockedPillarTrack: {
  height: 4,
  borderRadius: 2,
  backgroundColor: colors.subtleBorder,
  overflow: 'hidden',
},
lockedPillarBar: {
  height: '100%',
  borderRadius: 2,
},
lockedOverlay: {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(250,247,242,0.55)',
  alignItems: 'center',
  justifyContent: 'center',
},
lockedLockCircle: {
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: colors.warmWhite,
  borderWidth: 1.5,
  borderColor: colors.softBorder,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 6,
  elevation: 3,
},
lockedLockIcon: { fontSize: 26 },
lockedCtaRow: {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.sm,
  paddingBottom: spacing.lg,
},
lockedCta: {
  backgroundColor: colors.deepRose,
  borderRadius: radii.md,
  paddingVertical: 11,
  alignItems: 'center',
},
lockedCtaText: {
  ...typography.buttonPrimary,
  fontSize: 12,
},
});

// ─── Freeze Indicator sub-component ──────────────────────────────────────────
function FreezeIndicator({ isPro }) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    AsyncStorage.getItem(STREAK_FREEZE_KEY).then((v) => {
      const n = parseInt(v || '0', 10);
      setCount(n);
    });
  }, []);

  const isUnlimited = isPro;
  const hasFreeze   = isUnlimited || count > 0;

  return (
    <Text style={[
      styles.freezeGlyph,
      { color: isUnlimited ? colors.sage : hasFreeze ? '#6fa8c8' : colors.champagne },
    ]}>
      ❄
    </Text>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigation = useNavigation();
  const route      = useRoute();

  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [streakCount, setStreakCount]         = useState(0);
  const [bestStreak, setBestStreak]           = useState(0);
  const [techRole, setTechRole]               = useState(null);
  const [newCityTrack, setNewCityTrack]       = useState(null);
  const [newCityJobStatus, setNewCityJobStatus] = useState(null);
  const [physicalTrack, setPhysicalTrack]     = useState(null);
  const [themesToShow, setThemesToShow]       = useState([]);
  const [weeklyHours, setWeeklyHours]         = useState(DEFAULT_WEEKLY_HOURS);
  const [isPro, setIsPro]                     = useState(false);
  const [planStartISO, setPlanStartISO]       = useState(null);
  const [showPremiumUpsell, setShowPremiumUpsell] = useState(false);
  const [showIntro, setShowIntro]             = useState(false);
  const [scoreData, setScoreData]             = useState(null);

  // ── Coach mark state ─────────────────────────────────────────────────────────
  const [coachSeen, setCoachSeen]   = useState(true);  // default true to avoid flash
  const [coachLoaded, setCoachLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(HOME_COACH_KEY)
      .then((val) => {
        setCoachSeen(val === 'true');
        setCoachLoaded(true);
      })
      .catch(() => setCoachLoaded(true));
  }, []);

  const markCoachSeen = useCallback(async () => {
    setCoachSeen(true);
    await AsyncStorage.setItem(HOME_COACH_KEY, 'true');
  }, []);

  const dayIdx        = getDayOfYear(new Date()) - 1;
  const todayReminder = dailyReminders[dayIdx % dailyReminders.length];

  const { loading: progressLoading, map, reload } = useRoadmapProgress({
    roadmapKey: selectedRoadmap || '',
    planLength:  null,
  });

  const roleOrTrackForSelectedRoadmap = useMemo(() => {
    if (selectedRoadmap === 'tech_switch')      return techRole;
    if (selectedRoadmap === 'new_city')         return normalizeNewCityTrackKey(newCityTrack);
    if (selectedRoadmap === 'physical_glow_up') return physicalTrack;
    return null;
  }, [selectedRoadmap, techRole, newCityTrack, physicalTrack]);

  const themeKeys = useMemo(() => {
    if (!selectedRoadmap) return [];
    return getThemeKeysForRoadmap({
      roadmapKey:   selectedRoadmap,
      trackKey:     roleOrTrackForSelectedRoadmap,
      jobStatusKey: newCityJobStatus,
    });
  }, [selectedRoadmap, roleOrTrackForSelectedRoadmap, newCityJobStatus]);

  const orderedTasks = useMemo(() => {
    if (!selectedRoadmap) return [];
    const allowed = new Set(themeKeys);
    if (!isPro) {
      const freeGroups = roadmapTasksFree?.[selectedRoadmap] || {};
      const out = [];
      themeKeys.forEach((themeKey) => {
        const arr =
          selectedRoadmap === 'tech_switch'
            ? getTasksForTheme(roadmapTasksFree, selectedRoadmap, themeKey, roleOrTrackForSelectedRoadmap)
            : Array.isArray(freeGroups?.[themeKey]) ? freeGroups[themeKey] : [];
        arr.forEach((taskObj, index) => out.push({ ...taskObj, themeKey, __taskIndex: index }));
      });
      return out.filter((t) => allowed.has(t.themeKey));
    }
    const premiumFlat = roadmapTasksPremium?.[selectedRoadmap] || [];
    return premiumFlat
      .filter((t) => allowed.has(t.themeKey))
      .map((taskObj, index) => ({
        ...taskObj,
        __taskIndex: Number.isInteger(taskObj.originalTaskOrder) ? taskObj.originalTaskOrder : index,
      }));
  }, [selectedRoadmap, themeKeys, isPro, roleOrTrackForSelectedRoadmap]);

  const themesWithLabels = useMemo(() => {
    const derived = deriveThemesFor(selectedRoadmap, roleOrTrackForSelectedRoadmap);
    const byKey   = new Map((derived || []).map((t) => [t.key, t.label]));
    return themeKeys.map((key) => ({ key, label: byKey.get(key) || key }));
  }, [selectedRoadmap, roleOrTrackForSelectedRoadmap, themeKeys]);

  const themeProgress = useMemo(() => {
    const out = {};
    themesWithLabels.forEach((theme) => {
      const tasksForTheme = orderedTasks.filter((t) => t.themeKey === theme.key);
      out[theme.key] = tasksForTheme.filter((t) => !!map?.[getTaskRuntimeKey(t)]?.isCompleted).length;
    });
    return out;
  }, [themesWithLabels, orderedTasks, map]);

  const totalDone = useMemo(
    () => orderedTasks.filter((t) => !!map?.[getTaskRuntimeKey(t)]?.isCompleted).length,
    [orderedTasks, map]
  );
  const totalMax = orderedTasks.length;

  const weeks = useMemo(() => {
    const wh = Number.isFinite(weeklyHours) && weeklyHours > 0 ? weeklyHours : DEFAULT_WEEKLY_HOURS;
    return bucketTasksByWeek(orderedTasks, wh);
  }, [orderedTasks, weeklyHours]);

  const unlockedWeek = useMemo(() => {
    if (!planStartISO || !weeks.length) return 0;
    return Math.max(0, Math.min(weeksBetween(planStartISO, new Date()), Math.max(weeks.length - 1, 0)));
  }, [planStartISO, weeks]);

  const backlogTasks = useMemo(() => {
    if (!Array.isArray(weeks) || weeks.length === 0 || unlockedWeek <= 0) return [];
    const out = [];
    const lastBacklogWeek = Math.min(unlockedWeek - 1, weeks.length - 1);
    for (let w = 0; w <= lastBacklogWeek; w++) {
      (weeks[w] || []).forEach((t) => {
        if (!map?.[getTaskRuntimeKey(t)]?.isCompleted) out.push({ ...t, __weekIndex: w });
      });
    }
    return out;
  }, [weeks, unlockedWeek, map]);

  const momentumTasks = useMemo(() => pickMomentumTasks(backlogTasks), [backlogTasks]);
  const momentumModeActive    = backlogTasks.length >= MOMENTUM_TRIGGER_MISSED && momentumTasks.length > 0;
  const momentumBacklogCount  = backlogTasks.length;
  const momentumSuggestedCount = momentumTasks.length;
  const momentumSuggestedHours = useMemo(
    () => prettyHours(momentumTasks.reduce((sum, t) => sum + Number(t?.duration || 0), 0)),
    [momentumTasks]
  );

  // ── Streak ──────────────────────────────────────────────────────────────────
  const loadStreak = async () => {
    const count = parseInt((await AsyncStorage.getItem(STREAK_COUNT_KEY)) || '0', 10) || 0;
    const best  = parseInt((await AsyncStorage.getItem(STREAK_BEST_KEY))  || '0', 10) || 0;
    setStreakCount(count);
    setBestStreak(best);
  };

  const updateStreakOnOpen = useCallback(async () => {
    const todayISO = startOfDayISO();
    const today    = new Date(todayISO);

    const [lastDateRaw, countRaw, bestRaw, lastShownRaw, freezeRaw, freezeResetRaw] =
      await AsyncStorage.multiGet([
        STREAK_LAST_DATE_KEY,
        STREAK_COUNT_KEY,
        STREAK_BEST_KEY,
        LAST_STREAK_MILESTONE_KEY,
        STREAK_FREEZE_KEY,
        STREAK_FREEZE_LAST_RESET,
      ]).then((pairs) => pairs.map(([, v]) => v));

    const currentCount = parseInt(countRaw    || '0', 10) || 0;
    const currentBest  = parseInt(bestRaw     || '0', 10) || 0;
    const lastShown    = parseInt(lastShownRaw || '0', 10) || 0;

    // ── Monthly freeze reset ───────────────────────────────────────────────
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const lastResetDate  = freezeResetRaw ? new Date(freezeResetRaw) : null;
    let freezesLeft      = parseInt(freezeRaw || '0', 10);

    if (!lastResetDate || lastResetDate < new Date(thisMonthStart)) {
      freezesLeft = isPro ? PRO_FREEZE_UNLIMITED : FREE_FREEZE_MONTHLY_LIMIT;
      await AsyncStorage.multiSet([
        [STREAK_FREEZE_KEY,        String(freezesLeft)],
        [STREAK_FREEZE_LAST_RESET, todayISO],
      ]);
    }

    // ── Streak logic ───────────────────────────────────────────────────────
    let nextCount  = currentCount;
    let nextBest   = currentBest;
    let usedFreeze = false;

    if (!lastDateRaw) {
      nextCount = 1;
      nextBest  = Math.max(currentBest, 1);
    } else {
      const diff = daysBetween(lastDateRaw, today);

      if (diff === 0) {
        nextCount = currentCount > 0 ? currentCount : 1;
        nextBest  = Math.max(currentBest, nextCount);
      } else if (diff === 1) {
        nextCount = currentCount + 1;
        nextBest  = Math.max(currentBest, nextCount);
      } else if (diff === 2 && freezesLeft > 0) {
        nextCount  = currentCount;
        nextBest   = currentBest;
        freezesLeft = isPro ? PRO_FREEZE_UNLIMITED : Math.max(0, freezesLeft - 1);
        usedFreeze  = true;
        await AsyncStorage.setItem(STREAK_FREEZE_KEY, String(freezesLeft));
      } else {
        nextCount = 1;
        nextBest  = Math.max(currentBest, 1);
      }
    }

    await AsyncStorage.multiSet([
      [STREAK_LAST_DATE_KEY, todayISO],
      [STREAK_COUNT_KEY,     String(nextCount)],
      [STREAK_BEST_KEY,      String(nextBest)],
    ]);
    setStreakCount(nextCount);
    setBestStreak(nextBest);

    if (usedFreeze) {
      const remaining = isPro ? 'unlimited' : String(freezesLeft);
      Alert.alert(
        'Streak freeze used ❄️',
        `You missed yesterday, but your streak is protected.\n\n${
          isPro
            ? 'You have unlimited streak freezes as a Premium member.'
            : freezesLeft === 0
              ? 'You have no freezes left this month. Upgrade to Premium for unlimited freezes.'
              : `${remaining} freeze${freezesLeft === 1 ? '' : 's'} remaining this month.`
        }`
      );
    }

    if (STREAK_MILESTONES.includes(nextCount) && nextCount > lastShown) {
      await AsyncStorage.setItem(LAST_STREAK_MILESTONE_KEY, String(nextCount));
      Alert.alert('Streak milestone 🎉', getStreakMilestoneMessage(nextCount));
    }
  }, [isPro]);

  // ── Focus effects ────────────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadHome = async () => {
        try {
          setLoading(true);
          let raw = await AsyncStorage.getItem('recommendedRoadmap');
let roadmapKey = normalizeRoadmapKey(raw);

if (!roadmapKey) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      const { data } = await supabase
        .from('user_roadmap')
        .select('recommended_roadmap')
        .eq('user_id', session.user.id)
        .single();

      if (data?.recommended_roadmap) {
        roadmapKey = normalizeRoadmapKey(data.recommended_roadmap);
      }
    }
  } catch {}
}

if (!isActive) return;

if (!roadmapKey) {
  setSelectedRoadmap(null);
  setLoading(false);
  return;
}

if (raw !== roadmapKey) {
  await AsyncStorage.setItem('recommendedRoadmap', roadmapKey);
}

setSelectedRoadmap(roadmapKey);
          await updateStreakOnOpen();
          if (!roadmapsConfig[roadmapKey]) { if (isActive) setLoading(false); return; }

          let nextWeeklyHours = parseFloat(await AsyncStorage.getItem('timeCommitmentHours'));
          if (!Number.isFinite(nextWeeklyHours) || nextWeeklyHours <= 0) {
            const dailyStr = await AsyncStorage.getItem('dailyTimeBudgetHours');
            const daily    = dailyStr ? parseFloat(dailyStr) : NaN;
            nextWeeklyHours =
              Number.isFinite(daily) && daily > 0 ? daily * 7 : DEFAULT_WEEKLY_HOURS;
          }

          const startKey = `planStart_${roadmapKey}__GLOBAL`;
          let nextPlanStartISO = await AsyncStorage.getItem(startKey);
          if (!nextPlanStartISO) {
            nextPlanStartISO = startOfDayISO();
            await AsyncStorage.setItem(startKey, nextPlanStartISO);
          }

          const pro = await isProUser();

          let roleOrTrack = null, jobStatusVal = null;

          if (roadmapKey === 'tech_switch') {
            roleOrTrack = await AsyncStorage.getItem(TECH_TRACK_KEY);
            if (isActive) setTechRole(roleOrTrack);
          } else if (roadmapKey === 'new_city') {
            roleOrTrack   = await AsyncStorage.getItem(NEWCITY_TRACK_KEY);
            jobStatusVal  = await AsyncStorage.getItem(NEWCITY_JOB_KEY);
            if (isActive) { setNewCityTrack(roleOrTrack); setNewCityJobStatus(jobStatusVal); }
          } else if (roadmapKey === 'physical_glow_up') {
            roleOrTrack = await AsyncStorage.getItem(PHYSICAL_TRACK_KEY);
            if (isActive) setPhysicalTrack(roleOrTrack);
          }

          const themes = deriveThemesFor(
            roadmapKey,
            roadmapKey === 'new_city' ? normalizeNewCityTrackKey(roleOrTrack) : roleOrTrack
          );
          if (isActive) {
            setThemesToShow(themes);
            setWeeklyHours(nextWeeklyHours);
            setPlanStartISO(nextPlanStartISO);
            setIsPro(pro);
          }

          // ── Reinvention Score ─────────────────────────────────────────────
try {
  const { data: { session } } = await supabase.auth.getSession();
  if (isActive && session?.user?.id) {
    calculateReinventionScore(session.user.id)
      .then((sd) => { if (isActive) setScoreData(sd); })
      .catch((e) => console.warn('HomeScreen score fetch error', e));
  }
} catch (e) {
  console.warn('HomeScreen score session error', e);
}

          const completeFlagKey = `roadmapComplete_${roadmapKey}`;
          const completeFlag    = await AsyncStorage.getItem(completeFlagKey);

          try {
            const [introSeen, quizDone, firstLoginSeen] = await Promise.all([
              AsyncStorage.getItem(INTRO_KEY),
              AsyncStorage.getItem(QUIZ_DONE_KEY),
              AsyncStorage.getItem(FIRST_LOGIN_KEY),
            ]);
            const justFinishedQuiz    = route?.params?.justFinishedQuiz === true;
            const shouldShowFromQuiz  = quizDone === 'true' || justFinishedQuiz;
            const shouldShowFromLogin = firstLoginSeen !== 'true';
            const showPremiumFirst    = route?.params?.showPremiumUpsellFirst === true;

            if (introSeen !== 'true' && (shouldShowFromQuiz || shouldShowFromLogin)) {
              if (showPremiumFirst) {
                if (isActive) { setShowPremiumUpsell(true); setShowIntro(false); }
              } else {
                if (isActive) setShowIntro(true);
              }
            }
            if (firstLoginSeen !== 'true') await AsyncStorage.setItem(FIRST_LOGIN_KEY, 'true');
          } catch {}

        } finally {
          if (isActive) setLoading(false);
        }
      };
      loadHome();
      return () => { isActive = false; };
    }, [navigation, route?.params, updateStreakOnOpen])
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const runFocusRefresh = async () => {
        if (selectedRoadmap) await reload();
        await loadStreak();
        try { await evaluateTriggeredRoadmapNudges({ trigger: 'app_focus' }); }
        catch (e) { console.warn('evaluateTriggeredRoadmapNudges failed', e); }
      };
      runFocusRefresh();
      return () => { isActive = false; };
    }, [selectedRoadmap, reload])
  );

const congratsShownRef = useRef(false);

  useEffect(() => {
    const maybeNavigateCongrats = async () => {
      const completeFlagKey = selectedRoadmap ? `roadmapComplete_${selectedRoadmap}` : null;
      if (!selectedRoadmap || totalMax <= 0 || totalDone < totalMax || !completeFlagKey) return;
      const completeFlag = await AsyncStorage.getItem(completeFlagKey);
      if (!completeFlag) {
        await AsyncStorage.setItem(completeFlagKey, 'true');
        navigation.getParent()?.navigate?.('Congrats', { roadmap: selectedRoadmap });
      }
    };
    maybeNavigateCongrats();
  }, [selectedRoadmap, totalDone, totalMax, navigation]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleOpenRoadmap = async () => {
    if (!selectedRoadmap || !roadmapsConfig[selectedRoadmap]) return;
    if (selectedRoadmap === 'new_city') {
      const [[, trackVal], [, jobVal]] = await AsyncStorage.multiGet([NEWCITY_TRACK_KEY, NEWCITY_JOB_KEY]);
      if (!trackVal || !jobVal) {
        navigation.navigate('RoadmapStack', { screen: 'NewCityTrackModal' });
        return;
      }
    }
    navigation.navigate('RoadmapStack', { screen: 'RoadmapPlan', params: { roadmapKey: selectedRoadmap } });
  };

  const handleCloseIntro = async () => {
    setShowIntro(false);
    try { await AsyncStorage.setItem(INTRO_KEY, 'true'); } catch {}
  };

  const handleGoToRoadmap = async () => {
    setShowIntro(false);
    try { await AsyncStorage.setItem(INTRO_KEY, 'true'); } catch {}
    handleOpenRoadmap();
  };

  const handleClosePremiumUpsell = () => {
    setShowPremiumUpsell(false);
    setShowIntro(true);
  };

  const handleFreezeTap = async () => {
    if (isPro) {
      Alert.alert('Streak freeze ❄️', 'You have unlimited streak freezes as a Premium member. If you miss a day, your streak is automatically protected.');
      return;
    }
    const raw = await AsyncStorage.getItem(STREAK_FREEZE_KEY);
    const n   = parseInt(raw || '0', 10);
    if (n > 0) {
      Alert.alert(
        'Streak freeze ❄️',
        `You have ${n} freeze${n === 1 ? '' : 's'} left this month.\n\nIf you miss a day, your streak is automatically protected.`
      );
    } else {
      Alert.alert(
        'No freezes left this month',
        'Upgrade to Premium for unlimited streak freezes; your streak is always protected.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Upgrade', onPress: () => setShowPremiumUpsell(true) },
        ]
      );
    }
  };

  // ── Loading / empty states ───────────────────────────────────────────────────
  if (loading || progressLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.dustyRose} />
        <Text style={styles.loadingText}>Loading your roadmap…</Text>
      </View>
    );
  }

  if (!selectedRoadmap || !roadmapsConfig[selectedRoadmap]) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>No roadmap selected yet.</Text>
      </View>
    );
  }

  // ── Derived display values ───────────────────────────────────────────────────
  const roadmap         = roadmapsConfig[selectedRoadmap];
  const overallProgress = totalMax > 0 ? totalDone / totalMax : 0;
  const overallPct      = Math.round(overallProgress * 100);

  const extraLabel =
    selectedRoadmap === 'tech_switch'        && techRole      ? techRole
    : selectedRoadmap === 'new_city'         && newCityTrack  ? newCityTrackLabel(newCityTrack)
    : selectedRoadmap === 'physical_glow_up' && physicalTrack ? physicalTrackLabel(physicalTrack)
    : null;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.deepRose} />

      <SafeAreaView style={styles.safeArea}>

        {/* Top bar — profile icon left, premium badge/upgrade right */}
        <View style={styles.topBar}>
          {/* Profile icon — top left */}
          <TouchableOpacity
            style={styles.profileIconBtn}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <Ionicons name="person-circle-outline" size={28} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>

          {/* Premium badge or upgrade chip — top right */}
          {isPro ? (
            <View style={styles.premiumBadge}>
              <View style={styles.premiumDot} />
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.upgradeChip}
              onPress={() => setShowPremiumUpsell(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.upgradeChipText}>Upgrade</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Hero: roadmap title left, percentage right */}
        <View style={styles.heroRow}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroKicker}>Your reinvention</Text>
            <Text style={styles.heroTitle}>{roadmap.label}</Text>
            {extraLabel ? (
              <Text style={styles.heroSub}>{extraLabel}</Text>
            ) : null}
          </View>
          <View style={styles.pctBlock}>
            <Text style={styles.pctNum}>
              {overallPct}<Text style={styles.pctUnit}>%</Text>
            </Text>
            <Text style={styles.pctLabel}>complete</Text>
          </View>
        </View>

        {/* Overall progress bar */}
        <View style={styles.overallBarTrack}>
          <View style={[styles.overallBarFill, { width: `${overallPct}%` }]} />
        </View>

        {/* ── Warm white sheet ── */}
        <ScrollView
          style={styles.sheet}
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Momentum mode card ── */}
          {momentumModeActive && (
            <TouchableOpacity
              style={styles.momentumCard}
              onPress={handleOpenRoadmap}
              activeOpacity={0.88}
            >
              <Text style={styles.momentumEye}>Momentum mode</Text>
              <Text style={styles.momentumTitle}>Let's get you back in flow.</Text>
              <Text style={styles.momentumBody}>
                {momentumBacklogCount} earlier steps still open; today's reset is{' '}
                {momentumSuggestedCount} steps · ~{momentumSuggestedHours}h.
              </Text>
              <View style={styles.momentumBtn}>
                <Text style={styles.momentumBtnText}>Open catch-up plan</Text>
              </View>
            </TouchableOpacity>
          )}

{/* ── Reinvention Score card ── */}
          <ReinventionScoreCard
            score={scoreData?.total ?? 0}
            breakdown={scoreData?.breakdown ?? { completion: 0, streak: 0, momentum: 0, breadth: 0 }}
            delta={scoreData?.delta ?? null}
          />

          {/* ── Streak card ── */}
          <View style={styles.streakCard}>
            <View style={styles.streakBlock}>
              <Text style={[styles.streakNum, { color: colors.dustyRose }]}>{streakCount}</Text>
              <Text style={styles.streakLabel}>Current streak</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakBlock}>
              <Text style={styles.streakNum}>{bestStreak}</Text>
              <Text style={styles.streakLabel}>Best streak</Text>
            </View>
            <View style={styles.streakDivider} />

            {/* Freeze block — tappable + hint */}
            <TouchableOpacity
              style={styles.streakBlock}
              onPress={handleFreezeTap}
              activeOpacity={0.7}
            >
              <FreezeIndicator isPro={isPro} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.streakLabel}>Freeze</Text>
                <HintButton
                  title="Streak freeze ❄️"
                  body={
                    isPro
                      ? 'You have unlimited streak freezes as a Premium member. Miss a day and your streak is automatically protected.'
                      : 'A freeze protects your streak if you miss a day. Free members get 1 freeze per month. Upgrade to Premium for unlimited freezes.'
                  }
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* ── Theme progress card ── */}
          <TouchableOpacity
            style={styles.themeCard}
            onPress={handleOpenRoadmap}
            activeOpacity={0.88}
          >
            {/* Header row with hint button */}
            <View style={styles.themeCardHeader}>
              <Text style={styles.themeCardEye}>Theme progress</Text>
              <HintButton
                title="Your theme journey"
                body="These themes are personalised from your quiz. They form a curated path, not a free pick. Tap this card to open your roadmap and start working through your tasks."
              />
            </View>

            {themesWithLabels.map((theme) => {
              const done = themeProgress[theme.key] || 0;
              const max  = orderedTasks.filter((t) => t.themeKey === theme.key).length;
              const pct  = max > 0 ? done / max : 0;
              const isComplete = max > 0 && done === max;
              return (
                <View key={theme.key} style={styles.themeBarRow}>
                  <View style={styles.themeBarHeader}>
                    <Text style={styles.themeBarName} numberOfLines={1}>{theme.label}</Text>
                    <Text style={styles.themeBarVal}>{done}/{max}</Text>
                  </View>
                  <View style={styles.themeBarTrack}>
                    <View style={[
                      styles.themeBarFill,
                      { width: `${pct * 100}%` },
                      isComplete && styles.themeBarFillComplete,
                    ]} />
                  </View>
                </View>
              );
            })}
          </TouchableOpacity>

          {/* ── Daily reminder quote ── */}
          <View style={styles.quoteStrip}>
            <View style={styles.quoteRule} />
            <View style={styles.quoteInner}>
              <Text style={styles.quoteEye}>Today's reminder</Text>
              <Text style={styles.quoteBody}>{todayReminder}</Text>
            </View>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>

      </SafeAreaView>

      <PremiumUpsellModal
        visible={showPremiumUpsell}
        onClose={handleClosePremiumUpsell}
      />

      <WelcomeGuideModal
        visible={showIntro}
        onClose={handleCloseIntro}
        onGoToRoadmap={handleGoToRoadmap}
        roadmapKey={selectedRoadmap}
      />

      {/* ── First-visit coach mark — shows once, then permanently dismissed ── */}
      <CoachMarkOverlay
        visible={coachLoaded && !coachSeen && !showIntro && !showPremiumUpsell}
        onDone={markCoachSeen}
        steps={HOME_COACH_STEPS}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor: colors.deepRose,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.deepRose,
    paddingHorizontal: spacing.xxl,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.warmWhite,
  },
  loadingText: {
    marginTop: 12,
    ...typography.caption,
  },

  // ── Top bar ───────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  profileIconBtn: {
    padding: 2,
  },
  brand: {
    fontFamily: 'serif',
    fontSize: 12,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.2,
  },
  premiumBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 5,
  backgroundColor: 'rgba(255,255,255,0.15)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.3)',
  borderRadius: 20,          // radii.pill equivalent
  paddingHorizontal: 10,
  paddingVertical: 4,
},
premiumDot: {
  width: 5,
  height: 5,
  borderRadius: 3,
  backgroundColor: 'rgba(255,255,255,0.75)',
},
premiumBadgeText: {
  fontSize: 10,
  fontWeight: '600',
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: '#fff',
},
upgradeChip: {
  backgroundColor: 'rgba(255,255,255,0.12)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.25)',
  borderRadius: 20,
  paddingHorizontal: 10,
  paddingVertical: 4,
},
upgradeChipText: {
  fontSize: 10,
  fontWeight: '600',
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.85)',
},

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  heroLeft: {
    flex: 1,
    paddingRight: spacing.md,
  },
  heroKicker: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: colors.dustyRose,
    marginBottom: 6,
  },
  heroTitle: {
    fontFamily: 'serif',
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontFamily: 'serif',
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.dustyRose,
    marginTop: 4,
  },
  pctBlock: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  pctNum: {
    fontFamily: 'serif',
    fontSize: 42,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 44,
    letterSpacing: -1,
  },
  pctUnit: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.35)',
  },
  pctLabel: {
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.3)',
    marginTop: 2,
    textAlign: 'right',
  },

  // ── Overall progress bar ──────────────────────────────────────────────────
  overallBarTrack: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: spacing.lg,
  },
  overallBarFill: {
    height: '100%',
    backgroundColor: colors.dustyRose,
    borderRadius: 2,
  },

  // ── Warm white sheet ──────────────────────────────────────────────────────
  sheet: {
    flex: 1,
    backgroundColor: colors.warmWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginHorizontal: -spacing.xxl,
  },
  sheetContent: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingBottom: 32,
  },

  // ── Momentum card ─────────────────────────────────────────────────────────
  momentumCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.linen,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.fawn,
    padding: spacing.lg,
  },
  momentumEye: {
    ...typography.eyebrow,
    marginBottom: 5,
  },
  momentumTitle: {
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 5,
    letterSpacing: -0.2,
  },
  momentumBody: {
    fontSize: 12,
    fontWeight: '300',
    color: colors.caption,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  momentumBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.ink,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  momentumBtnText: {
    ...typography.buttonPrimary,
    fontSize: 10,
  },

  // ── Streak card ───────────────────────────────────────────────────────────
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    overflow: 'hidden',
  },
  streakBlock: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 3,
  },
  streakNum: {
    fontFamily: 'serif',
    fontSize: 32,
    fontWeight: '700',
    color: colors.ink,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  streakLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.caption,
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.softBorder,
  },
  freezeGlyph: {
    fontSize: 22,
    lineHeight: 26,
    textAlign: 'center',
  },

  // ── Theme progress card ───────────────────────────────────────────────────
  themeCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    padding: spacing.lg,
  },
  themeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  themeCardEye: {
    ...typography.eyebrow,
  },
  themeBarRow: {
    marginBottom: spacing.sm,
  },
  themeBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  themeBarName: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.bodyMuted,
    flex: 1,
    marginRight: spacing.xs,
  },
  themeBarVal: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.caption,
  },
  themeBarTrack: {
    height: 3,
    backgroundColor: colors.subtleBorder,
    borderRadius: 2,
    overflow: 'hidden',
  },
  themeBarFill: {
    height: '100%',
    backgroundColor: colors.ink,
    borderRadius: 2,
  },
  themeBarFillComplete: {
    backgroundColor: colors.sage,
  },

  quoteStrip: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  quoteRule: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: colors.deepRose,
    borderRadius: 0,
    flexShrink: 0,
  },
  quoteInner: { flex: 1 },
  quoteEye: {
    ...typography.eyebrow,
    marginBottom: 7,
  },
  quoteBody: {
    fontFamily: 'serif',
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    color: colors.ink,
  },
});