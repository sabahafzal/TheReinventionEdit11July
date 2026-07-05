// lib/calendarExport.js
import * as Calendar from 'expo-calendar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { roadmapsConfig } from '../config/roadmapsConfig';
import { roadmapTasks } from '../screens/roadmapTasks';

// ---- helpers (aligned with your NewCity/TechSwitch pacing) ----
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

// Greedy pack items into weekly buckets by duration (same logic as app)
const buildWeeklyBuckets = (items, weeklyBudgetHours) => {
  const buckets = [];
  let current = [];
  let sum = 0;
  const budget =
    Number.isFinite(weeklyBudgetHours) && weeklyBudgetHours > 0
      ? weeklyBudgetHours
      : 4;

  items.forEach((it, idx) => {
    const dur = Number(it.duration || 0);
    if (sum + dur <= budget || current.length === 0) {
      current.push(idx);
      sum += dur;
    } else {
      buckets.push(current);
      current = [idx];
      sum = dur;
    }
  });
  if (current.length) buckets.push(current);
  return buckets;
};

const normalizeTask = (t) => {
  if (!t) return { task: '', duration: 0.33 };
  if (typeof t === 'string') return { task: t, duration: 0.33 };
  return { task: String(t.task || ''), duration: Number(t.duration ?? 0.33) };
};

const getStartOfWeek = (referenceDate = new Date()) => {
  // Start from today (referenceDate) so events are never placed in the past
  const d = new Date(referenceDate);
  d.setHours(0, 0, 0, 0);
  return d;
};

// --- Find or create a named calendar on the device ---
async function getOrCreateCalendar(calName) {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const existing = calendars.find(
    (c) => c.title === calName && c.allowsModifications
  );
  if (existing) return existing.id;

  // Build a source for the new calendar
  let source;
  if (Platform.OS === 'ios') {
    const icloudCal = calendars.find((c) => c.source?.name === 'iCloud');
    const localCal  = calendars.find((c) => c.source?.type === Calendar.SourceType.LOCAL);
    source = (icloudCal || localCal)?.source;
  } else {
    // Android — find the first local or device account source
    source = calendars.find((c) => c.source?.type === 'LOCAL')?.source
      || { isLocalAccount: true, name: 'Reinvention Edit', type: 'LOCAL' };
  }

  const newId = await Calendar.createCalendarAsync({
    title: calName,
    color: '#C4A69A', // dusty rose from theme.js
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: Platform.OS === 'ios' ? source?.id : undefined,
    source:   Platform.OS === 'android' ? source : undefined,
    name: calName,
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });

  return newId;
}

/**
 * Export the CURRENT week's unlocked tasks directly into the device calendar.
 *
 * Uses these AsyncStorage keys:
 *  - 'timeCommitmentHours' (number, weekly total)
 *  - 'weekdayDailyBudgetHours' (number, hours for Mon–Fri)   optional
 *  - 'weekendDailyBudgetHours' (number, hours for Sat/Sun)   optional
 *  - 'weekdayStartHour' (integer 0–23)                       optional
 *  - 'weekendStartHour' (integer 0–23)                       optional
 *
 * @param {Object} opts
 * @param {string} opts.roadmapKey          e.g. 'new_city' | 'tech_switch' | 'financial_glow_up' ...
 * @param {number} [opts.dayStartHour=9]    Legacy single start hour each day (local time)
 * @param {number} [opts.weekdayStartHour]  Mon–Fri start hour (0–23)
 * @param {number} [opts.weekendStartHour]  Sat–Sun start hour (0–23)
 * @param {string} [opts.calendarName]      Calendar name on device (defaults to roadmap label)
 * @param {Date}   [opts.referenceDate]     Which week to export (defaults to now)
 * @returns {Promise<number>}               Number of events created
 */
