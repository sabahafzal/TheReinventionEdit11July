// lib/roadmapReminders.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from './supabase';
import { roadmapsConfig } from '../config/roadmapsConfig';
import { roadmapTasksFree, roadmapTasksPremium } from '../screens/roadmapTasks';
import { bucketTasksByWeek } from '../utils/taskUtils';
import { isProUser } from './paywall';

/**
 * ------------------------------------------------------------
 * Shared roadmap reminder system
 * ------------------------------------------------------------
 * One daily reminder only.
 *
 * Modes:
 * - normal        => "Today's One Step"
 * - recovery      => missed yesterday / fell out of rhythm
 * - quick_session => backlog is high, suggest a short reset
 *
 * Triggered nudges:
 * - one task away from finishing current week
 * - one task away from finishing current theme
 * - "Never Miss Twice" when exactly one day was missed
 *
 * This file is designed to be called from:
 * - Onboarding (after reminder preference is chosen)
 * - HomeScreen (on focus / app open)
 * - RoadmapPlanScreen (after a task toggle)
 * ------------------------------------------------------------
 */

/** Existing onboarding keys */
export const TASK_TIME_KEY = 'preferredTaskTimeLabel';
export const TASK_TIME_HOUR_KEY = 'preferredTaskTimeHour';
export const TASK_TIME_MINUTE_KEY = 'preferredTaskTimeMinute';
export const TASK_REMINDER_HOUR_KEY = 'preferredTaskReminderHour';
export const TASK_REMINDER_MINUTE_KEY = 'preferredTaskReminderMinute';

export const NOTIFICATIONS_CHOICE_KEY = 'taskReminderChoice';
export const NOTIFICATIONS_ENABLED_KEY = 'notificationsEnabled';
export const NOTIFICATIONS_PERMISSION_KEY = 'notificationsPermissionStatus';
export const DAILY_NOTIFICATION_ID_KEY = 'dailyTaskReminderNotificationId';

/** New roadmap-reminder-specific keys */
export const ROADMAP_REMINDER_ENABLED_KEY = 'roadmapReminderEnabled';
export const ROADMAP_REMINDER_MODE_KEY = 'roadmapReminderMode'; // normal | recovery | quick_session
export const ROADMAP_REMINDER_LAST_TASK_KEY = 'roadmapReminderLastTaskKey';
export const ROADMAP_REMINDER_LAST_REFRESH_KEY = 'roadmapReminderLastRefresh';
export const ROADMAP_REMINDER_LAST_SENT_DATE_KEY = 'roadmapReminderLastSentDate';

/** Triggered progress nudge keys */
export const LAST_WEEK_NUDGE_DATE_KEY = 'last_week_nudge_date';
export const LAST_THEME_NUDGE_DATE_KEY = 'last_theme_nudge_date';
export const LAST_NEVER_MISS_TWICE_DATE_KEY = 'last_never_miss_twice_date';

const TECH_TRACK_KEY = 'techSwitchTrack';
const NEWCITY_TRACK_KEY = 'newCityTrack';
const NEWCITY_JOB_KEY = 'newCityJobStatus';
const PHYSICAL_TRACK_KEY = 'physicalGlowUpTrack';

const DEFAULT_WEEKLY_HOURS = 4;
const DEFAULT_TASK_HOURS = 0.33;
const QUICK_TASK_MAX_HOURS = 0.5;
const BACKLOG_QUICK_SESSION_THRESHOLD = 5;

const VALID_ROADMAP_KEYS = new Set([
  'new_city',
  'tech_switch',
  'financial_glow_up',
  'physical_glow_up',
  'mental_glow_up',
]);

const labelToKey = {
  'starting over in a new city': 'new_city',
  'switching into tech': 'tech_switch',
  'financial glow-up': 'financial_glow_up',
  'physical glow-up': 'physical_glow_up',
  'mental glow-up': 'mental_glow_up',
};

const NOTIFICATION_CHANNEL_ID = 'daily-reminders';

const startOfDayISO = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
};

