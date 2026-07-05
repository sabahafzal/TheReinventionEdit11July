import { useEffect, useState, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../lib/supabase';
import { hydrateProgress, upsertTaskProgress, syncQueued, progressRatioFromLocalMap } from '../services/progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { roadmapTasks, getTaskId } from '../screens/roadmapTasks';

type Options = {
  roadmapKey: string;
  userId?: string;          // if undefined, read from Supabase auth session
  planLength?: number | null;
};

export function useRoadmapProgress({ roadmapKey, userId, planLength }: Options) {
  const [map, setMap] = useState<Record<string, { isCompleted: boolean; completedAt?: string | null }>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = userId ?? sessionData?.session?.user?.id;
    if (!uid) {
      // Session not yet restored — RoadmapScreen will retry via onAuthStateChange.
      setLoading(false);
      return;
    }
    const m = await hydrateProgress(uid, roadmapKey);
    setMap(m);
    setLoading(false);
  }, [roadmapKey, userId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const unsub = NetInfo.addEventListener(async (state) => {
      if (state.isConnected) {
        const { data: sessionData } = await supabase.auth.getSession();
        const uid = userId ?? sessionData?.session?.user?.id;
        if (uid) await syncQueued(uid, roadmapKey);
      }
    });
    return () => unsub();
  }, [roadmapKey, userId]);

  const toggle = useCallback(async (themeKey: string, taskIndex: number, next: boolean) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = userId ?? sessionData?.session?.user?.id;
    if (!uid) return;

    // Optimistic UI
    const key = `${themeKey}:${taskIndex}`;
    setMap((prev) => ({ ...prev, [key]: { isCompleted: next, completedAt: next ? new Date().toISOString() : null } }));

    await upsertTaskProgress({
      userId: uid,
      roadmapKey,
      themeKey,
      taskIndex,
      isCompleted: next,
      planLength: planLength ?? null,
      dayNumber: undefined,
    });
  }, [roadmapKey, userId, planLength]);

  const summary = progressRatioFromLocalMap(map);

  return { loading, map, toggle, summary, reload: load };
}