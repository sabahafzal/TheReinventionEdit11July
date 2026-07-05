// screens/AnalyticsScreen.js
import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import PremiumUpsellModal from '../components/PremiumUpsellModal';
import { supabase } from '../lib/supabase';
import { roadmapsConfig } from '../config/roadmapsConfig';
import { colors, typography, spacing, radii, tokens, shadows } from './theme';

// ─── Storage keys ─────────────────────────────────────────────────────────────
const TECH_TRACK_KEY     = 'techSwitchTrack';
const NEWCITY_TRACK_KEY  = 'newCityTrack';
const PHYSICAL_TRACK_KEY = 'physicalGlowUpTrack';

const STREAK_COUNT_KEY     = 'streak_count';
const STREAK_BEST_KEY      = 'streak_best';
const STREAK_LAST_DATE_KEY = 'streak_last_date';

const HISTORY_LOOKBACK_DAYS = 84; // 12 weeks

// ─── Coach mark key ───────────────────────────────────────────────────────────
const ANALYTICS_COACH_KEY = 'hint.analyticsScreen.coach.v1.seen';

// ─── Coach mark steps ─────────────────────────────────────────────────────────
const ANALYTICS_COACH_STEPS = [
  {
    emoji: '📊',
    title: 'Your consistency at a glance',
    body: 'Analytics tracks every task you complete across all your roadmaps; your streak, active days, and patterns over the last 12 weeks.',
  },
  {
    emoji: '🔥',
    title: 'Build your streak',
    body: 'Complete at least one task each day to keep your streak alive. Your personal best is saved so you can always aim to beat it.',
  },
  {
    emoji: '📅',
    title: 'The activity heatmap',
    body: "Each square on the calendar represents one day. Darker means more tasks completed. Tap any square to see exactly how many tasks you did that day.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isActivePro({ is_pro, pro_until }) {
  if (!is_pro) return false;
  if (!pro_until) return true;
  const until = new Date(pro_until);
  if (Number.isNaN(until.getTime())) return false;
  return until.getTime() > Date.now();
}

function pretty(n, digits = 1) {
  const x = Number(n);
  if (!Number.isFinite(x)) return '—';
  return x.toFixed(digits);
}

function formatLastActive(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toYMD(date = new Date()) {
  const d = startOfDay(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDateMaybe(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string') {
    const asNum = Number(value);
    if (Number.isFinite(asNum) && value.trim() !== '') {
      const d = new Date(asNum);
      if (!Number.isNaN(d.getTime())) return d;
    }
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatDayLabel(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatMonthLabel(date) {
  return date.toLocaleDateString('en-GB', { month: 'short' });
}

function getWeekdayLabel(index) {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] || '';
}

function getContributionLevel(count) {
  if (count >= 3) return 4;
  if (count === 2) return 3;
  if (count === 1) return 2;
  return 0;
}

function getCellColor(level) {
  switch (level) {
    case 4: return colors.deepRose;
    case 3: return colors.dustyRose;
    case 2: return colors.fawn;
    default: return colors.offWhite;
  }
}

function sum(arr) {
  return (arr || []).reduce((acc, n) => acc + (Number(n) || 0), 0);
}

function getCurrentWeekMonday(date = new Date()) {
  const d = startOfDay(date);
  const jsDay = d.getDay();
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
  d.setDate(d.getDate() + mondayOffset);
  return d;
}

function buildHeatmapDays(ymdToCount, lookbackDays = HISTORY_LOOKBACK_DAYS) {
  const today            = startOfDay(new Date());
  const currentWeekMonday = getCurrentWeekMonday(today);
  const start            = new Date(currentWeekMonday);
  start.setDate(start.getDate() - 7 * 11);

  const days = [];
  for (let i = 0; i < lookbackDays; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key   = toYMD(d);
    const count = Number(ymdToCount[key] || 0);
    days.push({ key, date: d, count, level: getContributionLevel(count), weekday: ((d.getDay() + 6) % 7) });
  }
  return days;
}

function buildHeatmapColumns(days) {
  const columns = [];
  for (let i = 0; i < days.length; i += 7) {
    columns.push(days.slice(i, i + 7));
  }
  return columns;
}

function buildMonthMarkers(columns) {
  const markers = [];
  columns.forEach((col, idx) => {
    const first = col[0];
    if (!first) return;
    const month = first.date.getMonth();
    const prev  = columns[idx - 1]?.[0]?.date?.getMonth();
    if (idx === 0 || month !== prev) {
      markers.push({ index: idx, label: formatMonthLabel(first.date) });
    }
  });
  return markers;
}

function deriveWeeklyStats(days) {
  const columns = buildHeatmapColumns(days);
  return columns.map((week, idx) => ({
    id:          `week_${idx}`,
    label:       idx === columns.length - 1 ? 'This week' : `Week ${idx + 1}`,
    activeDays:  week.filter((d) => d.count > 0).length,
    completions: sum(week.map((d) => d.count)),
    start:       week[0]?.date || null,
    end:         week[6]?.date || null,
  }));
}

function getLongestRun(days) {
  let best = 0, current = 0;
  days.forEach((d) => {
    if (d.count > 0) { current += 1; if (current > best) best = current; }
    else { current = 0; }
  });
  return best;
}

function getActiveDaysThisMonth(days) {
  const now = new Date();
  return days.filter(
    (d) => d.date.getMonth() === now.getMonth() && d.date.getFullYear() === now.getFullYear() && d.count > 0
  ).length;
}

function getCompletionsThisMonth(days) {
  const now = new Date();
  return sum(
    days
      .filter((d) => d.date.getMonth() === now.getMonth() && d.date.getFullYear() === now.getFullYear())
      .map((d) => d.count)
  );
}

function getRecentActivityLabel(days) {
  const todayKey     = toYMD(new Date());
  const yesterday    = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toYMD(yesterday);
  if ((days.find((d) => d.key === todayKey)?.count || 0) > 0) return 'Active today';
  if ((days.find((d) => d.key === yesterdayKey)?.count || 0) > 0) return 'Active yesterday';
  return 'No recent activity yet';
}

function extractCompletionYMDsFromProgressMap(progressMap) {
  const out = [];
  Object.values(progressMap || {}).forEach((entry) => {
    if (!entry || !entry.isCompleted) return;
    const maybeDate =
      entry.completedAt || entry.completed_at || entry.updatedAt ||
      entry.updated_at  || entry.date         || entry.finishedAt ||
      entry.finished_at || entry.lastCompletedAt || entry.last_completed_at;
    const parsed = parseDateMaybe(maybeDate);
    if (parsed) out.push(toYMD(parsed));
  });
  return out;
}

async function loadCompletionHistoryFromCaches(userId) {
  const roadmapKeys = Object.keys(roadmapsConfig || {});
  const ymdToCount  = {};
  for (const roadmapKey of roadmapKeys) {
    const storageKey = `progress_cache_${userId}_${roadmapKey}`;
    const raw        = await AsyncStorage.getItem(storageKey);
    if (!raw) continue;
    let parsed = {};
    try { parsed = JSON.parse(raw) || {}; } catch { parsed = {}; }
    extractCompletionYMDsFromProgressMap(parsed).forEach((ymd) => {
      ymdToCount[ymd] = (ymdToCount[ymd] || 0) + 1;
    });
  }
  return ymdToCount;
}

// ─── Tab IDs ──────────────────────────────────────────────────────────────────
const TAB_OVERVIEW = 'overview';
const TAB_WEEKLY   = 'weekly';
const TAB_HISTORY  = 'history';
const TABS = [
  { id: TAB_OVERVIEW, label: 'Overview' },
  { id: TAB_WEEKLY,   label: 'Weekly'   },
  { id: TAB_HISTORY,  label: 'History'  },
];

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
          style={[coachStyles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
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
  scrim:       { flex: 1, backgroundColor: colors.overlayDark, justifyContent: 'flex-end', paddingHorizontal: spacing.xxl, paddingBottom: 48 },
  card:        { backgroundColor: colors.warmWhite, borderRadius: radii.xxl, padding: spacing.xxl, borderWidth: 1.5, borderColor: colors.softBorder, ...shadows.modal },
  dots:        { flexDirection: 'row', gap: 5, marginBottom: spacing.lg },
  dot:         { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.fawn },
  dotActive:   { backgroundColor: colors.dustyRose, width: 18 },
  pip:         { width: 28, height: 4, borderRadius: 2, backgroundColor: colors.dustyRose, marginBottom: spacing.lg, opacity: 0.7 },
  emoji:       { fontSize: 30, marginBottom: spacing.md },
  title:       { fontFamily: 'PlayfairDisplay', fontSize: 20, color: colors.ink, marginBottom: spacing.sm, letterSpacing: 0.2 },
  body:        { fontSize: 14, lineHeight: 22, color: colors.bodyMuted, marginBottom: spacing.xl },
  actions:     { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.md },
  skipText:    { fontSize: 12, fontWeight: '500', letterSpacing: 0.8, color: colors.caption, textTransform: 'uppercase' },
  nextBtn:     { backgroundColor: colors.deepRose, borderRadius: radii.md, paddingVertical: 12, paddingHorizontal: spacing.xl, alignItems: 'center' },
  nextBtnFull: { flex: 1 },
  nextBtnText: { ...typography.buttonPrimary },
});

// ─── ScreenHeader ─────────────────────────────────────────────────────────────
function ScreenHeader({ sub }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerEyebrow}>The Reinvention Edit</Text>
      <View style={styles.headerRule} />
      <Text style={styles.headerTitle} numberOfLines={0}>Your Analytics</Text>
      <Text style={styles.headerSub}>{sub}</Text>
      <View style={styles.headerBottomRule} />
    </View>
  );
}
// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionRule({ label, hint }) {
  return (
    <View style={styles.sectionRule}>
      <Text style={styles.eyebrow}>{label}</Text>
      {hint && <HintButton title={hint.title} body={hint.body} />}
      <View style={styles.rule} />
    </View>
  );
}

function StatTile({ label, value, hint }) {
  const isLong = String(value).length > 6;
  return (
    <View style={styles.statTile}>
      <Text style={styles.tileEyebrow} numberOfLines={1}>{label}</Text>
      <Text style={[styles.tileValue, isLong && styles.tileValueSmall]}>{value}</Text>
      {hint ? <Text style={styles.tileHint}>{hint}</Text> : null}
    </View>
  );
}

function HeatmapCard({ columns, monthMarkers, onCellPress }) {
  const legend = [{ level: 0 }, { level: 2 }, { level: 3 }, { level: 4 }];

  return (
    <View style={styles.calCard}>
      {/* Month labels */}
      <View style={styles.monthRow}>
        <View style={styles.weekdaySpacer} />
        <View style={styles.monthLabelsWrap}>
          {monthMarkers.map((m) => (
            <Text
              key={`${m.label}_${m.index}`}
              style={[styles.monthLabel, { left: m.index * 20 }]}
            >
              {m.label}
            </Text>
          ))}
        </View>
      </View>

      {/* Grid */}
      <View style={styles.heatmapWrap}>
        <View style={styles.weekdayCol}>
          {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
            <View key={idx} style={styles.weekdayCell}>
              {idx % 2 === 0 ? (
                <Text style={styles.weekdayLabel}>{getWeekdayLabel(idx)}</Text>
              ) : null}
            </View>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.columnsRow}>
            {columns.map((week, colIdx) => (
              <View key={`col_${colIdx}`} style={styles.weekCol}>
                {week.map((day) => (
                  <TouchableOpacity
                    key={day.key}
                    activeOpacity={0.8}
                    style={[styles.heatCell, { backgroundColor: getCellColor(day.level) }]}
                    onPress={() => onCellPress(day)}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <Text style={styles.legendText}>Less</Text>
        {legend.map((item, i) => (
          <View key={i} style={[styles.legendCell, { backgroundColor: getCellColor(item.level) }]} />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
}

function WeekRow({ week }) {
  const isStrong = week.activeDays >= 5;
  return (
    <View style={styles.weekRow}>
      <View style={[styles.weekDot, isStrong && styles.weekDotActive]} />
      <View style={styles.weekInfo}>
        <Text style={styles.weekLabel}>{week.label}</Text>
        {week.start && week.end ? (
          <Text style={styles.weekSub}>
            {formatDayLabel(week.start)} – {formatDayLabel(week.end)}
          </Text>
        ) : null}
      </View>
      <View style={styles.weekMetrics}>
        <Text style={styles.weekMetricValue}>{week.activeDays}/7</Text>
        <Text style={styles.weekMetricLabel}>days</Text>
      </View>
      <View style={styles.weekMetrics}>
        <Text style={styles.weekMetricValue}>{week.completions}</Text>
        <Text style={styles.weekMetricLabel}>tasks</Text>
      </View>
    </View>
  );
}

// ─── Tab content ──────────────────────────────────────────────────────────────

function OverviewTab({
  streakCount, bestStreak, activeDaysThisMonth,
  completionsThisMonth, longestRun, totalActiveDays,
  weeklyHours, recentActivityLabel, streakLastDate,
  columns, monthMarkers, weeklyStats, proUntil,
  onCellPress,
}) {
  return (
    <>
      {/* Streak hero with hint */}
      <View style={styles.streakCardWrap}>
        <View style={styles.streakCard}>
          <View>
            <Text style={styles.streakNum}>{streakCount}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={{ flex: 1 }}>
            <Text style={styles.streakSubLabel}>Personal best</Text>
            <Text style={styles.streakSubValue}>{bestStreak} days</Text>
            <Text style={[styles.streakSubLabel, { marginTop: spacing.xs }]}>
              {recentActivityLabel}
            </Text>
          </View>
        </View>
        <View style={styles.streakHintWrap}>
          <HintButton
            title="Your streak"
            body="Complete at least one task per day to keep your streak going. Miss a day and it resets, unless you have a streak freeze saved. Your personal best is always tracked."
            style={styles.streakHintBtn}
          />
        </View>
      </View>

      {/* Three stat tiles */}
      <View style={styles.statRow}>
        <StatTile label="This month" value={activeDaysThisMonth} hint="active days" />
        <StatTile label="Completions" value={completionsThisMonth} hint="tasks done" />
        <StatTile
          label="Weekly avg"
          value={weeklyHours ? `${pretty(weeklyHours, 1)}h` : '—'}
          hint="commitment"
        />
      </View>

      <SectionRule
        label="Activity calendar"
        hint={{
          title: 'Activity heatmap',
          body: "Each square is one day. Darker pink means more tasks completed. Tap any square to see the exact count. The calendar covers the last 12 weeks.",
        }}
      />
      <HeatmapCard
        columns={columns}
        monthMarkers={monthMarkers}
        onCellPress={onCellPress}
      />

      <SectionRule
        label="Recent weeks"
        hint={{
          title: 'Recent weeks',
          body: 'This shows your active days and task completions for each of the last 5 weeks. A week with 5+ active days gets a rose dot.',
        }}
      />
      <View style={styles.listCard}>
        {weeklyStats.length === 0 ? (
          <Text style={styles.emptyText}>
            Your calendar fills up as you complete roadmap tasks.
          </Text>
        ) : (
          weeklyStats.slice(-5).reverse().map((week) => (
            <WeekRow key={week.id} week={week} />
          ))
        )}
      </View>

      <SectionRule label="Your plan" />
      <View style={styles.planCard}>
        <View style={styles.planIconBox}>
          <Text style={styles.planIconGlyph}>✦</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.planTitle}>Premium member</Text>
          <Text style={styles.planSub}>Full analytics unlocked</Text>
        </View>
      </View>
    </>
  );
}

function WeeklyTab({ weeklyStats }) {
  const allWeeks = [...weeklyStats].reverse();
  const thisWeek = allWeeks[0] || null;

  return (
    <>
      {thisWeek && (
        <>
          <SectionRule
            label="This week"
            hint={{
              title: 'This week',
              body: "Active days counts how many different days you completed at least one task this week. Completions is the total number of tasks you've ticked off.",
            }}
          />
          <View style={styles.statRow}>
            <StatTile label="Active days" value={`${thisWeek.activeDays}/7`} />
            <StatTile label="Completions" value={thisWeek.completions} hint="tasks" />
          </View>
        </>
      )}

      <SectionRule
        label="All 12 weeks"
        hint={{
          title: 'All 12 weeks',
          body: 'A full breakdown of every week in your 12-week analytics window. Days and tasks are shown per week so you can spot your patterns.',
        }}
      />
      <View style={styles.listCard}>
        {allWeeks.length === 0 ? (
          <Text style={styles.emptyText}>
            Your calendar fills up as you complete roadmap tasks.
          </Text>
        ) : (
          allWeeks.map((week) => <WeekRow key={week.id} week={week} />)
        )}
      </View>
    </>
  );
}

function HistoryTab({
  bestStreak, totalActiveDays, longestRun,
  weeklyStats, heatmapDays, streakLastDate,
}) {
  const monthlyMap = {};
  heatmapDays.forEach((d) => {
    if (d.count === 0) return;
    const key   = `${d.date.getFullYear()}-${String(d.date.getMonth() + 1).padStart(2, '0')}`;
    const label = d.date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    if (!monthlyMap[key]) monthlyMap[key] = { key, label, activeDays: 0, completions: 0 };
    monthlyMap[key].activeDays  += 1;
    monthlyMap[key].completions += d.count;
  });
  const monthlyList = Object.values(monthlyMap).sort((a, b) => b.key.localeCompare(a.key));

  const avgActiveDays =
    weeklyStats.length > 0
      ? (weeklyStats.reduce((s, w) => s + w.activeDays, 0) / weeklyStats.length).toFixed(1)
      : '—';

  return (
    <>
      <SectionRule
        label="All time"
        hint={{
          title: 'All-time stats',
          body: "Best streak is the longest consecutive daily run you've ever had. Total active days counts every unique day you completed at least one task. Longest run is the longest unbroken active streak in your heatmap window.",
        }}
      />
      <View style={styles.statRow}>
        <StatTile label="Best streak" value={bestStreak} hint="days" />
        <StatTile label="Total active" value={totalActiveDays} hint="days" />
        <StatTile label="Longest run" value={longestRun} hint="in calendar" />
      </View>

      <View style={[styles.statRow, { marginTop: spacing.sm }]}>
        <StatTile label="Avg days/week" value={avgActiveDays} />
        <StatTile label="Last active" value={formatLastActive(streakLastDate)} />
      </View>

      <SectionRule
        label="Monthly breakdown"
        hint={{
          title: 'Monthly breakdown',
          body: 'Tasks and active days grouped by calendar month. Most recent months appear at the top.',
        }}
      />
      <View style={styles.listCard}>
        {monthlyList.length === 0 ? (
          <Text style={styles.emptyText}>No activity recorded yet.</Text>
        ) : (
          monthlyList.map((m) => (
            <View key={m.key} style={styles.weekRow}>
              <View style={[styles.weekDot, styles.weekDotActive]} />
              <View style={styles.weekInfo}>
                <Text style={styles.weekLabel}>{m.label}</Text>
                <Text style={styles.weekSub}>{m.completions} tasks completed</Text>
              </View>
              <View style={styles.weekMetrics}>
                <Text style={styles.weekMetricValue}>{m.activeDays}</Text>
                <Text style={styles.weekMetricLabel}>active days</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AnalyticsScreen() {
  const navigation = useNavigation();

  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState(TAB_OVERVIEW);
  const [planStatus, setPlanStatus]       = useState('—');
  const [freeHoursUsed, setFreeHoursUsed] = useState(0);
  const [proUntil, setProUntil]           = useState(null);
  const [weeklyHours, setWeeklyHours]     = useState(null);
  const [streakCount, setStreakCount]     = useState(0);
  const [bestStreak, setBestStreak]       = useState(0);
  const [streakLastDate, setStreakLastDate] = useState(null);
  const [heatmapDays, setHeatmapDays]     = useState([]);
  const [upsellVisible, setUpsellVisible] = useState(false);

  // ── Coach mark state ─────────────────────────────────────────────────────────
  const [coachSeen, setCoachSeen]     = useState(true);
  const [coachLoaded, setCoachLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ANALYTICS_COACH_KEY)
      .then((val) => { setCoachSeen(val === 'true'); setCoachLoaded(true); })
      .catch(() => setCoachLoaded(true));
  }, []);

  const markCoachSeen = useCallback(async () => {
    setCoachSeen(true);
    await AsyncStorage.setItem(ANALYTICS_COACH_KEY, 'true');
  }, []);

  const isPremium = planStatus === 'Premium';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [
        streakLast, streakNow, streakBestNow, timeCommitment,
        techTrack, cityTrack, physicalTrack,
      ] = await AsyncStorage.multiGet([
        STREAK_LAST_DATE_KEY, STREAK_COUNT_KEY, STREAK_BEST_KEY,
        'timeCommitmentHours', TECH_TRACK_KEY, NEWCITY_TRACK_KEY, PHYSICAL_TRACK_KEY,
      ]);

      setStreakLastDate(streakLast?.[1] || null);
      setStreakCount(parseInt(streakNow?.[1] || '0', 10) || 0);
      setBestStreak(parseInt(streakBestNow?.[1] || '0', 10) || 0);

      const wh = timeCommitment?.[1] ? parseFloat(timeCommitment[1]) : null;
      setWeeklyHours(Number.isFinite(wh) ? wh : null);

      void techTrack; void cityTrack; void physicalTrack;

const { data: { session } } = await supabase.auth.getSession();
const user = session?.user;
if (!user) {
  setPlanStatus('—'); setFreeHoursUsed(0); setProUntil(null); setHeatmapDays([]);
  setLoading(false);
  return;
}
const { data: prof, error } = await supabase
  .from('profiles')
  .select('is_pro, pro_until, free_hours_used')
  .eq('id', user.id)
  .single();

      if (error) {
        console.warn('profiles select error', error);
        setPlanStatus('—'); setFreeHoursUsed(0); setProUntil(null);
      } else {
        const used = Number(prof?.free_hours_used || 0);
        setFreeHoursUsed(Number.isFinite(used) ? used : 0);
        setProUntil(prof?.pro_until || null);
        setPlanStatus(isActivePro(prof || {}) ? 'Premium' : 'Free');
      }

      const ymdToCount = await loadCompletionHistoryFromCaches(user.id);
      setHeatmapDays(buildHeatmapDays(ymdToCount, HISTORY_LOOKBACK_DAYS));
    } catch (e) {
      console.warn('Analytics load error', e);
      Alert.alert('Error', 'Could not load analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const columns              = useMemo(() => buildHeatmapColumns(heatmapDays), [heatmapDays]);
  const monthMarkers         = useMemo(() => buildMonthMarkers(columns), [columns]);
  const weeklyStats          = useMemo(() => deriveWeeklyStats(heatmapDays), [heatmapDays]);
  const activeDaysThisMonth  = useMemo(() => getActiveDaysThisMonth(heatmapDays), [heatmapDays]);
  const completionsThisMonth = useMemo(() => getCompletionsThisMonth(heatmapDays), [heatmapDays]);
  const longestRun           = useMemo(() => getLongestRun(heatmapDays), [heatmapDays]);
  const totalActiveDays      = useMemo(() => heatmapDays.filter((d) => d.count > 0).length, [heatmapDays]);
  const recentActivityLabel  = useMemo(() => getRecentActivityLabel(heatmapDays), [heatmapDays]);

  const handleCellPress = (day) => {
    Alert.alert(
      formatDayLabel(day.date),
      day.count > 0
        ? `${day.count} completed task${day.count === 1 ? '' : 's'}`
        : 'No completed tasks recorded.'
    );
  };

  const openPaywall = () => setUpsellVisible(true);

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader sub="Loading your consistency data…" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.deepRose} />
        </View>
        <PremiumUpsellModal visible={upsellVisible} onClose={() => setUpsellVisible(false)} />
      </View>
    );
  }

  // ── Locked overlay (free users) ───────────────────────────────────────────────
  const lockedOverlay = !isPremium && (
    <View style={styles.lockedOverlay}>
      <View style={styles.lockedCard}>
        <View style={styles.lockedCardHintRow}>
          <HintButton
            title="Analytics"
            body="This screen tracks your consistency across all roadmaps; streaks, daily completions, and patterns over the last 12 weeks. Premium is required to unlock the full view."
          />
        </View>
        <Text style={styles.lockedTitle}>Premium Analytics ✨</Text>
        <Text style={styles.lockedSub}>
          Unlock your full consistency calendar and habit heatmap.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={openPaywall} activeOpacity={0.9}>
          <Text style={styles.primaryBtnText}>Go Premium</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.9}
        >
          <Text style={styles.secondaryBtnText}>View my plan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Shared tab props ──────────────────────────────────────────────────────────
  const sharedProps = {
    streakCount, bestStreak, activeDaysThisMonth, completionsThisMonth,
    longestRun, totalActiveDays, weeklyHours, recentActivityLabel,
    streakLastDate, columns, monthMarkers, weeklyStats, proUntil,
    heatmapDays, onCellPress: handleCellPress,
  };

  return (
    <View style={styles.screen}>

      {/* ── Header ── */}
      <ScreenHeader
        sub={`${recentActivityLabel}${streakCount > 0 ? ` · ${streakCount}-day streak` : ''}`}
      />

      {/* ── Content (segmented control + scroll + locked overlay) ── */}
      <View style={{ flex: 1, position: 'relative' }}>

        {/* ── Segmented control ── */}
        <View style={styles.segWrap}>
          <View style={styles.seg}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.segBtn, activeTab === tab.id && styles.segBtnActive]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.segBtnText, activeTab === tab.id && styles.segBtnTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {isPremium && (
            <View style={styles.segHintRow}>
              <HintButton
                title="Analytics"
                body="This screen tracks your consistency across all roadmaps; streaks, daily completions, and patterns over the last 12 weeks."
              />
            </View>
          )}
        </View>

        {/* ── Scrollable body ── */}
        <ScrollView
          style={isPremium ? null : styles.blurred}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === TAB_OVERVIEW && <OverviewTab {...sharedProps} />}
          {activeTab === TAB_WEEKLY   && <WeeklyTab weeklyStats={weeklyStats} />}
          {activeTab === TAB_HISTORY  && (
            <HistoryTab
              bestStreak={bestStreak}
              totalActiveDays={totalActiveDays}
              longestRun={longestRun}
              weeklyStats={weeklyStats}
              heatmapDays={heatmapDays}
              streakLastDate={streakLastDate}
            />
          )}
          <View style={styles.footerSpacer} />
        </ScrollView>

        {lockedOverlay}

      </View>

      <PremiumUpsellModal visible={upsellVisible} onClose={() => setUpsellVisible(false)} />

      {/* ── First-visit coach mark ── */}
      <CoachMarkOverlay
        visible={coachLoaded && !coachSeen && !loading}
        onDone={markCoachSeen}
        steps={ANALYTICS_COACH_STEPS}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: colors.warmWhite,
  },

  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    paddingTop: spacing.screenPaddingTop,
    paddingHorizontal: spacing.screenPaddingH,
    paddingBottom: spacing.xl,
    backgroundColor: colors.warmWhite,
  },
  headerEyebrow: {
    ...typography.eyebrow,
    fontSize: 9,
    letterSpacing: 3.5,
    color: colors.clay,
    marginBottom: spacing.sm,
  },
  headerRule: {
    width: 32,
    height: 1.5,
    backgroundColor: colors.deepRose,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontFamily: 'DancingScript',
    fontSize: 40,
    color: colors.ink,
    lineHeight: 56,
    marginBottom: spacing.xs,
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  headerSub: {
    fontFamily: 'serif',
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.bodyMuted,
    letterSpacing: 0.3,
  },
  headerBottomRule: {
    width: '100%',
    height: 1.5,
    backgroundColor: colors.ink,
    marginTop: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  // ── Plan badge ────────────────────────────────────────────────────────────────
  planBadge:            { ...tokens.badge },
  planBadgePremium:     { backgroundColor: colors.deepRose, borderColor: colors.deepRose },
  planBadgeFree:        { backgroundColor: colors.roseTint08, borderColor: colors.roseTint15 },
  planBadgeText:        { ...typography.badge },
  planBadgeTextPremium: { color: colors.white },
  planBadgeTextFree:    { color: colors.deepRose },

  // ── Segmented control ─────────────────────────────────────────────────────────
  segWrap: {
    paddingHorizontal: spacing.screenPaddingH,
    paddingVertical: spacing.sm,
    backgroundColor: colors.warmWhite,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.subtleBorder,
  },
  seg: {
    flexDirection: 'row',
    backgroundColor: colors.offWhite,
    borderRadius: radii.md,
    padding: 3,
    gap: 2,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  segBtnActive: {
    backgroundColor: colors.white,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segBtnText:       { ...typography.actionSub, fontWeight: '500' },
  segBtnTextActive: { color: colors.deepRose, fontWeight: '600' },
  segHintRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },

  // ── Scroll body ───────────────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: spacing.screenPaddingH,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  blurred: { opacity: 0.2 },

  // ── Streak hero card ──────────────────────────────────────────────────────────
  streakCardWrap: {
    position: 'relative',
  },
  streakCard: {
    backgroundColor: colors.deepRose,
    borderRadius: radii.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  streakHintWrap: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  streakHintBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.35)',
  },
  streakNum: {
    fontFamily: typography.fontSerif,
    fontSize: 48,
    fontWeight: '700',
    color: colors.warmWhite,
    lineHeight: 52,
  },
  streakLabel: {
    ...typography.actionSub,
    color: 'rgba(250,247,242,0.7)',
    marginTop: 2,
  },
  streakDivider: {
    width: 0.5,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(250,247,242,0.25)',
  },
  streakSubLabel: { ...typography.actionSub, color: 'rgba(250,247,242,0.65)' },
  streakSubValue: {
    fontFamily: typography.fontSerif,
    fontSize: 16,
    fontWeight: '700',
    color: colors.warmWhite,
    marginTop: 1,
  },

  // ── Stat tiles ────────────────────────────────────────────────────────────────
  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statTile: {
    flex: 1,
    backgroundColor: colors.offWhite,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  tileEyebrow:     { ...typography.eyebrow, marginBottom: 4, fontSize: 9, letterSpacing: 0.4 },
  tileValue:       { fontFamily: typography.fontSerif, fontSize: 22, fontWeight: '700', color: colors.deepRose, lineHeight: 26 },
  tileValueSmall:  { fontSize: 13, lineHeight: 18 },
  tileHint:        { ...typography.caption, marginTop: 2 },

  // ── Section rule ──────────────────────────────────────────────────────────────
  sectionRule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  eyebrow: { ...typography.eyebrow },
  rule:    { flex: 1, height: 0.5, backgroundColor: colors.clayRule },

  // ── Heatmap card ──────────────────────────────────────────────────────────────
  calCard:         { ...tokens.infoCard, padding: spacing.md },
  monthRow:        { flexDirection: 'row', marginBottom: spacing.xs },
  weekdaySpacer:   { width: 30 },
  monthLabelsWrap: { position: 'relative', height: 14, flex: 1 },
  monthLabel:      { position: 'absolute', top: 0, ...typography.caption, fontWeight: '600' },
  heatmapWrap:     { flexDirection: 'row', alignItems: 'flex-start' },
  weekdayCol:      { width: 30, marginRight: 3 },
  weekdayCell:     { height: 17, justifyContent: 'center' },
  weekdayLabel:    { ...typography.caption, fontWeight: '600', fontSize: 10 },
  columnsRow:      { flexDirection: 'row', gap: 3 },
  weekCol:         { gap: 3 },
  heatCell:        { width: 14, height: 14, borderRadius: radii.dot + 1 },
  legendRow:       { marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 5 },
  legendText:      { ...typography.caption, fontWeight: '600', fontSize: 10 },
  legendCell:      { width: 12, height: 12, borderRadius: radii.dot },

  // ── Weekly list card ──────────────────────────────────────────────────────────
  listCard: {
    ...tokens.infoCard,
    overflow: 'hidden',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.cardPaddingH,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.subtleBorder,
    gap: spacing.sm,
  },
  weekDot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.fawn, flexShrink: 0 },
  weekDotActive:   { backgroundColor: colors.deepRose },
  weekInfo:        { flex: 1 },
  weekLabel:       { ...typography.actionLabel },
  weekSub:         { ...typography.actionSub, marginTop: 1 },
  weekMetrics:     { alignItems: 'flex-end', minWidth: 44 },
  weekMetricValue: { fontFamily: typography.fontSerif, fontSize: 14, fontWeight: '700', color: colors.deepRose },
  weekMetricLabel: { ...typography.caption, fontSize: 10 },

  // ── Plan card ─────────────────────────────────────────────────────────────────
  planCard: {
    ...tokens.linenCard,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.cardPaddingH,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  planIconBox:   { ...tokens.actionIconBox, backgroundColor: colors.deepRose },
  planIconGlyph: { fontSize: 16, color: colors.white },
  planTitle:     { ...typography.actionLabel, fontWeight: '600' },
  planSub:       { ...typography.actionSub, marginTop: 2 },

  // ── Empty state ───────────────────────────────────────────────────────────────
  emptyText: {
    ...typography.body,
    color: colors.bodyMuted,
    paddingHorizontal: spacing.cardPaddingH,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },

  // ── Locked overlay ────────────────────────────────────────────────────────────
  lockedOverlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPaddingH,
  },
  lockedCard: {
    ...tokens.modalCard,
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  lockedCardHintRow: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xs,
  },
  lockedTitle: { ...typography.sectionTitle, textAlign: 'center' },
  lockedSub:   { ...typography.body, color: colors.bodyMuted, textAlign: 'center', lineHeight: 20 },
  primaryBtn:      { ...tokens.buttonPrimary, width: '100%', marginTop: spacing.xs },
  primaryBtnText:  { ...typography.buttonPrimary },
  secondaryBtn:    { ...tokens.buttonDanger, width: '100%' },
  secondaryBtnText:{ ...typography.buttonDanger },

  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  footerSpacer: { height: spacing.xxxl },
});