const toYMD = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, '0');
  const dd = String(x.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const daysBetween = (fromISO, to = new Date()) => {
  if (!fromISO) return 0;
  const f = new Date(fromISO);
  const a = new Date(f.getFullYear(), f.getMonth(), f.getDate()).getTime();
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.max(0, Math.floor((b - a) / 86400000));
};

const weeksBetween = (fromISO, to = new Date()) =>
  Math.floor(daysBetween(fromISO, to) / 7);

const normalizeRoadmapKey = (raw) => {
  if (!raw) return null;
  const key = String(raw).trim().toLowerCase();
  if (VALID_ROADMAP_KEYS.has(key)) return key;
  if (labelToKey[key]) return labelToKey[key];
  return null;
};

const normalizeNewCityTrackKey = (id) => {
  if (id === 'moving_city_only') return 'moving_city';
  return id;
};

const normalizeTrackKey = (roadmapKey, trackKey) => {
  if (roadmapKey !== 'new_city') return trackKey;
  return normalizeNewCityTrackKey(trackKey);
};

const getTaskRuntimeKey = (taskObj) => `${taskObj.themeKey}:${taskObj.__taskIndex}`;

const prettyHours = (h) => {
  const n = Number(h || 0);
  return Number.isFinite(n) ? Number(n.toFixed(2)) : 0;
};

async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: 'Daily reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 150, 150, 150],
    lightColor: '#D6A5D2',
  });
}

async function getCurrentUserId() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch {
    return null;
  }
}

function getThemeKeysForRoadmap({ roadmapKey, trackKey, jobStatusKey }) {
  const cfg = roadmapsConfig?.[roadmapKey] || {};

  if (roadmapKey === 'new_city') {
    const tKey = normalizeTrackKey(roadmapKey, trackKey);
    const baseThemes =
      (tKey && cfg?.tracks?.[tKey]?.themes?.map((t) => t.key)) ||
      (cfg?.themes?.map((t) => t.key)) ||
      Object.keys(roadmapTasksFree?.[roadmapKey] || {});

    const jobCfg = cfg?.jobStatus;
    const opt = jobCfg?.options?.find((o) => o.key === jobStatusKey);
    const prepend = opt?.presets?.prependThemes || [];
    const hide = opt?.presets?.hideThemes || [];

    const seen = new Set();
    const ordered = [];
    [...prepend, ...baseThemes].forEach((k) => {
      if (k && !seen.has(k)) {
        seen.add(k);
        ordered.push(k);
      }
    });

    const hideSet = new Set(hide);
    const filtered = ordered.filter((k) => !hideSet.has(k));
    const groups = roadmapTasksFree?.[roadmapKey] || {};
    return filtered.filter((k) => !!groups[k]);
  }

  if (roadmapKey === 'tech_switch') {
    if (trackKey && cfg?.tracks?.[trackKey]?.themes) {
      return cfg.tracks[trackKey].themes.map((t) => t.key);
    }
    if (Array.isArray(cfg?.generalThemes)) {
      return cfg.generalThemes.map((t) => t.key);
    }
    return Object.keys(roadmapTasksFree?.[roadmapKey] || {});
  }

  if (roadmapKey === 'physical_glow_up') {
    if (trackKey && cfg?.tracks?.[trackKey]?.themes) {
      return cfg.tracks[trackKey].themes.map((t) => t.key);
    }
    return Object.keys(roadmapTasksFree?.[roadmapKey] || {});
  }

  if (Array.isArray(cfg?.themes)) return cfg.themes.map((t) => t.key);
  return Object.keys(roadmapTasksFree?.[roadmapKey] || {});
}

