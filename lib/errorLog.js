// lib/errorLog.js
//
// A standalone diagnostic log that persists to AsyncStorage, independent of
// Sentry. This exists because the exact failure we're chasing — a missing
// native module — can, in the worst case, also break the Sentry native
// layer itself (it links against the same native bridge). If that ever
// happens, Sentry.captureException() may silently no-op and we'd be back to
// a black box. Every checkpoint/error logged here is ALSO written locally,
// so there's always a second, independent trail.
//
// How to read the log after a bad TestFlight build:
//   1. Reproduce the crash (open the app).
//   2. Immediately reopen the app again — the fallback screen rendered by
//      AppErrorBoundary shows the last error inline (see components/
//      AppErrorBoundary.js), which is usually enough on its own.
//   3. For the full breadcrumb trail, call `dumpErrorLog()` (imported
//      anywhere) and log/inspect the result, or wire it to a hidden debug
//      screen later if needed.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';

const LOG_KEY = 'diagnostic.log.v1';
const MAX_ENTRIES = 100;

// In-memory mirror so synchronous reads (e.g. the error boundary's fallback
// UI) don't have to await AsyncStorage on the crash path.
let memoryLog = [];

function nowIso() {
  try {
    return new Date().toISOString();
  } catch {
    return String(Date.now());
  }
}

async function persist() {
  try {
    await AsyncStorage.setItem(LOG_KEY, JSON.stringify(memoryLog));
  } catch {
    // If AsyncStorage itself is unavailable, there's nothing further we can
    // do — the in-memory copy and console output are the fallback.
  }
}

function push(entry) {
  memoryLog.push(entry);
  if (memoryLog.length > MAX_ENTRIES) {
    memoryLog = memoryLog.slice(memoryLog.length - MAX_ENTRIES);
  }
  // Fire and forget — logging must never block or throw on the caller.
  persist().catch(() => {});
}

/**
 * Records a lightweight checkpoint — "we got this far". Use these liberally
 * at every stage of startup so a crash can be bisected to the exact stage
 * it occurred in, even without a stack trace.
 */
export function logCheckpoint(label, extra) {
  const entry = { type: 'checkpoint', label, extra: extra || null, at: nowIso() };
  console.log(`[Checkpoint] ${label}`, extra || '');
  push(entry);
  try {
    Sentry.addBreadcrumb({ category: 'checkpoint', message: label, data: extra || undefined, level: 'info' });
    Sentry.captureMessage(`[Checkpoint] ${label}`);
  } catch {
    // Sentry itself may be the thing that's broken — never let that mask
    // the underlying issue or crash the app.
  }
}

/**
 * Records a full error with as much context as possible, both to Sentry and
 * to the local standalone log.
 */
export function logError(label, error, extra) {
  const message = error?.message || String(error);
  const stack = error?.stack || null;
  const entry = { type: 'error', label, message, stack, extra: extra || null, at: nowIso() };
  console.error(`[Error] ${label}:`, message);
  if (stack) console.error(stack);
  push(entry);
  try {
    Sentry.captureException(error instanceof Error ? error : new Error(message), {
      contexts: { errorLog: { label, ...extra } },
    });
  } catch {
    // Same reasoning as above — swallow, don't compound the failure.
  }
}

/** Returns the most recent error logged, synchronously, for use in a UI fallback. */
export function getLastError() {
  for (let i = memoryLog.length - 1; i >= 0; i--) {
    if (memoryLog[i].type === 'error') return memoryLog[i];
  }
  return null;
}

/** Returns the full in-memory log (most recent MAX_ENTRIES entries), newest last. */
export function getMemoryLog() {
  return memoryLog.slice();
}

/** Loads the persisted log from AsyncStorage (survives app restarts/crashes). */
export async function dumpErrorLog() {
  try {
    const raw = await AsyncStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('dumpErrorLog failed:', e?.message || e);
    return [];
  }
}

/** Clears the persisted log. Useful after you've confirmed a fix works. */
export async function clearErrorLog() {
  memoryLog = [];
  try {
    await AsyncStorage.removeItem(LOG_KEY);
  } catch {}
}

/**
 * Checks whether a given native module is actually present on the bridge.
 * Call this BEFORE anything that depends on it (e.g. useFonts, which uses
 * ExpoFontLoader) so a missing module is caught and logged with a clear,
 * specific label instead of surfacing later as an opaque render crash.
 */
export function checkNativeModule(NativeModules, moduleName) {
  const present = !!(NativeModules && NativeModules[moduleName]);
  logCheckpoint(`Native module check: ${moduleName}`, { present });
  return present;
}