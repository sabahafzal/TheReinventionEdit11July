// screens/OnboardingQuizScreen.js

import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase';
import { roadmapTasks } from './roadmapTasks';
import {
  refreshDailyRoadmapReminder,
  ROADMAP_REMINDER_ENABLED_KEY,
} from '../lib/roadmapReminders';
import { autoJoinRoadmapCircle } from './ReinventionCircleScreen';
import { colors, typography, spacing, radii, tokens } from './theme';

// ─── Nav names ────────────────────────────────────────────────────────────────
const TAB_CONTAINER_NAME = 'MainTabs';
const HOME_TAB_NAME = 'Home';

// ─── Notification / time preference keys ──────────────────────────────────────
const TASK_TIME_KEY              = 'preferredTaskTimeLabel';
const TASK_TIME_HOUR_KEY         = 'preferredTaskTimeHour';
const TASK_TIME_MINUTE_KEY       = 'preferredTaskTimeMinute';
const TASK_REMINDER_HOUR_KEY     = 'preferredTaskReminderHour';
const TASK_REMINDER_MINUTE_KEY   = 'preferredTaskReminderMinute';
const NOTIFICATIONS_CHOICE_KEY   = 'taskReminderChoice';
const NOTIFICATIONS_ENABLED_KEY  = 'notificationsEnabled';
const NOTIFICATIONS_PERMISSION_KEY = 'notificationsPermissionStatus';
const NOTIFICATIONS_PROMPTED_KEY = 'notificationsPrompted';
const DAILY_NOTIFICATION_ID_KEY  = 'dailyTaskReminderNotificationId';

// ─── Labels ───────────────────────────────────────────────────────────────────
const LABELS = {
  new_city:          'Starting Over in a New City',
  tech_switch:       'Switching Into Tech',
  financial_glow_up: 'Financial Glow-Up',
  physical_glow_up:  'Physical Glow-Up',
  mental_glow_up:    'Mental Glow-Up',
};

// ─── Time options ─────────────────────────────────────────────────────────────
const TASK_TIME_OPTIONS = [
  { label: 'Before work',          hour: 7,  minute: 30 },
  { label: 'Morning',              hour: 9,  minute: 0  },
  { label: 'Straight after work',  hour: 17, minute: 45 },
  { label: 'After dinner',         hour: 19, minute: 30 },
  { label: 'Evening',              hour: 20, minute: 30 },
  { label: 'Before going to bed',  hour: 22, minute: 15 },
];

const DEFAULT_TASK_HOURS = 0.33;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const findTaskTimeOption = (label) =>
  TASK_TIME_OPTIONS.find((o) => o.label === label) || TASK_TIME_OPTIONS[3];

const subtractMinutes = (hour, minute, minus) => {
  const total = hour * 60 + minute - minus;
  const n = ((total % 1440) + 1440) % 1440;
  return { hour: Math.floor(n / 60), minute: n % 60 };
};

const flattenTasksDeep = (node, acc = []) => {
  if (Array.isArray(node)) { node.forEach((item) => flattenTasksDeep(item, acc)); return acc; }
  if (node && typeof node === 'object') {
    if (typeof node.task === 'string' || typeof node.duration !== 'undefined') { acc.push(node); return acc; }
    Object.values(node).forEach((v) => flattenTasksDeep(v, acc));
  }
  return acc;
};