async function loadReminderPrefs() {
  const pairs = await AsyncStorage.multiGet([
    ROADMAP_REMINDER_ENABLED_KEY,
    NOTIFICATIONS_ENABLED_KEY,
    NOTIFICATIONS_PERMISSION_KEY,
    NOTIFICATIONS_CHOICE_KEY,
    TASK_TIME_KEY,
    TASK_TIME_HOUR_KEY,
    TASK_TIME_MINUTE_KEY,
    TASK_REMINDER_HOUR_KEY,
    TASK_REMINDER_MINUTE_KEY,
    DAILY_NOTIFICATION_ID_KEY,
    ROADMAP_REMINDER_MODE_KEY,
    ROADMAP_REMINDER_LAST_TASK_KEY,
    ROADMAP_REMINDER_LAST_REFRESH_KEY,
    ROADMAP_REMINDER_LAST_SENT_DATE_KEY,
    LAST_WEEK_NUDGE_DATE_KEY,
    LAST_THEME_NUDGE_DATE_KEY,
    LAST_NEVER_MISS_TWICE_DATE_KEY,
  ]);

  const map = Object.fromEntries(pairs);

  const notificationsEnabled =
    map[ROADMAP_REMINDER_ENABLED_KEY] != null
      ? map[ROADMAP_REMINDER_ENABLED_KEY] === 'true'
      : map[NOTIFICATIONS_ENABLED_KEY] === 'true';

  const permissionStatus = map[NOTIFICATIONS_PERMISSION_KEY] || 'undetermined';
  const choice = map[NOTIFICATIONS_CHOICE_KEY] || null;

  const taskTimeLabel = map[TASK_TIME_KEY] || 'After dinner';
  const taskHour = Number(map[TASK_TIME_HOUR_KEY]);
  const taskMinute = Number(map[TASK_TIME_MINUTE_KEY]);
  const reminderHour = Number(map[TASK_REMINDER_HOUR_KEY]);
  const reminderMinute = Number(map[TASK_REMINDER_MINUTE_KEY]);

  return {
    enabled: notificationsEnabled,
    permissionStatus,
    choice,
    taskTimeLabel,
    taskHour: Number.isFinite(taskHour) ? taskHour : 19,
    taskMinute: Number.isFinite(taskMinute) ? taskMinute : 30,
    reminderHour: Number.isFinite(reminderHour) ? reminderHour : 19,
    reminderMinute: Number.isFinite(reminderMinute) ? reminderMinute : 15,
    notificationId: map[DAILY_NOTIFICATION_ID_KEY] || null,
    mode: map[ROADMAP_REMINDER_MODE_KEY] || 'normal',
    lastTaskKey: map[ROADMAP_REMINDER_LAST_TASK_KEY] || null,
    lastRefresh: map[ROADMAP_REMINDER_LAST_REFRESH_KEY] || null,
    lastSentDate: map[ROADMAP_REMINDER_LAST_SENT_DATE_KEY] || null,
    lastWeekNudgeDate: map[LAST_WEEK_NUDGE_DATE_KEY] || null,
    lastThemeNudgeDate: map[LAST_THEME_NUDGE_DATE_KEY] || null,
    lastNeverMissTwiceDate: map[LAST_NEVER_MISS_TWICE_DATE_KEY] || null,
  };
}

async function loadRoadmapContext() {
  const pairs = await AsyncStorage.multiGet([
    'recommendedRoadmap',
    TECH_TRACK_KEY,
    NEWCITY_TRACK_KEY,
    NEWCITY_JOB_KEY,
    PHYSICAL_TRACK_KEY,
    'timeCommitmentHours',
    'dailyTimeBudgetHours',
  ]);

  const map = Object.fromEntries(pairs);
  const roadmapKey = normalizeRoadmapKey(map.recommendedRoadmap);
  const techTrack = map[TECH_TRACK_KEY] || null;
  const newCityTrack = map[NEWCITY_TRACK_KEY] || null;
  const newCityJobStatus = map[NEWCITY_JOB_KEY] || null;
  const physicalTrack = map[PHYSICAL_TRACK_KEY] || null;

  let weeklyHours = Number(map.timeCommitmentHours);
  if (!Number.isFinite(weeklyHours) || weeklyHours <= 0) {
    const daily = Number(map.dailyTimeBudgetHours);
    weeklyHours =
      Number.isFinite(daily) && daily > 0
        ? daily * 7
        : DEFAULT_WEEKLY_HOURS;
  }

  let trackKey = null;
  if (roadmapKey === 'tech_switch') trackKey = techTrack;
  if (roadmapKey === 'new_city') trackKey = normalizeTrackKey(roadmapKey, newCityTrack);
  if (roadmapKey === 'physical_glow_up') trackKey = physicalTrack;

  return {
    roadmapKey,
    weeklyHours,
    trackKey,
    jobStatusKey: roadmapKey === 'new_city' ? newCityJobStatus : null,
  };
}

