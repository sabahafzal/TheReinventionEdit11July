// screens/RoadmapPlanScreen.js
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';

import PlanLayout, { PLAN_THEME, PLAN_BUTTONS, PLAN_UI } from '../components/PlanLayout';
import { colors, radii, spacing, typography, shadows } from './theme';
import PremiumUpsellModal from '../components/PremiumUpsellModal';

import * as Notifications from 'expo-notifications';

import { roadmapsConfig } from '../config/roadmapsConfig';
import {
  roadmapTasksFree,
  roadmapTasksPremium,
  getTaskId,
  taskExplanations,
} from './roadmapTasks';
import { bucketTasksByWeek } from '../utils/taskUtils';
import { useRoadmapProgress } from '../hooks/useRoadmapProgress';
import { enforceGlobalCap, enforceFreeCapOrUpsell, addFreeHoursUsed, isProUser } from '../lib/paywall';
import {
  refreshDailyRoadmapReminder,
  evaluateTriggeredRoadmapNudges,
} from '../lib/roadmapReminders';


// ─── Storage keys ─────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  tech_switch:      { track: 'techSwitchTrack' },
  new_city:         { track: 'newCityTrack', job: 'newCityJobStatus' },
  physical_glow_up: { track: 'physicalGlowUpTrack' },
};

const DEFAULT_WEEKLY_HOURS = 4;

const MOMENTUM_TRIGGER_MISSED  = 5;
const MOMENTUM_QUICK_MAX_HOURS = 0.5;
const PREMIUM_PREVIEW_COUNT    = 2;

const NOTIFICATIONS_CHOICE_KEY     = 'taskReminderChoice';
const NOTIFICATIONS_PERMISSION_KEY = 'notificationsPermissionStatus';
const NOTIFICATIONS_ENABLED_KEY    = 'notificationsEnabled';
const NOTIFICATIONS_PROMPTED_KEY   = 'notificationsPrompted';

const NOTIFICATION_REPROMPT_FIRST_TASK_KEY = 'notifications_reprompt_after_first_task_shown';
const NOTIFICATION_REPROMPT_FIFTH_TASK_KEY = 'notifications_reprompt_after_fifth_task_shown';

const EXTRA_HOURS_OPTIONS = [1, 2, 3];
const getBonusHoursKey      = (roadmapKey, weekIndex) => `bonus_week_hours_${roadmapKey}_${weekIndex}`;
const getBonusPromptShownKey = (roadmapKey, weekIndex) => `bonus_week_prompt_shown_${roadmapKey}_${weekIndex}`;

const getDismissedRecurringKey = (roadmapKey) => `dismissed_recurring_series_${roadmapKey}`;

/**
 * Derives a stable series key from a recurring task so that dismissing one
 * instance hides all instances in the same series.
 *
 * - If the task has an `id` like "new_city.jobhunt.daily_job_search.day3",
 *   strips the trailing ".dayN" / ".weekN" segment to get the idBase.
 * - Falls back to stripping " (Day N)" / " (Week N)" from the title.
 * - Returns null for non-recurring tasks.
 */
const getRecurringSeriesKey = (taskObj) => {
  const kind = taskObj?.meta?.kind;
  if (kind !== 'recurring' && kind !== 'recurring_weekly') return null;

  if (taskObj.id) {
    const parts = taskObj.id.split('.');
    const last  = parts[parts.length - 1];
    if (last.startsWith('day') || last.startsWith('week')) {
      return parts.slice(0, -1).join('.');
    }
    return taskObj.id;
  }

  return taskObj.task
    ? taskObj.task.replace(/\s*\((Day|Week) \d+\)$/, '').trim()
    : null;
};


// ─── Coach mark key ───────────────────────────────────────────────────────────
const ROADMAP_PLAN_COACH_KEY = 'hint.roadmapPlan.coach.v1.seen';

// ─── Coach mark steps ─────────────────────────────────────────────────────────
const ROADMAP_PLAN_COACH_STEPS = [
  {
    emoji: '📅',
    title: 'Your week-by-week plan',
    body: "Your tasks are spread across weeks based on your available time. Each week unlocks as time passes. You can't jump ahead, but you can look back.",
  },
  {
    emoji: '✅',
    title: 'Mark tasks complete',
    body: 'Tap "Mark complete" on any task to log your progress. Tap "Details" to see a deeper explanation of what the task involves.',
  },
  {
    emoji: '🔒',
    title: 'Free vs Premium',
    body: 'Free members get a curated set of tasks per theme. Premium unlocks the full task list, bonus steps, and the ability to add extra hours to a week.',
  },
];

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

const weeksBetween = (fromISO, to = new Date()) => Math.floor(daysBetween(fromISO, to) / 7);

const prettyHours = (h) => {
  const n = Number(h || 0);
  return Number.isFinite(n) ? Number(n.toFixed(2)) : 0;
};

const toYMD = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

const isYesterdayYMD = (value) => {
  if (!value) return false;
  const parts = value.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return false;
  const [y, m, d] = parts;
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + 1);
  return toYMD(date) === toYMD(new Date());
};

const updateStreakForCompletedTask = async () => {
  const today    = toYMD(new Date());
  const lastDate = (await AsyncStorage.getItem('streak_last_date')) || '';
  let count      = parseInt((await AsyncStorage.getItem('streak_count')) || '0', 10) || 0;
  let best       = parseInt((await AsyncStorage.getItem('streak_best'))  || '0', 10) || 0;

  if (lastDate === today) return;

  count = isYesterdayYMD(lastDate) ? count + 1 : 1;
  if (count > best) best = count;

  await AsyncStorage.multiSet([
    ['streak_last_date', today],
    ['streak_count',     String(count)],
    ['streak_best',      String(best)],
  ]);
};

const normalizeTrackKey = (roadmapKey, trackKey) => {
  if (roadmapKey !== 'new_city') return trackKey;
  if (trackKey === 'moving_city_only') return 'moving_city';
  return trackKey;
};

const getThemeKeysForRoadmap = ({ roadmapKey, trackKey, jobStatusKey }) => {
  const cfg = roadmapsConfig?.[roadmapKey] || {};

  if (roadmapKey === 'new_city') {
    const tKey       = normalizeTrackKey(roadmapKey, trackKey);
    const baseThemes =
      (tKey && cfg?.tracks?.[tKey]?.themes?.map((t) => t.key)) ||
      (cfg?.themes?.map((t) => t.key)) ||
      Object.keys(roadmapTasksFree?.[roadmapKey] || {});
    const jobCfg  = cfg?.jobStatus;
    const opt     = jobCfg?.options?.find((o) => o.key === jobStatusKey);
    const prepend = opt?.presets?.prependThemes || [];
    const hide    = opt?.presets?.hideThemes    || [];
    const seen    = new Set();
    const ordered = [];
    [...prepend, ...baseThemes].forEach((k) => {
      if (k && !seen.has(k)) { seen.add(k); ordered.push(k); }
    });
    const hideSet  = new Set(hide);
    const filtered = ordered.filter((k) => !hideSet.has(k));
    const groups   = roadmapTasksFree?.[roadmapKey] || {};
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
};

const getTrackOptions = (roadmapKey) => {
  const cfg = roadmapsConfig?.[roadmapKey];
  if (!cfg?.tracks) return [];
  return Object.entries(cfg.tracks).map(([key, obj]) => ({
    key,
    label: obj.label || obj.title || key,
  }));
};

const getThemeLabel = (roadmapKey, themeKey, trackKey) => {
  const cfg = roadmapsConfig?.[roadmapKey];
  if (!cfg) return themeKey;
  if (trackKey && cfg?.tracks?.[trackKey]?.themes) {
    const t = cfg.tracks[trackKey].themes.find((x) => x.key === themeKey);
    if (t) return t.title;
  }
  if (Array.isArray(cfg?.themes)) {
    const t = cfg.themes.find((x) => x.key === themeKey);
    if (t) return t.title;
  }
  return themeKey.replace('_', ' ');
};

const getTaskRuntimeKey = (taskObj) => `${taskObj.themeKey}:${taskObj.__taskIndex}`;

const pickMomentumTasks = (tasks) => {
  if (!Array.isArray(tasks) || tasks.length === 0) return [];
  const quick = tasks.find((t) => Number(t?.duration || 0) <= MOMENTUM_QUICK_MAX_HOURS) || tasks[0];
  const core  =
    tasks.find(
      (t) => getTaskRuntimeKey(t) !== getTaskRuntimeKey(quick) && Number(t?.duration || 0) > MOMENTUM_QUICK_MAX_HOURS
    ) ||
    tasks.find((t) => getTaskRuntimeKey(t) !== getTaskRuntimeKey(quick)) ||
    null;
  return [quick, core].filter(Boolean);
};

// ─── Notification helpers ─────────────────────────────────────────────────────
async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('daily-reminders', {
    name: 'Daily reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 150, 150, 150],
    lightColor: '#D6A5D2',
  });
}

