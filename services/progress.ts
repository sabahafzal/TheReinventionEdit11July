// services/progress.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

type SavePayload = {
  userId: string;
  roadmapKey: string;
  themeKey: string;
  taskIndex: number;
  isCompleted: boolean;
  planLength?: number | null;
  dayNumber?: number | null;
  completedAt?: string | null; // ISO
};

const cacheKey = (userId: string, roadmapKey: string) =>
  `progress_cache_${userId}_${roadmapKey}`;

export async function upsertTaskProgress(p: SavePayload) {
  // Always write to local cache immediately so the UI survives
  // coming back to the screen even if Supabase hasn't responded yet.
  await mirrorToLocal(p);

  try {
    const { error } = await supabase
      .from('roadmap_task_progress')
      .upsert(
        {
          user_id: p.userId,
          roadmap_key: p.roadmapKey,
          theme_key: p.themeKey,
          task_index: p.taskIndex,
          is_completed: p.isCompleted,
          plan_length: p.planLength ?? null,
          day_number: p.dayNumber ?? null,
          completed_at: p.isCompleted
            ? (p.completedAt ?? new Date().toISOString())
            : null,
        },
        { onConflict: 'user_id,roadmap_key,theme_key,task_index' },
      );

    if (error) {
      console.error(
        '[upsertTaskProgress] Supabase error — queuing for retry:',
        JSON.stringify(error),
      );
      await queueLocalChange(p);
    }
  } catch (e) {
    console.error('[upsertTaskProgress] Unexpected exception — queuing for retry:', e);
    await queueLocalChange(p);
  }
}

async function queueLocalChange(p: SavePayload) {
  const key = cacheKey(p.userId, p.roadmapKey) + '_queue';
  try {
    const prev = await AsyncStorage.getItem(key);
    const queued: SavePayload[] = prev ? JSON.parse(prev) : [];
    // De-dupe by (themeKey, taskIndex) — keep the latest state
    const filtered = queued.filter(
      (x) => !(x.themeKey === p.themeKey && x.taskIndex === p.taskIndex),
    );
    filtered.push(p);
    await AsyncStorage.setItem(key, JSON.stringify(filtered));
  } catch (e) {
    console.error('[queueLocalChange] AsyncStorage error:', e);
  }
}

async function mirrorToLocal(p: SavePayload) {
  const key = cacheKey(p.userId, p.roadmapKey);
  try {
    const prev = await AsyncStorage.getItem(key);
    const local: Record<string, { isCompleted: boolean; completedAt: string | null }> =
      prev ? JSON.parse(prev) : {};
    local[`${p.themeKey}:${p.taskIndex}`] = {
      isCompleted: p.isCompleted,
      completedAt: p.isCompleted ? (p.completedAt ?? new Date().toISOString()) : null,
    };
    await AsyncStorage.setItem(key, JSON.stringify(local));
  } catch (e) {
    console.error('[mirrorToLocal] AsyncStorage error:', e);
  }
}

export async function hydrateProgress(userId: string, roadmapKey: string) {
  const localRaw = await AsyncStorage.getItem(cacheKey(userId, roadmapKey));
  const localMap: Record<string, { isCompleted: boolean; completedAt: string | null }> =
    localRaw ? JSON.parse(localRaw) : {};

  const { data, error } = await supabase
    .from('roadmap_task_progress')
    .select('theme_key, task_index, is_completed, completed_at')
    .eq('user_id', userId)
    .eq('roadmap_key', roadmapKey);

  if (error) {
    console.error('[hydrateProgress] Supabase error — falling back to local cache:', JSON.stringify(error));
    // Return local cache so already-completed tasks still show correctly
    return localMap;
  }

  // Build a map from Supabase rows
  const remoteMap: Record<string, { isCompleted: boolean; completedAt: string | null }> = {};
  (data ?? []).forEach((r) => {
    remoteMap[`${r.theme_key}:${r.task_index}`] = {
      isCompleted: r.is_completed,
      completedAt: r.completed_at,
    };
  });

  // Merge: local wins for any key not yet in Supabase (queued offline writes),
  // Supabase wins for everything it knows about.
  const merged = { ...localMap, ...remoteMap };

  // Persist the merged result so the next cold load is fast
  await AsyncStorage.setItem(cacheKey(userId, roadmapKey), JSON.stringify(merged));

  return merged;
}

export async function syncQueued(userId: string, roadmapKey: string) {
  const qKey = cacheKey(userId, roadmapKey) + '_queue';
  try {
    const queued = await AsyncStorage.getItem(qKey);
    if (!queued) return;
    const items: SavePayload[] = JSON.parse(queued);
    if (items.length === 0) return;

    const upserts = items.map((p) => ({
      user_id: userId,
      roadmap_key: roadmapKey,
      theme_key: p.themeKey,
      task_index: p.taskIndex,
      is_completed: p.isCompleted,
      plan_length: p.planLength ?? null,
      day_number: p.dayNumber ?? null,
      completed_at: p.isCompleted ? (p.completedAt ?? new Date().toISOString()) : null,
    }));

    const { error } = await supabase.from('roadmap_task_progress').upsert(upserts, {
      onConflict: 'user_id,roadmap_key,theme_key,task_index',
    });

    if (error) {
      console.error('[syncQueued] Supabase error — will retry on next connection:', JSON.stringify(error));
    } else {
      await AsyncStorage.removeItem(qKey);
    }
  } catch (e) {
    console.error('[syncQueued] Unexpected error:', e);
  }
}

export function progressRatioFromLocalMap(
  localMap: Record<string, { isCompleted: boolean }>,
) {
  const entries = Object.values(localMap || {});
  if (entries.length === 0) return { completed: 0, total: 0, ratio: 0 };
  const completed = entries.filter((e) => e.isCompleted).length;
  return { completed, total: entries.length, ratio: completed / entries.length };
}