const getRoadmapTotalHours = (roadmapKey) => {
  const source = roadmapTasks?.[roadmapKey];
  if (!source) return 0;
  const tasks = flattenTasksDeep(source, []);
  return Number(
    tasks.reduce((sum, t) => {
      const d = Number(t?.duration);
      return sum + (Number.isFinite(d) && d > 0 ? d : DEFAULT_TASK_HOURS);
    }, 0).toFixed(2)
  );
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

// ─── Choice component ─────────────────────────────────────────────────────────
const Choice = ({ text, index, onPress, selected }) => (
  <TouchableOpacity
    style={[styles.choice, selected && styles.choiceSelected]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <View style={styles.choiceLeft}>
      <Text style={[styles.choiceIndex, selected && styles.choiceIndexSelected]}>
        {String(index + 1).padStart(2, '0')}
      </Text>
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>
        {text}
      </Text>
    </View>
    <View style={[styles.choiceRadio, selected && styles.choiceRadioSelected]}>
      {selected && <View style={styles.choiceRadioInner} />}
    </View>
  </TouchableOpacity>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const navigation = useNavigation();
  const finishingRef = useRef(false);

  const [willingNewCity, setWillingNewCity]     = useState(null);
  const [willingTech, setWillingTech]           = useState(null);
  const [scores, setScores]                     = useState({
    new_city: 0, tech_switch: 0, financial_glow_up: 0, physical_glow_up: 0, mental_glow_up: 0,
  });
  const [weekdayDaily, setWeekdayDaily]         = useState(null);
  const [weekendDaily, setWeekendDaily]         = useState(null);
  const [preferredTaskTime, setPreferredTaskTime] = useState(null);
  const [notificationsChoice, setNotificationsChoice] = useState(null);
  const [notificationsPermissionStatus, setNotificationsPermissionStatus] = useState(null);
  const [dailyNotificationId, setDailyNotificationId] = useState(null);
  const [step, setStep]                         = useState(0);
  const [answers, setAnswers]                   = useState({});

  // ── Notification helpers ────────────────────────────────────────────────────
  const cancelExistingDailyReminder = async () => {
    try {
      const existingId = await AsyncStorage.getItem(DAILY_NOTIFICATION_ID_KEY);
      if (existingId) {
        await Notifications.cancelScheduledNotificationAsync(existingId);
        await AsyncStorage.removeItem(DAILY_NOTIFICATION_ID_KEY);
      }
      setDailyNotificationId(null);
    } catch {}
  };

  const scheduleDailyReminder = async (taskTimeLabel) => {
    const chosen = findTaskTimeOption(taskTimeLabel);
    const reminder = subtractMinutes(chosen.hour, chosen.minute, 15);
    await ensureAndroidNotificationChannel();
    await cancelExistingDailyReminder();
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your Reinvention step ✨',
        body: '15 minutes until your planned roadmap time.',
        sound: true,
      },
      trigger:
        Platform.OS === 'android'
          ? { channelId: 'daily-reminders', hour: reminder.hour, minute: reminder.minute, repeats: true, type: Notifications.SchedulableTriggerInputTypes.DAILY }
          : { hour: reminder.hour, minute: reminder.minute, repeats: true },
    });
    await AsyncStorage.multiSet([
      [DAILY_NOTIFICATION_ID_KEY, id],
      [TASK_TIME_KEY, chosen.label],
      [TASK_TIME_HOUR_KEY, String(chosen.hour)],
      [TASK_TIME_MINUTE_KEY, String(chosen.minute)],
      [TASK_REMINDER_HOUR_KEY, String(reminder.hour)],
      [TASK_REMINDER_MINUTE_KEY, String(reminder.minute)],
      [NOTIFICATIONS_ENABLED_KEY, 'true'],
    ]);
    setDailyNotificationId(id);
    return { id, reminderHour: reminder.hour, reminderMinute: reminder.minute };
  };

  const requestNotificationPermissionAndSchedule = async (taskTimeLabel) => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_PROMPTED_KEY, 'true');
      const current = await Notifications.getPermissionsAsync();
      let finalStatus = current.status;
      if (finalStatus !== 'granted') {
        const requested = await Notifications.requestPermissionsAsync();
        finalStatus = requested.status;
      }
      setNotificationsPermissionStatus(finalStatus);
      await AsyncStorage.setItem(NOTIFICATIONS_PERMISSION_KEY, finalStatus);
      if (finalStatus === 'granted') {
        await scheduleDailyReminder(taskTimeLabel);
        return { granted: true, status: finalStatus };
      }
      await cancelExistingDailyReminder();
      await AsyncStorage.multiSet([
        [NOTIFICATIONS_ENABLED_KEY, 'false'],
        [ROADMAP_REMINDER_ENABLED_KEY, 'false'],
      ]);
      return { granted: false, status: finalStatus };
    } catch (e) {
      setNotificationsPermissionStatus('denied');
      await AsyncStorage.multiSet([
        [NOTIFICATIONS_PERMISSION_KEY, 'denied'],
        [NOTIFICATIONS_ENABLED_KEY, 'false'],
        [ROADMAP_REMINDER_ENABLED_KEY, 'false'],
      ]);
      return { granted: false, status: 'denied', error: e };
    }
  };

  // ── Build flow ──────────────────────────────────────────────────────────────
  const flow = useMemo(() => {
    const questions = [
      {
        id: 'q1_new_city',
        title: 'Are you willing to relocate to a new city or country?',
        options: [
          { label: 'Yes', onPick: () => setWillingNewCity(true) },
          { label: 'No',  onPick: () => setWillingNewCity(false) },
        ],
      },
      {
        id: 'q2_tech',
        title: 'Are you willing to switch into another field, such as tech?',
        options: [
          { label: 'Yes', onPick: () => { setWillingTech(true);  setStep(2); } },
          { label: 'No',  onPick: () => { setWillingTech(false); setStep(2); } },
        ],
      },
    ];

    if (willingNewCity !== null && willingTech !== null) {
      const allowNewCity = willingNewCity !== false;
      const allowTech    = willingTech !== false;

      const addScore = (updates) =>
        setScores((prev) => {
          const next = { ...prev };
          for (const [k, v] of Object.entries(updates)) next[k] = (next[k] || 0) + v;
          return next;
        });

      const activitiesOptions = [
        ...(allowNewCity ? [{ label: 'Exploring a new city & building a social life',       onPick: () => addScore({ new_city: 2 }) }] : []),
        ...(allowTech    ? [{ label: 'Learning tech skills & building portfolio projects',  onPick: () => addScore({ tech_switch: 2 }) }] : []),
        { label: 'Boosting savings, budgeting & investing',    onPick: () => addScore({ financial_glow_up: 2 }) },
        { label: 'Fitness habits, energy & healthy routines',  onPick: () => addScore({ physical_glow_up: 2 }) },
        { label: 'Mindset, stress, calm & confidence',         onPick: () => addScore({ mental_glow_up: 2 }) },
      ];
      questions.push({
        id: 'q_activities',
        title: 'Which activities sound most appealing for the next 90 days?',
        subtitle: 'Go with your gut; what would feel rewarding to work on?',
        options: activitiesOptions,
      });

      const secondaryOptions = [];
      if (allowNewCity) secondaryOptions.push({ label: 'Becoming a local quickly',          onPick: () => addScore({ new_city: 1 }) });
      if (allowTech)    secondaryOptions.push({ label: 'Positioning for a tech role',       onPick: () => addScore({ tech_switch: 1 }) });
      secondaryOptions.push(
        { label: 'Increasing financial freedom',              onPick: () => addScore({ financial_glow_up: 1 }) },
        { label: 'Feeling fitter & glowing up physically',    onPick: () => addScore({ physical_glow_up: 1 }) },
        { label: 'Feeling calmer & mentally strong',          onPick: () => addScore({ mental_glow_up: 1 }) },
      );
      questions.push({ id: 'q_secondary', title: "What's your next priority after that?", options: secondaryOptions });

      const constraintOptions = [
        ...(allowNewCity ? [{ label: 'Joy',       onPick: () => addScore({ new_city: 2 }) }] : []),
        ...(allowTech    ? [{ label: 'Excitement', onPick: () => addScore({ tech_switch: 2 }) }] : []),
        { label: 'Money',   onPick: () => addScore({ financial_glow_up: 2 }) },
        { label: 'Energy',  onPick: () => addScore({ physical_glow_up: 2 }) },
        { label: 'Clarity', onPick: () => addScore({ mental_glow_up: 2 }) },
      ];
      questions.push({ id: 'q_constraint', title: 'What would make the biggest difference to your life right now?', options: constraintOptions });

      const mindsetOptions = [
        ...(allowNewCity ? [{ label: 'A new beginning',              onPick: () => addScore({ new_city: 2 }) }] : []),
        ...(allowTech    ? [{ label: 'Rediscover excitement',        onPick: () => addScore({ tech_switch: 2 }) }] : []),
        { label: 'Better overview of finances',      onPick: () => addScore({ financial_glow_up: 2 }) },
        { label: 'More focused and energised',       onPick: () => addScore({ physical_glow_up: 2 }) },
        { label: 'Lower stress / better sleep',      onPick: () => addScore({ mental_glow_up: 2 }) },
      ];
      questions.push({ id: 'q_mindset', title: 'What would help your mindset the most?', options: mindsetOptions });

      questions.push(
        {
          id: 'q_time_weekday',
          title: 'How many hours can you set aside on a weekday?',
          subtitle: 'Monday – Friday',
          options: [
            { label: '0.5 h', onPick: () => setWeekdayDaily(0.5) },
            { label: '1 h',   onPick: () => setWeekdayDaily(1)   },
            { label: '2 h',   onPick: () => setWeekdayDaily(2)   },
            { label: '3 h',   onPick: () => setWeekdayDaily(3)   },
            { label: '4 h',   onPick: () => setWeekdayDaily(4)   },
            { label: '5 h',   onPick: () => setWeekdayDaily(5)   },
            { label: '6 h',   onPick: () => setWeekdayDaily(6)   },
            { label: '7 h',   onPick: () => setWeekdayDaily(7)   },
            { label: '8 h',   onPick: () => setWeekdayDaily(8)   },
          ],
        },
        {
          id: 'q_time_weekend',
          title: 'How many hours can you set aside per weekend day?',
          subtitle: 'Saturday – Sunday',
          options: [
            { label: '0.5 h', onPick: () => setWeekendDaily(0.5) },
            { label: '1 h',   onPick: () => setWeekendDaily(1)   },
            { label: '2 h',   onPick: () => setWeekendDaily(2)   },
            { label: '3 h',   onPick: () => setWeekendDaily(3)   },
            { label: '4 h',   onPick: () => setWeekendDaily(4)   },
            { label: '5 h',   onPick: () => setWeekendDaily(5)   },
            { label: '6 h',   onPick: () => setWeekendDaily(6)   },
            { label: '7 h',   onPick: () => setWeekendDaily(7)   },
            { label: '8 h',   onPick: () => setWeekendDaily(8)   },
          ],
        },
        {
          id: 'q_task_time_preference',
          title: 'When do you usually want to do your roadmap tasks?',
          subtitle: 'Pick the time that feels most realistic for your routine.',
          options: TASK_TIME_OPTIONS.map((opt) => ({
            label: opt.label,
            onPick: () => setPreferredTaskTime(opt.label),
          })),
        },
        {
          id: 'q_notifications',
          title: 'Can The Reinvention Edit send you reminders?',
          subtitle: "We'll nudge you 15 minutes before your chosen task time.",
          options: [
            {
              label: 'Yes, remind me',
              onPick: async () => {
                setNotificationsChoice('yes');
                const result = await requestNotificationPermissionAndSchedule(
                  preferredTaskTime || TASK_TIME_OPTIONS[3].label
                );
                if (!result.granted && result.status !== 'granted') {
                  await AsyncStorage.multiSet([
                    [NOTIFICATIONS_ENABLED_KEY, 'false'],
                    [ROADMAP_REMINDER_ENABLED_KEY, 'false'],
                  ]);
                }
              },
            },
            {
              label: 'No thanks',
              onPick: async () => {
                setNotificationsChoice('no');
                setNotificationsPermissionStatus('denied');
                await cancelExistingDailyReminder();
                await AsyncStorage.multiSet([
                  [NOTIFICATIONS_CHOICE_KEY, 'no'],
                  [NOTIFICATIONS_ENABLED_KEY, 'false'],
                  [NOTIFICATIONS_PERMISSION_KEY, 'denied'],
                  [ROADMAP_REMINDER_ENABLED_KEY, 'false'],
                ]);
              },
            },
          ],
        }
      );
    }

    return questions;
  }, [willingNewCity, willingTech, preferredTaskTime]);

  // ── Step advance ────────────────────────────────────────────────────────────
  const next = () => setStep((s) => Math.min(s + 1, flow.length - 1));

  const onPick = async (fn) => {
    await fn();
    if (step < flow.length - 1) next();
  };

  const onPickWithAnswer = async (questionId, label, fn) => {
    setAnswers((prev) => ({ ...prev, [questionId]: label }));
    await onPick(fn);
  };

  // ── Navigate to home ────────────────────────────────────────────────────────
  const goToHomeTab = (params = {}) => {
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: TAB_CONTAINER_NAME }] }));
    navigation.dispatch(CommonActions.navigate({ name: TAB_CONTAINER_NAME, params: { screen: HOME_TAB_NAME, params } }));
  };

  // ── Supabase mirror ─────────────────────────────────────────────────────────
  // Upserts the chosen roadmap, then fire-and-forgets circle auto-join.
  // Called in the background after navigation — does not block the user.
  const mirrorToSupabase = async (winner, weeklyHours) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user_id = session?.user?.id;
      if (!user_id) return false;

      const { error } = await supabase.from('user_roadmap').upsert(
        { user_id, recommended_roadmap: winner, time_commitment_hours: weeklyHours, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
      if (error) return false;

      // Auto-join the roadmap circle. Fire-and-forget — idempotent, safe to
      // call on every quiz completion including re-personalisation runs.
      autoJoinRoadmapCircle(winner, session.user).catch((e) =>
        console.warn('autoJoinRoadmapCircle:', e)
      );

      return true;
    } catch { return false; }
  };

  // ── Finalize ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const finishIfReady = async () => {
      const basicsDone         = willingNewCity !== null && willingTech !== null;
      const hasInterest        = Object.values(scores).some((v) => v > 0) || (basicsDone && (willingNewCity || willingTech));
      const hasTimeSplit       = weekdayDaily != null && weekendDaily != null;
      const hasTaskTimePref    = !!preferredTaskTime;
      const hasNotifChoice     = notificationsChoice !== null;
      const onLast             = step === flow.length - 1 && flow.length >= 6;

      if (!onLast || !basicsDone || !hasInterest || !hasTimeSplit || !hasTaskTimePref || !hasNotifChoice || finishingRef.current) return;

      finishingRef.current = true;

      const adjusted = { ...scores };
      if (willingNewCity === false) adjusted.new_city    = -9999;
      if (willingTech    === false) adjusted.tech_switch = -9999;

      let winner = 'financial_glow_up', best = -Infinity;
      for (const [k, v] of Object.entries(adjusted)) { if (v > best) { best = v; winner = k; } }

      const requestedWeeklyTotal = weekdayDaily * 5 + weekendDaily * 2;
      const roadmapTotalHours    = getRoadmapTotalHours(winner);
      const effectiveWeeklyTotal = roadmapTotalHours > 0 ? Math.min(requestedWeeklyTotal, roadmapTotalHours) : requestedWeeklyTotal;
      const averageDaily         = effectiveWeeklyTotal / 7;

      const chosen   = findTaskTimeOption(preferredTaskTime);
      const reminder = subtractMinutes(chosen.hour, chosen.minute, 15);

      const notificationsEnabled = notificationsChoice === 'yes' && notificationsPermissionStatus === 'granted';

      try {
        // Write everything local first — this is fast and all HomeScreen needs
        await AsyncStorage.multiSet([
          ['recommendedRoadmap',         winner],
          ['timeCommitmentHours',        String(effectiveWeeklyTotal)],
          ['weekdayDailyBudgetHours',    String(weekdayDaily)],
          ['weekendDailyBudgetHours',    String(weekendDaily)],
          ['dailyTimeBudgetHours',       String(averageDaily)],
          ['quizCompleted',              'true'],
          ['onboarding.quizDone',        'true'],
          ['onboarded',                  'true'],
          [TASK_TIME_KEY,                chosen.label],
          [TASK_TIME_HOUR_KEY,           String(chosen.hour)],
          [TASK_TIME_MINUTE_KEY,         String(chosen.minute)],
          [TASK_REMINDER_HOUR_KEY,       String(reminder.hour)],
          [TASK_REMINDER_MINUTE_KEY,     String(reminder.minute)],
          [NOTIFICATIONS_CHOICE_KEY,     notificationsChoice],
          [NOTIFICATIONS_ENABLED_KEY,    notificationsEnabled ? 'true' : 'false'],
          [NOTIFICATIONS_PERMISSION_KEY, notificationsPermissionStatus || 'undetermined'],
          [ROADMAP_REMINDER_ENABLED_KEY, notificationsEnabled ? 'true' : 'false'],
        ]);

        // Navigate immediately — HomeScreen reads from AsyncStorage which is
        // already written above. No need to wait on any network call.
        goToHomeTab({ justFinishedQuiz: true });

        // Fire network ops in the background after navigation
        mirrorToSupabase(winner, effectiveWeeklyTotal).catch((e) =>
          console.warn('mirrorToSupabase failed:', e)
        );

        if (notificationsEnabled) {
          refreshDailyRoadmapReminder().catch((e) =>
            console.warn('roadmap reminder refresh failed:', e)
          );
        }

      } catch (e) {
        finishingRef.current = false;
        Alert.alert('Could not save your plan', e?.message || 'Unknown error');
      }
    };

    finishIfReady();
  }, [step, flow.length, willingNewCity, willingTech, scores, weekdayDaily, weekendDaily, preferredTaskTime, notificationsChoice, notificationsPermissionStatus]);

  // ── Render ──────────────────────────────────────────────────────────────────
  const current        = flow[step];
  const selectedLabel  = current?.id ? answers[current.id] : null;
  const totalSteps     = flow.length;
  const DISPLAY_TOTAL  = 10; // always show out of 10 so early steps read "1 of 10", "2 of 10"
  const progressPct    = DISPLAY_TOTAL > 1 ? step / (DISPLAY_TOTAL - 1) : 0;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* ── Dusty rose header — brand + question lives here ── */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.topBar}>
            <Text style={styles.brandMark}>The Reinvention Edit</Text>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{step + 1} of {DISPLAY_TOTAL}</Text>
            </View>
          </View>

          {/* Eyebrow category + question block */}
          <View style={styles.questionBlock}>
            <View style={styles.eyebrowRow}>
              <Text style={styles.eyebrow}>Your journey</Text>
              <View style={styles.eyebrowRule} />
            </View>
            <Text style={styles.title}>{current?.title || 'Loading…'}</Text>
            {current?.subtitle ? (
              <Text style={styles.subtitle}>{current.subtitle}</Text>
            ) : null}
          </View>

          {/* Progress bar at the bottom of the header */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct * 100}%` }]} />
          </View>
        </SafeAreaView>
      </View>

      {/* ── Warm white sheet slides up over the rose header ── */}
      <View style={styles.sheet}>
        <SafeAreaView style={styles.safe}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.choices}>
              {current?.options?.map((opt, i) => (
                <Choice
                  key={`${current.id}-${i}`}
                  text={opt.label}
                  index={i}
                  selected={selectedLabel === opt.label}
                  onPress={() => onPickWithAnswer(current.id, opt.label, opt.onPick)}
                />
              ))}
            </View>
            <View style={{ height: 24 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: colors.dustyRose,
  },

  // ── Dusty rose header ──────────────────────────────────────────────────────
  header: {
    backgroundColor: colors.dustyRose,
    paddingHorizontal: spacing.screenPaddingH,
    paddingBottom: spacing.lg,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 48 : 16,
    paddingBottom: spacing.lg,
  },

  brandMark: {
    fontFamily: 'serif',
    fontSize: 13,
    fontStyle: 'italic',
    letterSpacing: 0.2,
    color: colors.warmWhite,
    opacity: 1,
  },

  stepBadge: {
    backgroundColor: 'rgba(250,247,242,0.28)',
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(250,247,242,0.70)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.warmWhite,
  },

  // ── Question block (lives inside rose header) ──────────────────────────────
  questionBlock: {
    marginBottom: spacing.lg,
  },

  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: 'rgba(250,247,242,0.65)',
  },
  eyebrowRule: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(250,247,242,0.25)',
  },

  title: {
    fontFamily: typography.fontDisplay,
    fontSize: 22,
    fontWeight: '400',
    color: colors.warmWhite,
    lineHeight: 30,
    letterSpacing: 0.2,
    marginBottom: 5,
  },
  subtitle: {
    fontFamily: typography.fontSerif,
    fontStyle: 'italic',
    fontSize: 13,
    color: 'rgba(250,247,242,0.65)',
    lineHeight: 19,
  },

  // ── Progress bar ───────────────────────────────────────────────────────────
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(250,247,242,0.25)',
    borderRadius: 1,
    marginTop: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.warmWhite,
    borderRadius: 1,
  },

  // ── Warm white answer sheet ────────────────────────────────────────────────
  sheet: {
    flex: 1,
    backgroundColor: colors.warmWhite,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
  },
  content: {
    paddingHorizontal: spacing.screenPaddingH,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },

  // ── Choices ────────────────────────────────────────────────────────────────
  choices: {
    gap: spacing.sm,
  },

  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingVertical: 13,
    paddingHorizontal: spacing.md,
    minHeight: 50,
  },
  choiceSelected: {
    backgroundColor: colors.linen,
    borderColor: colors.roseTint18,
  },

  choiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },

  choiceIndex: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.dustyRose,
    width: 16,
    textAlign: 'right',
    flexShrink: 0,
  },
  choiceIndexSelected: {
    color: colors.deepRose,
  },

  choiceText: {
    flex: 1,
    fontFamily: typography.fontSerif,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 20,
  },
  choiceTextSelected: {
    fontWeight: '500',
  },

  choiceRadio: {
    width: 18,
    height: 18,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.fawn,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  choiceRadioSelected: {
    backgroundColor: colors.deepRose,
    borderColor: colors.deepRose,
  },
  choiceRadioInner: {
    width: 6,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.warmWhite,
  },
});