async function promptToEnableNotificationsAgain() {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_PROMPTED_KEY, 'true');
    const current     = await Notifications.getPermissionsAsync();
    let finalStatus   = current.status;
    if (finalStatus !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      finalStatus     = requested.status;
    }
    await AsyncStorage.setItem(NOTIFICATIONS_PERMISSION_KEY, finalStatus);
    if (finalStatus === 'granted') {
      await AsyncStorage.multiSet([
        [NOTIFICATIONS_CHOICE_KEY,  'yes'],
        [NOTIFICATIONS_ENABLED_KEY, 'true'],
      ]);
      try { await ensureAndroidNotificationChannel(); await refreshDailyRoadmapReminder(); } catch {}
      Alert.alert('Notifications enabled ✨', "Perfect - we will remind you before your roadmap time.");
      return true;
    }
    await AsyncStorage.multiSet([
      [NOTIFICATIONS_CHOICE_KEY,  'no'],
      [NOTIFICATIONS_ENABLED_KEY, 'false'],
    ]);
    return false;
  } catch (e) {
    console.warn('promptToEnableNotificationsAgain error', e);
    return false;
  }
}

async function maybeRepromptNotificationsAfterProgress(nextCompletedCount) {
  const [notificationsChoice, permissionStatus, firstTaskRepromptShown, fifthTaskRepromptShown] =
    await AsyncStorage.multiGet([
      NOTIFICATIONS_CHOICE_KEY, NOTIFICATIONS_PERMISSION_KEY,
      NOTIFICATION_REPROMPT_FIRST_TASK_KEY, NOTIFICATION_REPROMPT_FIFTH_TASK_KEY,
    ]).then((pairs) => pairs.map(([, value]) => value));

  if (notificationsChoice !== 'no' || permissionStatus === 'granted') return;


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
  }, [visible, fadeAnim, slideAnim]);

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
  dots: { flexDirection: 'row', gap: 5, marginBottom: spacing.lg },
  dot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.fawn },
  dotActive: { backgroundColor: colors.dustyRose, width: 18 },
  pip:  { width: 28, height: 4, borderRadius: 2, backgroundColor: colors.dustyRose, marginBottom: spacing.lg, opacity: 0.7 },
  emoji: { fontSize: 30, marginBottom: spacing.md },
  title: { fontFamily: 'PlayfairDisplay', fontSize: 20, color: colors.ink, marginBottom: spacing.sm, letterSpacing: 0.2 },
  body:  { fontSize: 14, lineHeight: 22, color: colors.bodyMuted, marginBottom: spacing.xl },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.md },
  skipText: { fontSize: 12, fontWeight: '500', letterSpacing: 0.8, color: colors.caption, textTransform: 'uppercase' },
  nextBtn:  { backgroundColor: colors.deepRose, borderRadius: radii.md, paddingVertical: 12, paddingHorizontal: spacing.xl, alignItems: 'center' },
  nextBtnFull: { flex: 1 },
  nextBtnText: { ...typography.buttonPrimary },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function RoadmapPlanScreen() {
  const route      = useRoute();
  const navigation = useNavigation();

  const roadmapKey = route?.params?.roadmapKey || route?.params?.roadmap || null;
  const cfg        = roadmapKey ? roadmapsConfig?.[roadmapKey] : null;

  const [loadingSetup, setLoadingSetup]   = useState(true);
  const [isPro, setIsPro]                 = useState(false);
  const [weeklyHours, setWeeklyHours]     = useState(DEFAULT_WEEKLY_HOURS);
  const [trackKey, setTrackKey]           = useState(null);
  const [jobStatusKey, setJobStatusKey]   = useState(null);
  const [planStartISO, setPlanStartISO]   = useState(null);
  const [weekToShow, setWeekToShow]       = useState(0);
  const [unlockedWeek, setUnlockedWeek]   = useState(0);
  const [upsellVisible, setUpsellVisible] = useState(false);
  const [showOnlyUnfinished, setShowOnlyUnfinished] = useState(false);
  const [bonusHoursForWeek, setBonusHoursForWeek]   = useState(0);
  const [bonusPromptHandled, setBonusPromptHandled] = useState(false);

  const [coachSeen, setCoachSeen]         = useState(true);
  const [coachLoaded, setCoachLoaded]     = useState(false);
  const [trackExpanded, setTrackExpanded] = useState(false);
  const [dismissedSeriesKeys, setDismissedSeriesKeys] = useState(new Set());

  // ── Tech-switch role banner state ──────────────────────────────────────────
  const [techRole,  setTechRole]  = useState(null);
  const [techTrack, setTechTrack] = useState(null);

  const loadTechRole = useCallback(async () => {
    if (roadmapKey !== 'tech_switch') return;
    try {
      const r = await AsyncStorage.getItem('techSwitch.selectedRole');
      const t = await AsyncStorage.getItem('techSwitchTrack');
      setTechRole(r  || null);
      setTechTrack(t || null);
    } catch {}
  }, [roadmapKey]);

  // Load on mount and whenever the screen comes back into focus
  useEffect(() => { loadTechRole(); }, [loadTechRole]);
  useEffect(() => {
    return navigation.addListener('focus', loadTechRole);
  }, [navigation, loadTechRole]);

  useEffect(() => {
    AsyncStorage.getItem(ROADMAP_PLAN_COACH_KEY)
      .then((val) => { setCoachSeen(val === 'true'); setCoachLoaded(true); })
      .catch(() => setCoachLoaded(true));
  }, []);

  const markCoachSeen = useCallback(async () => {
    setCoachSeen(true);
    await AsyncStorage.setItem(ROADMAP_PLAN_COACH_KEY, 'true');
  }, []);

  const togglingRef = useRef(new Set());

  const { loading: progressLoading, map, toggle } = useRoadmapProgress({
    roadmapKey: roadmapKey || '',
    planLength:  null,
  });



  useEffect(() => {
    const init = async () => {
      if (!roadmapKey) {
        Alert.alert('Missing roadmap', 'No roadmapKey passed to RoadmapPlanScreen.');
        setLoadingSetup(false);
        return;
      }
      setLoadingSetup(true);
      try {
        let wh = parseFloat(await AsyncStorage.getItem('timeCommitmentHours'));
        if (!Number.isFinite(wh) || wh <= 0) {
          const dailyStr = await AsyncStorage.getItem('dailyTimeBudgetHours');
          const daily    = dailyStr ? parseFloat(dailyStr) : NaN;
          wh             = Number.isFinite(daily) && daily > 0 ? daily * 7 : DEFAULT_WEEKLY_HOURS;
        }
        setWeeklyHours(wh);

        const keys = STORAGE_KEYS[roadmapKey] || {};
        if (keys.track) setTrackKey(await AsyncStorage.getItem(keys.track));
        if (keys.job)   setJobStatusKey(await AsyncStorage.getItem(keys.job));

        const startKey = `planStart_${roadmapKey}__GLOBAL`;
        let iso = await AsyncStorage.getItem(startKey);
        if (!iso) { iso = startOfDayISO(); await AsyncStorage.setItem(startKey, iso); }
        setPlanStartISO(iso);

        const pro = await isProUser();
        setIsPro(pro);

        const elapsed        = weeksBetween(iso, new Date());
        const requestedWeek  = Number(route?.params?.startAtWeek);
        const initialWeek    =
          Number.isInteger(requestedWeek) && requestedWeek >= 0 ? requestedWeek : Math.max(0, elapsed);

        setUnlockedWeek(Math.max(0, elapsed));
        setWeekToShow(initialWeek);

        // Load dismissed recurring series from storage
        try {
          const raw = await AsyncStorage.getItem(getDismissedRecurringKey(roadmapKey));
          if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) setDismissedSeriesKeys(new Set(arr));
          }
        } catch {}
      } catch (e) {
        console.warn('RoadmapPlan init error', e);
      } finally {
        setLoadingSetup(false);
      }
    };
    init();
  }, [roadmapKey, route?.params?.startAtWeek]);

  const themeKeys = useMemo(() => {
    if (!roadmapKey) return [];
    const t = normalizeTrackKey(roadmapKey, trackKey);
    return getThemeKeysForRoadmap({ roadmapKey, trackKey: t, jobStatusKey });
  }, [roadmapKey, trackKey, jobStatusKey]);

  const sortedTasks = useMemo(() => {
    if (!roadmapKey) return [];
    const allowed = new Set(themeKeys);
    const filterDismissed = (tasks) =>
      tasks.filter((t) => {
        const sk = getRecurringSeriesKey(t);
        return sk === null || !dismissedSeriesKeys.has(sk);
      });
    if (!isPro) {
      const freeGroups = roadmapTasksFree?.[roadmapKey] || {};
      const out = [];
      themeKeys.forEach((themeKey) => {
        const arr = Array.isArray(freeGroups?.[themeKey]) ? freeGroups[themeKey] : [];
        arr.forEach((taskObj, index) => out.push({ ...taskObj, themeKey, __taskIndex: index }));
      });
      return filterDismissed(out.filter((t) => allowed.has(t.themeKey)));
    }
    const premiumFlat = roadmapTasksPremium?.[roadmapKey] || [];
    return filterDismissed(
      premiumFlat
        .filter((t) => allowed.has(t.themeKey))
        .map((taskObj, index) => ({
          ...taskObj,
          __taskIndex: Number.isInteger(taskObj.originalTaskOrder) ? taskObj.originalTaskOrder : index,
        }))
    );
  }, [roadmapKey, themeKeys, isPro, dismissedSeriesKeys]);

  const roadmapProgressPct = useMemo(() => {
    const total     = sortedTasks.length;
    if (!total) return 0;
    const completed = sortedTasks.filter((t) => !!map?.[`${t.themeKey}:${t.__taskIndex}`]?.isCompleted).length;
    return Math.round((completed / total) * 100);
  }, [sortedTasks, map]);

  const weeks = useMemo(() => {
    const wh = Number.isFinite(weeklyHours) && weeklyHours > 0 ? weeklyHours : DEFAULT_WEEKLY_HOURS;
    return bucketTasksByWeek(sortedTasks, wh);
  }, [sortedTasks, weeklyHours]);

  useEffect(() => {
    if (!weeks?.length) return;
    const max = Math.max(0, weeks.length - 1);
    setUnlockedWeek((w) => Math.min(w, max));
    setWeekToShow((w)   => Math.min(w, max));
  }, [weeks?.length]);

  useEffect(() => { setShowOnlyUnfinished(false); }, [weekToShow]);

  useEffect(() => {
    let alive = true;
    const loadBonusWeekState = async () => {
      if (!roadmapKey || !Number.isInteger(weekToShow) || weekToShow < 0) return;
      try {
        const [savedHours, promptHandled] = await AsyncStorage.multiGet([
          getBonusHoursKey(roadmapKey, weekToShow),
          getBonusPromptShownKey(roadmapKey, weekToShow),
        ]).then((pairs) => pairs.map(([, value]) => value));
        if (!alive) return;
        setBonusHoursForWeek(Number(savedHours) || 0);
        setBonusPromptHandled(promptHandled === 'true');
      } catch (e) {
        console.warn('loadBonusWeekState failed', e);
        if (!alive) return;
        setBonusHoursForWeek(0);
        setBonusPromptHandled(false);
      }
    };
    loadBonusWeekState();
    return () => { alive = false; };
  }, [roadmapKey, weekToShow]);

  const needsTrack = useMemo(() => {
    if (!roadmapKey) return false;
    if (!roadmapsConfig?.[roadmapKey]?.tracks) return false;
    // tech_switch track is chosen inside the task "Explore common tech roles and pick your first track"
    // deferTrackSelection: never block setup or show the inline picker upfront for this roadmap
    if (roadmapsConfig?.[roadmapKey]?.deferTrackSelection) return false;
    return roadmapKey === 'new_city' || roadmapKey === 'physical_glow_up';
  }, [roadmapKey]);

  const needsJobStatus  = roadmapKey === 'new_city';
  const trackOptions    = useMemo(() => getTrackOptions(roadmapKey), [roadmapKey]);
  const jobOptions      = useMemo(() => cfg?.jobStatus?.options || [], [cfg]);

  const isSetupBlocking = useMemo(() => {
    if (!roadmapKey) return true;
    if (needsTrack && !trackKey) return true;
    if (needsJobStatus && !jobStatusKey) return true;
    return false;
  }, [roadmapKey, needsTrack, trackKey, needsJobStatus, jobStatusKey]);

  const saveTrack = useCallback(async (next) => {
    const keys = STORAGE_KEYS[roadmapKey] || {};
    if (keys.track) await AsyncStorage.setItem(keys.track, next);
    setTrackKey(next);
  }, [roadmapKey]);

  const saveJobStatus = useCallback(async (next) => {
    const keys = STORAGE_KEYS[roadmapKey] || {};
    if (keys.job) await AsyncStorage.setItem(keys.job, next);
    setJobStatusKey(next);
  }, [roadmapKey]);

  const openDetails = (taskObj) => {
    try {
      const id          = getTaskId(roadmapKey, taskObj.themeKey, taskObj);
      const explanation = taskExplanations?.[id];
      navigation.navigate('TaskDetail', { taskId: id, taskText: taskObj.task, roadmapKey, themeKey: taskObj.themeKey, explanation });
    } catch (e) {
      console.warn('openDetails error', e);
    }
  };

  const unlockedMax = isPro ? (weeks?.length ?? 0) - 1 : unlockedWeek;

  const futureIncompleteTasksPool = useMemo(() => {
    if (!isPro || !Array.isArray(weeks) || !weeks.length) return [];
    const out = [];
    for (let i = weekToShow + 1; i < weeks.length; i += 1) {
      (weeks[i] || []).forEach((taskObj) => {
        if (!map?.[`${taskObj.themeKey}:${taskObj.__taskIndex}`]?.isCompleted) out.push(taskObj);
      });
    }
    return out;
  }, [isPro, weeks, weekToShow, map]);

  const bonusTasksForShownWeek = useMemo(() => {
    if (!isPro || !shownWeekIsCompleted || !bonusHoursForWeek || !futureIncompleteTasksPool.length) return [];
    const selected = [];
    let used = 0;
    for (const taskObj of futureIncompleteTasksPool) {
      const dur     = Number(taskObj?.duration || 0.33);
      const safeDur = Number.isFinite(dur) && dur > 0 ? dur : 0.33;
      if (selected.length === 0 || used + safeDur <= bonusHoursForWeek) {
        selected.push(taskObj);
        used += safeDur;
      }
      if (used >= bonusHoursForWeek) break;
    }
    return selected;
  }, [isPro, shownWeekIsCompleted, bonusHoursForWeek, futureIncompleteTasksPool]);

  const bonusHoursUsed = useMemo(() =>
    prettyHours(bonusTasksForShownWeek.reduce((sum, t) => sum + Number(t?.duration || 0), 0)),
  [bonusTasksForShownWeek]);

  const promptForBonusHours = useCallback(async () => {
    if (!roadmapKey || !isPro || !shownWeekIsCompleted || bonusPromptHandled) return;
    try {
      await AsyncStorage.setItem(getBonusPromptShownKey(roadmapKey, weekToShow), 'true');
      setBonusPromptHandled(true);
      Alert.alert(
        'Week completed early ✨',
        "You've completed the tasks planned for this week. Would you like to add extra hours to this specific week and unlock a few more steps?",
        [
          { text: 'Not now', style: 'cancel' },
          ...EXTRA_HOURS_OPTIONS.map((hours) => ({
            text: `+${hours}h`,
            onPress: async () => {
              try { await AsyncStorage.setItem(getBonusHoursKey(roadmapKey, weekToShow), String(hours)); setBonusHoursForWeek(hours); } catch {}
            },
          })),
        ]
      );
    } catch (e) {
      console.warn('promptForBonusHours failed', e);
    }
  }, [roadmapKey, isPro, shownWeekIsCompleted, bonusPromptHandled, weekToShow]);

  useEffect(() => {
    if (isPro && shownWeekIsCompleted && !bonusPromptHandled) promptForBonusHours();
  }, [isPro, shownWeekIsCompleted, bonusPromptHandled, promptForBonusHours]);

  const openBonusHoursPicker = useCallback(() => {
    if (!roadmapKey || !isPro || !shownWeekIsCompleted) return;
    Alert.alert('Adjust extra hours', 'How many additional hours would you like to add to this specific week?', [
      ...EXTRA_HOURS_OPTIONS.map((hours) => ({
        text: `+${hours}h`,
        onPress: async () => {
          try {
            await AsyncStorage.setItem(getBonusHoursKey(roadmapKey, weekToShow), String(hours));
            await AsyncStorage.setItem(getBonusPromptShownKey(roadmapKey, weekToShow), 'true');
            setBonusHoursForWeek(hours);
            setBonusPromptHandled(true);
          } catch {}
        },
      })),
      {
        text: 'Remove extra hours', style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem(getBonusHoursKey(roadmapKey, weekToShow));
            await AsyncStorage.setItem(getBonusPromptShownKey(roadmapKey, weekToShow), 'true');
            setBonusHoursForWeek(0);
            setBonusPromptHandled(true);
          } catch {}
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [roadmapKey, isPro, shownWeekIsCompleted, weekToShow]);

  const handleToggle = async (taskObj) => {
    // Guard: stale press can arrive after the task list re-renders
    if (!taskObj?.themeKey || taskObj.__taskIndex == null) return;

    const key = `${taskObj.themeKey}:${taskObj.__taskIndex}`;
    if (togglingRef.current.has(key)) return;
    togglingRef.current.add(key);

    // Snapshot sortedTasks now so mid-flight state changes can't corrupt logic below.
    const stableSortedTasks = sortedTasks;

    try {
      const isDone = !!map?.[key]?.isCompleted;

      if (!isDone) {
        // ── Cap enforcement ───────────────────────────────────────────────
        // Check the global free-hours cap BEFORE recording hours or toggling.
        // If the user has hit the limit, show the upsell and bail out early.
        const allowed = await enforceGlobalCap(() => setUpsellVisible(true));
        if (!allowed) {
          togglingRef.current.delete(key);
          return;
        }

        const dur = Number(taskObj.duration ?? 0.33);
        const result = await addFreeHoursUsed(Number.isFinite(dur) && dur > 0 ? dur : 0.33);

        // If adding this task's hours crossed the cap, toggle the task (hours
        // are already written) then immediately show the upsell.
        if (result.hitCap) {
          await toggle(taskObj.themeKey, taskObj.__taskIndex, true);
          try { await updateStreakForCompletedTask(); } catch {}
          try { await refreshDailyRoadmapReminder(); } catch {}
          setUpsellVisible(true);
          togglingRef.current.delete(key);
          return;
        }
      }

      const completionAfterToggle = {};
      stableSortedTasks.forEach((t) => {
        const taskKey = `${t.themeKey}:${t.__taskIndex}`;
        completionAfterToggle[taskKey] = taskKey === key ? !isDone : !!map?.[taskKey]?.isCompleted;
      });

      await toggle(taskObj.themeKey, taskObj.__taskIndex, !isDone);

      if (!isDone) {
        try { await updateStreakForCompletedTask(); } catch (e) { console.warn('updateStreakForCompletedTask failed', e); }
      }

      try { await refreshDailyRoadmapReminder(); } catch (e) { console.warn('refreshDailyRoadmapReminder failed', e); }
      // Stagger the nudge evaluation so it doesn't race with the daily reminder
      // scheduling above — simultaneous scheduleNotificationAsync calls on Android
      // can crash the notification channel.
      await new Promise((resolve) => setTimeout(resolve, 300));
      try { await evaluateTriggeredRoadmapNudges({ trigger: 'task_toggle' }); } catch (e) { console.warn('evaluateTriggeredRoadmapNudges failed', e); }



      if (!isDone) {
        const nextCompletedCount = Object.values(completionAfterToggle).filter(Boolean).length;

        // Mark roadmap complete in storage so HomeScreen / CongratsScreen can read it
        if (nextCompletedCount === stableSortedTasks.length && stableSortedTasks.length > 0) {
          await AsyncStorage.setItem(`roadmapComplete_${roadmapKey}`, 'true');
        }

        setTimeout(() => {
          maybeRepromptNotificationsAfterProgress(nextCompletedCount).catch((e) =>
            console.warn('maybeRepromptNotificationsAfterProgress failed', e)
          );
        }, 800);
      }
    } catch (e) {
      console.error('handleToggle failed', e);
      Alert.alert('Task completion failed', e?.message || 'Something went wrong while updating this task.');
    } finally {
      togglingRef.current.delete(key);
    }
  };

  const handleDismissRecurring = useCallback((taskObj) => {
    const seriesKey = getRecurringSeriesKey(taskObj);
    if (!seriesKey || !roadmapKey) return;

    Alert.alert(
      'Remove recurring task?',
      "This will hide all instances of this recurring task from your roadmap. You can't undo this.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setDismissedSeriesKeys((prev) => {
                const next = new Set(prev);
                next.add(seriesKey);
                AsyncStorage.setItem(
                  getDismissedRecurringKey(roadmapKey),
                  JSON.stringify([...next])
                ).catch(() => {});
                return next;
              });
            } catch (e) {
              console.warn('handleDismissRecurring failed', e);
            }
          },
        },
      ]
    );
  }, [roadmapKey]);

  const premiumPreviewTasks = useMemo(() => {
    if (isPro || !roadmapKey) return [];
    const allowed    = new Set(themeKeys);
    const freeGroups = roadmapTasksFree?.[roadmapKey] || {};
    const premiumFlat= roadmapTasksPremium?.[roadmapKey] || [];
    const freeTaskIds= new Set();
    themeKeys.forEach((themeKey) => {
      const arr = Array.isArray(freeGroups?.[themeKey]) ? freeGroups[themeKey] : [];
      arr.forEach((taskObj) => { try { freeTaskIds.add(getTaskId(roadmapKey, themeKey, taskObj)); } catch {} });
    });
    const preview = [];
    for (let index = 0; index < premiumFlat.length; index += 1) {
      const taskObj = premiumFlat[index];
      if (!allowed.has(taskObj?.themeKey)) continue;
      let taskId = null;
      try { taskId = getTaskId(roadmapKey, taskObj.themeKey, taskObj); } catch {}
      if (taskId && freeTaskIds.has(taskId)) continue;
      preview.push({
        ...taskObj,
        __taskIndex: Number.isInteger(taskObj.originalTaskOrder) ? taskObj.originalTaskOrder : index,
      });
      if (preview.length >= PREMIUM_PREVIEW_COUNT) break;
    }
    return preview;
  }, [isPro, roadmapKey, themeKeys]);

  const backlogTasks = useMemo(() => {
    if (!Array.isArray(weeks) || weeks.length === 0 || unlockedWeek <= 0) return [];
    const out = [];
    const lastBacklogWeek = Math.min(unlockedWeek - 1, weeks.length - 1);
    for (let weekIndex = 0; weekIndex <= lastBacklogWeek; weekIndex += 1) {
      (weeks[weekIndex] || []).forEach((t) => {
        if (!map?.[getTaskRuntimeKey(t)]?.isCompleted) out.push({ ...t, __weekIndex: weekIndex });
      });
    }
    return out;
  }, [weeks, unlockedWeek, map]);

  const firstBacklogWeek = useMemo(() => backlogTasks[0]?.__weekIndex ?? null, [backlogTasks]);

  // How many hours of incomplete tasks are still sitting in previous weeks
  const backlogHours = useMemo(() =>
    backlogTasks.reduce((sum, t) => sum + Number(t?.duration || 0.33), 0),
  [backlogTasks]);

  // Remaining capacity for NEW tasks this week = weekly budget minus backlog hours.
  // Clamped to 0 (if backlog already fills or exceeds the budget) and to the full
  // budget (if there is no backlog at all).
  const newTaskCapacity = useMemo(() => {
    const wh = Number.isFinite(weeklyHours) && weeklyHours > 0 ? weeklyHours : DEFAULT_WEEKLY_HOURS;
    return Math.max(0, wh - backlogHours);
  }, [weeklyHours, backlogHours]);

  // For the current unlocked week, only surface as many new tasks as the user
  // has capacity for after accounting for their backlog hours.
  // e.g. 10h weekly budget - 5h backlog = show only 5h of new tasks this week.
  // When browsing a past week the full bucket is shown (no trimming).
  const weekTasks = useMemo(() => {
    const rawTasks = weeks?.[weekToShow] || [];
    const isCurrentWeek = weekToShow === unlockedWeek;
    if (!isCurrentWeek || newTaskCapacity >= weeklyHours) return rawTasks;
    if (newTaskCapacity <= 0) return [];
    // Greedily include tasks up to the remaining capacity
    const result = [];
    let used = 0;
    for (const t of rawTasks) {
      const dur = Number(t?.duration || 0.33);
      if (used + dur > newTaskCapacity && result.length > 0) break;
      result.push(t);
      used += dur;
    }
    return result;
  }, [weeks, weekToShow, unlockedWeek, newTaskCapacity, weeklyHours]);

  const visibleWeekTasks = useMemo(() => {
    if (!showOnlyUnfinished) return weekTasks;
    return weekTasks.filter((t) => !map?.[`${t.themeKey}:${t.__taskIndex}`]?.isCompleted);
  }, [weekTasks, showOnlyUnfinished, map]);

  const completedWeekTasksCount = useMemo(() =>
    weekTasks.filter((t) => !!map?.[`${t.themeKey}:${t.__taskIndex}`]?.isCompleted).length,
  [weekTasks, map]);

  const shownWeekIsCompleted = useMemo(() =>
    weekTasks.length > 0 && completedWeekTasksCount === weekTasks.length,
  [weekTasks, completedWeekTasksCount]);

  const momentumTasks = useMemo(() => pickMomentumTasks(backlogTasks), [backlogTasks]);

  const momentumModeActive = useMemo(() =>
    weekToShow === unlockedWeek && backlogTasks.length >= MOMENTUM_TRIGGER_MISSED && momentumTasks.length > 0,
  [weekToShow, unlockedWeek, backlogTasks.length, momentumTasks.length]);

  const momentumHours = useMemo(() =>
    prettyHours(momentumTasks.reduce((sum, t) => sum + Number(t.duration || 0), 0)),
  [momentumTasks]);

  const renderTaskCard = (t, badgeText = null) => {
    const k          = `${t.themeKey}:${t.__taskIndex}`;
    const isDone     = !!map?.[k]?.isCompleted;
    const isRecurring = getRecurringSeriesKey(t) !== null;

    return (
      <View key={`${badgeText || 'task'}-${k}`} style={[PLAN_UI.card, isDone && PLAN_UI.cardDone]}>
        {!!badgeText && (
          <View style={styles.badgeWrap}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        )}
        <Text style={styles.themeLabel}>{getThemeLabel(roadmapKey, t.themeKey, trackKey)}</Text>
        <Text style={[PLAN_UI.cardText, isDone && PLAN_UI.cardTextDone]}>{t.task}</Text>
        <Text style={PLAN_UI.duration}>~{Number(t.duration || 0.33)}h</Text>
        <View style={styles.rowBtns}>
          <TouchableOpacity onPress={() => handleToggle(t)} style={[PLAN_BUTTONS.smallBase, PLAN_BUTTONS.primarySmall]} activeOpacity={0.85}>
            <Text style={PLAN_BUTTONS.primarySmallText}>{isDone ? 'Unmark' : 'Mark complete'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openDetails(t)} style={[PLAN_BUTTONS.smallBase, PLAN_BUTTONS.secondarySmall]} activeOpacity={0.85}>
            <Text style={PLAN_BUTTONS.secondarySmallText}>Details</Text>
          </TouchableOpacity>
          {isRecurring && (
            <TouchableOpacity
              onPress={() => handleDismissRecurring(t)}
              style={[PLAN_BUTTONS.smallBase, styles.dismissRecurringBtn]}
              activeOpacity={0.85}
            >
              <Text style={styles.dismissRecurringBtnText}>Remove recurring</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderPremiumPreviewCard = (t, index) => (
    <TouchableOpacity
      key={`premium-preview-${t.themeKey}-${t.__taskIndex}-${index}`}
      onPress={() => setUpsellVisible(true)}
      activeOpacity={0.9}
      style={[PLAN_UI.card, styles.previewCard]}
    >
      <View style={styles.previewTopRow}>
        <View style={styles.previewBadge}><Text style={styles.previewBadgeText}>Premium</Text></View>
        <Text style={styles.previewLock}>🔒</Text>
      </View>
      <Text style={[PLAN_UI.cardText, styles.previewCardText]}>{t.task}</Text>
      <Text style={PLAN_UI.duration}>~{Number(t.duration || 0.33)}h</Text>
      <Text style={styles.previewHint}>Upgrade to unlock this step</Text>
    </TouchableOpacity>
  );

  const SetupBlock = () => (
    <View style={styles.setupWrap}>
      {needsTrack && (
        <View style={styles.setupSection}>
          <Text style={styles.setupTitle}>
            {roadmapKey === 'tech_switch' ? 'Pick your tech track'
              : roadmapKey === 'new_city' ? 'Moving Country vs Moving City'
              : 'Pick your workout track'}
          </Text>
          <View style={{ gap: 10, marginTop: 10 }}>
            {trackOptions.map((o) => {
              const active = normalizeTrackKey(roadmapKey, trackKey) === o.key;
              return (
                <TouchableOpacity key={o.key} onPress={() => saveTrack(o.key)} style={[styles.optionCard, active && styles.optionCardActive]} activeOpacity={0.9}>
                  <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>{o.label}</Text>
                  <Text style={styles.optionHint}>Tap to select</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
      {needsJobStatus && (
        <View style={[styles.setupSection, { marginTop: 14 }]}>
          <Text style={styles.setupTitle}>{cfg?.jobStatus?.title || "What's your job situation?"}</Text>
          <View style={{ gap: 10, marginTop: 10 }}>
            {jobOptions.map((o) => {
              const active = jobStatusKey === o.key;
              return (
                <TouchableOpacity key={o.key} onPress={() => saveJobStatus(o.key)} style={[styles.optionCard, active && styles.optionCardActive]} activeOpacity={0.9}>
                  <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>{o.emoji ? `${o.emoji} ` : ''}{o.title || o.key}</Text>
                  {!!o.blurb && <Text style={styles.optionHint}>{o.blurb}</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );

  // ─── TrackSwitcher: always-visible collapsible track selector ────────────────
  const trackSwitcherTitle =
    roadmapKey === 'tech_switch' ? 'Tech track'
      : roadmapKey === 'new_city' ? 'Move type & job situation'
      : 'Workout track';

  const activeTrackLabel = trackOptions.find(
    (o) => o.key === normalizeTrackKey(roadmapKey, trackKey)
  )?.label || trackKey || '—';

  const activeJobLabel = jobOptions.find((o) => o.key === jobStatusKey)?.title
    || jobOptions.find((o) => o.key === jobStatusKey)?.key
    || null;

  const trackSwitcherSummary = roadmapKey === 'new_city' && activeJobLabel
    ? `${activeTrackLabel} · ${activeJobLabel}`
    : activeTrackLabel;

  const TrackSwitcher = () => (
    <View style={styles.trackSwitcherWrap}>
      <TouchableOpacity
        onPress={() => setTrackExpanded((v) => !v)}
        activeOpacity={0.85}
        style={styles.trackSwitcherHeader}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.trackSwitcherEyebrow}>{trackSwitcherTitle}</Text>
          <Text style={styles.trackSwitcherValue} numberOfLines={1}>{trackSwitcherSummary}</Text>
        </View>
        <Text style={styles.trackSwitcherChevron}>{trackExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {trackExpanded && (
        <View style={{ marginTop: 10, gap: 8 }}>
          {/* Track options */}
          {trackOptions.map((o) => {
            const active = normalizeTrackKey(roadmapKey, trackKey) === o.key;
            return (
              <TouchableOpacity
                key={o.key}
                onPress={() => { saveTrack(o.key); }}
                style={[styles.optionCard, active && styles.optionCardActive]}
                activeOpacity={0.9}
              >
                <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>{o.label}</Text>
                {active
                  ? <Text style={[styles.optionHint, { color: colors.deepRose }]}>Currently selected</Text>
                  : <Text style={styles.optionHint}>Tap to switch</Text>
                }
              </TouchableOpacity>
            );
          })}

          {/* Job status options — new_city only */}
          {needsJobStatus && jobOptions.length > 0 && (
            <>
              <Text style={[styles.trackSwitcherEyebrow, { marginTop: 8 }]}>
                {cfg?.jobStatus?.title || "Job situation"}
              </Text>
              {jobOptions.map((o) => {
                const active = jobStatusKey === o.key;
                return (
                  <TouchableOpacity
                    key={o.key}
                    onPress={() => { saveJobStatus(o.key); }}
                    style={[styles.optionCard, active && styles.optionCardActive]}
                    activeOpacity={0.9}
                  >
                    <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>
                      {o.emoji ? `${o.emoji} ` : ''}{o.title || o.key}
                    </Text>
                    {active
                      ? <Text style={[styles.optionHint, { color: colors.deepRose }]}>Currently selected</Text>
                      : !!o.blurb && <Text style={styles.optionHint}>{o.blurb}</Text>
                    }
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {/* Collapse button */}
          <TouchableOpacity
            onPress={() => setTrackExpanded(false)}
            activeOpacity={0.8}
            style={styles.trackSwitcherCollapseBtn}
          >
            <Text style={styles.trackSwitcherCollapseBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // ── Tech-track banner — shows selected role above the week navigator ──────────
  // Only visible once the user has picked a track inside the "Explore common tech roles" task.
  const TechTrackBanner = () => {
    if (roadmapKey !== 'tech_switch') return null;
    if (!techRole) return null;
    return (
      <View style={techBannerStyles.wrap}>
        <View style={techBannerStyles.left}>
          <Text style={techBannerStyles.eyebrow}>YOUR TRACK</Text>
          <Text style={techBannerStyles.role} numberOfLines={1}>{techRole}</Text>
          {techTrack ? (
            <View style={techBannerStyles.pill}>
              <Text style={techBannerStyles.pillText}>{techTrack.toUpperCase()}</Text>
            </View>
          ) : null}
        </View>
        <TouchableOpacity
          style={techBannerStyles.changeBtn}
          onPress={() => navigation.navigate('TechSwitchRole')}
          activeOpacity={0.8}
        >
          <Text style={techBannerStyles.changeBtnText}>Change</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const WeekNav = () => {
    const max          = Math.max(0, weeks.length - 1);
    const canPrev      = weekToShow > 0;
    const canNext      = weekToShow < Math.min(max, unlockedMax);
    const displayTasks = showOnlyUnfinished ? visibleWeekTasks : weekTasks;
    const weekHours    = prettyHours(displayTasks.reduce((sum, t) => sum + Number(t.duration || 0), 0));

    return (
      <View style={styles.weekHeader}>
        <TouchableOpacity onPress={() => setWeekToShow((w) => Math.max(0, w - 1))} disabled={!canPrev} style={[styles.weekNavBtn, !canPrev && styles.weekNavBtnDisabled]}>
          <Text style={styles.weekNavTxt}>◀</Text>
        </TouchableOpacity>

        <View style={{ alignItems: 'center', flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.weekTitle}>Week {weekToShow + 1}</Text>
            <HintButton
              title="How weeks work"
              body="Your tasks are spread across weeks based on how much time you committed. If you have incomplete tasks from earlier weeks, this week's new tasks are reduced to keep your total workload within your weekly hours. Finish your backlog to unlock the full week."
            />
          </View>
          <Text style={styles.weekMeta}>{displayTasks.length} steps · ~{weekHours}h</Text>
        </View>

        <TouchableOpacity onPress={() => setWeekToShow((w) => Math.min(Math.min(max, unlockedMax), w + 1))} disabled={!canNext} style={[styles.weekNavBtn, !canNext && styles.weekNavBtnDisabled]}>
          <Text style={styles.weekNavTxt}>▶</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!roadmapKey) {
    return (
      <PlanLayout title="Plan" subtitle="Missing roadmapKey" loading={false}>
        <Text style={{ textAlign: 'center', color: PLAN_THEME.textSecondary }}>
          No roadmapKey passed. Navigate with: navigation.navigate('RoadmapPlan', {`{ roadmapKey: 'new_city' }`})
        </Text>
      </PlanLayout>
    );
  }

  return (
    <PlanLayout
      title={cfg?.label || 'Your Plan'}
      subtitle={
        isPro
          ? 'Your weekly plan, adapted to urgency and your progress.'
          : 'Your weekly plan, organised one theme at a time.'
      }
      loading={loadingSetup || progressLoading}
    >
      <PremiumUpsellModal visible={upsellVisible} onClose={() => setUpsellVisible(false)} />

      {isSetupBlocking ? (
        <SetupBlock />
      ) : (
        <>
          {roadmapKey !== 'tech_switch' && (needsTrack || (trackKey && trackOptions.length > 0)) && <TrackSwitcher />}
          <TechTrackBanner />
          <WeekNav />

          <View style={styles.filterRow}>
            <TouchableOpacity
              onPress={() => setShowOnlyUnfinished((prev) => !prev)}
              style={[styles.filterChip, showOnlyUnfinished && styles.filterChipActive]}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterChipText, showOnlyUnfinished && styles.filterChipTextActive]}>
                {showOnlyUnfinished ? 'Showing unfinished only' : 'Show unfinished only'}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.filterMeta}>{completedWeekTasksCount}/{weekTasks.length} done</Text>
              <HintButton
                title="Filtering tasks"
                body="Tap 'Show unfinished only' to hide completed tasks and focus on what's left. The count on the right shows how many you've done this week."
              />
            </View>
          </View>

          <View style={styles.progressRow}>
            <View style={styles.progressPill}>
              <Text style={styles.progressPillText}>Roadmap progress: {roadmapProgressPct}%</Text>
            </View>
            <HintButton
              title="Overall progress"
              body="This shows your progress across all tasks in your entire roadmap, not just this week. Complete tasks each week to move this number forward."
            />
          </View>

          {momentumModeActive && (
            <View style={styles.momentumWrap}>
              <Text style={styles.momentumEyebrow}>Momentum Mode</Text>
              <Text style={styles.momentumTitle}>Let&apos;s get you back into the flow.</Text>
              <Text style={styles.momentumBody}>
                You have {backlogTasks.length} earlier steps still open, so here is a lighter catch-up plan for today.
              </Text>
              <Text style={styles.momentumMeta}>Today&apos;s reset: {momentumTasks.length} steps · ~{momentumHours}h</Text>

              <View style={{ marginTop: 12 }}>
                {momentumTasks.map((t, idx) => renderTaskCard(t, idx === 0 ? 'Quick win' : 'Core focus'))}
              </View>

              {typeof firstBacklogWeek === 'number' && (
                <TouchableOpacity
                  onPress={() => setWeekToShow(firstBacklogWeek)}
                  style={[PLAN_BUTTONS.smallBase, PLAN_BUTTONS.secondarySmall, { marginTop: 8, alignSelf: 'flex-start' }]}
                  activeOpacity={0.85}
                >
                  <Text style={PLAN_BUTTONS.secondarySmallText}>View earlier week</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {isPro && shownWeekIsCompleted && bonusTasksForShownWeek.length > 0 && (
            <View style={styles.extraTasksSection}>
              <View style={styles.extraTasksHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.extraTasksTitle}>Extra tasks for this week</Text>
                  <HintButton
                    title="Bonus hours"
                    body="You finished this week's tasks early! These bonus steps come from future weeks. They fit the extra time you added. You can adjust the hours using the chip on the right."
                  />
                </View>
                <TouchableOpacity onPress={openBonusHoursPicker} activeOpacity={0.85} style={styles.extraTasksChip}>
                  <Text style={styles.extraTasksChipText}>{bonusHoursForWeek > 0 ? `~${bonusHoursForWeek}h added` : 'Adjust'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.extraTasksSubtitle}>
                You finished this week early, so here are a few extra premium steps that fit the additional time you added.
              </Text>
              <Text style={styles.extraTasksMeta}>
                {bonusTasksForShownWeek.length} extra step{bonusTasksForShownWeek.length === 1 ? '' : 's'} · ~{bonusHoursUsed}h
              </Text>
              {bonusTasksForShownWeek.map((t) => renderTaskCard(t, 'Extra task'))}
            </View>
          )}

          {isPro && shownWeekIsCompleted && bonusTasksForShownWeek.length === 0 && (
            <TouchableOpacity onPress={openBonusHoursPicker} activeOpacity={0.9} style={styles.addExtraHoursCard}>
              <Text style={styles.addExtraHoursTitle}>Finished this week early?</Text>
              <Text style={styles.addExtraHoursText}>Add extra hours to this specific week and unlock a few more premium tasks.</Text>
            </TouchableOpacity>
          )}

          {!isPro && premiumPreviewTasks.length > 0 && (
            <View style={styles.previewSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Text style={styles.sectionTitle}>✨ Premium steps</Text>
                <HintButton
                  title="Premium tasks"
                  body="These are a preview of the additional tasks that unlock with Premium. They go deeper into each theme, giving you a more comprehensive roadmap experience."
                />
              </View>
              <Text style={styles.previewSectionSubtitle}>A little preview of what unlocks with Premium.</Text>
              {premiumPreviewTasks.map((t, index) => renderPremiumPreviewCard(t, index))}
            </View>
          )}

          <View style={{ marginTop: 12 }}>
            {momentumModeActive && <Text style={styles.sectionTitle}>Your normal week plan</Text>}

            {visibleWeekTasks.length > 0 ? (
              visibleWeekTasks.map((t) => renderTaskCard(t))
            ) : (
              <View style={styles.emptyFilterState}>
                <Text style={styles.emptyFilterTitle}>Everything here is completed ✨</Text>
                <Text style={styles.emptyFilterText}>Switch the filter off to see all tasks for this week again.</Text>
              </View>
            )}
          </View>
        </>
      )}

      <CoachMarkOverlay
        visible={coachLoaded && !coachSeen && !loadingSetup && !progressLoading}
        onDone={markCoachSeen}
        steps={ROADMAP_PLAN_COACH_STEPS}
      />
    </PlanLayout>
  );
}

const styles = StyleSheet.create({
  setupWrap: {
    backgroundColor: PLAN_THEME.cardBg, borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: colors.softBorder,
  },
  trackSwitcherWrap: {
    backgroundColor: PLAN_THEME.cardBg, borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: colors.softBorder, marginBottom: 10,
  },
  trackSwitcherHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  trackSwitcherEyebrow: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.5,
    color: PLAN_THEME.textSecondary, textTransform: 'uppercase', marginBottom: 2,
  },
  trackSwitcherValue: {
    fontSize: 14, fontWeight: '800', color: PLAN_THEME.textPrimary,
  },
  trackSwitcherChevron: {
    fontSize: 11, fontWeight: '800', color: PLAN_THEME.textSecondary, paddingHorizontal: 4,
  },
  trackSwitcherCollapseBtn: {
    marginTop: 4, alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 999, backgroundColor: colors.deepRose,
  },
  trackSwitcherCollapseBtnText: {
    fontSize: 13, fontWeight: '800', color: colors.white,
  },
  setupSection:     { paddingVertical: 6 },
  setupTitle:       { fontSize: 16, fontWeight: '800', color: PLAN_THEME.textPrimary, textAlign: 'center' },
  optionCard:       { backgroundColor: colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.softBorder },
  optionCardActive: { borderColor: colors.deepRose, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  optionTitle:      { fontSize: 15, fontWeight: '800', color: PLAN_THEME.textPrimary },
  optionTitleActive:{ color: PLAN_THEME.textPrimary },
  optionHint:       { marginTop: 6, color: PLAN_THEME.textSecondary, opacity: 0.8, fontSize: 12 },

  weekHeader: {
    marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, paddingHorizontal: 6, borderRadius: 14,
    borderWidth: 1, borderColor: PLAN_THEME.borderLight, backgroundColor: PLAN_THEME.cardBg,
  },
  weekNavBtn:         { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: PLAN_THEME.borderLight, alignItems: 'center', justifyContent: 'center', backgroundColor: PLAN_THEME.cardBg },
  weekNavBtnDisabled: { opacity: 0.4 },
  weekNavTxt:         { fontSize: 18, fontWeight: '800', color: PLAN_THEME.textSecondary },
  weekTitle:          { fontSize: 16, fontWeight: '900', color: PLAN_THEME.textPrimary },
  weekMeta:           { fontSize: 12, color: PLAN_THEME.subtleText, marginTop: 2 },

  filterRow: {
    marginTop: 12, marginBottom: 4, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', gap: 10,
  },
  filterChip:         { backgroundColor: PLAN_THEME.cardBg, borderWidth: 1, borderColor: PLAN_THEME.borderLight, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999 },
  filterChipActive:   { borderColor: colors.deepRose, backgroundColor: colors.roseTint08 },
  filterChipText:     { fontSize: 13, fontWeight: '700', color: PLAN_THEME.textSecondary },
  filterChipTextActive:{ color: colors.deepRose },
  filterMeta:         { fontSize: 12, color: PLAN_THEME.subtleText, fontWeight: '700' },

  progressRow: {
    marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  progressPill: {
    alignSelf: 'center', backgroundColor: colors.roseTint08,
    borderWidth: 1, borderColor: colors.roseTint18, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999,
  },
  progressPillText: { fontSize: 13, fontWeight: '800', color: colors.deepRose },

  momentumWrap: {
    marginTop: 14, backgroundColor: PLAN_THEME.cardBg, borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: colors.softBorder,
  },
  momentumEyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4, color: PLAN_THEME.textSecondary, textTransform: 'uppercase' },
  momentumTitle:   { marginTop: 4, fontSize: 18, fontWeight: '900', color: PLAN_THEME.textPrimary },
  momentumBody:    { marginTop: 8, fontSize: 14, lineHeight: 20, color: PLAN_THEME.textSecondary },
  momentumMeta:    { marginTop: 8, fontSize: 13, fontWeight: '700', color: PLAN_THEME.textPrimary },

  sectionTitle: { marginBottom: 10, fontSize: 14, fontWeight: '800', color: PLAN_THEME.textPrimary },

  badgeWrap: {
    alignSelf: 'flex-start', marginBottom: 8, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 999, backgroundColor: colors.roseTint08, borderWidth: 1, borderColor: colors.roseTint18,
  },
  badgeText: { fontSize: 11, fontWeight: '800', color: colors.deepRose },

  rowBtns: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' },

  dismissRecurringBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.fawn,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  dismissRecurringBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.caption,
  },

  emptyFilterState: {
    marginTop: 8, padding: 16, borderRadius: 14,
    borderWidth: 1, borderColor: PLAN_THEME.borderLight, backgroundColor: PLAN_THEME.cardBg,
  },
  emptyFilterTitle: { fontSize: 14, fontWeight: '800', color: PLAN_THEME.textPrimary },
  emptyFilterText:  { marginTop: 6, fontSize: 13, lineHeight: 19, color: PLAN_THEME.textSecondary },

  extraTasksSection: { marginTop: 18, gap: 10 },
  extraTasksHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  extraTasksTitle:   { fontSize: 16, fontWeight: '800', color: PLAN_THEME.textPrimary },
  extraTasksSubtitle:{ fontSize: 13, lineHeight: 19, color: PLAN_THEME.textSecondary },
  extraTasksMeta:    { fontSize: 12, fontWeight: '700', color: PLAN_THEME.subtleText, marginTop: -2 },
  extraTasksChip:    { backgroundColor: colors.roseTint08, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.roseTint18 },
  extraTasksChipText:{ color: colors.deepRose, fontWeight: '800', fontSize: 12 },

  addExtraHoursCard: { marginTop: 18, backgroundColor: colors.linen, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.fawn },
  addExtraHoursTitle:{ fontSize: 16, fontWeight: '800', color: PLAN_THEME.textPrimary, marginBottom: 4 },
  addExtraHoursText: { fontSize: 13, lineHeight: 19, color: PLAN_THEME.textSecondary },

  previewSection:        { marginTop: 18 },
  previewSectionSubtitle:{ marginTop: -2, marginBottom: 10, fontSize: 12, color: PLAN_THEME.textSecondary, opacity: 0.9 },
  previewCard:           { opacity: 0.75, borderStyle: 'dashed' },
  previewTopRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  previewBadge:          { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.roseTint08, borderWidth: 1, borderColor: colors.roseTint18 },
  previewBadgeText:      { fontSize: 11, fontWeight: '800', color: colors.deepRose },
  previewLock:           { fontSize: 16 },
  previewCardText:       { opacity: 0.95 },
  previewHint:           { marginTop: 10, fontSize: 12, fontWeight: '700', color: PLAN_THEME.textSecondary },

  themeLabel: { fontSize: 12, fontWeight: '700', color: PLAN_THEME.highlight, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
});

// Styles for the tech-track role banner above the week navigator
// Colour scheme mirrors the task cards (offWhite bg, subtleBorder, deepRose accents)
const techBannerStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.offWhite,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.subtleBorder,
  },
  left:    { flex: 1, marginRight: 10 },
  eyebrow: { fontSize: 10, fontWeight: '800', color: colors.bodyMuted, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2 },
  role:    { fontSize: 15, fontWeight: '700', color: colors.ink },
  pill: {
    alignSelf: 'flex-start',
    marginTop: 5,
    backgroundColor: colors.roseTint08,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.roseTint18,
  },
  pillText:      { color: colors.deepRose, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  changeBtn:     { backgroundColor: colors.deepRose, borderRadius: 8, paddingHorizontal: 13, paddingVertical: 9 },
  changeBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 },
});