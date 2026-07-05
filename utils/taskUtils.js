// utils/taskUtils.js
import { roadmapTasks } from '../screens/roadmapTasks';

/**
 * Design:
 * - Keep the existing nested structure in roadmapTasks (themes → tasks).
 * - Each task can optionally include { priority: number } where a LOWER number = more important.
 * - If priority is missing, we fall back to (theme index, task index) order to keep your current flow stable.
 * - We always return flattened tasks with their themeKey preserved.
 */

export function flattenRoadmapTasks(roadmapKey) {
  const roadmap = roadmapTasks[roadmapKey] || {};
  const themeKeys = Object.keys(roadmap);

  const flat = [];
  themeKeys.forEach((themeKey, themeIndex) => {
    const items = roadmap[themeKey] || [];
    items.forEach((t, taskIndex) => {
      flat.push({
        themeKey,
        ...t,
        __themeIndex: themeIndex,
        __taskIndex: taskIndex,
        __priority: typeof t.priority === 'number' ? t.priority : null,
      });
    });
  });
  return flat;
}

export function getChronologicalTasks(roadmapKey) {
  const flat = flattenRoadmapTasks(roadmapKey);

  // Sort by explicit priority first (ascending), then by theme order, then by in-theme order.
  flat.sort((a, b) => {
    const ap = a.__priority;
    const bp = b.__priority;
    if (ap !== null && bp !== null) return ap - bp;
    if (ap !== null && bp === null) return -1;
    if (ap === null && bp !== null) return 1;
    // fallback: theme order, then task index
    if (a.__themeIndex !== b.__themeIndex) return a.__themeIndex - b.__themeIndex;
    return a.__taskIndex - b.__taskIndex;
  });

  return separateDailyTasks(flat);
}

/**
 * Ensures recurring tasks are spread out so no two appear consecutively without
 * a normal (one-off) task in between, while also respecting the logical ordering
 * of each recurring series relative to the normal tasks around it.
 *
 * A "recurring series" covers both daily (meta.kind === 'recurring') and weekly
 * (meta.kind === 'recurring_weekly') tasks. Each series is identified by its idBase
 * (the part of task.id before the final ".dayN" / ".weekN" segment).
 *
 * Strategy:
 *  1. Walk the sorted input once. Each recurring task's series is recorded with the
 *     index of the first normal task that came BEFORE the first instance of that
 *     series in the sorted list. This is the series' "unlock index" — the number of
 *     normal tasks that must be output before any instance of that series may appear.
 *  2. Build a normal queue and per-series pools (preserving sort order within each).
 *  3. Walk output slots: at each step pick the next eligible task:
 *     a. If the last placed task was recurring, prefer a normal task next (to avoid
 *        two consecutive recurring tasks).
 *     b. Otherwise, try to place a recurring task from a series whose unlock index
 *        has been reached (i.e. enough normals have been output already) and whose
 *        series key differs from the last placed recurring series.
 *     c. If no eligible recurring task exists, place the next normal task.
 *  4. Graceful fallback when normals are exhausted.
 *
 * This guarantees:
 *  - No two consecutive instances from the same series.
 *  - Recurring tasks never appear before the normal tasks that logically precede
 *    them in their theme (e.g. "Workout session" never before "Learn form").
 */