async function buildOrderedTasksForCurrentRoadmap({
  roadmapKey,
  trackKey,
  jobStatusKey,
}) {
  if (!roadmapKey) return [];

  const themeKeys = getThemeKeysForRoadmap({
    roadmapKey,
    trackKey,
    jobStatusKey,
  });

  const allowed = new Set(themeKeys);
  const pro = await isProUser();

  if (!pro) {
    const freeGroups = roadmapTasksFree?.[roadmapKey] || {};
    const out = [];

    themeKeys.forEach((themeKey) => {
      const arr = Array.isArray(freeGroups?.[themeKey]) ? freeGroups[themeKey] : [];
      arr.forEach((taskObj, index) => {
        out.push({
          ...taskObj,
          themeKey,
          __taskIndex: index,
        });
      });
    });

    return out.filter((t) => allowed.has(t.themeKey));
  }

  const premiumFlat = roadmapTasksPremium?.[roadmapKey] || [];
  return premiumFlat
    .filter((t) => allowed.has(t.themeKey))
    .map((taskObj, index) => ({
      ...taskObj,
      __taskIndex: Number.isInteger(taskObj.originalTaskOrder)
        ? taskObj.originalTaskOrder
        : index,
    }));
}

async function loadProgressMap(userId, roadmapKey) {
  if (!userId || !roadmapKey) return {};

  const storageKey = `progress_cache_${userId}_${roadmapKey}`;
  const raw = await AsyncStorage.getItem(storageKey);

  if (!raw) return {};

  try {
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

async function loadPlanStartISO(roadmapKey) {
  if (!roadmapKey) return startOfDayISO();

  const startKey = `planStart_${roadmapKey}__GLOBAL`;
  let iso = await AsyncStorage.getItem(startKey);

  if (!iso) {
    iso = startOfDayISO();
    await AsyncStorage.setItem(startKey, iso);
  }

  return iso;
}

function getDaysSinceLastTask(lastDate, now = new Date()) {
  if (!lastDate) return 0;
  return daysBetween(lastDate, now);
}

function getMissedDayFlags(lastDate, now = new Date()) {
  const daysSinceLastTask = getDaysSinceLastTask(lastDate, now);
  return {
    daysSinceLastTask,
    missedOneDay: daysSinceLastTask === 2,
    missedTwoOrMoreDays: daysSinceLastTask >= 3,
    skippedRecently: daysSinceLastTask >= 2,
  };
}

async function getReminderContext() {
  const userId = await getCurrentUserId();
  const prefs = await loadReminderPrefs();
  const roadmap = await loadRoadmapContext();

  if (!roadmap.roadmapKey) {
    return {
      userId,
      prefs,
      roadmap,
      tasks: [],
      weeks: [],
      map: {},
      currentWeekIndex: 0,
      currentWeekTasks: [],
      backlogTasks: [],
      incompleteTasks: [],
      daysSinceLastTask: 0,
      hasSkippedYesterday: false,
      skippedRecently: false,
    };
  }

  const tasks = await buildOrderedTasksForCurrentRoadmap({
    roadmapKey: roadmap.roadmapKey,
    trackKey: roadmap.trackKey,
    jobStatusKey: roadmap.jobStatusKey,
  });

  const map = await loadProgressMap(userId, roadmap.roadmapKey);
  const weeks = bucketTasksByWeek(tasks, roadmap.weeklyHours || DEFAULT_WEEKLY_HOURS);

  const planStartISO = await loadPlanStartISO(roadmap.roadmapKey);
  const currentWeekIndex = Math.max(
    0,
    Math.min(weeksBetween(planStartISO, new Date()), Math.max(weeks.length - 1, 0))
  );

  const currentWeekTasks = weeks?.[currentWeekIndex] || [];
  const incompleteTasks = tasks.filter((t) => !map?.[getTaskRuntimeKey(t)]?.isCompleted);

  const backlogTasks = [];
  if (Array.isArray(weeks) && currentWeekIndex > 0) {
    for (let weekIndex = 0; weekIndex < currentWeekIndex; weekIndex += 1) {
      const weekTasks = weeks[weekIndex] || [];
      weekTasks.forEach((task) => {
        const key = getTaskRuntimeKey(task);
        if (!map?.[key]?.isCompleted) {
          backlogTasks.push({ ...task, __weekIndex: weekIndex });
        }
      });
    }
  }

  const lastDate = (await AsyncStorage.getItem('streak_last_date')) || '';
  const missed = getMissedDayFlags(lastDate, new Date());

  return {
    userId,
    prefs,
    roadmap,
    tasks,
    weeks,
    map,
    currentWeekIndex,
    currentWeekTasks,
    backlogTasks,
    incompleteTasks,
    daysSinceLastTask: missed.daysSinceLastTask,
    hasSkippedYesterday: missed.missedOneDay,
    skippedRecently: missed.skippedRecently,
    missedOneDay: missed.missedOneDay,
    missedTwoOrMoreDays: missed.missedTwoOrMoreDays,
  };
}

function pickDailyReminderMode({ backlogCount, hasSkippedRecently }) {
  if (hasSkippedRecently) return 'recovery';
  if (backlogCount >= BACKLOG_QUICK_SESSION_THRESHOLD) return 'quick_session';
  return 'normal';
}

function sortByShortest(tasks = []) {
  return [...tasks].sort(
    (a, b) => Number(a?.duration || DEFAULT_TASK_HOURS) - Number(b?.duration || DEFAULT_TASK_HOURS)
  );
}

function pickTaskForMode({
  mode,
  currentWeekTasks,
  backlogTasks,
  incompleteTasks,
  map,
}) {
  const currentIncomplete = (currentWeekTasks || []).filter(
    (task) => !map?.[getTaskRuntimeKey(task)]?.isCompleted
  );

  if (mode === 'recovery') {
    const pool = backlogTasks.length > 0
      ? backlogTasks
      : currentIncomplete.length > 0
        ? currentIncomplete
        : incompleteTasks;
    return sortByShortest(pool)[0] || null;
  }

  if (mode === 'quick_session') {
    const pool =
      backlogTasks.length > 0
        ? backlogTasks
        : currentIncomplete.length > 0
          ? currentIncomplete
          : incompleteTasks;

    const quick = sortByShortest(pool).find(
      (task) => Number(task?.duration || DEFAULT_TASK_HOURS) <= QUICK_TASK_MAX_HOURS
    );

    return quick || sortByShortest(pool)[0] || null;
  }

  return currentIncomplete[0] || incompleteTasks[0] || null;
}

function trimTaskText(taskText = '', max = 90) {
  const text = String(taskText || '').trim();
  if (!text) return 'Open your roadmap and take one small step.';
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function buildDailyReminderContent({ mode, task }) {
  const taskText = trimTaskText(task?.task || task?.title || '');

  if (mode === 'recovery') {
    return {
      title: 'A gentle restart ✨',
      body: `Missed yesterday? No problem — ${taskText}`,
    };
  }

  if (mode === 'quick_session') {
    return {
      title: 'Your 10-minute reset',
      body: `Only 10 minutes today? ${taskText}`,
    };
  }

  return {
    title: "Today's One Step",
    body: taskText,
  };
}

function getIncompleteCount(tasks = [], map = {}) {
  return (tasks || []).filter((task) => !map?.[getTaskRuntimeKey(task)]?.isCompleted).length;
}

function groupTasksByTheme(tasks = []) {
  const groups = [];
  const seen = new Map();

  (tasks || []).forEach((task) => {
    const themeKey = task?.themeKey || 'default';
    if (!seen.has(themeKey)) {
      const group = {
        themeKey,
        tasks: [],
      };
      seen.set(themeKey, group);
      groups.push(group);
    }
    seen.get(themeKey).tasks.push(task);
  });

  return groups;
}

function getCurrentActiveTheme(tasks = [], map = {}) {
  const groups = groupTasksByTheme(tasks);

  for (const group of groups) {
    const incompleteTasks = group.tasks.filter(
      (task) => !map?.[getTaskRuntimeKey(task)]?.isCompleted
    );

    if (incompleteTasks.length > 0) {
      return {
        themeKey: group.themeKey,
        tasks: group.tasks,
        incompleteTasks,
        remainingCount: incompleteTasks.length,
      };
    }
  }

  return null;
}

function buildWeekProgressNudgeContent() {
  return {
    title: "You're nearly there ✨",
    body: "You're one step away from finishing this week's plan.",
  };
}

function buildThemeProgressNudgeContent() {
  return {
    title: 'Almost there 💫',
    body: 'One more task completes this theme.',
  };
}

function buildNeverMissTwiceContent() {
  return {
    title: 'Tiny reset, big difference ✨',
    body: "You missed yesterday. Let's not miss twice.",
  };
}

async function sendImmediateRoadmapNudge(content) {
  try {
    await ensureAndroidNotificationChannel();

    // Use seconds: 2 so this nudge never fires at the exact same second as a
    // concurrently scheduled daily reminder — simultaneous scheduleNotificationAsync
    // calls on Android can crash the notification channel.
    const trigger =
      Platform.OS === 'android'
        ? {
            channelId: NOTIFICATION_CHANNEL_ID,
            seconds: 2,
          }
        : null;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        sound: true,
      },
      trigger,
    });
  } catch (e) {
    console.warn('sendImmediateRoadmapNudge failed', e);
    return null;
  }
}

