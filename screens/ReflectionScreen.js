// screens/ReflectionScreen.js
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Share,
  Switch,
  Modal,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

// 🔔 Notifications
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Roadmap progress + roadmap/task config
import { useRoadmapProgress } from '../hooks/useRoadmapProgress';
import { roadmapsConfig } from '../config/roadmapsConfig';
import { roadmapTasksFree, roadmapTasksPremium } from './roadmapTasks';
import { isProUser } from '../lib/paywall';
import { colors, typography, spacing, radii, shadows } from './theme';
import { identityStatements } from '../config/configidentityStatements';

const moodTints = {
  '🤩': '#FFEFD6',
  '😌': '#EAF7F1',
  '😴': '#EDF0FF',
  '😤': '#FFEAEA',
  '😔': '#F3EDF7',
};

// AsyncStorage keys for reminder prefs
const REMINDER_ENABLED_KEY = 'reflectionReminderEnabled';
const REMINDER_TIME_KEY = 'reflectionReminderTime';
const DEFAULT_REMINDER = '20:00'; // 8 PM fallback
const WEEKLY_REMINDER_ENABLED_KEY = 'reflectionWeeklyReminderEnabled';
const WEEKLY_REMINDER_TIME_KEY = 'reflectionWeeklyReminderTime';
const DEFAULT_WEEKLY_REMINDER = '18:00'; // 6 PM Sunday fallback

// Reflection-specific soft nudge throttle keys
const LAST_REFLECTION_NUDGE_DATE_KEY = 'last_reflection_nudge_date';
const LAST_WEEKLY_REFLECTION_NUDGE_WEEK_KEY = 'last_weekly_reflection_nudge_week';

// Weekly review local storage
const WEEKLY_REVIEW_KEY_PREFIX = 'weeklyReview-';

// Shared app streak keys (same ones already used elsewhere)
const APP_STREAK_COUNT_KEY = 'streak_count';
const APP_STREAK_BEST_KEY = 'streak_best';

// Track keys used across the app
const TECH_TRACK_KEY = 'techSwitchTrack';
const NEWCITY_TRACK_KEY = 'newCityTrack';
const NEWCITY_JOB_KEY = 'newCityJobStatus';
const PHYSICAL_TRACK_KEY = 'physicalGlowUpTrack';

// Notification handler is set once, in App.js — the true entry point.
// Setting it again here (with the outdated shouldShowAlert shape) used to
// silently overwrite that correct handler the moment this lazy-loaded
// screen was opened, breaking notification banners app-wide from then on.

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

const getTaskRuntimeKey = (task) => {
  if (!task) return 'unknown:unknown';
  return `${String(task.themeKey ?? 'unknown')}:${String(task.__taskIndex ?? 'unknown')}`;
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
    if (Array.isArray(cfg?.generalThemes)) return cfg.generalThemes.map((t) => t.key);
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

const getStartOfWeek = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 Sun, 1 Mon...
  const diff = day === 0 ? -6 : 1 - day; // week starts Monday
  d.setDate(d.getDate() + diff);
  return d;
};

const getEndOfWeek = (date = new Date()) => {
  const d = getStartOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
};

const getWeekKey = (date = new Date()) => {
  const start = getStartOfWeek(date);
  return format(start, 'yyyy-MM-dd');
};

const getTodayKey = (date = new Date()) => format(date, 'yyyy-MM-dd');

const isDateInCurrentWeek = (dateInput) => {
  if (!dateInput) return false;
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return false;
  const start = getStartOfWeek(new Date());
  const end = getEndOfWeek(new Date());
  return d >= start && d <= end;
};

const getWeekDatesLabel = () => {
  const start = getStartOfWeek(new Date());
  const end = getEndOfWeek(new Date());
  return `${format(start, 'd MMM')} – ${format(end, 'd MMM')}`;
};

const hasReflectionToday = (history = []) => {
  const todayKey = getTodayKey();
  return history.some((item) => item?.date === todayKey);
};

const countReflectionsThisWeek = (history = []) => {
  return history.filter((item) => isDateInCurrentWeek(item?.date)).length;
};

const getReflectionNudgeCopy = ({ weeklyCount = 0, hasReflectedToday: reflectedToday = false }) => {
  if (reflectedToday) return null;

  if (weeklyCount >= 3) {
    return `You’ve reflected ${weeklyCount} times this week! Keep the streak soft and steady.`;
  }

  if (weeklyCount === 0) {
    return 'Take 2 minutes to reflect on today.';
  }

  return 'A short check-in tonight will help next week feel clearer.';
};

const getIdentityStatement = ({ roadmapKey, techRole, newCityTrack, newCityJobStatus, physicalTrack }) => {
  if (!roadmapKey) return '';

  if (roadmapKey === 'tech_switch') {
    return identityStatements.tech_switch?.[techRole] || '';
  }

  if (roadmapKey === 'new_city') {
    if (newCityJobStatus === 'job_secured') return identityStatements.new_city.job_secured;
    if (newCityJobStatus === 'job_needed') return identityStatements.new_city.job_needed;
    return identityStatements.new_city?.[normalizeNewCityTrackKey(newCityTrack)] || '';
  }

  if (roadmapKey === 'physical_glow_up') {
    return identityStatements.physical_glow_up?.[physicalTrack] || '';
  }

  return identityStatements[roadmapKey] || '';
};