function separateDailyTasks(sortedTasks) {
  // Helper: derive a stable series key from a task (null = not recurring)
  const seriesKey = (t) => {
    const kind = t.meta?.kind;
    if (kind !== 'recurring' && kind !== 'recurring_weekly') return null;

    if (t.id) {
      const parts = t.id.split('.');
      const last = parts[parts.length - 1];
      // strip trailing .dayN or .weekN
      if (last.startsWith('day') || last.startsWith('week')) {
        return parts.slice(0, -1).join('.');
      }
      return t.id; // id present but no day/week suffix — use as-is
    }
    // Fallback: strip " (Day N)" or " (Week N)" from title
    return t.task
      ? t.task.replace(/\s*\((Day|Week) \d+\)$/, '').trim()
      : null;
  };

  // --- Pass 1: count normal tasks seen before each series' first instance ---
  // unlockAfter[seriesKey] = number of normal tasks that must be output first
  const unlockAfter = new Map(); // seriesKey → int
  let normalsSeen = 0;
  for (const t of sortedTasks) {
    const key = seriesKey(t);
    if (key === null) {
      normalsSeen++;
    } else {
      if (!unlockAfter.has(key)) {
        unlockAfter.set(key, normalsSeen);
      }
    }
  }

  // --- Pass 2: partition into pools ---
  const normalQueue = [];            // non-recurring tasks, in original order
  const recurringPools = new Map();  // seriesKey → task[]

  for (const t of sortedTasks) {
    const key = seriesKey(t);
    if (key === null) {
      normalQueue.push(t);
    } else {
      if (!recurringPools.has(key)) recurringPools.set(key, []);
      recurringPools.get(key).push(t);
    }
  }

  // No recurring tasks — return as-is
  if (recurringPools.size === 0) return sortedTasks;

  const result = [];
  let lastWasRecurring = false;
  let lastSeriesKey = null;
  let normalsOutput = 0; // how many normal tasks we've placed so far

  const totalRecurring = () =>
    [...recurringPools.values()].reduce((s, a) => s + a.length, 0);

  // Is a series eligible to place its next instance right now?
  const isUnlocked = (key) => normalsOutput >= (unlockAfter.get(key) ?? 0);

  while (normalQueue.length > 0 || totalRecurring() > 0) {
    // If the last task was recurring, strongly prefer a normal task next
    if (lastWasRecurring && normalQueue.length > 0) {
      result.push(normalQueue.shift());
      normalsOutput++;
      lastWasRecurring = false;
      lastSeriesKey = null;
      continue;
    }

    // Try to place an unlocked recurring task from a different series than the last
    let placed = false;
    for (const [key, pool] of recurringPools) {
      if (pool.length === 0) continue;
      if (key === lastSeriesKey) continue;  // same series — skip
      if (!isUnlocked(key)) continue;       // not enough normals output yet

      result.push(pool.shift());
      lastSeriesKey = key;
      lastWasRecurring = true;
      placed = true;
      break;
    }

    if (!placed) {
      // Either all remaining recurring are locked, or only the same series remains.
      // Place the next normal task to either unlock a series or act as separator.
      if (normalQueue.length > 0) {
        result.push(normalQueue.shift());
        normalsOutput++;
        lastWasRecurring = false;
        lastSeriesKey = null;
      } else {
        // No normals left — flush remaining recurring tasks (graceful fallback)
        // Respect unlock order as best we can, but don't block indefinitely.
        for (const pool of recurringPools.values()) {
          while (pool.length > 0) result.push(pool.shift());
        }
        break;
      }
    }
  }

  // Safety net: flush any remaining normal tasks
  while (normalQueue.length > 0) result.push(normalQueue.shift());

  return result;
}

export function sliceTasksByAllowedHours(sortedTasks, allowedHours) {
  let total = 0;
  const sliced = [];
  for (const t of sortedTasks) {
    const d = Number(t.duration || 0) || 0;
    if (total + d > allowedHours) break;
    sliced.push(t);
    total += d;
  }
  return sliced;
}

/**
 * Split a sorted (chronological) task list into weeks by a weekly hours budget.
 * - duration is in hours (float). We will pack tasks into weeks without exceeding the budget.
 * - If a single task > weeklyBudget, we still place it alone in that week.
 */
export function bucketTasksByWeek(sortedTasks, weeklyBudgetHours) {
  const weeks = [];
  let current = [];
  let used = 0;

  sortedTasks.forEach((t) => {
    const d = Number(t.duration || 0) || 0;
    // if adding this task would exceed the budget and current week has content, start a new week
    if (current.length > 0 && used + d > weeklyBudgetHours) {
      weeks.push(current);
      current = [t];
      used = d;
    } else if (used + d <= weeklyBudgetHours || current.length === 0) {
      current.push(t);
      used += d;
    } else {
      // safety fallback (should rarely hit)
      weeks.push(current);
      current = [t];
      used = d;
    }
  });

  if (current.length > 0) weeks.push(current);
  return weeks;
}