async function wasNudgeSentToday(storageKey) {
  const today = toYMD(new Date());
  const last = await AsyncStorage.getItem(storageKey);
  return last === today;
}

async function markNudgeSentToday(storageKey) {
  await AsyncStorage.setItem(storageKey, toYMD(new Date()));
}

export async function cancelDailyRoadmapReminder() {
  try {
    const existingId = await AsyncStorage.getItem(DAILY_NOTIFICATION_ID_KEY);
    if (existingId) {
      await Notifications.cancelScheduledNotificationAsync(existingId);
    }
  } catch {}

  await AsyncStorage.multiRemove([
    DAILY_NOTIFICATION_ID_KEY,
    ROADMAP_REMINDER_MODE_KEY,
    ROADMAP_REMINDER_LAST_TASK_KEY,
  ]);
}

export async function markRoadmapReminderSent(dateYMD = toYMD(new Date())) {
  await AsyncStorage.setItem(ROADMAP_REMINDER_LAST_SENT_DATE_KEY, dateYMD);
}

async function scheduleDailyRoadmapReminder({ hour, minute, content }) {
  await ensureAndroidNotificationChannel();
  await cancelDailyRoadmapReminder();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: content.title,
      body: content.body,
      sound: true,
    },
    trigger:
      Platform.OS === 'android'
        ? {
            channelId: NOTIFICATION_CHANNEL_ID,
            hour,
            minute,
            repeats: true,
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
          }
        : {
            hour,
            minute,
            repeats: true,
          },
  });

  return id;
}