const ReflectionScreen = () => {
  // Inputs
  const [reflection, setReflection] = useState('');
  const [dayRating, setDayRating] = useState(null);
  const [mood, setMood] = useState(null);
  const [gratitude, setGratitude] = useState('');

  // Weekly review inputs
  const [weeklyWin, setWeeklyWin] = useState('');
  const [weeklyFocus, setWeeklyFocus] = useState('');
  const [weeklyChallenge, setWeeklyChallenge] = useState('');

  // UI state
  const [history, setHistory] = useState([]);
  const [reflectionStreak, setReflectionStreak] = useState(0);
  const [appStreak, setAppStreak] = useState(0);
  const [bestAppStreak, setBestAppStreak] = useState(0);

  // Reminder state
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(DEFAULT_REMINDER);
  const scheduledIdRef = useRef(null);
  const [weeklyReminderEnabled, setWeeklyReminderEnabled] = useState(false);
  const [weeklyReminderTime, setWeeklyReminderTime] = useState(DEFAULT_WEEKLY_REMINDER);
  const weeklyScheduledIdRef = useRef(null);
  const [clockVisible, setClockVisible] = useState(false);
  const [clockTarget, setClockTarget] = useState('daily');
  const [clockHour, setClockHour] = useState(20);
  const [clockMinute, setClockMinute] = useState(0);

  // Roadmap state for weekly summary
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [techRole, setTechRole] = useState(null);
  const [newCityTrack, setNewCityTrack] = useState(null);
  const [newCityJobStatus, setNewCityJobStatus] = useState(null);
  const [physicalTrack, setPhysicalTrack] = useState(null);
  const [proStatus, setProStatus] = useState(false);

  const { map } = useRoadmapProgress({
    roadmapKey: selectedRoadmap || '',
    planLength: null,
  });

  useEffect(() => {
    loadReflectionData();
    initReminderPrefs();
    loadRoadmapContext();
    loadWeeklyReview();
    loadAppStreak();
  }, []);

  useEffect(() => {
    setReflectionStreak(calcReflectionStreak(history));
  }, [history]);

  const roleOrTrackForSelectedRoadmap = useMemo(() => {
    if (selectedRoadmap === 'tech_switch') return techRole;
    if (selectedRoadmap === 'new_city') return normalizeNewCityTrackKey(newCityTrack);
    if (selectedRoadmap === 'physical_glow_up') return physicalTrack;
    return null;
  }, [selectedRoadmap, techRole, newCityTrack, physicalTrack]);

  const identityStatement = useMemo(() => {
    return getIdentityStatement({
      roadmapKey: selectedRoadmap,
      techRole,
      newCityTrack,
      newCityJobStatus,
      physicalTrack,
    });
  }, [selectedRoadmap, techRole, newCityTrack, newCityJobStatus, physicalTrack]);

  const themeKeys = useMemo(() => {
    if (!selectedRoadmap) return [];
    return getThemeKeysForRoadmap({
      roadmapKey: selectedRoadmap,
      trackKey: roleOrTrackForSelectedRoadmap,
      jobStatusKey: newCityJobStatus,
    });
  }, [selectedRoadmap, roleOrTrackForSelectedRoadmap, newCityJobStatus]);

  const orderedTasks = useMemo(() => {
    if (!selectedRoadmap) return [];

    const allowed = new Set(themeKeys);

    if (!proStatus) {
      const freeGroups = roadmapTasksFree?.[selectedRoadmap] || {};
      const out = [];

      themeKeys.forEach((themeKey) => {
        const arr =
          selectedRoadmap === 'tech_switch'
            ? getTasksForTheme(roadmapTasksFree, selectedRoadmap, themeKey, roleOrTrackForSelectedRoadmap)
            : Array.isArray(freeGroups?.[themeKey])
              ? freeGroups[themeKey]
              : [];

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

    const premiumFlat = roadmapTasksPremium?.[selectedRoadmap] || [];
    return premiumFlat
      .filter((t) => allowed.has(t.themeKey))
      .map((taskObj, index) => ({
        ...taskObj,
        __taskIndex: Number.isInteger(taskObj.originalTaskOrder)
          ? taskObj.originalTaskOrder
          : index,
      }));
  }, [selectedRoadmap, themeKeys, proStatus, roleOrTrackForSelectedRoadmap]);

  const weeklyRoadmapStats = useMemo(() => {
    const allTasks = orderedTasks || [];
    const totalTasks = allTasks.length;

    let totalCompleted = 0;
    let completedThisWeek = 0;
    let hoursThisWeek = 0;

    allTasks.forEach((task) => {
      const runtimeKey = getTaskRuntimeKey(task);
      const progressItem = map?.[runtimeKey];
      if (progressItem?.isCompleted) {
        totalCompleted += 1;

        if (isDateInCurrentWeek(progressItem.completedAt)) {
          completedThisWeek += 1;
          hoursThisWeek += Number(task.duration || 0);
        }
      }
    });

    const progressPct =
      totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

    return {
      tasksCompletedThisWeek: completedThisWeek,
      hoursInvestedThisWeek: Number(hoursThisWeek.toFixed(2)),
      roadmapProgressPct: progressPct,
      totalCompleted,
      totalTasks,
    };
  }, [orderedTasks, map]);

  const weeklyReflectionStats = useMemo(() => {
    const thisWeek = history.filter((entry) => {
      if (!entry?.date) return false;
      const d = new Date(entry.date);
      return isDateInCurrentWeek(d);
    });

    const previousWeekStart = getStartOfWeek(new Date());
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const previousWeekEnd = new Date(previousWeekStart);
    previousWeekEnd.setDate(previousWeekEnd.getDate() + 6);
    previousWeekEnd.setHours(23, 59, 59, 999);

    const previousWeek = history.filter((entry) => {
      if (!entry?.date) return false;
      const d = new Date(entry.date);
      return d >= previousWeekStart && d <= previousWeekEnd;
    });

    const ratings = thisWeek
      .map((x) => x.rating)
      .filter((n) => typeof n === 'number');

    const prevRatings = previousWeek
      .map((x) => x.rating)
      .filter((n) => typeof n === 'number');

    const avg = ratings.length
      ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2))
      : 0;

    const prevAvg = prevRatings.length
      ? Number((prevRatings.reduce((a, b) => a + b, 0) / prevRatings.length).toFixed(2))
      : 0;

    const moodCounts = {};
    thisWeek.forEach((row) => {
      if (row.mood) moodCounts[row.mood] = (moodCounts[row.mood] || 0) + 1;
    });

    const dominantMood =
      Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return {
      reflectionsThisWeek: thisWeek.length,
      avgRatingThisWeek: avg,
      avgRatingLastWeek: prevAvg,
      dominantMood,
    };
  }, [history]);

  // --- Helpers ---
const getUserId = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }
  return session.user.id;
};

  const loadRoadmapContext = async () => {
    try {
      const [
        roadmapRaw,
        techTrackVal,
        newCityTrackVal,
        newCityJobVal,
        physicalTrackVal,
      ] = await AsyncStorage.multiGet([
        'recommendedRoadmap',
        TECH_TRACK_KEY,
        NEWCITY_TRACK_KEY,
        NEWCITY_JOB_KEY,
        PHYSICAL_TRACK_KEY,
      ]);

      setSelectedRoadmap(normalizeRoadmapKey(roadmapRaw?.[1]) || null);
      setTechRole(techTrackVal?.[1] || null);
      setNewCityTrack(newCityTrackVal?.[1] || null);
      setNewCityJobStatus(newCityJobVal?.[1] || null);
      setPhysicalTrack(physicalTrackVal?.[1] || null);

      const pro = await isProUser();
      setProStatus(!!pro);
    } catch (e) {
      console.warn('Roadmap context load failed:', e?.message || e);
    }
  };

  const loadAppStreak = async () => {
    try {
      const [[, current], [, best]] = await AsyncStorage.multiGet([
        APP_STREAK_COUNT_KEY,
        APP_STREAK_BEST_KEY,
      ]);
      setAppStreak(parseInt(current || '0', 10) || 0);
      setBestAppStreak(parseInt(best || '0', 10) || 0);
    } catch (e) {
      console.warn('App streak load failed:', e?.message || e);
    }
  };

  // Calculate current reflection streak based on consecutive dates starting today
  const calcReflectionStreak = (rows) => {
    if (!rows?.length) return 0;
    const dates = new Set(rows.map((r) => r.date));
    let s = 0;
    const d = new Date();
    while (true) {
      const key = format(d, 'yyyy-MM-dd');
      if (!dates.has(key)) break;
      s += 1;
      d.setDate(d.getDate() - 1);
    }
    return s;
  };

  const getBadges = (s) => {
    const b = [];
    if (s >= 3) b.push('📍 3-day Streak');
    if (s >= 7) b.push('💫 7-day Streak');
    if (s >= 14) b.push('🌸 14-day Bloom');
    if (s >= 30) b.push('👑 30-day Queen');
    return b;
  };

  const weeklyStats = (arr) => {
    const thisWeek = arr.filter((entry) => {
      if (!entry?.date) return false;
      const d = new Date(entry.date);
      return isDateInCurrentWeek(d);
    });

    if (!thisWeek.length) return { avg: 0, best: null, worst: null, days: 0 };

    const ratings = thisWeek.map((x) => x.rating).filter((n) => typeof n === 'number');
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const best = thisWeek.reduce((m, x) => (x.rating > (m?.rating ?? -1) ? x : m), null);
    const worst = thisWeek.reduce((m, x) => (x.rating < (m?.rating ?? 6) ? x : m), null);

    return {
      avg: Number(avg.toFixed(2)),
      best,
      worst,
      days: thisWeek.length,
    };
  };

  const getConsistencyNudge = useCallback(() => {
    const reflectionDays = weeklyReflectionStats.reflectionsThisWeek;
    const taskCount = weeklyRoadmapStats.tasksCompletedThisWeek;

    if (reflectionDays >= 5 && taskCount >= 3) {
      return 'You’re building a very strong loop this week; action + reflection. Keep it going.';
    }

    if (reflectionDays >= 4 && taskCount === 0) {
      return 'You reflected well this week. Next step: tie that awareness to one concrete roadmap action.';
    }

    if (reflectionDays <= 1 && taskCount >= 3) {
      return 'You’re taking action well. Add a 2-minute evening reflection to help the progress stick.';
    }

    if (reflectionDays <= 1 && taskCount <= 1) {
      return 'Keep it light: one small roadmap step and one sentence of reflection tomorrow is enough.';
    }

    return 'Consistency beats intensity. A short check-in every evening will make your progress feel more real.';
  }, [weeklyReflectionStats, weeklyRoadmapStats]);

  const getInsightLine = useCallback(() => {
    const { dominantMood, avgRatingThisWeek, avgRatingLastWeek } = weeklyReflectionStats;

    if (dominantMood && avgRatingLastWeek > 0) {
      if (avgRatingThisWeek > avgRatingLastWeek) {
        return `Your dominant mood this week was ${dominantMood}, and your average rating improved versus last week.`;
      }
      if (avgRatingThisWeek < avgRatingLastWeek) {
        return `Your dominant mood this week was ${dominantMood}. Your average rating dipped a little versus last week, so next week may need gentler pacing.`;
      }
    }

    if (dominantMood) {
      return `Your most common mood this week was ${dominantMood}.`;
    }

    if (weeklyRoadmapStats.tasksCompletedThisWeek >= 3) {
      return 'You created momentum this week, the kind that compounds.';
    }

    return 'Small notes create big patterns over time. Keep collecting the data on your own life.';
  }, [weeklyReflectionStats, weeklyRoadmapStats]);

  const maybeShowReflectionNudge = useCallback(async () => {
    try {
      const enabled = await AsyncStorage.getItem(REMINDER_ENABLED_KEY);
      if (enabled !== 'true') return;

      const todayKey = getTodayKey();
      const weekKey = getWeekKey();

      const weeklyCount = countReflectionsThisWeek(history);
      const reflectedToday = hasReflectionToday(history);

      if (!reflectedToday) {
        const lastDailyNudge = await AsyncStorage.getItem(LAST_REFLECTION_NUDGE_DATE_KEY);

        if (lastDailyNudge !== todayKey) {
          const copy = getReflectionNudgeCopy({
            weeklyCount,
            hasReflectedToday: reflectedToday,
          });

          if (copy) {
            Alert.alert('Reflection reminder ✨', copy);
            await AsyncStorage.setItem(LAST_REFLECTION_NUDGE_DATE_KEY, todayKey);
            return;
          }
        }
      }

      const lastWeeklyNudge = await AsyncStorage.getItem(LAST_WEEKLY_REFLECTION_NUDGE_WEEK_KEY);

      if (!reflectedToday && weeklyCount >= 3 && lastWeeklyNudge !== weekKey) {
        Alert.alert(
          'Weekly reflection nudge 🌙',
          `You’ve reflected ${weeklyCount} times this week! Keep the streak soft and steady.`
        );
        await AsyncStorage.setItem(LAST_WEEKLY_REFLECTION_NUDGE_WEEK_KEY, weekKey);
      }
    } catch (e) {
      console.warn('Reflection nudge failed:', e?.message || e);
    }
  }, [history]);

  useFocusEffect(
    useCallback(() => {
      maybeShowReflectionNudge();
    }, [maybeShowReflectionNudge])
  );

  const shareWeekly = async () => {
    const s = weeklyStats(history);
    const lines = [
      `✨ My Reinvention Edit weekly review (${getWeekDatesLabel()})`,
      `Hours invested this week: ${weeklyRoadmapStats.hoursInvestedThisWeek}`,
      `Tasks completed this week: ${weeklyRoadmapStats.tasksCompletedThisWeek}`,
      `Current streak: ${appStreak}`,
      `Roadmap progress: ${weeklyRoadmapStats.roadmapProgressPct}%`,
      `Reflection days this week: ${weeklyReflectionStats.reflectionsThisWeek}`,
      `Average day rating: ${s.avg || '—'}`,
      weeklyWin ? `What went well: ${weeklyWin}` : null,
      weeklyFocus ? `Next week focus: ${weeklyFocus}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await Share.share({ message: lines });
    } catch {}
  };

  const loadReflectionData = async () => {
    try {
      const userId = await getUserId();

      let sel = 'reflection_date, rating, text, mood, gratitude';
      let { data, error } = await supabase
        .from('reflections')
        .select(sel)
        .eq('user_id', userId)
        .order('reflection_date', { ascending: false });

      if (error) {
        sel = 'reflection_date, rating, text';
        ({ data, error } = await supabase
          .from('reflections')
          .select(sel)
          .eq('user_id', userId)
          .order('reflection_date', { ascending: false }));
        if (error) throw error;
      }

      if (Array.isArray(data)) {
        const mapped = data.map((r) => ({
          date: r.reflection_date,
          rating: r.rating,
          text: r.text,
          mood: r.mood || null,
          gratitude: r.gratitude || '',
        }));
        setHistory(mapped);
        await cacheLocally(mapped);
        return;
      }
    } catch (e) {
      console.warn('Supabase load failed, falling back to local cache:', e?.message || e);
    }

    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const reflectionKeys = allKeys.filter((key) => key.startsWith('reflection-'));
      const allItems = await AsyncStorage.multiGet(reflectionKeys);
      const parsed = allItems.map(([key, value]) => {
        const base = { date: key.replace('reflection-', ''), rating: null, text: '' };
        if (!value) return base;
        try {
          const v = JSON.parse(value);
          return {
            date: base.date,
            rating: v.rating ?? null,
            text: v.text ?? '',
            mood: v.mood ?? null,
            gratitude: v.gratitude ?? '',
          };
        } catch {
          return base;
        }
      });
      setHistory(parsed.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error('Error loading local history:', error);
    }
  };

  const cacheLocally = async (rows) => {
    try {
      const pairs = rows.map((r) => [
        `reflection-${r.date}`,
        JSON.stringify({
          rating: r.rating,
          text: r.text,
          mood: r.mood ?? null,
          gratitude: r.gratitude ?? '',
        }),
      ]);
      await AsyncStorage.multiSet(pairs);
    } catch {}
  };

  const loadWeeklyReview = async () => {
    try {
      const weekKey = `${WEEKLY_REVIEW_KEY_PREFIX}${getWeekKey()}`;
      const raw = await AsyncStorage.getItem(weekKey);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      setWeeklyWin(parsed.weeklyWin || '');
      setWeeklyFocus(parsed.weeklyFocus || '');
      setWeeklyChallenge(parsed.weeklyChallenge || '');
    } catch (e) {
      console.warn('Weekly review load error:', e?.message || e);
    }
  };

  const saveWeeklyReview = async () => {
    if (!weeklyWin.trim() && !weeklyFocus.trim() && !weeklyChallenge.trim()) {
      Alert.alert('Nothing to save', 'Add at least one weekly reflection answer first.');
      return;
    }

    try {
      const payload = {
        weekKey: getWeekKey(),
        weeklyWin: weeklyWin.trim(),
        weeklyFocus: weeklyFocus.trim(),
        weeklyChallenge: weeklyChallenge.trim(),
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        `${WEEKLY_REVIEW_KEY_PREFIX}${getWeekKey()}`,
        JSON.stringify(payload)
      );

      await AsyncStorage.setItem(LAST_WEEKLY_REFLECTION_NUDGE_WEEK_KEY, getWeekKey());

      Alert.alert('Saved', 'Your weekly review has been saved ✨');
    } catch (e) {
      console.warn('Weekly review save error:', e?.message || e);
      Alert.alert('Error', 'Could not save your weekly review.');
    }
  };

  const saveData = async () => {
    if (!dayRating) {
      Alert.alert('Incomplete', 'Please select a rating.');
      return;
    }
    if (reflection.trim() === '') {
      Alert.alert('Incomplete', 'Please write a short reflection.');
      return;
    }

    const todayDate = format(new Date(), 'yyyy-MM-dd');
    const data = {
      rating: dayRating,
      text: reflection.trim(),
      mood,
      gratitude: gratitude.trim(),
    };

    try {
      const userId = await getUserId();

      let { error } = await supabase
        .from('reflections')
        .upsert(
          [
            {
              user_id: userId,
              reflection_date: todayDate,
              rating: data.rating,
              text: data.text,
              mood: data.mood ?? null,
              gratitude: data.gratitude ?? null,
            },
          ],
          { onConflict: 'user_id,reflection_date' }
        );

      if (error) {
        const retry = await supabase
          .from('reflections')
          .upsert(
            [
              {
                user_id: userId,
                reflection_date: todayDate,
                rating: data.rating,
                text: data.text,
              },
            ],
            { onConflict: 'user_id,reflection_date' }
          );
        if (retry.error) throw retry.error;
      }

      setHistory((prev) => {
        const filtered = prev.filter((e) => e.date !== todayDate);
        return [{ date: todayDate, ...data }, ...filtered];
      });

      await AsyncStorage.multiSet([
        [`reflection-${todayDate}`, JSON.stringify(data)],
        [LAST_REFLECTION_NUDGE_DATE_KEY, getTodayKey()],
      ]);

      Alert.alert('Saved', 'Your reflection has been saved 💾');
      setReflection('');
      setDayRating(null);
      setMood(null);
      setGratitude('');
      return;
    } catch (e) {
      console.error('Supabase save failed:', e?.message || e);
      Alert.alert(
        'Saved locally',
        "You're offline or Supabase is unavailable. Saved on device for now."
      );
    }

    try {
      const todayKey = `reflection-${todayDate}`;
      await AsyncStorage.multiSet([
        [todayKey, JSON.stringify(data)],
        [LAST_REFLECTION_NUDGE_DATE_KEY, getTodayKey()],
      ]);

      setHistory((prev) => {
        const filtered = prev.filter((e) => e.date !== todayDate);
        return [{ date: todayDate, ...data }, ...filtered];
      });
      setReflection('');
      setDayRating(null);
      setMood(null);
      setGratitude('');
    } catch (error) {
      console.error('Local save error:', error);
      Alert.alert('Error', 'Could not save your reflection.');
    }
  };

  // ---------- Reminder logic ----------
  const initReminderPrefs = async () => {
    try {
      const [en, tm, wen, wtm] = await AsyncStorage.multiGet([
        REMINDER_ENABLED_KEY,
        REMINDER_TIME_KEY,
        WEEKLY_REMINDER_ENABLED_KEY,
        WEEKLY_REMINDER_TIME_KEY,
      ]);
      const enabled = en?.[1] === 'true';
      const time = tm?.[1] || DEFAULT_REMINDER;
      setReminderEnabled(enabled);
      setReminderTime(time);

      const weeklyEnabled = wen?.[1] === 'true';
      const weeklyTime = wtm?.[1] || DEFAULT_WEEKLY_REMINDER;
      setWeeklyReminderEnabled(weeklyEnabled);
      setWeeklyReminderTime(weeklyTime);

      if (enabled) {
        await ensurePermissions();
        await rescheduleDaily(time);
      }
      if (weeklyEnabled) {
        await ensurePermissions();
        await rescheduleWeekly(weeklyTime);
      }
    } catch (e) {
      console.warn('Reminder init error:', e?.message);
    }
  };

  const ensurePermissions = async () => {
    if (!Device.isDevice) {
      Alert.alert('Simulator notice', 'Notifications require a physical device.');
      return false;
    }
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Enable notifications to get your daily reminder.');
      return false;
    }
    return true;
  };

  const parseHM = (s) => {
    if (!s || !/^\d{1,2}:\d{2}$/.test(s)) return { h: 20, m: 0 };
    const [hh, mm] = s.split(':').map((x) => parseInt(x, 10));
    const h = Math.max(0, Math.min(23, hh));
    const m = Math.max(0, Math.min(59, mm));
    return { h, m };
  };

  const formatHM = (s) => {
    const { h, m } = parseHM(s);
    const h12 = ((h + 11) % 12) + 1;
    const ampm = h < 12 ? 'AM' : 'PM';
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const clearExisting = async () => {
    try {
      const all = await Notifications.getAllScheduledNotificationsAsync();
      for (const n of all) {
        if (n?.identifier?.startsWith?.('reflection-daily')) {
          await Notifications.cancelScheduledNotificationAsync(n.identifier);
        }
      }
      if (scheduledIdRef.current) {
        try {
          await Notifications.cancelScheduledNotificationAsync(scheduledIdRef.current);
        } catch {}
        scheduledIdRef.current = null;
      }
    } catch {}
  };

  const rescheduleDaily = async (timeHM) => {
    await clearExisting();
    const ok = await ensurePermissions();
    if (!ok) return;

    const { h, m } = parseHM(timeHM);
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'A quick moment for you ✨',
        body: 'How was your day? Open Reinvention Edit to reflect.',
        data: { screen: 'Reflection' },
      },
      trigger: { hour: h, minute: m, repeats: true },
    });
    scheduledIdRef.current = id;
  };

  const clearWeeklyExisting = async () => {
    try {
      const all = await Notifications.getAllScheduledNotificationsAsync();
      for (const n of all) {
        if (n?.identifier?.startsWith?.('reflection-weekly')) {
          await Notifications.cancelScheduledNotificationAsync(n.identifier);
        }
      }
      if (weeklyScheduledIdRef.current) {
        try {
          await Notifications.cancelScheduledNotificationAsync(weeklyScheduledIdRef.current);
        } catch {}
        weeklyScheduledIdRef.current = null;
      }
    } catch {}
  };

  const rescheduleWeekly = async (timeHM) => {
    await clearWeeklyExisting();
    const ok = await ensurePermissions();
    if (!ok) return;

    const { h, m } = parseHM(timeHM);
    // weekday: 1=Sunday in expo-notifications (Sunday=1, Monday=2, ..., Saturday=7)
    const id = await Notifications.scheduleNotificationAsync({
      identifier: `reflection-weekly-${h}-${m}`,
      content: {
        title: 'Weekly reflection 🌙',
        body: 'How did this week go? Take a moment to reflect before the new week begins.',
        data: { screen: 'Reflection' },
      },
      trigger: { weekday: 1, hour: h, minute: m, repeats: true },
    });
    weeklyScheduledIdRef.current = id;
  };

  const onToggleWeeklyReminder = async (val) => {
    try {
      setWeeklyReminderEnabled(val);
      await AsyncStorage.setItem(WEEKLY_REMINDER_ENABLED_KEY, val ? 'true' : 'false');
      if (val) {
        await rescheduleWeekly(weeklyReminderTime);
        Alert.alert('Weekly reminder on', `Every Sunday at ${formatHM(weeklyReminderTime)}.`);
      } else {
        await clearWeeklyExisting();
        Alert.alert('Weekly reminder off', 'Sunday reflection reminder disabled.');
      }
    } catch (e) {
      console.warn('Toggle weekly reminder error:', e?.message);
    }
  };

  const onToggleReminder = async (val) => {
    try {
      setReminderEnabled(val);
      await AsyncStorage.setItem(REMINDER_ENABLED_KEY, val ? 'true' : 'false');
      if (val) {
        await rescheduleDaily(reminderTime);
        Alert.alert('Reminder on', `Daily at ${formatHM(reminderTime)}.`);
      } else {
        await clearExisting();
        Alert.alert('Reminder off', 'Daily reminder disabled.');
      }
    } catch (e) {
      console.warn('Toggle reminder error:', e?.message);
    }
  };

  const openClockPicker = (target) => {
    const timeStr = target === 'daily' ? reminderTime : weeklyReminderTime;
    const { h, m } = parseHM(timeStr);
    setClockHour(h);
    setClockMinute(m);
    setClockTarget(target);
    setClockVisible(true);
  };

  const confirmClockPicker = async () => {
    const hh = String(clockHour).padStart(2, '0');
    const mm = String(clockMinute).padStart(2, '0');
    const timeStr = `${hh}:${mm}`;
    setClockVisible(false);
    if (clockTarget === 'daily') {
      setReminderTime(timeStr);
      await AsyncStorage.setItem(REMINDER_TIME_KEY, timeStr);
      if (reminderEnabled) await rescheduleDaily(timeStr);
    } else {
      setWeeklyReminderTime(timeStr);
      await AsyncStorage.setItem(WEEKLY_REMINDER_TIME_KEY, timeStr);
      if (weeklyReminderEnabled) await rescheduleWeekly(timeStr);
    }
  };

  const s = weeklyStats(history);
  const consistencyNudge = getConsistencyNudge();
  const insightLine = getInsightLine();

  const todayLogged = hasReflectionToday(history);
  const recentHistory = history.slice(0, 5);
  const streakMax = Math.max(reflectionStreak, 7);
  const streakPct = streakMax > 0 ? Math.min(reflectionStreak / streakMax, 1) : 0;

  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* ── Header ── */}
        <View style={styles.masthead}>
  <Text style={styles.mastheadEyebrow}>The Reinvention Edit</Text>
  <View style={styles.mastheadRule} />
  <Text style={styles.title}>Reflect</Text>
  <Text style={styles.mastheadSub}>Your space to pause, notice &amp; grow.</Text>
</View>

        {/* ── Streak bar ── */}
        <View style={styles.streakBarRow}>
          <Text style={styles.streakLabel}>
            🔥 {reflectionStreak}-day streak
          </Text>
          <View style={styles.streakTrack}>
            <View style={[styles.streakFill, { flex: streakPct }]} />
          </View>
          <Text style={styles.streakFraction}>
            {reflectionStreak}/{streakMax}
          </Text>
        </View>

        {/* ── Streak badges ── */}
        {getBadges(reflectionStreak).length > 0 && (
          <View style={styles.badgesRow}>
            {getBadges(reflectionStreak).map((b, i) => (
              <View key={i} style={styles.badge}>
                <Text style={styles.badgeText}>{b}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── This week — history list ── */}
        <Text style={styles.eyebrow}>This week</Text>
        <View style={styles.historyCard}>
          {recentHistory.length === 0 && (
            <View style={styles.historyRow}>
              <Text style={styles.historyEmpty}>No entries yet this week.</Text>
            </View>
          )}
          {recentHistory.map((entry, i) => {
            const isLast = i === recentHistory.length - 1;
            const label = (() => {
              try { return format(new Date(entry.date), 'EEEE'); } catch { return entry.date; }
            })();
            const preview = entry.text
              ? `"${entry.text.slice(0, 48)}${entry.text.length > 48 ? '\u2026' : ''}"`
              : 'No text logged';
            return (
              <View key={entry.date} style={[styles.historyRow, isLast && styles.historyRowLast]}>
                <View style={styles.historyLeft}>
                  <Text style={styles.historyDay}>{label}</Text>
                  <Text style={styles.historyPreview}>{preview}</Text>
                </View>
                <View style={styles.historyRight}>
                  {!!entry.mood && (
                    <Text style={styles.historyMood}>{entry.mood}</Text>
                  )}
                  {typeof entry.rating === 'number' && (
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingBadgeText}>{entry.rating}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Insight + nudge ── */}
        {(insightLine || consistencyNudge) && (
          <View style={styles.insightCard}>
            {!!insightLine && (
              <>
                <Text style={styles.insightTitle}>Reflection insight</Text>
                <Text style={styles.insightText}>{insightLine}</Text>
              </>
            )}
            {!!insightLine && !!consistencyNudge && <View style={styles.insightDivider} />}
            {!!consistencyNudge && (
              <Text style={styles.insightText}>{consistencyNudge}</Text>
            )}
          </View>
        )}

        {/* ── Section rule ── */}
        <View style={styles.sectionRule} />

        {/* ── Today's entry ── */}
        <Text style={styles.eyebrow}>
          Today — {format(new Date(), 'd MMM')}
        </Text>
        <Text style={styles.sectionIntro}>
          Small daily check-ins build the self-awareness that makes big changes stick.
        </Text>

        <View style={styles.entryCard}>

          {/* Mood */}
          <Text style={styles.fieldLabel}>Mood</Text>
          <View style={styles.moodRow}>
            {['🤩', '😌', '😴', '😤', '😔'].map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.moodBubble,
                  mood === m && styles.moodBubbleSelected,
                  mood === m && { backgroundColor: moodTints[m] || colors.offWhite },
                ]}
                onPress={() => setMood(m)}
              >
                <Text style={styles.moodEmoji}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rating */}
          <Text style={styles.fieldLabel}>Day rating</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.ratingDot, dayRating === num && styles.ratingDotSelected]}
                onPress={() => setDayRating(num)}
              >
                <Text style={[styles.ratingNum, dayRating === num && styles.ratingNumSelected]}>
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Gratitude */}
          <Text style={styles.fieldLabel}>One thing I'm grateful for</Text>
          <TextInput
            style={styles.inputShort}
            value={gratitude}
            onChangeText={setGratitude}
            placeholder="A person, a moment, a small win…"
            placeholderTextColor={colors.champagne}
          />

          {/* Reflection */}
          <Text style={styles.fieldLabel}>What are you carrying into tomorrow?</Text>
          <TextInput
            style={styles.inputTall}
            value={reflection}
            onChangeText={setReflection}
            multiline
            placeholder="Today I felt…"
            placeholderTextColor={colors.champagne}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.btnPrimary} onPress={saveData}>
            <Text style={styles.btnPrimaryText}>Save entry</Text>
          </TouchableOpacity>
        </View>

        {/* ── Identity mantra ── */}
        {!!identityStatement && (
          <View style={styles.identityCard}>
            <Text style={styles.eyebrow}>Your identity</Text>
            <Text style={styles.identityText}>"{identityStatement}"</Text>
          </View>
        )}

        {/* ── Weekly review ── */}
        <View style={styles.sectionRule} />
        <Text style={styles.eyebrow}>Weekly review · {getWeekDatesLabel()}</Text>
        <Text style={styles.sectionIntro}>
          Once a week, ideally Sunday evening, zoom out and see the whole picture.
        </Text>

        <View style={styles.weeklyCard}>
          <Text style={styles.weeklyStatsRow}>
            <Text style={styles.weeklyStatNum}>{weeklyReflectionStats.reflectionsThisWeek}</Text>
            <Text style={styles.weeklyStatLabel}> reflections  </Text>
            <Text style={styles.weeklyStatNum}>{s.avg || '\u2014'}</Text>
            <Text style={styles.weeklyStatLabel}> avg rating  </Text>
            <Text style={styles.weeklyStatNum}>{weeklyRoadmapStats.tasksCompletedThisWeek}</Text>
            <Text style={styles.weeklyStatLabel}> tasks done</Text>
          </Text>

          <View style={styles.weeklyDivider} />

          <Text style={styles.fieldLabel}>What went well this week?</Text>
          <TextInput
            style={styles.inputWeekly}
            value={weeklyWin}
            onChangeText={setWeeklyWin}
            multiline
            placeholder="A win, shift, lesson, or proud moment…"
            placeholderTextColor={colors.champagne}
            textAlignVertical="top"
          />

          <Text style={styles.fieldLabel}>What felt challenging?</Text>
          <TextInput
            style={styles.inputWeekly}
            value={weeklyChallenge}
            onChangeText={setWeeklyChallenge}
            multiline
            placeholder="Where did you feel resistance or friction?"
            placeholderTextColor={colors.champagne}
            textAlignVertical="top"
          />

          <Text style={styles.fieldLabel}>Focus for next week</Text>
          <TextInput
            style={styles.inputWeekly}
            value={weeklyFocus}
            onChangeText={setWeeklyFocus}
            multiline
            placeholder="One realistic focus is enough."
            placeholderTextColor={colors.champagne}
            textAlignVertical="top"
          />

          <View style={styles.weeklyActions}>
            <TouchableOpacity style={styles.btnPrimary} onPress={saveWeeklyReview}>
              <Text style={styles.btnPrimaryText}>Save review</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnGhost} onPress={shareWeekly}>
              <Text style={styles.btnGhostText}>Share summary</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Reminder ── */}
        <View style={styles.sectionRule} />
        <Text style={styles.eyebrow}>Evening reminder</Text>

        <View style={styles.reminderCard}>
          <View style={styles.reminderRow}>
            <View>
              <Text style={styles.actionLabel}>Daily reminder</Text>
              <Text style={styles.actionSub}>Get a gentle nudge to reflect each evening</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={onToggleReminder}
              thumbColor={reminderEnabled ? colors.dustyRose : colors.fawn}
              trackColor={{ false: colors.linen, true: colors.roseTint30 }}
            />
          </View>
          {reminderEnabled && (
            <View style={[styles.reminderRow, { borderTopWidth: 1, borderTopColor: colors.subtleBorder, marginTop: 4, paddingTop: 10 }]}>
              <Text style={styles.actionLabel}>Time</Text>
              <TouchableOpacity style={styles.timeBtn} onPress={() => openClockPicker('daily')}>
                <Text style={styles.timeBtnText}>{formatHM(reminderTime)}</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.reminderRow, { borderTopWidth: 1, borderTopColor: colors.subtleBorder, marginTop: 4, paddingTop: 10 }]}>
            <View>
              <Text style={styles.actionLabel}>Weekly reminder</Text>
              <Text style={styles.actionSub}>Every Sunday — review how your week went</Text>
            </View>
            <Switch
              value={weeklyReminderEnabled}
              onValueChange={onToggleWeeklyReminder}
              thumbColor={weeklyReminderEnabled ? colors.dustyRose : colors.fawn}
              trackColor={{ false: colors.linen, true: colors.roseTint30 }}
            />
          </View>
          {weeklyReminderEnabled && (
            <View style={[styles.reminderRow, { borderTopWidth: 1, borderTopColor: colors.subtleBorder, marginTop: 4, paddingTop: 10 }]}>
              <Text style={styles.actionLabel}>Sunday time</Text>
              <TouchableOpacity style={styles.timeBtn} onPress={() => openClockPicker('weekly')}>
                <Text style={styles.timeBtnText}>{formatHM(weeklyReminderTime)}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </ScrollView>

      {/* ── Clock Picker Modal ── */}
      <Modal
        visible={clockVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setClockVisible(false)}
      >
        <Pressable style={styles.clockOverlay} onPress={() => setClockVisible(false)}>
          <Pressable style={styles.clockSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.clockTitle}>
              {clockTarget === 'daily' ? 'Daily reminder time' : 'Sunday reminder time'}
            </Text>

            <View style={styles.clockDrumRow}>
              {/* Hour spinner */}
              <View style={styles.spinnerCol}>
                <Text style={styles.drumLabel}>Hour</Text>
                <TouchableOpacity style={styles.spinnerChevron} onPress={() => setClockHour((h) => (h + 1) % 24)}>
                  <Text style={styles.spinnerChevronText}>▲</Text>
                </TouchableOpacity>
                <View style={styles.spinnerBox}>
                  <Text style={styles.spinnerValue}>{String(clockHour).padStart(2, '0')}</Text>
                </View>
                <TouchableOpacity style={styles.spinnerChevron} onPress={() => setClockHour((h) => (h + 23) % 24)}>
                  <Text style={styles.spinnerChevronText}>▼</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.clockColon}>:</Text>

              {/* Minute spinner */}
              <View style={styles.spinnerCol}>
                <Text style={styles.drumLabel}>Min</Text>
                <TouchableOpacity style={styles.spinnerChevron} onPress={() => setClockMinute((m) => (m + 1) % 60)}>
                  <Text style={styles.spinnerChevronText}>▲</Text>
                </TouchableOpacity>
                <View style={styles.spinnerBox}>
                  <Text style={styles.spinnerValue}>{String(clockMinute).padStart(2, '0')}</Text>
                </View>
                <TouchableOpacity style={styles.spinnerChevron} onPress={() => setClockMinute((m) => (m + 59) % 60)}>
                  <Text style={styles.spinnerChevronText}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* AM/PM display */}
              <View style={styles.spinnerCol}>
                <Text style={styles.drumLabel}> </Text>
                <View style={styles.spinnerChevron} />
                <View style={styles.ampmBox}>
                  <Text style={styles.ampmText}>{clockHour < 12 ? 'AM' : 'PM'}</Text>
                </View>
                <View style={styles.spinnerChevron} />
              </View>
            </View>

            <Text style={styles.clockPreview}>
              {(() => {
                const h12 = ((clockHour + 11) % 12) + 1;
                const ampm = clockHour < 12 ? 'AM' : 'PM';
                return `${h12}:${String(clockMinute).padStart(2, '0')} ${ampm}`;
              })()}
            </Text>

            <View style={styles.clockActions}>
              <TouchableOpacity style={styles.clockCancel} onPress={() => setClockVisible(false)}>
                <Text style={styles.clockCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.clockConfirm} onPress={confirmClockPicker}>
                <Text style={styles.clockConfirmText}>Set reminder</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
};

export default ReflectionScreen;


const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.warmWhite,
  },

  container: {
    paddingHorizontal: spacing.screenPaddingH,
    paddingTop: spacing.screenPaddingTop,
    paddingBottom: 36,
    flexGrow: 1,
  },

  // ── Header ──────────────────────────────────────────────────────────
  masthead: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.ink,
    marginBottom: spacing.sm,
    position: 'relative',
  },

  mastheadEyebrow: {
    ...typography.eyebrow,
    fontSize: 9,
    letterSpacing: 3.5,
    color: colors.clay,
    marginBottom: spacing.sm,
  },

  mastheadRule: {
    width: 32,
    height: 1.5,
    backgroundColor: colors.deepRose,
    marginBottom: spacing.sm,
  },

  title: {
    fontFamily: 'DancingScript',
    fontSize: 40,
    color: colors.ink,
    lineHeight: 58,
    marginBottom: spacing.xs,
  },

  mastheadSub: {
    fontFamily: 'serif',
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.bodyMuted,
    letterSpacing: 0.3,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },

  todayPill: {
    backgroundColor: colors.roseTint08,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.roseTint18,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    alignSelf: 'center',
  },

  todayPillText: {
    ...typography.badge,
  },

  // ── Streak bar ──────────────────────────────────────────────────────
  streakBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  streakLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.deepRose,
    letterSpacing: 0.2,
  },

  streakTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.linen,
    borderRadius: radii.pill,
    overflow: 'hidden',
    flexDirection: 'row',
  },

  streakFill: {
    height: '100%',
    backgroundColor: colors.dustyRose,
    borderRadius: radii.pill,
  },

  streakFraction: {
    ...typography.caption,
  },

  // ── Badges ──────────────────────────────────────────────────────────
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },

  badge: {
    backgroundColor: colors.roseTint08,
    borderColor: colors.roseTint18,
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
  },

  badgeText: {
    ...typography.badge,
  },

  // ── Eyebrow ─────────────────────────────────────────────────────────
  eyebrow: {
    ...typography.eyebrow,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },

  // ── History card ────────────────────────────────────────────────────
  historyCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },

  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
  },

  historyRowLast: {
    borderBottomWidth: 0,
  },

  historyLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },

  historyDay: {
    ...typography.actionLabel,
  },

  historyPreview: {
    ...typography.actionSub,
    marginTop: 2,
  },

  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  historyMood: {
    fontSize: 16,
  },

  historyEmpty: {
    ...typography.actionSub,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  ratingBadge: {
    backgroundColor: colors.dustyRose,
    borderRadius: radii.pill,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ratingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },

  // ── Insight card ────────────────────────────────────────────────────
  insightCard: {
    backgroundColor: colors.offWhite,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  insightTitle: {
    ...typography.eyebrow,
    marginBottom: spacing.xs,
  },

  insightText: {
    ...typography.body,
    color: colors.bodyMuted,
    lineHeight: 20,
  },

  sectionIntro: {
    fontSize: 13,
    fontFamily: 'serif',
    fontStyle: 'italic',
    color: colors.bodyMuted,
    lineHeight: 19,
    marginTop: 2,
    marginBottom: spacing.md,
  },

  insightDivider: {
    height: 1,
    backgroundColor: colors.clayRule,
    marginVertical: spacing.sm,
  },

  // ── Section rule ────────────────────────────────────────────────────
  sectionRule: {
    height: 1,
    backgroundColor: colors.clayRule,
    marginVertical: spacing.lg,
  },

  // ── Entry card ──────────────────────────────────────────────────────
  entryCard: {
    backgroundColor: colors.offWhite,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  fieldLabel: {
    ...typography.actionLabel,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },

  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  moodBubble: {
    width: 46,
    height: 46,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  moodBubbleSelected: {
    borderColor: colors.midRose,
    borderWidth: 2,
  },

  moodEmoji: {
    fontSize: 22,
  },

  ratingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  ratingDot: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ratingDotSelected: {
    backgroundColor: colors.dustyRose,
    borderColor: colors.deepRose,
  },

  ratingNum: {
    ...typography.body,
    fontWeight: '500',
  },

  ratingNumSelected: {
    color: colors.white,
    fontWeight: '700',
  },

  inputShort: {
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.ink,
    marginBottom: spacing.md,
    height: 44,
  },

  inputTall: {
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.ink,
    marginBottom: spacing.md,
    height: 110,
  },

  // ── Buttons ─────────────────────────────────────────────────────────
  btnPrimary: {
    ...shadows.card,
    backgroundColor: colors.deepRose,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xs,
  },

  btnPrimaryText: {
    ...typography.buttonPrimary,
  },

  btnGhost: {
    borderWidth: 1.5,
    borderColor: colors.roseTint20,
    borderRadius: radii.lg,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: spacing.xs,
  },

  btnGhostText: {
    ...typography.buttonDanger,
  },

  // ── Identity card ───────────────────────────────────────────────────
  identityCard: {
    backgroundColor: colors.linen,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.roseTint30,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },

  identityText: {
    fontFamily: 'serif',
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.deepRose,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.xs,
  },

  // ── Weekly card ─────────────────────────────────────────────────────
  weeklyCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  weeklyStatsRow: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  weeklyStatNum: {
    fontFamily: 'serif',
    fontSize: 18,
    fontWeight: '700',
    color: colors.deepRose,
  },

  weeklyStatLabel: {
    fontSize: 12,
    color: colors.bodyMuted,
  },

  weeklyDivider: {
    height: 1,
    backgroundColor: colors.clayRule,
    marginVertical: spacing.sm,
  },

  inputWeekly: {
    backgroundColor: colors.offWhite,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.ink,
    marginBottom: spacing.md,
    height: 80,
  },

  weeklyActions: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },

  // ── Reminder card ───────────────────────────────────────────────────
  reminderCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.xxxl,
  },

  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },

  actionLabel: {
    ...typography.actionLabel,
  },

  actionSub: {
    ...typography.actionSub,
    marginTop: 2,
  },

  timeBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.offWhite,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
  },

  timeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.deepRose,
  },

  // ── Clock picker modal ───────────────────────────────────────────────
  clockOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  clockSheet: {
    backgroundColor: colors.warmWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
  },

  clockTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.2,
  },

  clockDrumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },

  spinnerCol: {
    alignItems: 'center',
    gap: 4,
  },

  drumLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.bodyMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },

  spinnerChevron: {
    width: 52,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  spinnerChevronText: {
    fontSize: 14,
    color: colors.deepRose,
    fontWeight: '700',
  },

  spinnerBox: {
    width: 64,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.roseTint18,
    backgroundColor: colors.roseTint08,
    alignItems: 'center',
    justifyContent: 'center',
  },

  spinnerValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.deepRose,
    fontVariant: ['tabular-nums'],
  },

  clockColon: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 36,
    marginHorizontal: 2,
  },

  ampmWrapper: {
    alignItems: 'center',
  },

  ampmBox: {
    width: 52,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    backgroundColor: colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ampmText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.deepRose,
  },

  clockPreview: {
    textAlign: 'center',
    fontSize: 32,
    fontFamily: 'serif',
    fontStyle: 'italic',
    color: colors.deepRose,
    marginBottom: 20,
  },

  clockActions: {
    flexDirection: 'row',
    gap: 12,
  },

  clockCancel: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.roseTint20,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },

  clockCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.bodyMuted,
  },

  clockConfirm: {
    flex: 2,
    backgroundColor: colors.deepRose,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },

  clockConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});