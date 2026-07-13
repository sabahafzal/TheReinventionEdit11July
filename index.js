import * as Sentry from '@sentry/react-native';

// This MUST run before App.js (and its full import tree — AuthStack ->
// lib/supabase.ts, etc.) is evaluated. A plain `import App from './App'`
// would NOT guarantee this, because Babel hoists all static `import`
// statements above other top-level code in a file, regardless of source
// order — so even putting this above `import App from './App'` wouldn't
// have worked. Using require() instead is what actually guarantees
// ordering, since require() is a normal runtime function call, not hoisted.
Sentry.init({
  dsn: 'https://beab71e11cd91a740626271fa86cc054@o4511717414862848.ingest.de.sentry.io/4511717419057232',
  debug: false,
  tracesSampleRate: 1.0,
  enableNative: true,
});

const { logCheckpoint, logError, checkNativeModule } = require('./lib/errorLog');

logCheckpoint('[0] index.js — true entry point, Sentry initialized first');

// ─── Global error handler ──────────────────────────────────────────────────
// Catches any JS exception that escapes React entirely — thrown outside a
// component render (e.g. in a plain callback, a native-module call at
// module-eval time, or anything not wrapped by AppErrorBoundary). Without
// this, such an error crashes silently with nothing but a generic native
// "JSI JSError" in Sentry and no JS-side breadcrumb trail.
const globalErrorUtils = typeof ErrorUtils !== 'undefined' ? ErrorUtils : global.ErrorUtils;
if (globalErrorUtils && typeof globalErrorUtils.setGlobalHandler === 'function') {
  const previousHandler = globalErrorUtils.getGlobalHandler
    ? globalErrorUtils.getGlobalHandler()
    : null;

  globalErrorUtils.setGlobalHandler((error, isFatal) => {
    logError('[GlobalHandler] Uncaught JS exception', error, { isFatal: !!isFatal });
    // Preserve default behavior (dev red screen / native crash reporting)
    // by chaining to whatever handler was registered before us.
    if (typeof previousHandler === 'function') {
      previousHandler(error, isFatal);
    }
  });
  logCheckpoint('[0a] Global JS error handler installed');
} else {
  logCheckpoint('[0a] ErrorUtils unavailable — global handler NOT installed');
}

// ─── Unhandled promise rejection handler ───────────────────────────────────
// Hermes/RN do not always surface these as fatal, so they can fail silently
// (e.g. an awaited native call that rejects with "module not found" inside
// a useEffect with no .catch()). This makes sure they're logged too.
try {
  const tracking = require('promise/setimmediate/rejection-tracking');
  tracking.enable({
    allRejections: true,
    onUnhandled: (id, error) => {
      logError('[UnhandledRejection] id=' + id, error);
    },
    onHandled: () => {},
  });
  logCheckpoint('[0b] Unhandled promise rejection tracking installed');
} catch (e) {
  // Not fatal if this polyfill isn't present in this RN version — the
  // global handler above still covers the fatal cases.
  logCheckpoint('[0b] Rejection tracking unavailable', { reason: e?.message || String(e) });
}

// ─── Pre-flight native module checks ───────────────────────────────────────
// This is the direct, targeted check for the root cause Sentry surfaced:
// "Cannot find native module 'ExpoFontLoader'". Running this here, before
// App.js's import tree (which calls useFonts() at render time) even starts
// evaluating, tells us definitively — with a clean, unambiguous log line —
// whether the native binary this build was compiled with actually has
// these modules linked in. If the next TestFlight build still crashes but
// THIS checkpoint reports `present: true` for both, the native linking is
// fine and the bug has moved elsewhere; if it reports `present: false`, it
// confirms the native rebuild didn't pick up the fix.
try {
  const { NativeModules } = require('react-native');
  checkNativeModule(NativeModules, 'ExpoFontLoader');
  checkNativeModule(NativeModules, 'NativeUnimoduleProxy');
  checkNativeModule(NativeModules, 'ExponentConstants'); // expo-constants' bridge name
} catch (e) {
  logError('[0c] Native module pre-flight check failed to run', e);
}

logCheckpoint('[1] Requiring App.js and expo entry point');

let App;
try {
  App = require('./App').default;
} catch (e) {
  logError('[1a] App.js failed to load/evaluate', e);
  throw e; // Nothing we can render without it — let it surface normally.
}

const { registerRootComponent } = require('expo');

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);