async function maybeSendThemeProgressNudge(context) {
  const { prefs, roadmap, tasks, map, incompleteTasks } = context;

  if (!prefs.enabled || prefs.choice === 'no' || prefs.permissionStatus !== 'granted') {
    return { sent: false, reason: 'notifications_disabled' };
  }

  if (!roadmap?.roadmapKey || !incompleteTasks?.length) {
    return { sent: false, reason: 'no_active_roadmap' };
  }

  if (await wasNudgeSentToday(LAST_THEME_NUDGE_DATE_KEY)) {
    return { sent: false, reason: 'already_sent_today' };
  }

  const activeTheme = getCurrentActiveTheme(tasks, map);
  if (!activeTheme || activeTheme.remainingCount !== 1) {
    return { sent: false, reason: 'theme_not_one_away' };
  }

  const notificationId = await sendImmediateRoadmapNudge(buildThemeProgressNudgeContent());
  await markNudgeSentToday(LAST_THEME_NUDGE_DATE_KEY);

  return {
    sent: true,
    type: 'theme_progress',
    notificationId,
    themeKey: activeTheme.themeKey,
    remainingCount: activeTheme.remainingCount,
  };
}

async function maybeSendWeekProgressNudge(context) {
  const { prefs, roadmap, currentWeekTasks, currentWeekIndex, map, incompleteTasks } = context;

  if (!prefs.enabled || prefs.choice === 'no' || prefs.permissionStatus !== 'granted') {
    return { sent: false, reason: 'notifications_disabled' };
  }

  if (!roadmap?.roadmapKey || !incompleteTasks?.length) {
    return { sent: false, reason: 'no_active_roadmap' };
  }

  if (await wasNudgeSentToday(LAST_WEEK_NUDGE_DATE_KEY)) {
    return { sent: false, reason: 'already_sent_today' };
  }

  const remainingInCurrentWeek = getIncompleteCount(currentWeekTasks, map);
  if (remainingInCurrentWeek !== 1) {
    return { sent: false, reason: 'week_not_one_away' };
  }

  const notificationId = await sendImmediateRoadmapNudge(buildWeekProgressNudgeContent());
  await markNudgeSentToday(LAST_WEEK_NUDGE_DATE_KEY);

  return {
    sent: true,
    type: 'week_progress',
    notificationId,
    weekIndex: currentWeekIndex,
    remainingCount: remainingInCurrentWeek,
  };
}

