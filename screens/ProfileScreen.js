// screens/ProfileScreen.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  TextInput,
  StatusBar,
  Animated,
  Linking,
  Platform,
  Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { roadmapTasks } from './roadmapTasks';
import { exportCurrentWeekToICS } from '../lib/calendarExport';
import { roadmapsConfig } from '../config/roadmapsConfig';
import { supabase } from '../lib/supabase';
import PremiumUpsellModal from '../components/PremiumUpsellModal';
import { TermsOfService } from './TermsOfServiceScreen';
import { PrivacyPolicy } from './PrivacyPolicyScreen';
import { colors, shadows, spacing, radii, typography } from './theme';

// ─── Reminder constants ───────────────────────────────────────────────────────
const TASK_TIME_KEY              = 'preferredTaskTimeLabel';
const TASK_TIME_HOUR_KEY         = 'preferredTaskTimeHour';
const TASK_TIME_MINUTE_KEY       = 'preferredTaskTimeMinute';
const TASK_REMINDER_HOUR_KEY     = 'preferredTaskReminderHour';
const TASK_REMINDER_MINUTE_KEY   = 'preferredTaskReminderMinute';
const NOTIFICATIONS_CHOICE_KEY   = 'taskReminderChoice';
const NOTIFICATIONS_ENABLED_KEY  = 'notificationsEnabled';
const NOTIFICATIONS_PERMISSION_KEY = 'notificationsPermissionStatus';
const DAILY_NOTIFICATION_ID_KEY  = 'dailyTaskReminderNotificationId';
const ROADMAP_REMINDER_ENABLED_KEY = 'roadmapReminderEnabled';

const TASK_TIME_OPTIONS = [
  { label: 'Before work',          hour: 7,  minute: 30 },
  { label: 'Morning',              hour: 9,  minute: 0  },
  { label: 'Straight after work',  hour: 17, minute: 45 },
  { label: 'After dinner',         hour: 19, minute: 30 },
  { label: 'Evening',              hour: 20, minute: 30 },
  { label: 'Before going to bed',  hour: 22, minute: 15 },
];

const findTaskTimeOption = (label) =>
  TASK_TIME_OPTIONS.find((o) => o.label === label) || TASK_TIME_OPTIONS[3];

const subtractMinutes = (hour, minute, minus) => {
  const total = hour * 60 + minute - minus;
  const n = ((total % 1440) + 1440) % 1440;
  return { hour: Math.floor(n / 60), minute: n % 60 };
};

async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('daily-reminders', {
    name: 'Daily reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 150, 150, 150],
    lightColor: colors.dustyRose,
  });
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TRACK_KEY               = 'techSwitchTrack';
const NEW_CITY_TRACK_KEY      = 'newCityTrack';
const NEW_CITY_JOB_STATUS_KEY = 'newCityJobStatus';
const PHYSICAL_TRACK_KEY      = 'physicalGlowUpTrack';

const ALL_ROADMAP_KEYS = [
  'new_city', 'tech_switch', 'financial_glow_up', 'physical_glow_up', 'mental_glow_up',
];

const ONBOARDING_RESET_KEYS = [
  'quizCompleted', 'onboarded', 'recommendedRoadmap', 'timeCommitmentHours',
  'dailyTimeBudgetHours', 'weeklyTaskTarget', 'weekdayDailyBudgetHours',
  'weekendDailyBudgetHours', TRACK_KEY, NEW_CITY_TRACK_KEY, NEW_CITY_JOB_STATUS_KEY,
  PHYSICAL_TRACK_KEY, 'streak_last_date', 'streak_count', 'streak_best',
  'intro.v1.seen', 'auth.firstLogin.seen', 'lastUserId',
];

// ─── Coach mark key ───────────────────────────────────────────────────────────
const PROFILE_COACH_KEY = 'hint.profileScreen.coach.v1.seen';

// ─── Coach mark steps ─────────────────────────────────────────────────────────
const PROFILE_COACH_STEPS = [
  {
    emoji: '👤',
    title: 'Your profile',
    body: 'This is where your plan settings live; your roadmap, time commitment, and progress. Tap "Re-personalise" to update these at any time.',
  },
  {
    emoji: '🔔',
    title: 'Daily reminders',
    body: 'Set a push notification to nudge you 15 minutes before your planned task time. You can change or disable this here whenever you like.',
  },
  {
    emoji: '📅',
    title: 'Export to calendar',
    body: 'Premium members can export this week\'s tasks directly into their device calendar — no file needed. Tasks are added straight to Apple Calendar, Google Calendar, or whichever calendar app you use.',
  },
];

const trackLabelMap = {
  data:     'Data (Analytics / Science / ML)',
  ai:       'AI / Machine Learning',
  frontend: 'Frontend',
  product:  'Product Management',
  ux:       'UX / Product Design',
  devops:   'DevOps / Platform',
};

const newCityTrackLabelMap = {
  moving_country:  'Moving Country',
  moving_city_only:'Moving City (same country)',
  moving_city:     'Moving City (same country)',
};

const newCityJobStatusLabelMap = {
  job_secured: 'Job secured',
  job_needed:  'Job needed',
};

const physicalTrackLabelMap = {
  gym:  'Working out in a gym',
  home: 'Working out at home',
};

const roadmapLabels = {
  new_city:          'Starting Over in a New City',
  tech_switch:       'Switching Into Tech',
  financial_glow_up: 'Financial Glow-Up',
  physical_glow_up:  'Physical Glow-Up',
  mental_glow_up:    'Mental Glow-Up',
};

const PRIVACY_POLICY_URL = 'https://thereinventionedit.com/privacy-policy-1';

const pretty = (v, digits = 2) =>
  v === null || v === undefined || Number.isNaN(v) ? '—' : Number(v).toFixed(digits);

const DEFAULT_TASK_HOURS = 0.33;
const FREE_CAP_HOURS     = 20;

// ─── Palette (legacy local — ProfileScreen predates theme.js) ─────────────────
const C = {
  linen:      '#ede6d8',
  warmWhite:  '#faf7f2',
  offWhite:   '#f5f0e6',
  dustyRose:  '#c8948e',
  deepRose:   '#7a3535',
  midRose:    '#a04848',
  sage:       '#5a7358',
  clay:       '#a0613a',
  ink:        '#1e150e',
  fawn:       '#ddd2c0',
  champagne:  '#c8b89e',
  softBorder: 'rgba(30,21,14,0.10)',
  caption:    'rgba(30,21,14,0.42)',
};

// ─── Shared roadmap helpers ───────────────────────────────────────────────────

const loadProfileTracks = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('tech_switch_track, physical_glow_up_track, new_city_track, new_city_job_status')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.warn('Failed to load profile tracks:', error.message);
      return;
    }

    if (data?.tech_switch_track) {
      await AsyncStorage.setItem(TRACK_KEY, data.tech_switch_track);
    }

    if (data?.physical_glow_up_track) {
      await AsyncStorage.setItem(PHYSICAL_TRACK_KEY, data.physical_glow_up_track);
    }

    if (data?.new_city_track) {
      await AsyncStorage.setItem(NEW_CITY_TRACK_KEY, data.new_city_track);
    }

    if (data?.new_city_job_status) {
      await AsyncStorage.setItem(NEW_CITY_JOB_STATUS_KEY, data.new_city_job_status);
    }

  } catch (e) {
    console.warn('Error loading profile tracks:', e?.message || e);
  }
};