export async function exportCurrentWeekToICS({
  roadmapKey,
  dayStartHour = 9,
  weekdayStartHour,
  weekendStartHour,
  calendarName,
  referenceDate = new Date(),
}) {
  if (!roadmapKey || !roadmapTasks?.[roadmapKey]) {
    throw new Error('Invalid roadmap key');
  }

  // --- Request calendar permission ---
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    throw new Error(
      'Calendar permission denied. Please enable it in your device Settings to export tasks.'
    );
  }

  // --- Hours budget (weekly + optional weekday/weekend split) ---
  let weeklyBudget = parseFloat(await AsyncStorage.getItem('timeCommitmentHours'));
  if (!Number.isFinite(weeklyBudget) || weeklyBudget <= 0) {
    const dailyStr = await AsyncStorage.getItem('dailyTimeBudgetHours');
    const daily = dailyStr ? parseFloat(dailyStr) : NaN;
    weeklyBudget = Number.isFinite(daily) && daily > 0 ? daily * 7 : 4;
  }

  const weekdayDailyStr = await AsyncStorage.getItem('weekdayDailyBudgetHours');
  const weekendDailyStr = await AsyncStorage.getItem('weekendDailyBudgetHours');
  const weekdayDaily = weekdayDailyStr != null ? parseFloat(weekdayDailyStr) : NaN;
  const weekendDaily = weekendDailyStr != null ? parseFloat(weekendDailyStr) : NaN;

  const averageDaily = weeklyBudget / 7;
  const haveSplit = Number.isFinite(weekdayDaily) && Number.isFinite(weekendDaily);

  // Build per-day budgets for today..today+6 using actual day-of-week
  const todayDow = referenceDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const isWeekendDow = (dow) => dow === 0 || dow === 6; // Sun or Sat
  const dailyBudgets = Array.from({ length: 7 }, (_, i) => {
    const dow = (todayDow + i) % 7;
    const isWeekend = isWeekendDow(dow);
    return haveSplit ? (isWeekend ? weekendDaily : weekdayDaily) : averageDaily;
  });

  // --- Determine per-day start hours (from args -> AsyncStorage -> legacy fallback) ---
  let wdStart = weekdayStartHour;
  let weStart = weekendStartHour;
  try {
    if (!Number.isFinite(wdStart)) {
      const v = await AsyncStorage.getItem('weekdayStartHour');
      if (v != null) wdStart = Number(v);
    }
    if (!Number.isFinite(weStart)) {
      const v = await AsyncStorage.getItem('weekendStartHour');
      if (v != null) weStart = Number(v);
    }
  } catch {
    // ignore read errors; fall back below
  }
  if (!Number.isFinite(wdStart)) wdStart = dayStartHour;
  if (!Number.isFinite(weStart)) weStart = dayStartHour;

  // dIndex is offset from today (0 = today, 1 = tomorrow, etc.)
  const getStartHourForDayIndex = (dIndex) => {
    const dow = (todayDow + dIndex) % 7;
    return isWeekendDow(dow) ? weStart : wdStart;
  };

  // --- Global start for this roadmap (cross-theme pacing) ---
  const roadmapStartKey = `planStart_${roadmapKey}__GLOBAL`;
  let roadmapStartISO = await AsyncStorage.getItem(roadmapStartKey);
  if (!roadmapStartISO) {
    roadmapStartISO = startOfDayISO();
    await AsyncStorage.setItem(roadmapStartKey, roadmapStartISO);
  }

  // --- Flatten ALL tasks in roadmap in config order (matches your screens) ---
  const themeOrder = (roadmapsConfig?.[roadmapKey]?.themes || []).map((t) => t.key);
  const orderedThemeKeys = themeOrder.length
    ? themeOrder
    : Object.keys(roadmapTasks?.[roadmapKey] || {});

  const flat = [];
  for (const tk of orderedThemeKeys) {
    const arr = roadmapTasks?.[roadmapKey]?.[tk] || [];
    const list = Array.isArray(arr) ? arr : [];
    list.forEach((t, idx) => {
      const n = normalizeTask(t);
      flat.push({ theme: tk, index: idx, ...n });
    });
  }

  // --- Weekly buckets across ALL themes (same as in your plan screens) ---
  const buckets = buildWeeklyBuckets(flat, weeklyBudget);
  const weeksElapsed = weeksBetween(roadmapStartISO, referenceDate);
  const thisWeek = buckets[weeksElapsed] || [];

  if (!thisWeek.length) {
    throw new Error('No tasks unlocked for this week based on your time budget.');
  }

  // --- Allocate this week's tasks across Mon..Sun using per-day budgets ---
  const startOfWeek = getStartOfWeek(referenceDate); // Today 00:00 — events placed forwards from here
  const events = [];

  let dayCursor = 0;
  const setToDayStart = (dIndex) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + dIndex);
    d.setHours(getStartHourForDayIndex(dIndex), 0, 0, 0);
    return d;
  };
  let dayTimeCursor = setToDayStart(dayCursor);
  let remainingToday = dailyBudgets[dayCursor];

  for (const flatIdx of thisWeek) {
    const item = flat[flatIdx];
    const dur = Number(item.duration || 0.33);

    // If task doesn't fit today, move to next days until it does or we run out of the week
    while (dur > (remainingToday + 1e-9)) {
      dayCursor += 1;
      if (dayCursor > 6) break; // out of this week
      remainingToday = dailyBudgets[dayCursor];
      dayTimeCursor = setToDayStart(dayCursor);
    }
    if (dayCursor > 6) break;

    // Build event for this task
    const start = new Date(dayTimeCursor);
    const end   = new Date(start.getTime() + dur * 60 * 60 * 1000);
    events.push({
      title: item.task,
      start,
      end,
      notes: `Theme: ${item.theme.replace(/_/g, ' ')}`,
    });

    // Advance the day cursor
    dayTimeCursor = end;
    remainingToday = Math.max(0, remainingToday - dur);
  }

  // --- Find or create the calendar on device ---
  const calName =
    calendarName ||
    roadmapsConfig?.[roadmapKey]?.label ||
    `The Reinvention Edit — ${roadmapKey}`;

  const calendarId = await getOrCreateCalendar(calName);
  const timeZone   = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // --- Write events directly to device calendar ---
  for (const ev of events) {
    await Calendar.createEventAsync(calendarId, {
      title:     ev.title,
      startDate: ev.start,
      endDate:   ev.end,
      notes:     ev.notes,
      timeZone,
    });
  }

  return events.length; // caller can show "X tasks added to calendar"
}