async function maybeSendNeverMissTwiceNudge(context) {
  const { prefs, roadmap, incompleteTasks, missedOneDay, daysSinceLastTask } = context;

  if (!prefs.enabled || prefs.choice === 'no' || prefs.permissionStatus !== 'granted') {
    return { sent: false, reason: 'notifications_disabled' };
  }

  if (!roadmap?.roadmapKey || !incompleteTasks?.length) {
    return { sent: false, reason: 'no_active_roadmap' };
  }

  if (!missedOneDay) {
    return { sent: false, reason: 'did_not_miss_exactly_one_day', daysSinceLastTask };
  }

  if (await wasNudgeSentToday(LAST_NEVER_MISS_TWICE_DATE_KEY)) {
    return { sent: false, reason: 'already_sent_today' };
  }

  const notificationId = await sendImmediateRoadmapNudge(buildNeverMissTwiceContent());
  await markNudgeSentToday(LAST_NEVER_MISS_TWICE_DATE_KEY);

  return {
    sent: true,
    type: 'never_miss_twice',
    notificationId,
    daysSinceLastTask,
  };
}

/**
 * Triggered roadmap nudges
 *
 * Recommended usage:
 * - HomeScreen focus/app open:
 *   await evaluateTriggeredRoadmapNudges({ trigger: 'app_focus' });
 *
 * - RoadmapPlanScreen after task toggle:
 *   await evaluateTriggeredRoadmapNudges({ trigger: 'task_toggle' });
 */
export async function evaluateTriggeredRoadmapNudges(options = {}) {
  try {
    const { trigger = 'manual' } = options;
    const context = await getReminderContext();

    const order =
      trigger === 'app_focus'
        ? [maybeSendNeverMissTwiceNudge, maybeSendThemeProgressNudge, maybeSendWeekProgressNudge]
        : [maybeSendThemeProgressNudge, maybeSendWeekProgressNudge, maybeSendNeverMissTwiceNudge];

    for (const fn of order) {
      const result = await fn(context);
      if (result?.sent) {
        return {
          ok: true,
          sent: true,
          trigger,
          ...result,
        };
      }
    }

    return {
      ok: true,
      sent: false,
      trigger,
      reason: 'no_triggered_nudge_matched',
      currentWeekIndex: context.currentWeekIndex,
      daysSinceLastTask: context.daysSinceLastTask,
    };
  } catch (error) {
    console.warn('evaluateTriggeredRoadmapNudges error', error);
    return { ok: false, sent: false, reason: 'error', error };
  }
}