const syncTracksToSupabase = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const techTrack = await AsyncStorage.getItem(TRACK_KEY);
    const physicalTrack = await AsyncStorage.getItem(PHYSICAL_TRACK_KEY);
    const newCityTrack = await AsyncStorage.getItem(NEW_CITY_TRACK_KEY);
    const jobStatus = await AsyncStorage.getItem(NEW_CITY_JOB_STATUS_KEY);

    const { error } = await supabase
      .from('profiles')
      .update({
        tech_switch_track: techTrack || null,
        physical_glow_up_track: physicalTrack || null,
        new_city_track: newCityTrack || null,
        new_city_job_status: jobStatus || null,
      })
      .eq('id', session.user.id);

    if (error) {
      console.warn('Failed to sync tracks:', error.message);
    }

  } catch (e) {
    console.warn('Error syncing tracks:', e?.message || e);
  }
};

const getRoadmapStorageKey = (userId, roadmapKey) => {
  if (!userId || !roadmapKey) return null;
  return `progress_cache_${userId}_${roadmapKey}`;
};

const normalizeTrackKey = (roadmapKey, trackKey) => {
  if (roadmapKey !== 'new_city') return trackKey;
  return trackKey === 'moving_city_only' ? 'moving_city' : trackKey;
};

const getThemeKeysForRoadmap = ({ roadmapKey, trackKey, jobStatusKey }) => {
  const cfg = roadmapsConfig?.[roadmapKey] || {};

  if (roadmapKey === 'new_city') {
    const tKey       = normalizeTrackKey(roadmapKey, trackKey);
    const baseThemes =
      (tKey && cfg?.tracks?.[tKey]?.themes?.map((t) => t.key)) ||
      (cfg?.themes?.map((t) => t.key)) ||
      Object.keys(roadmapTasks?.[roadmapKey] || {});
    const opt     = cfg?.jobStatus?.options?.find((o) => o.key === jobStatusKey);
    const prepend = opt?.presets?.prependThemes || [];
    const hide    = new Set(opt?.presets?.hideThemes || []);
    const ordered = [...new Set([...prepend, ...baseThemes])];
    return ordered.filter((k) => !hide.has(k) && roadmapTasks?.[roadmapKey]?.[k]);
  }

  if (roadmapKey === 'tech_switch') {
    if (trackKey && cfg?.tracks?.[trackKey]?.themes)
      return cfg.tracks[trackKey].themes.map((t) => t.key);
    if (Array.isArray(cfg?.generalThemes)) return cfg.generalThemes.map((t) => t.key);
    return Object.keys(roadmapTasks?.[roadmapKey] || {});
  }

  if (roadmapKey === 'physical_glow_up') {
    if (trackKey && cfg?.tracks?.[trackKey]?.themes)
      return cfg.tracks[trackKey].themes.map((t) => t.key);
    return Object.keys(roadmapTasks?.[roadmapKey] || {});
  }

  if (Array.isArray(cfg?.themes)) return cfg.themes.map((t) => t.key);
  return Object.keys(roadmapTasks?.[roadmapKey] || {});
};

const buildRoadmapTaskList = ({ roadmapKey, trackKey, jobStatusKey }) => {
  if (!roadmapKey || !roadmapTasks?.[roadmapKey]) return [];
  const themeKeys = getThemeKeysForRoadmap({ roadmapKey, trackKey, jobStatusKey });
  const groups    = roadmapTasks?.[roadmapKey] || {};
  const out       = [];
  themeKeys.forEach((themeKey) => {
    const arr = Array.isArray(groups?.[themeKey]) ? groups[themeKey] : [];
    arr.forEach((taskObj, index) => out.push({ ...taskObj, themeKey, __taskIndex: index }));
  });
  return out;
};

const computeRoadmapHoursProgress = async ({ userId, roadmapKey, trackKey, jobStatusKey }) => {
  const tasks = buildRoadmapTaskList({ roadmapKey, trackKey, jobStatusKey });
  const total = tasks.reduce((sum, t) => {
    const dur = Number.isFinite(Number(t?.duration)) ? Number(t.duration) : DEFAULT_TASK_HOURS;
    return sum + dur;
  }, 0);
  const storageKey  = getRoadmapStorageKey(userId, roadmapKey);
  const raw         = storageKey ? await AsyncStorage.getItem(storageKey) : null;
  let progressMap   = {};
  try { progressMap = raw ? JSON.parse(raw) : {}; } catch { progressMap = {}; }
  const invested = tasks.reduce((sum, t) => {
    const key         = `${t.themeKey}:${t.__taskIndex}`;
    const isCompleted = !!progressMap?.[key]?.isCompleted;
    const dur         = Number.isFinite(Number(t?.duration)) ? Number(t.duration) : DEFAULT_TASK_HOURS;
    return sum + (isCompleted ? dur : 0);
  }, 0);
  return {
    invested:    pretty(invested, 1),
    total:       pretty(total, 1),
    rawInvested: invested,
    rawTotal:    total,
  };
};

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
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  btnDark: {
    backgroundColor: 'rgba(122,53,53,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(122,53,53,0.18)',
  },
  btnLight: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  btnText:      { fontSize: 11, fontWeight: '700', lineHeight: 14 },
  btnTextDark:  { color: C.deepRose },
  btnTextLight: { color: 'rgba(255,255,255,0.85)' },
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(30,21,14,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 26,
  },
  card: {
    width: '100%',
    backgroundColor: C.warmWhite,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1.5,
    borderColor: C.softBorder,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  pip: {
    width: 28, height: 4, borderRadius: 2,
    backgroundColor: C.dustyRose,
    marginBottom: 18, opacity: 0.7,
  },
  cardTitle: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 18, color: C.ink,
    marginBottom: 10, letterSpacing: 0.2,
  },
  cardBody: {
    fontSize: 14, lineHeight: 22,
    color: 'rgba(30,21,14,0.58)',
    marginBottom: 22,
  },
  closeBtn: {
    backgroundColor: C.deepRose,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 11, fontWeight: '700',
    letterSpacing: 2, textTransform: 'uppercase',
    color: '#fff',
  },
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
  scrim:       { flex: 1, backgroundColor: 'rgba(30,21,14,0.45)', justifyContent: 'flex-end', paddingHorizontal: 26, paddingBottom: 48 },
  card:        { backgroundColor: C.warmWhite, borderRadius: 22, padding: 22, borderWidth: 1.5, borderColor: C.softBorder, shadowColor: C.ink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6 },
  dots:        { flexDirection: 'row', gap: 5, marginBottom: 18 },
  dot:         { width: 6, height: 6, borderRadius: 3, backgroundColor: C.fawn },
  dotActive:   { backgroundColor: C.dustyRose, width: 18 },
  pip:         { width: 28, height: 4, borderRadius: 2, backgroundColor: C.dustyRose, marginBottom: 18, opacity: 0.7 },
  emoji:       { fontSize: 30, marginBottom: 14 },
  title:       { fontFamily: 'PlayfairDisplay', fontSize: 20, color: C.ink, marginBottom: 10, letterSpacing: 0.2 },
  body:        { fontSize: 14, lineHeight: 22, color: 'rgba(30,21,14,0.58)', marginBottom: 22 },
  actions:     { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 14 },
  skipText:    { fontSize: 12, fontWeight: '500', letterSpacing: 0.8, color: C.caption, textTransform: 'uppercase' },
  nextBtn:     { backgroundColor: C.deepRose, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 22, alignItems: 'center' },
  nextBtnFull: { flex: 1 },
  nextBtnText: { fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: '#fff' },
});

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionEyebrow({ label }) {
  return (
    <View style={styles.sectionEyeRow}>
      <Text style={styles.sectionEye}>{label}</Text>
      <View style={styles.sectionRule} />
    </View>
  );
}

