// lib/paywall.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

export const FREE_LIMIT_HOURS = 20;
export const SOFT_WARNING_THRESHOLDS = [15, 18];
const SUB_KEY = 'isPro';

/* ============================================================
   Helpers
   ============================================================ */

function isActivePro({ is_pro, pro_until }) {
  if (!is_pro) return false;

  // If pro_until is null/empty, trust the is_pro boolean (some setups use boolean only)
  if (!pro_until) return true;

  const until = new Date(pro_until);
  if (Number.isNaN(until.getTime())) return true; // unparseable date → trust is_pro flag

  return until.getTime() > Date.now();
}

/* ============================================================
   ✅ Pro check
   Checks local AsyncStorage first, then Supabase profiles
   ============================================================ */

export async function isProUser() {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      // No active session — clear any stale local flag
      await AsyncStorage.removeItem(SUB_KEY);
      return false;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('is_pro, pro_until')
      .eq('id', sessionData.session.user.id)
      .single();
    if (error) return false;
    const active = isActivePro(data || {});
    // Keep AsyncStorage in sync with the ground-truth Supabase value
    if (active) {
      await AsyncStorage.setItem(SUB_KEY, 'true');
    } else {
      await AsyncStorage.removeItem(SUB_KEY);
    }
    return active;
  } catch {
    return false;
  }
}

/* ============================================================
   ✅ SINGLE SOURCE OF TRUTH — Global Supabase-based enforcement
   ============================================================ */

export async function enforceGlobalCap(showUpsell) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) return false;

    const { data, error } = await supabase
      .from('profiles')
      .select('free_hours_used, is_pro, pro_until')
      .eq('id', user.id)
      .single();

    if (error) {
      // PGRST116 = no rows found — new account whose profile row hasn't been
      // created yet. Treat as a fresh free user with 0 hours used.
      if (error.code === 'PGRST116') return true;

      // Any other DB error — fail closed to be safe
      try {
        showUpsell?.();
      } catch {}
      return false;
    }

    // ✅ Respect expiry
    if (isActivePro(data || {})) return true;

    const used = Number(data?.free_hours_used || 0);

    if (used >= FREE_LIMIT_HOURS) {
      try {
        showUpsell?.();
      } catch {}
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/* ============================================================
   🔁 Wrapper for backward compatibility
   Now routes everything through enforceGlobalCap
   ============================================================ */

export async function enforceFreeCapOrUpsell(showUpsell) {
  return enforceGlobalCap(showUpsell);
}

/* ============================================================
   ✅ Add time to free_hours_used (Supabase-based)
   Call this when a user completes a task (incomplete -> complete).
   Also returns info about soft warning thresholds crossed.
   ============================================================ */

export async function addFreeHoursUsed(deltaHours) {
  const delta = Number(deltaHours || 0);

  if (!Number.isFinite(delta) || delta <= 0) {
    return {
      usedBefore: 0,
      usedAfter: 0,
      crossedWarnings: [],
      hitCap: false,
    };
  }

  try {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      return {
        usedBefore: 0,
        usedAfter: 0,
        crossedWarnings: [],
        hitCap: false,
      };
    }

    // Read current
    const { data: prof, error: readErr } = await supabase
      .from('profiles')
      .select('free_hours_used, is_pro, pro_until')
      .eq('id', user.id)
      .single();

    if (readErr) {
      // PGRST116 = no profile row yet — create it with this first delta
      if (readErr.code === 'PGRST116') {
        const next = Number(delta.toFixed(2));
        await supabase
          .from('profiles')
          .insert({ id: user.id, free_hours_used: next });
        return {
          usedBefore: 0,
          usedAfter: next,
          crossedWarnings: [],
          hitCap: next >= FREE_LIMIT_HOURS,
        };
      }
      // Any other read error — fail closed to prevent untracked usage
      return {
        usedBefore: 0,
        usedAfter: 0,
        crossedWarnings: [],
        hitCap: true,
      };
    }

    // If user is Pro (and active), don't count free hours
    if (isActivePro(prof || {})) {
      return {
        usedBefore: Infinity,
        usedAfter: Infinity,
        crossedWarnings: [],
        hitCap: false,
      };
    }

    const used = Number(prof?.free_hours_used || 0);
    const next = Number((used + delta).toFixed(2));

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ free_hours_used: next })
      .eq('id', user.id);

    if (updateErr) {
      // Write failed — fail closed so untracked hours don't slip through
      return {
        usedBefore: used,
        usedAfter: used,
        crossedWarnings: [],
        hitCap: true,
      };
    }

    const crossedWarnings = SOFT_WARNING_THRESHOLDS.filter(
      (threshold) => used < threshold && next >= threshold
    );

    return {
      usedBefore: used,
      usedAfter: next,
      crossedWarnings,
      hitCap: next >= FREE_LIMIT_HOURS,
    };
  } catch {
    // Unexpected error — fail closed to prevent untracked task completions
    return {
      usedBefore: 0,
      usedAfter: 0,
      crossedWarnings: [],
      hitCap: true,
    };
  }
}

/* ============================================================
   Optional: Remaining hours helper (server-based)
   ============================================================ */

export async function getFreeHoursRemaining() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) return 0;

    const { data, error } = await supabase
      .from('profiles')
      .select('free_hours_used, is_pro, pro_until')
      .eq('id', user.id)
      .single();

    // PGRST116 = no profile row yet → user has used 0 hours, full cap available
    if (error) return error.code === 'PGRST116' ? FREE_LIMIT_HOURS : 0;

    // If Pro (and active), treat as unlimited remaining
    if (isActivePro(data || {})) return Infinity;

    const used = Number(data?.free_hours_used || 0);
    return Math.max(0, Number((FREE_LIMIT_HOURS - used).toFixed(2)));
  } catch {
    return 0;
  }
}

/* ============================================================
   Utility formatter
   ============================================================ */

export const formatHoursHMM = (h) => {
  if (h === Infinity) return 'Unlimited';
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
};