export async function refreshDailyRoadmapReminder() {
  try {
    const context = await getReminderContext();
    const { prefs, roadmap, map, currentWeekTasks, backlogTasks, incompleteTasks } = context;

    if (!prefs.enabled) {
      await cancelDailyRoadmapReminder();
      return { ok: false, reason: 'disabled' };
    }

    if (prefs.choice === 'no') {
      await cancelDailyRoadmapReminder();
      return { ok: false, reason: 'opted_out' };
    }

    if (prefs.permissionStatus !== 'granted') {
      await cancelDailyRoadmapReminder();
      return { ok: false, reason: 'permission_not_granted' };
    }

    if (!roadmap.roadmapKey) {
      await cancelDailyRoadmapReminder();
      return { ok: false, reason: 'no_roadmap' };
    }

    if (!incompleteTasks.length) {
      await cancelDailyRoadmapReminder();
      return { ok: false, reason: 'roadmap_complete' };
    }

    const mode = pickDailyReminderMode({
      backlogCount: backlogTasks.length,
      hasSkippedRecently: context.skippedRecently,
    });

    const task = pickTaskForMode({
      mode,
      currentWeekTasks,
      backlogTasks,
      incompleteTasks,
      map,
    });

    if (!task) {
      await cancelDailyRoadmapReminder();
      return { ok: false, reason: 'no_task_found' };
    }

    const content = buildDailyReminderContent({ mode, task });
    const notificationId = await scheduleDailyRoadmapReminder({
      hour: prefs.reminderHour,
      minute: prefs.reminderMinute,
      content,
    });

    await AsyncStorage.multiSet([
      [ROADMAP_REMINDER_ENABLED_KEY, 'true'],
      [DAILY_NOTIFICATION_ID_KEY, notificationId],
      [ROADMAP_REMINDER_MODE_KEY, mode],
      [ROADMAP_REMINDER_LAST_TASK_KEY, getTaskRuntimeKey(task)],
      [ROADMAP_REMINDER_LAST_REFRESH_KEY, new Date().toISOString()],
      [TASK_REMINDER_HOUR_KEY, String(prefs.reminderHour)],
      [TASK_REMINDER_MINUTE_KEY, String(prefs.reminderMinute)],
    ]);

    return {
      ok: true,
      notificationId,
      mode,
      taskKey: getTaskRuntimeKey(task),
      taskText: task?.task || '',
      reminderHour: prefs.reminderHour,
      reminderMinute: prefs.reminderMinute,
      backlogCount: backlogTasks.length,
      skippedRecently: context.skippedRecently,
    };
  } catch (error) {
    console.warn('refreshDailyRoadmapReminder error', error);
    return { ok: false, reason: 'error', error };
  }
}

export async function getRoadmapReminderPrefs() {
  return loadReminderPrefs();
}

export async function setRoadmapReminderEnabled(enabled) {
  const value = enabled ? 'true' : 'false';
  await AsyncStorage.multiSet([
    [ROADMAP_REMINDER_ENABLED_KEY, value],
    [NOTIFICATIONS_ENABLED_KEY, value],
  ]);

  if (!enabled) {
    await cancelDailyRoadmapReminder();
  }
}

export async function getCurrentRoadmapReminderPreview() {
  const context = await getReminderContext();
  const { backlogTasks, currentWeekTasks, incompleteTasks, map } = context;

  const mode = pickDailyReminderMode({
    backlogCount: backlogTasks.length,
    hasSkippedRecently: context.skippedRecently,
  });

  const task = pickTaskForMode({
    mode,
    currentWeekTasks,
    backlogTasks,
    incompleteTasks,
    map,
  });

  const activeTheme = getCurrentActiveTheme(context.tasks, map);
  const remainingInCurrentWeek = getIncompleteCount(currentWeekTasks, map);

  return {
    mode,
    task,
    content: task ? buildDailyReminderContent({ mode, task }) : null,
    backlogCount: backlogTasks.length,
    currentWeekIndex: context.currentWeekIndex,
    currentWeekRemainingCount: remainingInCurrentWeek,
    currentThemeKey: activeTheme?.themeKey || null,
    currentThemeRemainingCount: activeTheme?.remainingCount ?? null,
    missedOneDay: context.missedOneDay,
    daysSinceLastTask: context.daysSinceLastTask,
    weeklyHours: prettyHours(context.roadmap?.weeklyHours),
  };
}