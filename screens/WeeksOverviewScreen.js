// screens/WeeksOverviewScreen.js
import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Animated,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography, spacing, radii, shadows, tokens } from './theme';
import { roadmapsConfig } from '../config/roadmapsConfig';
import { roadmapTasks } from './roadmapTasks';
import { isProUser } from '../lib/paywall';
import { hydrateProgress } from '../services/progress';
import { supabase } from '../lib/supabase';
import PremiumUpsellModal from '../components/PremiumUpsellModal';

const ROADMAP_KEY    = 'new_city';
const WEEKLY_DEFAULT = 4;

const PLAN_SCREENS = {
  new_city:          'RoadmapPlan',
  tech_switch:       'RoadmapPlan',
  mental_glow_up:    'RoadmapPlan',
  physical_glow_up:  'RoadmapPlan',
  financial_glow_up: 'RoadmapPlan',
};

// ─── Coach mark key ───────────────────────────────────────────────────────────
const WEEKS_COACH_KEY = 'hint.weeksOverview.coach.v1.seen';

// ─── Coach mark steps ─────────────────────────────────────────────────────────
const WEEKS_COACH_STEPS = [
  {
    emoji: '📋',
    title: 'Your full roadmap at a glance',
    body: 'Each card here is one week of your plan. Your tasks are spread across weeks based on how much time you said you have available.',
  },
  {
    emoji: '🎯',
    title: 'Tap a week to dive in',
    body: 'Tap any week card to open that week in your roadmap plan and start marking tasks complete.',
  },
  {
    emoji: '✨',
    title: 'AI Focus Plan (Premium)',
    body: 'Premium members can generate an AI-powered focus plan each week — it analyses your progress and surfaces the 3 most urgent tasks to work on.',
  },
];

// ─── Weekly cache helpers ─────────────────────────────────────────────────────
function getISOWeekKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1   = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function getAiCacheKey(roadmap) {
  return `ai_adaptation_cache_${roadmap}_${getISOWeekKey()}`;
}