function ActionRow({ label, sub, lockLabel, onPress, isLast }) {
  return (
    <TouchableOpacity
      style={[styles.actionRow, isLast && { borderBottomWidth: 0 }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.actionRowLeft}>
        <View style={styles.actionIconBox}>
          <Text style={styles.actionIconSymbol}>›</Text>
        </View>
        <View style={styles.actionTextWrap}>
          <Text style={styles.actionLabel}>{label}</Text>
          {sub ? <Text style={styles.actionSub}>{sub}</Text> : null}
        </View>
      </View>
      {lockLabel ? (
        <Text style={styles.lockLabel}>{lockLabel}</Text>
      ) : (
        <View style={styles.chevron} />
      )}
    </TouchableOpacity>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const nav = navigation || useNavigation();

  const [onboarded, setOnboarded]                         = useState(false);
  const [recommendedRoadmap, setRecommendedRoadmap]       = useState(null);
  const [timeCommitmentHours, setTimeCommitmentHours]     = useState(null);
  const [dailyTimeBudgetHours, setDailyTimeBudgetHours]   = useState(null);
  const [roadmapHoursProgress, setRoadmapHoursProgress]   = useState('—');
  const [profileImageURI, setProfileImageURI]             = useState(null);
  const [loading, setLoading]                             = useState(true);
  const [techTrackKey, setTechTrackKey]                   = useState(null);
  const [newCityTrackKey, setNewCityTrackKey]             = useState(null);
  const [newCityJobStatus, setNewCityJobStatus]           = useState(null);
  const [physicalTrackKey, setPhysicalTrackKey]           = useState(null);
  const [planStatus, setPlanStatus]                       = useState('—');
  const [freeHoursUsed, setFreeHoursUsed]                 = useState(0);
  const [streakCount, setStreakCount]                     = useState(0);
  const [bestStreak, setBestStreak]                       = useState(0);
  const [userEmail, setUserEmail]                         = useState(null);
  const [displayName, setDisplayName]                     = useState(null);
  const [memberSince, setMemberSince]                     = useState(null);
  const [upsellVisible, setUpsellVisible]                 = useState(false);
  const [exportModalVisible, setExportModalVisible]       = useState(false);
  const [reminderModalVisible, setReminderModalVisible]   = useState(false);
  const [reminderStep, setReminderStep]                   = useState('time');
  const [selectedTimeLabel, setSelectedTimeLabel]         = useState(null);
  const [weekdayStartHourInput, setWeekdayStartHourInput] = useState('09:00');
  const [weekendStartHourInput, setWeekendStartHourInput] = useState('10:00');
  const [feedbackModalVisible, setFeedbackModalVisible]   = useState(false);
  const [feedbackText, setFeedbackText]                   = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting]       = useState(false);

  // ── Coach mark state ─────────────────────────────────────────────────────────
  const [coachSeen, setCoachSeen]     = useState(true);
  const [coachLoaded, setCoachLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_COACH_KEY)
      .then((val) => { setCoachSeen(val === 'true'); setCoachLoaded(true); })
      .catch(() => setCoachLoaded(true));
  }, []);

  const markCoachSeen = useCallback(async () => {
    setCoachSeen(true);
    await AsyncStorage.setItem(PROFILE_COACH_KEY, 'true');
  }, []);

  useEffect(() => {
  const load = async () => {
    try {
      setLoading(true);
      await loadProfileTracks();

      const [
        _onb, rr, th, img, techTrack, cityTrack, physTrack, cityJobStatus,
        streakRaw, bestRaw,
      ] = await AsyncStorage.multiGet([
          'onboarded', 'recommendedRoadmap', 'timeCommitmentHours', 'profileImageURI',
          TRACK_KEY, NEW_CITY_TRACK_KEY, PHYSICAL_TRACK_KEY, NEW_CITY_JOB_STATUS_KEY,
          'streak_count', 'streak_best',
        ]);

        const roadmapKey      = rr?.[1] || null;
        const weeklyHours     = th?.[1] ? parseFloat(th[1]) : null;
        const techTrackVal    = techTrack?.[1] || null;
        const newCityTrackVal = cityTrack?.[1] || null;
        const physicalTrackVal= physTrack?.[1] || null;
        const newCityJobVal   = cityJobStatus?.[1] || null;

        setOnboarded((_onb?.[1] || '') === 'true');
        setRecommendedRoadmap(roadmapKey);
        setTimeCommitmentHours(weeklyHours);
        setProfileImageURI(img?.[1] || null);
        setTechTrackKey(techTrackVal);
        setNewCityTrackKey(newCityTrackVal);
        setPhysicalTrackKey(physicalTrackVal);
        setNewCityJobStatus(newCityJobVal);
        setStreakCount(parseInt(streakRaw?.[1] || '0', 10) || 0);
        setBestStreak(parseInt(bestRaw?.[1] || '0', 10) || 0);

        const daily = Number.isFinite(weeklyHours) && weeklyHours > 0 ? weeklyHours / 7 : null;
        setDailyTimeBudgetHours(daily);
        if (daily !== null) await AsyncStorage.setItem('dailyTimeBudgetHours', String(daily));

        const roleOrTrack =
          roadmapKey === 'tech_switch'       ? techTrackVal
          : roadmapKey === 'new_city'         ? newCityTrackVal
          : roadmapKey === 'physical_glow_up' ? physicalTrackVal
          : null;

const { data: { session } } = await supabase.auth.getSession();
const user = session?.user;
if (user?.email) setUserEmail(user.email);
const hoursProgress = await computeRoadmapHoursProgress({
  userId: user?.id, roadmapKey, trackKey: roleOrTrack, jobStatusKey: newCityJobVal,
});

        const hoursLabel =
          hoursProgress.rawTotal > 0
            ? `${hoursProgress.invested} / ${hoursProgress.total} h`
            : '—';

        setRoadmapHoursProgress(hoursLabel);
        await AsyncStorage.setItem('weeklyTaskTarget', hoursLabel);

        if (!user) {
          setPlanStatus('—');
          setFreeHoursUsed(null);
        } else {
          const { data: prof, error: profErr } = await supabase
            .from('profiles')
            .select('is_pro, pro_until, free_hours_used, display_name, created_at')
            .eq('id', user.id)
            .single();


          if (profErr) {
            console.warn('Profile fetch error:', profErr);
            setPlanStatus('Free');
            setFreeHoursUsed(0);
          } else {
            const hours      = Number(prof?.free_hours_used ?? 0);
            setFreeHoursUsed(Number.isFinite(hours) ? hours : 0);
            const until       = prof?.pro_until || null;
            const isProFlag   = !!prof?.is_pro;
            const isStillValid= !until ? true : new Date(until).getTime() > Date.now();
            setPlanStatus(isProFlag && isStillValid ? 'Premium' : 'Free');
            if (prof?.display_name) setDisplayName(prof.display_name);
            if (prof?.created_at) {
              const d     = new Date(prof.created_at);
              const label = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
              setMemberSince(label);
            }
          }

        }
      } catch (e) {
        console.warn('Profile load error', e);
        Alert.alert('Error', 'Could not load your profile.');
      } finally {
        setLoading(false);
      }
    };

    const unsub = nav.addListener('focus', load);
    load();
    return unsub;
  }, [nav]);

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo library access.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.8 });
      if (!res.canceled && res.assets?.[0]?.uri) {
        const uri = res.assets[0].uri;
        await AsyncStorage.setItem('profileImageURI', uri);
        setProfileImageURI(uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not update your profile photo.');
    }
  };

  const rePersonalise = () => nav.navigate('OnboardingQuiz', { source: 'profile' });

  const exportWeek = async (weekdayStartHour, weekendStartHour) => {
    try {
      const roadmapKey = await AsyncStorage.getItem('recommendedRoadmap');
      if (!roadmapKey) { Alert.alert('No roadmap', 'Pick a roadmap first.'); return; }
      const count = await exportCurrentWeekToICS({
        roadmapKey,
        dayStartHour:      Number(weekdayStartHour) || 9,
        weekdayStartHour:  Number(weekdayStartHour),
        weekendStartHour:  Number(weekendStartHour),
        calendarName:      'Reinvention — Weekly Plan',
      });
      Alert.alert('Added to calendar ✨', `${count} task${count !== 1 ? 's' : ''} added to your calendar.`);
    } catch (e) {
      Alert.alert('Export failed', e?.message || 'Could not add tasks to your calendar.');
    }
  };

  const openExportTimesModal = async () => {
    if (planStatus !== 'Premium') { setUpsellVisible(true); return; }
    try {
      const [wd, we] = await AsyncStorage.multiGet(['weekdayStartHour', 'weekendStartHour']);
      if (wd?.[1]) setWeekdayStartHourInput(String(Number(wd[1])).padStart(2, '0') + ':00');
      if (we?.[1]) setWeekendStartHourInput(String(Number(we[1])).padStart(2, '0') + ':00');
    } catch (e) {
      console.warn('Could not restore export time preferences:', e?.message || e);
    }
    setExportModalVisible(true);
  };

  const openRemindersModal = async () => {
    try {
      const saved = await AsyncStorage.getItem(TASK_TIME_KEY);
      setSelectedTimeLabel(saved || null);
    } catch {}
    setReminderStep('time');
    setReminderModalVisible(true);
  };

  const cancelExistingDailyReminder = async () => {
    try {
      const existingId = await AsyncStorage.getItem(DAILY_NOTIFICATION_ID_KEY);
      if (existingId) {
        await Notifications.cancelScheduledNotificationAsync(existingId);
        await AsyncStorage.removeItem(DAILY_NOTIFICATION_ID_KEY);
      }
    } catch {}
  };

  const scheduleDailyReminder = async (taskTimeLabel) => {
    const chosen   = findTaskTimeOption(taskTimeLabel);
    const reminder = subtractMinutes(chosen.hour, chosen.minute, 15);
    await ensureAndroidNotificationChannel();
    await cancelExistingDailyReminder();
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your Reinvention step ✨',
        body:  '15 minutes until your planned roadmap time.',
        sound: true,
      },
      trigger:
        Platform.OS === 'android'
          ? { channelId: 'daily-reminders', hour: reminder.hour, minute: reminder.minute, repeats: true, type: Notifications.SchedulableTriggerInputTypes.DAILY }
          : { hour: reminder.hour, minute: reminder.minute, repeats: true },
    });
    await AsyncStorage.multiSet([
      [DAILY_NOTIFICATION_ID_KEY, id],
      [TASK_TIME_KEY,             chosen.label],
      [TASK_TIME_HOUR_KEY,        String(chosen.hour)],
      [TASK_TIME_MINUTE_KEY,      String(chosen.minute)],
      [TASK_REMINDER_HOUR_KEY,    String(reminder.hour)],
      [TASK_REMINDER_MINUTE_KEY,  String(reminder.minute)],
      [NOTIFICATIONS_ENABLED_KEY, 'true'],
      [NOTIFICATIONS_CHOICE_KEY,  'yes'],
    ]);
    return id;
  };

  const handleReminderTimeSelect = (label) => {
    setSelectedTimeLabel(label);
    setReminderStep('permission');
  };

  const handleReminderYes = async () => {
    try {
      const current     = await Notifications.getPermissionsAsync();
      let finalStatus   = current.status;
      if (finalStatus !== 'granted') {
        const requested = await Notifications.requestPermissionsAsync();
        finalStatus     = requested.status;
      }
      await AsyncStorage.setItem(NOTIFICATIONS_PERMISSION_KEY, finalStatus);
      if (finalStatus === 'granted') {
        await scheduleDailyReminder(selectedTimeLabel || TASK_TIME_OPTIONS[3].label);
        setReminderModalVisible(false);
        Alert.alert('Reminders set ✨', `We'll nudge you 15 min before your ${selectedTimeLabel || 'chosen'} task time.`);
      } else {
        await cancelExistingDailyReminder();
        await AsyncStorage.multiSet([
          [NOTIFICATIONS_ENABLED_KEY,   'false'],
          [ROADMAP_REMINDER_ENABLED_KEY,'false'],
        ]);
        setReminderModalVisible(false);
        Alert.alert('Permission needed', 'To enable reminders, please allow notifications for this app in your device settings.');
      }
    } catch (e) {
      setReminderModalVisible(false);
      Alert.alert('Error', 'Could not set up reminders. Please try again.');
    }
  };

  const handleReminderNo = async () => {
    await cancelExistingDailyReminder();
    await AsyncStorage.multiSet([
      [NOTIFICATIONS_CHOICE_KEY,    'no'],
      [NOTIFICATIONS_ENABLED_KEY,   'false'],
      [ROADMAP_REMINDER_ENABLED_KEY,'false'],
    ]);
    setReminderModalVisible(false);
  };

  const handleLogout = async () => {
    Alert.alert('Log out?', 'You will be signed out of your account.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        onPress: async () => {
          try { await supabase.auth.signOut(); }
          catch (e) { Alert.alert('Error', 'Could not log out. Try again.'); }
        },
      },
    ]);
  };

  const handleSendFeedback = () => { setFeedbackText(''); setFeedbackModalVisible(true); };

  const submitFeedback = async () => {
    if (!feedbackText.trim()) { Alert.alert('Empty feedback', 'Please write something before sending.'); return; }
    try {
      setFeedbackSubmitting(true);
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes?.user?.id || null;
      const { error } = await supabase.from('feedback').insert({ user_id: userId, message: feedbackText.trim() });
      if (error) throw error;
      setFeedbackModalVisible(false);
      setFeedbackText('');
      Alert.alert('Thank you! 🙏', 'Your feedback has been received. We really appreciate it.');
    } catch (e) {
      Alert.alert('Could not send feedback', 'Please try again in a moment.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete account?',
      'This will permanently delete your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Are you absolutely sure?',
              'All your data will be removed and you will be signed out.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Yes, delete', style: 'destructive', onPress: actuallyDeleteAccount },
              ]
            ),
        },
      ]
    );
  };

  const actuallyDeleteAccount = async () => {
    try {
      setLoading(true);
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (sessionErr || !session?.user || !session?.access_token) {
        Alert.alert('Error', 'No authenticated session found.'); return;
      }
      const { data: fnData, error: fnErr } = await supabase.functions.invoke('delete-account', {
        body:    { user_id: session.user.id },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (fnErr || fnData?.error || fnData?.ok !== true) {
        const reason = fnErr?.message || fnData?.error || 'Unexpected error from server.';
        Alert.alert('Deletion Failed', `Could not delete your account: ${reason}\n\nPlease try again or contact support.`);
        return;
      }
      try {
        await AsyncStorage.clear();
      } catch (e) {
        console.warn('AsyncStorage reset error after account deletion:', e?.message || e);
      }
      try { await supabase.auth.signOut(); }
      catch (e) { console.warn('signOut error after account deletion:', e?.message || e); }
      Alert.alert('Account deleted', 'Your account and all data have been permanently removed.');
    } catch (e) {
      Alert.alert('Error', 'Could not delete your account. Please try again.');
    } finally { setLoading(false); }
  };

  // ── Derived display values ────────────────────────────────────────────────────
  const techTrackLabel = techTrackKey ? trackLabelMap[techTrackKey] || techTrackKey : '—';
  const cityTrackLabel = newCityTrackKey ? newCityTrackLabelMap[newCityTrackKey] || newCityTrackKey : '—';
  const physTrackLabel = physicalTrackKey ? physicalTrackLabelMap[physicalTrackKey] || physicalTrackKey : '—';
  const jobStatusLabel = newCityJobStatus ? newCityJobStatusLabelMap[newCityJobStatus] || newCityJobStatus : '—';

  const showTrackRow =
    recommendedRoadmap === 'tech_switch' ||
    recommendedRoadmap === 'new_city' ||
    recommendedRoadmap === 'physical_glow_up';

  const trackValue =
    recommendedRoadmap === 'tech_switch'       ? techTrackLabel
    : recommendedRoadmap === 'new_city'         ? cityTrackLabel
    : recommendedRoadmap === 'physical_glow_up' ? physTrackLabel
    : '—';

  const freeHoursUsedNum = Number.isFinite(Number(freeHoursUsed)) ? Number(freeHoursUsed) : 0;
  const freeHoursFillPct = Math.min(1, freeHoursUsedNum / FREE_CAP_HOURS);
  const freeHoursLabel   = `${pretty(freeHoursUsedNum, 1)} / ${FREE_CAP_HOURS} h`;

  const isPremium = planStatus === 'Premium';

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.warmWhite} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Avatar / hero ── */}
        <View style={styles.profileHero}>
          <View style={styles.avatarWrap}>
            {profileImageURI ? (
              <Image source={{ uri: profileImageURI }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarInitials}>
                  {displayName ? displayName.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.avatarEditBtn} onPress={pickImage} activeOpacity={0.8}>
              <Text style={styles.avatarEditIcon}>📷</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{displayName || 'My Profile'}</Text>
            <View style={styles.memberSince}>
              <View style={styles.memberDot} />
              <Text style={styles.memberText}>Member since {memberSince || '2026'}</Text>
            </View>
          </View>
        </View>

        {/* ── Personalisation section ── */}
        <SectionEyebrow label="Your personalisation" />

        <View style={styles.infoCard}>
          {/* Plan row */}
          <View style={styles.infoRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.infoRowLabel}>Plan</Text>
              <HintButton
                title="Your plan"
                body="Free members get a curated set of tasks per roadmap and up to 20 hours of roadmap content. Premium unlocks unlimited tasks, AI weekly planning, reinvention circles to connect with other women, and more."
              />
            </View>
            <View style={isPremium ? styles.planBadgePremium : styles.planBadgeFree}>
              {isPremium && <View style={styles.planBadgeDot} />}
              <Text style={isPremium ? styles.planBadgePremiumText : styles.planBadgeFreeText}>
                {isPremium ? 'Premium' : 'Free'}
              </Text>
            </View>
          </View>

          {/* Free hours bar */}
          {!isPremium && (
            <View style={styles.infoRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.infoRowLabel}>Free hours</Text>
                <HintButton
                  title="Free hours cap"
                  body="Free members can complete up to 20 hours of roadmap tasks. Once you reach the cap, upgrade to Premium to keep going with unlimited access."
                />
              </View>
              <View style={styles.freeHoursWrap}>
                <Text style={[styles.infoRowValue, { maxWidth: undefined }]}>{freeHoursLabel}</Text>
                <View style={styles.freeBar}>
                  <View style={[styles.freeBarFill, { width: `${freeHoursFillPct * 100}%` }]} />
                </View>
              </View>
            </View>
          )}

          {/* Active roadmap */}
          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Active roadmap</Text>
            <Text style={[styles.infoRowValue, styles.infoRowValueRose]}>
              {recommendedRoadmap ? roadmapLabels[recommendedRoadmap] || recommendedRoadmap : '—'}
            </Text>
          </View>

          {/* Track */}
          {showTrackRow && (
            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>Track</Text>
              <Text style={styles.infoRowValue}>{trackValue}</Text>
            </View>
          )}

          {/* Job status */}
          {recommendedRoadmap === 'new_city' && (
            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>Job status</Text>
              <Text style={styles.infoRowValue}>{jobStatusLabel}</Text>
            </View>
          )}

          {/* Weekly commitment */}
          <View style={styles.infoRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.infoRowLabel}>Weekly commitment</Text>
              <HintButton
                title="Weekly commitment"
                body="This is how many hours you picked per week you could spend on your reinvention. It determines how tasks are spread across your weekly plan. Update it by tapping the *Change my roadmap or time commitment* button further down"
              />
            </View>
            <Text style={styles.infoRowValue}>
              {timeCommitmentHours ? `${pretty(timeCommitmentHours, 1)} h / week` : '—'}
            </Text>
          </View>

          {/* Daily budget */}
          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Daily budget</Text>
            <Text style={styles.infoRowValue}>
              {dailyTimeBudgetHours !== null ? `${pretty(dailyTimeBudgetHours, 2)} h / day` : '—'}
            </Text>
          </View>

          {/* Hours invested */}
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.infoRowLabel}>Hours toward roadmap</Text>
              <HintButton
                title="Hours invested"
                body="The total estimated time of all the roadmap tasks you have completed so far, compared to the total time in your plan."
              />
            </View>
            <Text style={styles.infoRowValue}>{roadmapHoursProgress ?? '—'}</Text>
          </View>
        </View>

        {/* Re-personalise action */}
        <TouchableOpacity style={styles.repersonaliseBtn} onPress={rePersonalise} activeOpacity={0.85}>
          <Text style={styles.repersonaliseBtnText}>Change my roadmap or time commitment</Text>
          <View style={styles.chevron} />
        </TouchableOpacity>

        {/* ── Upgrade card (free users only) ── */}
        {!isPremium && (
          <View style={styles.upgradeCard}>
            <Text style={styles.upgradeTitle}>
              Go{' '}
              <Text style={styles.upgradeTitleItalic}>Premium</Text>
              {' '}and unlock your full reinvention
            </Text>
            <View style={styles.upgradeBullets}>
              {[
                'Unlimited roadmap hours across all plans',
                'AI-adapted weekly plans that adjust to your life effortlessly',
                'Advanced reflection insights & weekly summaries',
                'Export your weekly tasks directly into your calendar',
                'Share wins, take on group challenges & check in weekly with other women on their reinvention journey',
              ].map((b, i) => (
                <View key={i} style={styles.upgradeBulletRow}>
                  <View style={styles.upgradeBulletPip} />
                  <Text style={styles.upgradeBulletText}>{b}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.upgradeBtn} onPress={() => setUpsellVisible(true)} activeOpacity={0.88}>
              <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Tools section ── */}
        <SectionEyebrow label="Tools" />

        <View style={styles.actionsGroup}>
          <ActionRow
            label="Export weekly tasks to calendar"
            sub="Add tasks directly to your calendar"
            lockLabel={!isPremium ? 'Premium' : null}
            onPress={openExportTimesModal}
          />
          <ActionRow
            label="Daily reminders"
            sub="Manage push notifications"
            onPress={openRemindersModal}
          />
          <ActionRow
            label="Send feedback"
            sub="Report a bug or share an idea"
            onPress={handleSendFeedback}
          />
          <ActionRow
            label="Terms of Service"
            sub="Your rights and responsibilities"
            onPress={() => nav.navigate('TermsOfService')}
          />
          <ActionRow
            label="Privacy policy"
            sub="How we handle your data"
            onPress={() => nav.navigate('PrivacyPolicy')}
          />
        </View>

        {/* ── Account section ── */}
        <SectionEyebrow label="Account" />

        <View style={styles.actionsGroup}>
          <ActionRow
            label="Log out"
            sub={userEmail || ''}
            onPress={handleLogout}
            isLast
          />
        </View>

        <TouchableOpacity style={styles.dangerBtn} onPress={handleDeleteAccount} activeOpacity={0.8}>
          <Text style={styles.dangerBtnText}>Delete account</Text>
        </TouchableOpacity>

        {loading && <Text style={styles.loadingText}>Loading…</Text>}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Export modal ── */}
      <Modal visible={exportModalVisible} transparent animationType="fade" onRequestClose={() => setExportModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Start time for tasks</Text>
            <Text style={styles.modalSubtitle}>Choose the time you usually start on each day type (e.g. 09:00 or 17:30).</Text>

            <View style={styles.modalInputRow}>
              <Text style={styles.modalInputLabel}>Weekdays (Mon–Fri)</Text>
              <TextInput
                keyboardType="numbers-and-punctuation"
                value={weekdayStartHourInput}
                onChangeText={(text) => {
                  // Auto-insert colon after 2 digits
                  const digits = text.replace(/[^0-9]/g, '');
                  if (digits.length <= 2) {
                    setWeekdayStartHourInput(digits);
                  } else {
                    const hh = digits.slice(0, 2);
                    const mm = digits.slice(2, 4);
                    setWeekdayStartHourInput(`${hh}:${mm}`);
                  }
                }}
                onBlur={() => {
                  const digits = weekdayStartHourInput.replace(/[^0-9]/g, '');
                  const hh = digits.slice(0, 2).padStart(2, '0');
                  const mm = digits.length >= 3 ? digits.slice(2, 4).padStart(2, '0') : '00';
                  setWeekdayStartHourInput(`${hh}:${mm}`);
                }}
                placeholder="09:00"
                placeholderTextColor={C.champagne}
                style={styles.modalInput}
                maxLength={5}
              />
            </View>

            <View style={styles.modalInputRow}>
              <Text style={styles.modalInputLabel}>Weekend (Sat–Sun)</Text>
              <TextInput
                keyboardType="numbers-and-punctuation"
                value={weekendStartHourInput}
                onChangeText={(text) => {
                  const digits = text.replace(/[^0-9]/g, '');
                  if (digits.length <= 2) {
                    setWeekendStartHourInput(digits);
                  } else {
                    const hh = digits.slice(0, 2);
                    const mm = digits.slice(2, 4);
                    setWeekendStartHourInput(`${hh}:${mm}`);
                  }
                }}
                onBlur={() => {
                  const digits = weekendStartHourInput.replace(/[^0-9]/g, '');
                  const hh = digits.slice(0, 2).padStart(2, '0');
                  const mm = digits.length >= 3 ? digits.slice(2, 4).padStart(2, '0') : '00';
                  setWeekendStartHourInput(`${hh}:${mm}`);
                }}
                placeholder="10:00"
                placeholderTextColor={C.champagne}
                style={styles.modalInput}
                maxLength={5}
              />
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setExportModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={async () => {
                  // Parse HH:MM -> decimal hours for the export function
                  const parseHHMM = (str) => {
                    const parts = str.split(':');
                    const hh = Math.max(0, Math.min(23, parseInt(parts[0], 10) || 0));
                    const mm = Math.max(0, Math.min(59, parseInt(parts[1] || '0', 10)));
                    return hh + mm / 60;
                  };
                  const wd = parseHHMM(weekdayStartHourInput);
                  const we = parseHHMM(weekendStartHourInput);
                  const wdHour = Math.floor(wd);
                  const weHour = Math.floor(we);
                  try {
                    await AsyncStorage.multiSet([
                      ['weekdayStartHour', String(wdHour)],
                      ['weekendStartHour', String(weHour)],
                    ]);
                  } catch {}
                  setExportModalVisible(false);
                  await exportWeek(wdHour, weHour);
                }}
              >
                <Text style={styles.modalConfirmText}>Export</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Daily Reminders modal ── */}
      <Modal visible={reminderModalVisible} transparent animationType="slide" onRequestClose={() => setReminderModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingBottom: 28 }]}>
            {reminderStep === 'time' ? (
              <>
                <Text style={styles.modalTitle}>When do you work on your goals?</Text>
                <Text style={styles.modalSubtitle}>Pick the time that feels most realistic for your routine.</Text>
                {TASK_TIME_OPTIONS.map((opt, i) => {
                  const isSelected = selectedTimeLabel === opt.label;
                  return (
                    <TouchableOpacity
                      key={opt.label}
                      style={[reminderStyles.timeOption, isSelected && reminderStyles.timeOptionSelected]}
                      activeOpacity={0.82}
                      onPress={() => handleReminderTimeSelect(opt.label)}
                    >
                      <View style={reminderStyles.timeOptionLeft}>
                        <Text style={[reminderStyles.timeIndex, isSelected && reminderStyles.timeIndexSelected]}>
                          {String(i + 1).padStart(2, '0')}
                        </Text>
                        <Text style={[reminderStyles.timeLabel, isSelected && reminderStyles.timeLabelSelected]}>
                          {opt.label}
                        </Text>
                      </View>
                      <View style={[reminderStyles.radio, isSelected && reminderStyles.radioSelected]}>
                        {isSelected && <View style={reminderStyles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { marginTop: 14 }]}
                  onPress={() => setReminderModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Can we send you reminders?</Text>
                <Text style={styles.modalSubtitle}>
                  {`We'll nudge you 15 minutes before your ${selectedTimeLabel ? `"${selectedTimeLabel}"` : 'chosen'} task time.`}
                </Text>
                <TouchableOpacity
                  style={[reminderStyles.permBtn, { backgroundColor: C.deepRose }]}
                  activeOpacity={0.88}
                  onPress={handleReminderYes}
                >
                  <Text style={reminderStyles.permBtnText}>Yes, remind me</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[reminderStyles.permBtn, { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: C.softBorder, marginTop: 10 }]}
                  activeOpacity={0.82}
                  onPress={handleReminderNo}
                >
                  <Text style={[reminderStyles.permBtnText, { color: C.caption }]}>No thanks</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 14, alignSelf: 'center' }} onPress={() => setReminderStep('time')}>
                  <Text style={{ fontSize: 12, color: C.caption, textDecorationLine: 'underline' }}>← Change time</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <PremiumUpsellModal visible={upsellVisible} onClose={() => setUpsellVisible(false)} />

      {/* ── Feedback modal ── */}
      <Modal visible={feedbackModalVisible} transparent animationType="fade" onRequestClose={() => setFeedbackModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Send feedback</Text>
            <Text style={styles.modalSubtitle}>Found a bug or have an idea? We'd love to hear from you.</Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Write your feedback here…"
              placeholderTextColor={C.champagne}
              value={feedbackText}
              onChangeText={setFeedbackText}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.feedbackCharCount}>{feedbackText.length} / 1000</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setFeedbackModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, feedbackSubmitting && { opacity: 0.6 }]}
                onPress={submitFeedback}
                disabled={feedbackSubmitting}
              >
                <Text style={styles.modalConfirmText}>{feedbackSubmitting ? 'Sending…' : 'Send'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── First-visit coach mark ── */}
      <CoachMarkOverlay
        visible={coachLoaded && !coachSeen && !loading}
        onDone={markCoachSeen}
        steps={PROFILE_COACH_STEPS}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: C.warmWhite },
  scrollContent: { paddingBottom: 24 },

  // Top bar (kept for legacy reference)
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: 26, paddingBottom: 16, borderBottomWidth: 1.5, borderBottomColor: C.softBorder, backgroundColor: C.warmWhite },
  brand:  { fontFamily: 'serif', fontSize: 12, fontStyle: 'italic', color: C.ink, opacity: 0.55, letterSpacing: 0.2 },

  premiumTag:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(122,53,53,0.08)', borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(122,53,53,0.18)', paddingHorizontal: 13, paddingVertical: 5 },
  freeTag:        { backgroundColor: 'rgba(122,53,53,0.08)', borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(122,53,53,0.18)', paddingHorizontal: 13, paddingVertical: 5 },
  tagDot:         { width: 5, height: 5, borderRadius: 3, backgroundColor: C.dustyRose },
  premiumTagText: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: C.deepRose },
  freeTagText:    { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: C.deepRose },

  // Profile hero
  profileHero: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 26, paddingTop: 52, paddingBottom: 24, borderBottomWidth: 1.5, borderBottomColor: 'rgba(122,53,53,0.18)', backgroundColor: colors.deepRose },
  avatarWrap:  { position: 'relative' },
  avatar:      { width: 72, height: 72, borderRadius: 36, backgroundColor: C.linen, borderWidth: 2, borderColor: C.fawn, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarInitials: { fontFamily: 'serif', fontSize: 26, fontStyle: 'italic', color: C.deepRose, lineHeight: 30 },
  avatarEditBtn:  { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: C.ink, borderWidth: 2, borderColor: colors.deepRose, alignItems: 'center', justifyContent: 'center' },
  avatarEditIcon: { fontSize: 13, lineHeight: 16 },
  heroInfo:    { flex: 1 },
  heroName:    { fontFamily: 'serif', fontSize: 22, fontWeight: '700', color: '#fff', letterSpacing: -0.3, marginBottom: 2, textTransform: 'capitalize' },
  heroEmail:   { fontSize: 12, fontWeight: '300', color: C.caption, letterSpacing: 0.1, marginBottom: 8 },
  memberSince: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberDot:   { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.7)' },
  memberText:  { fontSize: 9, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' },

  // Section eyebrow
  sectionEyeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 26, marginBottom: 12, marginTop: 22 },
  sectionEye:    { fontSize: 9, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', color: C.clay },
  sectionRule:   { flex: 1, height: 1, backgroundColor: 'rgba(160,97,58,0.22)' },

  // Info card
  infoCard:       { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1.5, borderColor: C.softBorder, marginHorizontal: 26, marginBottom: 10, overflow: 'hidden' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30,21,14,0.06)',
  },
  infoRowLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: C.caption,
    letterSpacing: 0.1,
    flex: 0,
    marginRight: 8,
  },
  infoRowValue: {
    fontFamily: 'serif',
    fontSize: 13,
    color: C.ink,
    lineHeight: 18,
    textAlign: 'left',
  },
  infoRowValueRose: { fontStyle: 'italic', color: C.deepRose },

  planBadgePremium:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(122,53,53,0.08)', borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(122,53,53,0.2)', paddingHorizontal: 10, paddingVertical: 4 },
  planBadgeFree:        { backgroundColor: 'rgba(122,53,53,0.06)', borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(122,53,53,0.15)', paddingHorizontal: 10, paddingVertical: 4 },
  planBadgeDot:         { width: 5, height: 5, borderRadius: 3, backgroundColor: C.dustyRose },
  planBadgePremiumText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: C.deepRose },
  planBadgeFreeText:    { fontSize: 10, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', color: C.deepRose },

  freeHoursWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  freeBar:       { width: 44, height: 3, backgroundColor: 'rgba(30,21,14,0.08)', borderRadius: 2, overflow: 'hidden' },
  freeBarFill:   { height: '100%', backgroundColor: C.dustyRose, borderRadius: 2 },

  // Re-personalise
  repersonaliseBtn:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 26, marginBottom: 22, paddingHorizontal: 18, paddingVertical: 14, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: C.softBorder },
  repersonaliseBtnText: { fontFamily: 'serif', fontSize: 14, fontStyle: 'italic', color: C.deepRose },

  // Chevron
  chevron: { width: 10, height: 10, borderRightWidth: 1.5, borderTopWidth: 1.5, borderColor: C.champagne, transform: [{ rotate: '45deg' }] },

  // Upgrade card
  upgradeCard:        { marginHorizontal: 26, marginBottom: 24, backgroundColor: C.linen, borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(200,148,142,0.3)', padding: 20 },
  upgradeEye:         { fontSize: 8, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', color: C.deepRose, marginBottom: 6 },
  upgradeTitle:       { fontFamily: 'serif', fontSize: 19, color: C.ink, lineHeight: 25, marginBottom: 14 },
  upgradeTitleItalic: { fontStyle: 'italic', color: C.deepRose },
  upgradeBullets:     { gap: 7, marginBottom: 16 },
  upgradeBulletRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  upgradeBulletPip:   { width: 5, height: 5, borderRadius: 3, backgroundColor: C.dustyRose, marginTop: 6, flexShrink: 0 },
  upgradeBulletText:  { flex: 1, fontSize: 12, fontWeight: '300', color: 'rgba(30,21,14,0.65)', lineHeight: 18, letterSpacing: 0.1 },
  upgradeBtn:         { backgroundColor: C.deepRose, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  upgradeBtnText:     { fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: '#fff' },

  // Actions group
  actionsGroup:   { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1.5, borderColor: C.softBorder, marginHorizontal: 26, marginBottom: 22, overflow: 'hidden' },
  actionRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(30,21,14,0.06)' },
  actionRowLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  actionIconBox:  { width: 34, height: 34, borderRadius: 10, backgroundColor: C.linen, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actionIconSymbol: { fontFamily: 'serif', fontSize: 18, color: C.ink, lineHeight: 20 },
  actionTextWrap: { flex: 1 },
  actionLabel:    { fontSize: 13, fontWeight: '500', color: C.ink, letterSpacing: 0.1, marginBottom: 1 },
  actionSub:      { fontSize: 11, fontWeight: '400', color: 'rgba(30,21,14,0.58)', letterSpacing: 0.1 },
  lockLabel:      { fontSize: 9, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase', color: C.champagne },

  // Danger / logout
  dangerBtn:     { marginHorizontal: 26, marginBottom: 10, borderWidth: 1.5, borderColor: 'rgba(122,53,53,0.2)', borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  dangerBtnText: { fontSize: 11, fontWeight: '500', letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(122,53,53,0.5)' },

  loadingText: { textAlign: 'center', color: C.caption, marginTop: 12, fontSize: 13 },

  // Export / reminders modal
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(30,21,14,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard:       { width: '100%', backgroundColor: C.warmWhite, borderRadius: 22, padding: 22, borderWidth: 1.5, borderColor: C.softBorder },
  modalTitle:      { fontFamily: 'serif', fontSize: 20, fontWeight: '700', color: C.ink, marginBottom: 6, letterSpacing: -0.2 },
  modalSubtitle:   { fontSize: 13, fontWeight: '300', color: C.caption, marginBottom: 18, lineHeight: 19 },
  modalInputRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalInputLabel: { flex: 1, fontSize: 13, fontWeight: '400', color: C.ink },
  modalInput:      { width: 80, borderWidth: 1.5, borderColor: C.softBorder, borderRadius: 10, paddingVertical: 9, textAlign: 'center', backgroundColor: '#fff', color: C.ink, fontWeight: '600', fontSize: 15 },
  modalBtns:       { flexDirection: 'row', gap: 10, marginTop: 8 },
  modalCancelBtn:  { flex: 1, borderWidth: 1.5, borderColor: C.softBorder, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  modalCancelText: { fontSize: 12, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase', color: C.caption },
  modalConfirmBtn: { flex: 1, backgroundColor: C.ink, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  modalConfirmText:{ fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: '#fff' },

  // Feedback
  feedbackInput:     { borderWidth: 1.5, borderColor: C.softBorder, borderRadius: 10, padding: 12, backgroundColor: '#fff', color: C.ink, fontSize: 14, lineHeight: 20, minHeight: 120, marginBottom: 6 },
  feedbackCharCount: { fontSize: 11, color: C.caption, textAlign: 'right', marginBottom: 14 },
});

const reminderStyles = StyleSheet.create({
  timeOption:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, borderColor: C.softBorder, backgroundColor: '#fff', marginBottom: 8 },
  timeOptionSelected: { borderColor: C.deepRose, backgroundColor: 'rgba(122,53,53,0.04)' },
  timeOptionLeft:     { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  timeIndex:          { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: C.champagne, width: 22 },
  timeIndexSelected:  { color: C.deepRose },
  timeLabel:          { fontSize: 14, fontWeight: '400', color: C.ink, letterSpacing: 0.1 },
  timeLabelSelected:  { fontWeight: '600', color: C.deepRose },
  radio:              { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: C.champagne, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioSelected:      { borderColor: C.deepRose },
  radioInner:         { width: 10, height: 10, borderRadius: 5, backgroundColor: C.deepRose },
  permBtn:            { borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  permBtnText:        { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: '#fff' },
});

// ─── Reinvention Score ────────────────────────────────────────────────────────
const SCORE_CACHE_KEY = 'reinventionScoreCache';

export async function calculateReinventionScore(userId) {
  try {
    // 1. Fetch all task progress rows for this user
    const { data: rows, error } = await supabase
      .from('roadmap_task_progress')
      .select('roadmap_key, is_completed, completed_at')
      .eq('user_id', userId);

    if (error) throw error;

const completed = (rows || []).filter((r) => r.is_completed);

// ── Pillar 1: Task completion (0–25) ──────────────────────────────────────
const roadmapKey = await AsyncStorage.getItem('recommendedRoadmap');
const roadmapGroups = roadmapTasks?.[roadmapKey] || {};
const actualTotal = Object.values(roadmapGroups).flat().length;
const completionPts = actualTotal > 0
  ? Math.min(Math.round((completed.length / actualTotal) * 25), 25)
  : 0;

    // ── Pillar 2: Streak (0–25) ───────────────────────────────────────────────
    const streakRaw = await AsyncStorage.getItem('streak_count');
    const streak    = Math.min(parseInt(streakRaw || '0', 10), 30); // cap at 30 days
    const streakPts = Math.round((streak / 30) * 25);

// ── Pillar 3: Monthly momentum (0–25) — consistency across the last 28 days ──
// Uses a 28-day window so the score builds meaningfully over a full month,
// not a single active week. A sqrt curve rewards early engagement while
// making the last points genuinely hard-earned.
// Full score requires ~20 active days out of 28 (~5 days/week for 4 weeks).
const twentyEightDaysAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);

const recentCompleted = completed.filter((r) => {
  if (!r.completed_at) return false;
  return new Date(r.completed_at) >= twentyEightDaysAgo;
});

// Count unique active days in the last 28 days
const activeDays = new Set(
  recentCompleted.map((r) => new Date(r.completed_at).toISOString().slice(0, 10))
).size;

// sqrt curve: progress feels rewarding early, but plateau is hard to reach
const MOMENTUM_TARGET = 28; // active days needed for full score
const momentumPts = Math.min(
  Math.round(Math.sqrt(activeDays / MOMENTUM_TARGET) * 25),
  25
);

// ── Pillar 4: Life breadth (0–25) — weeks elapsed since first completion ──
// Rewards users who sustain the journey over time (target: ~8 weeks = full score)
const completedDates = completed
  .map((r) => r.completed_at)
  .filter(Boolean)
  .sort();
let breadthPts = 0;
if (completedDates.length > 0) {
  const firstCompleted = new Date(completedDates[0]);
  const weeksElapsed = Math.floor(
    (Date.now() - firstCompleted.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  // 16 weeks (~4 months) of sustained engagement = full score
  breadthPts = Math.min(Math.round((weeksElapsed / 16) * 25), 25);
}

    const score = completionPts + streakPts + momentumPts + breadthPts;

    const breakdown = {
      completion: completionPts,
      streak:     streakPts,
      momentum:   momentumPts,
      breadth:    breadthPts,
    };

    // ── Delta vs last week ────────────────────────────────────────────────────
    let delta = null;
    try {
      const cached = await AsyncStorage.getItem(SCORE_CACHE_KEY);
      if (cached) {
        const { score: prevScore, savedAt } = JSON.parse(cached);
        const ageMs = Date.now() - new Date(savedAt).getTime();
        // Only use cache if it's 5–9 days old (last week's snapshot)
        if (ageMs > 5 * 24 * 60 * 60 * 1000 && ageMs < 9 * 24 * 60 * 60 * 1000) {
          delta = score - prevScore;
        }
      }
      // Always save today's score for next week's delta
      await AsyncStorage.setItem(
        SCORE_CACHE_KEY,
        JSON.stringify({ score, savedAt: new Date().toISOString() })
      );
    } catch (_) {}

    return { score, breakdown, delta };
  } catch (e) {
    console.warn('calculateReinventionScore error', e);
    return {
      score: 0,
      breakdown: { completion: 0, streak: 0, momentum: 0, breadth: 0 },
      delta: null,
    };
  }
}