async function loadCachedAdaptation(roadmap) {
  try {
    const raw = await AsyncStorage.getItem(getAiCacheKey(roadmap));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function saveCachedAdaptation(roadmap, result) {
  try {
    await AsyncStorage.setItem(getAiCacheKey(roadmap), JSON.stringify(result));
  } catch (e) {
    console.warn('Failed to cache AI adaptation:', e);
  }
}

// ─── AI helpers ───────────────────────────────────────────────────────────────
function getCurrentThemeKey(roadmap, orderedThemeKeys, progressMap) {
  for (const themeKey of orderedThemeKeys) {
    const tasks  = roadmapTasks?.[roadmap]?.[themeKey] || [];
    const allDone =
      tasks.length > 0 &&
      tasks.every((_, i) => progressMap?.[`${themeKey}:${i}`]?.isCompleted);
    if (!allDone) return themeKey;
  }
  return orderedThemeKeys[orderedThemeKeys.length - 1];
}

function buildPrompt({ roadmapLabel, flatTasks, orderedThemeKeys, progressMap, currentWeek, isPro }) {
  const themeData = {};
  orderedThemeKeys.forEach((tk) => {
    themeData[tk] = { pending: [], done: 0, total: 0 };
  });

  flatTasks.forEach((t) => {
    const done = progressMap?.[`${t.theme}:${t.indexInTheme}`]?.isCompleted;
    if (!themeData[t.theme]) themeData[t.theme] = { pending: [], done: 0, total: 0 };
    themeData[t.theme].total += 1;
    if (done) {
      themeData[t.theme].done += 1;
    } else {
      themeData[t.theme].pending.push(t.task);
    }
  });

  let relevantThemeKeys = orderedThemeKeys;
  if (!isPro) {
    const activeTheme = getCurrentThemeKey(null, orderedThemeKeys, progressMap);
    relevantThemeKeys = [activeTheme];
  }

  const themeSummary = relevantThemeKeys
    .map((tk) => {
      const d      = themeData[tk] || { pending: [], done: 0, total: 0 };
      const pct    = d.total > 0 ? Math.round((d.done / d.total) * 100) : 0;
      const sample = d.pending.slice(0, 5).map((t) => `  - ${t}`).join('\n');
      return `Theme "${tk}" — ${pct}% complete, ${d.pending.length} tasks remaining:\n${sample || '  (all done)'}`;
    })
    .join('\n\n');

  return `You are a concise life-coaching assistant inside a personal reinvention app called "The Reinvention Edit".

The user is on the "${roadmapLabel}" roadmap, currently in Week ${currentWeek + 1}.

${isPro
    ? 'Premium user — surface the most urgent tasks across all active themes.'
    : 'Free user — rank urgency within their current active theme only. Do NOT suggest tasks from other themes.'}

Active theme(s) and pending tasks:
${themeSummary}

Identify the 3 most urgent tasks the user should focus on this week. Be direct, warm, and specific.

Rules:
- Each task must be referenced by its exact name from the list above
- One sentence (max 15 words) explaining why it's urgent right now
- Return ONLY valid JSON, no markdown fences, no preamble:
{
  "urgentTasks": [
    { "task": "exact task name", "theme": "theme_key", "reason": "why it's urgent" },
    { "task": "exact task name", "theme": "theme_key", "reason": "why it's urgent" },
    { "task": "exact task name", "theme": "theme_key", "reason": "why it's urgent" }
  ],
  "coachNote": "One encouraging sentence (max 20 words) for the week ahead."
}`;
}

async function fetchAdaptation({ roadmapLabel, flatTasks, orderedThemeKeys, progressMap, currentWeek, isPro }) {
  const prompt = buildPrompt({ roadmapLabel, flatTasks, orderedThemeKeys, progressMap, currentWeek, isPro });

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) throw new Error('Not authenticated');

  const { data, error } = await supabase.functions.invoke('claude-adapt', {
    body: { prompt },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (error) throw new Error(`Edge Function error: ${error.message}`);

  const clean = (data?.text ?? '').replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// ─── HintButton ───────────────────────────────────────────────────────────────
function HintButton({ title, body, style }) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        style={[hintStyles.btn, style]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel={`Help: ${title}`}
        accessibilityRole="button"
      >
        <Text style={hintStyles.btnText}>?</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
        statusBarTranslucent
      >
        <Pressable style={hintStyles.scrim} onPress={() => setVisible(false)}>
          <Pressable style={hintStyles.card} onPress={() => {}}>
            <View style={hintStyles.pip} />
            <Text style={hintStyles.cardTitle}>{title}</Text>
            <Text style={hintStyles.cardBody}>{body}</Text>
            <TouchableOpacity
              style={hintStyles.closeBtn}
              onPress={() => setVisible(false)}
              activeOpacity={0.8}
            >
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
    backgroundColor: colors.roseTint08,
    borderWidth: 1,
    borderColor: colors.roseTint18,
  },
  btnText: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    color: colors.deepRose,
  },
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
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDone}
    >
      <View style={coachStyles.scrim}>
        <Animated.View
          style={[
            coachStyles.card,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
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
  dots:      { flexDirection: 'row', gap: 5, marginBottom: spacing.lg },
  dot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.fawn },
  dotActive: { backgroundColor: colors.dustyRose, width: 18 },
  pip:       { width: 28, height: 4, borderRadius: 2, backgroundColor: colors.dustyRose, marginBottom: spacing.lg, opacity: 0.7 },
  emoji:     { fontSize: 30, marginBottom: spacing.md },
  title:     { fontFamily: 'PlayfairDisplay', fontSize: 20, color: colors.ink, marginBottom: spacing.sm, letterSpacing: 0.2 },
  body:      { fontSize: 14, lineHeight: 22, color: colors.bodyMuted, marginBottom: spacing.xl },
  actions:   { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.md },
  skipText:  { fontSize: 12, fontWeight: '500', letterSpacing: 0.8, color: colors.caption, textTransform: 'uppercase' },
  nextBtn:     { backgroundColor: colors.deepRose, borderRadius: radii.md, paddingVertical: 12, paddingHorizontal: spacing.xl, alignItems: 'center' },
  nextBtnFull: { flex: 1 },
  nextBtnText: { ...typography.buttonPrimary },
});

// ─── Sub-components ───────────────────────────────────────────────────────────
const URGENCY_LABELS = ['🔥 Most urgent', '⚡ Also urgent', "📌 Don't forget"];

function UrgentTaskCard({ item, index }) {
  return (
    <View style={styles.urgentCard}>
      <View style={styles.urgentRow}>
        <Text style={styles.urgentBadge}>{URGENCY_LABELS[index] ?? `#${index + 1}`}</Text>
        <Text style={styles.urgentThemeLabel}>{item.theme?.replace(/_/g, ' ')}</Text>
      </View>
      <Text style={styles.urgentTask}>{item.task}</Text>
      <Text style={styles.urgentReason}>{item.reason}</Text>
    </View>
  );
}

function PremiumTeaser({ onUpgrade }) {
  return (
    <View style={styles.teaserCard}>
      <Ionicons name="sparkles" size={20} color={colors.deepRose} style={{ marginBottom: spacing.sm }} />
      <Text style={styles.teaserTitle}>AI Weekly Adaptation</Text>
      <Text style={styles.teaserBody}>
        Upgrade to Premium and the AI will analyse your roadmap progress each week —
        surfacing the most urgent tasks to keep your reinvention on track.
      </Text>
      <TouchableOpacity style={styles.teaserButton} onPress={onUpgrade} activeOpacity={0.85}>
        <Text style={styles.teaserButtonText}>Unlock with Premium</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function WeeksOverviewScreen() {
  const navigation = useNavigation();
  const route      = useRoute();
  const { roadmap = ROADMAP_KEY } = route.params || {};

  const [loading, setLoading]             = useState(true);
  const [weeklyHours, setWeeklyHours]     = useState(WEEKLY_DEFAULT);
  const [currentWeek, setCurrentWeek]     = useState(0);
  const [weeklyBuckets, setWeeklyBuckets] = useState([]);
  const [flatTasks, setFlatTasks]         = useState([]);

  const [isPro, setIsPro]               = useState(false);
  const [progressMap, setProgressMap]   = useState({});
  const [showUpsell, setShowUpsell]     = useState(false);

  const [aiLoading, setAiLoading]         = useState(false);
  const [aiResult, setAiResult]           = useState(null);
  const [aiError, setAiError]             = useState(null);
  const [hasGenerated, setHasGenerated]   = useState(false);
  const [cachedWeekKey, setCachedWeekKey] = useState(null);

  // ── Coach mark state ─────────────────────────────────────────────────────────
  const [coachSeen, setCoachSeen]     = useState(true);
  const [coachLoaded, setCoachLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(WEEKS_COACH_KEY)
      .then((val) => { setCoachSeen(val === 'true'); setCoachLoaded(true); })
      .catch(() => setCoachLoaded(true));
  }, []);

  const markCoachSeen = useCallback(async () => {
    setCoachSeen(true);
    await AsyncStorage.setItem(WEEKS_COACH_KEY, 'true');
  }, []);

  const orderedThemeKeys = useMemo(() => {
    const fromCfg = (roadmapsConfig?.[roadmap]?.themes || []).map((t) => t.key);
    const fallback = Object.keys(roadmapTasks?.[roadmap] || {});
    return fromCfg.length ? fromCfg : fallback;
  }, [roadmap]);

  useFocusEffect(
    React.useCallback(() => {
      let alive = true;

      const init = async () => {
        setLoading(true);
        try {
const pro = await isProUser();
if (alive) setIsPro(pro);

          // ── Load progress from Supabase (with local cache fallback) ──
          const { data: { session } } = await supabase.auth.getSession();
          const uid = session?.user?.id;
          const progress = uid ? await hydrateProgress(uid, roadmap) : {};
          if (alive) setProgressMap(progress);

          const weeklyBudget =
            Number(await AsyncStorage.getItem('timeCommitmentHours')) || WEEKLY_DEFAULT;
          if (!alive) return;
          setWeeklyHours(weeklyBudget);

          const roadmapStartKey = `planStart_${roadmap}__GLOBAL`;
          let roadmapStartISO   = await AsyncStorage.getItem(roadmapStartKey);
          if (!roadmapStartISO) {
            roadmapStartISO = new Date().toISOString();
            await AsyncStorage.setItem(roadmapStartKey, roadmapStartISO);
          }

          const start       = new Date(roadmapStartISO);
          const now         = new Date();
          const weeksPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24 * 7));
          if (alive) setCurrentWeek(weeksPassed);

          const flat = [];
          orderedThemeKeys.forEach((tk, themeIndex) => {
            const arr = roadmapTasks?.[roadmap]?.[tk] || [];
            arr.forEach((raw, indexInTheme) => {
              flat.push({
                theme: tk,
                themeIndex,
                indexInTheme,
                task:     raw.task || raw,
                duration: raw.duration || 0.33,
                priority: raw.priority ?? null,
              });
            });
          });

          flat.sort((a, b) => {
            if (a.priority !== null && b.priority !== null) return a.priority - b.priority;
            if (a.priority !== null) return -1;
            if (b.priority !== null) return 1;
            if (a.themeIndex !== b.themeIndex) return a.themeIndex - b.themeIndex;
            return a.indexInTheme - b.indexInTheme;
          });

          const buckets = [];
          let current   = [];
          let sum       = 0;
          flat.forEach((t, idx) => {
            if (sum + t.duration <= weeklyBudget || current.length === 0) {
              current.push(idx);
              sum += t.duration;
            } else {
              buckets.push(current);
              current = [idx];
              sum     = t.duration;
            }
          });
          if (current.length) buckets.push(current);

          if (alive) {
            setFlatTasks(flat);
            setWeeklyBuckets(buckets);
          }

          // ── Load cached AI result for this week ──
          const cached = await loadCachedAdaptation(roadmap);
          if (alive && cached) {
            setAiResult(cached);
            setHasGenerated(true);
            setCachedWeekKey(getISOWeekKey());
          }
        } finally {
          if (alive) setLoading(false);
        }
      };

      init();
      return () => { alive = false; };
    }, [roadmap, orderedThemeKeys.length])
  );

  const handleGenerateAdaptation = useCallback(async () => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiError(null);
    setHasGenerated(true);

    try {
      const roadmapLabel = roadmapsConfig?.[roadmap]?.label || roadmap;
      const result = await fetchAdaptation({
        roadmapLabel, flatTasks, orderedThemeKeys, progressMap, currentWeek, isPro,
      });
      setAiResult(result);
      setCachedWeekKey(getISOWeekKey());
      await saveCachedAdaptation(roadmap, result);
    } catch (e) {
      setAiError('Could not generate adaptation. Please try again.');
      console.error('AI adaptation error:', e);
    } finally {
      setAiLoading(false);
    }
  }, [aiLoading, roadmap, flatTasks, orderedThemeKeys, progressMap, currentWeek, isPro]);

  const handleRefresh = useCallback(async () => {
    if (aiLoading) return;
    try { await AsyncStorage.removeItem(getAiCacheKey(roadmap)); } catch {}
    setAiResult(null);
    setHasGenerated(false);
    setCachedWeekKey(null);
    setTimeout(() => handleGenerateAdaptation(), 50);
  }, [aiLoading, roadmap, handleGenerateAdaptation]);

  // ── Loading screen ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.sage} />
        <Text style={[typography.body, { marginTop: spacing.sm, color: colors.ink }]}>
          Preparing your weeks…
        </Text>
      </View>
    );
  }

  const weekSummary = (indices) => {
    let count = 0;
    let hours = 0;
    indices.forEach((i) => {
      const it = flatTasks[i];
      if (!it) return;
      count += 1;
      hours += it.duration;
    });
    return { count, hours: Number(hours.toFixed(2)) };
  };

  const thisWeekKey      = getISOWeekKey();
  const isCachedThisWeek = cachedWeekKey === thisWeekKey;

  return (
    <>
      <View style={styles.background}>
        <ScrollView contentContainerStyle={styles.container}>

          {/* ── Header with hint ── */}
          <View style={styles.headerRow}>
            <Text style={styles.screenTitle}>Your Weekly Plan</Text>
            <HintButton
              title="How your plan works"
              body="Your tasks are spread across weeks based on your available hours. Each card is one week — tap it to open that week and start completing tasks."
            />
          </View>
          <Text style={styles.subtitle}>
            Most important tasks first · ~{weeklyHours}h/week
          </Text>

          {/* ── AI section eyebrow with hint ── */}
          <View style={[tokens.eyebrowRow, { marginHorizontal: 0, marginTop: spacing.lg }]}>
            <Text style={typography.eyebrow}>AI Adaptation</Text>
            <View style={tokens.eyebrowRule} />
            <HintButton
              title="AI Weekly Adaptation"
              body="Once a week, the AI analyses your roadmap progress and picks out the 3 most urgent tasks for you to focus on. The result is cached so it loads instantly until next week."
            />
          </View>

          {/* ── AI section body ── */}
          {!isPro ? (
            <PremiumTeaser onUpgrade={() => setShowUpsell(true)} />
          ) : (
            <View>
              <Text style={styles.aiSub}>
                The AI looks at your roadmap themes and surfaces the 3 most urgent tasks
                to focus on — ranked by what matters most right now.
              </Text>

              {/* Generate button — shown when no result yet */}
              {!hasGenerated && !aiLoading && (
                <TouchableOpacity
                  style={styles.generateBtn}
                  onPress={handleGenerateAdaptation}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="sparkles-outline"
                    size={16}
                    color={colors.white}
                    style={{ marginRight: spacing.xs }}
                  />
                  <Text style={typography.buttonPrimary}>Generate my focus plan</Text>
                </TouchableOpacity>
              )}

              {/* Loading */}
              {aiLoading && (
                <View style={styles.aiLoadingBox}>
                  <ActivityIndicator color={colors.deepRose} />
                  <Text style={[typography.actionSub, { marginLeft: spacing.sm }]}>
                    Analysing your roadmap…
                  </Text>
                </View>
              )}

              {/* Error */}
              {aiError && !aiLoading && (
                <View style={styles.aiErrorBox}>
                  <Text style={styles.aiErrorText}>{aiError}</Text>
                  <TouchableOpacity onPress={handleGenerateAdaptation}>
                    <Text style={styles.retryText}>Try again</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Results */}
              {aiResult && !aiLoading && (
                <View>
                  {/* Cached label */}
                  {isCachedThisWeek && (
                    <View style={styles.cachedBadgeRow}>
                      <Ionicons name="checkmark-circle-outline" size={13} color={colors.clay} />
                      <Text style={styles.cachedBadgeText}>
                        Generated this week · refreshes automatically next week
                      </Text>
                    </View>
                  )}

                  {aiResult.coachNote ? (
                    <View style={styles.coachNoteBox}>
                      <Text style={styles.coachNoteText}>"{aiResult.coachNote}"</Text>
                    </View>
                  ) : null}

                  {/* Focus this week — label with hint */}
                  <View style={styles.focusHeaderRow}>
                    <Text style={[typography.eyebrow, { marginBottom: spacing.sm }]}>
                      Your focus this week
                    </Text>
                    <HintButton
                      title="Your focus tasks"
                      body="These 3 tasks were chosen by the AI based on where you are in your roadmap. They are the highest-leverage steps to move your reinvention forward this week."
                    />
                  </View>

                  {(aiResult.urgentTasks || []).map((item, idx) => (
                    <UrgentTaskCard key={idx} item={item} index={idx} />
                  ))}

                  {/* Refresh button */}
                  <TouchableOpacity
                    style={styles.regenerateBtn}
                    onPress={handleRefresh}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={13}
                      color={colors.clay}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.regenerateText}>Refresh</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* ── Week cards ── */}
          <View style={[tokens.eyebrowRow, { marginHorizontal: 0, marginTop: spacing.xl }]}>
            <Text style={typography.eyebrow}>All Weeks</Text>
            <View style={tokens.eyebrowRule} />
          </View>

          {weeklyBuckets.map((indices, wIdx) => {
            const { count, hours } = weekSummary(indices);
            const isCurrent = wIdx === currentWeek;
            const isFuture  = wIdx > currentWeek;

            // Free users: future weeks are locked
            const isLocked = isFuture && !isPro;

            return (
              <TouchableOpacity
                key={`week-${wIdx}`}
                style={[
                  styles.weekCard,
                  isCurrent && styles.weekCardCurrent,
                  isLocked && styles.weekCardLocked,
                ]}
                onPress={() => {
                  if (isLocked) {
                    setShowUpsell(true);
                    return;
                  }
                  const target = PLAN_SCREENS[roadmap] || 'NewCityPlan';
                  navigation.navigate(target, { roadmap, startAtWeek: wIdx });
                }}
                activeOpacity={isLocked ? 0.6 : 0.88}
              >
                <View style={styles.weekHeader}>
                  <Text style={[
                    styles.weekTitle,
                    isCurrent && styles.weekTitleActive,
                    isLocked && styles.weekTitleLocked,
                  ]}>
                    Week {wIdx + 1}
                  </Text>
                  <View style={styles.weekHeaderRight}>
                    {isCurrent && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>current</Text>
                      </View>
                    )}
                    {isLocked && (
                      <Ionicons name="lock-closed" size={14} color={colors.bodyMuted} />
                    )}
                  </View>
                </View>

                <Text style={[
                  styles.weekMeta,
                  isCurrent && styles.weekMetaActive,
                  isLocked && styles.weekMetaLocked,
                ]}>
                  {count} step{count === 1 ? '' : 's'} · ~{hours}h
                </Text>

                {/* Hide task previews for locked weeks — show premium prompt instead */}
                {isLocked ? (
                  <Text style={styles.lockedHint}>Unlock with Premium to plan ahead ✨</Text>
                ) : (
                  indices.slice(0, 2).map((i) => {
                    const it = flatTasks[i];
                    return (
                      <Text
                        key={i}
                        style={[styles.previewItem, isCurrent && styles.previewItemActive]}
                        numberOfLines={1}
                      >
                        · {it.theme.replace(/_/g, ' ')} — {it.task}
                      </Text>
                    );
                  })
                )}
              </TouchableOpacity>
            );
          })}

          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      </View>

      <PremiumUpsellModal visible={showUpsell} onClose={() => setShowUpsell(false)} />

      {/* ── First-visit coach mark ── */}
      <CoachMarkOverlay
        visible={coachLoaded && !coachSeen && !loading}
        onDone={markCoachSeen}
        steps={WEEKS_COACH_STEPS}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: colors.warmWhite },
  center:     { flex: 1, backgroundColor: colors.warmWhite, alignItems: 'center', justifyContent: 'center' },

  container: {
    paddingHorizontal: spacing.screenPaddingH,
    paddingTop:        spacing.screenPaddingTop,
    paddingBottom:     spacing.xxxl,
  },

  // ── Header ──
  headerRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            spacing.sm,
    marginBottom:   spacing.xs,
  },
  screenTitle: {
    ...typography.screenTitle,
    marginBottom: 0,
  },
  subtitle: {
    ...typography.caption,
    textAlign:    'center',
    marginBottom: spacing.lg,
  },

  // ── Week cards ──
  weekCard: {
    ...tokens.infoCard,
    padding:      spacing.md,
    marginBottom: spacing.sm,
  },
  weekCardCurrent: {
    backgroundColor: colors.deepRose,
    borderColor:     colors.midRose,
  },
  weekCardLocked: {
    opacity:     0.55,
    borderStyle: 'dashed',
  },
  weekHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   spacing.xs,
  },
  weekHeaderRight: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.xs,
  },
  weekTitle: {
    ...typography.actionLabel,
    fontSize:   15,
    fontWeight: '700',
  },
  weekTitleActive: {
    color: colors.white,
  },
  weekTitleLocked: {
    color: colors.bodyMuted,
  },
  weekMeta: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  weekMetaActive: {
    color: 'rgba(255,255,255,0.75)',
  },
  weekMetaLocked: {
    color: colors.bodyMuted,
  },
  previewItem: {
    ...typography.caption,
    marginTop: 2,
  },
  previewItemActive: {
    color: 'rgba(255,255,255,0.65)',
  },
  lockedHint: {
    ...typography.caption,
    color:      colors.clay,
    fontStyle:  'italic',
    marginTop:  spacing.xs,
  },
  currentBadge: {
    backgroundColor:   colors.white,
    borderRadius:      radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical:   3,
  },
  currentBadgeText: {
    ...typography.badge,
    color: colors.deepRose,
  },

  // ── AI section ──
  aiSub: {
    ...typography.body,
    color:        colors.bodyMuted,
    marginBottom: spacing.lg,
  },

  generateBtn: {
    ...tokens.buttonPrimary,
    backgroundColor: colors.dustyRose,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: spacing.md,
    marginBottom:    spacing.lg,
  },

  aiLoadingBox: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.linen,
    borderRadius:    radii.lg,
    padding:         spacing.md,
    marginBottom:    spacing.sm,
    borderWidth:     1,
    borderColor:     colors.softBorder,
  },

  aiErrorBox: {
    backgroundColor: colors.roseTint08,
    borderRadius:    radii.lg,
    padding:         spacing.md,
    borderWidth:     1,
    borderColor:     colors.roseTint20,
    marginBottom:    spacing.sm,
  },
  aiErrorText: {
    ...typography.body,
    color:        colors.deepRose,
    marginBottom: spacing.xs,
  },
  retryText: {
    ...typography.actionLabel,
    color: colors.clay,
  },

  cachedBadgeRow: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  spacing.sm,
    gap:           4,
  },
  cachedBadgeText: {
    ...typography.caption,
    color: colors.clay,
  },

  coachNoteBox: {
    backgroundColor:  colors.offWhite,
    borderRadius:     radii.lg,
    padding:          spacing.md,
    marginBottom:     spacing.lg,
    borderLeftWidth:  2,
    borderLeftColor:  colors.dustyRose,
    borderWidth:      1,
    borderColor:      colors.softBorder,
  },
  coachNoteText: {
    ...typography.cardTitle,
    lineHeight: 20,
  },

  // ── Focus header row ──
  focusHeaderRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing.sm,
    marginBottom:   0,
  },

  // ── Urgent task cards ──
  urgentCard: {
    ...tokens.infoCard,
    ...shadows.card,
    padding:      spacing.md,
    marginBottom: spacing.sm,
  },
  urgentRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   spacing.xs,
  },
  urgentBadge: {
    ...typography.eyebrow,
    color: colors.clay,
  },
  urgentThemeLabel: {
    ...typography.caption,
    color:      colors.champagne,
    fontWeight: '600',
  },
  urgentTask: {
    ...typography.actionLabel,
    fontSize:     14,
    fontWeight:   '700',
    marginBottom: 4,
    lineHeight:   20,
  },
  urgentReason: {
    ...typography.actionSub,
    lineHeight: 17,
  },

  regenerateBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    alignSelf:         'center',
    marginTop:         spacing.sm,
    paddingVertical:   spacing.xs,
    paddingHorizontal: spacing.md,
  },
  regenerateText: {
    ...typography.modalCancel,
    color: colors.clay,
  },

  // ── Premium teaser ──
  teaserCard: {
    ...tokens.linenCard,
    padding:    spacing.xl,
    alignItems: 'center',
  },
  teaserTitle: {
    ...typography.sectionTitle,
    fontSize:     17,
    marginBottom: spacing.xs,
  },
  teaserBody: {
    ...typography.body,
    color:        colors.bodyLight,
    textAlign:    'center',
    marginBottom: spacing.lg,
  },
  teaserButton: {
    ...tokens.buttonPrimary,
    paddingHorizontal: spacing.xxl,
    paddingVertical:   spacing.sm,
  },
  teaserButtonText: {
    ...typography.buttonPrimary,
  },
});