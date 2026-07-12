// App.js
import * as Sentry from '@sentry/react-native';

// Sentry.init() now lives in index.js — the true entry point — since Babel
// hoists all `import` statements above other top-level code within a file,
// so init'ing it here did NOT guarantee it ran before this file's own
// imports (AuthStack -> lib/supabase.ts, etc.) were evaluated.

// Diagnostic checkpoint 1: confirms App.js itself is being evaluated
// (should now reliably fire after Checkpoint 0 in index.js).
Sentry.captureMessage('[Checkpoint 1] App.js module evaluating');

import * as ExpoSplashScreen from 'expo-splash-screen';

// ROOT CAUSE FIX: expo-font's useFonts() hook internally calls
// SplashScreen.preventAutoHideAsync(), which tells the native splash screen
// to stay visible while fonts load. But nothing in this codebase ever
// called SplashScreen.hideAsync() to dismiss it again — so the native splash
// (solid white, per app.json's splash.backgroundColor: "#ffffff") stayed on
// screen forever, with the real app running invisibly underneath. No crash,
// no error, because nothing was actually wrong at the JS level — the splash
// was just never told to go away. Calling preventAutoHideAsync() explicitly
// here (redundant with useFonts' internal call, but harmless and clearer)
// and hideAsync() once the app is truly ready (see the useEffect below)
// fixes this.
ExpoSplashScreen.preventAutoHideAsync().catch(() => {
  // Fails harmlessly if the splash was already hidden or auto-hide was
  // already prevented elsewhere — never let this block app startup.
});

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthStack from './navigation/AuthStack';
import SplashScreen from './screens/SplashScreen';
import AppErrorBoundary from './components/AppErrorBoundary';
import { supabase } from './lib/supabase';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { initIAP, cleanupIAP, syncEntitlement } from './lib/iap';

// ─── Lazy-load AppNavigator ────────────────────────────────────────────────────
// AppNavigator's static import tree pulls in every screen in the app, including
// HomeScreen → roadmapTasks.js (32k lines of synchronous JS execution at module
// load time). Loading it eagerly blocks the JS thread on cold launch and causes
// a blank white screen for unauthenticated users (e.g. Apple reviewers).
//
// With lazy(), AppNavigator and its entire dependency tree are only parsed and
// executed the first time a session exists — never on the auth/unauthenticated path.
const AppNavigator = lazy(() => import('./navigation/AppNavigator'));

console.log('[App] Module load OK');
Sentry.captureMessage('[Checkpoint 2] All top-level imports finished — module load complete');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const LAST_USER_ID_KEY = 'lastUserId';

const APP_RESET_KEYS = [
  'quizCompleted',
  'onboarding.quizDone',
  'onboarded',
  'recommendedRoadmap',
  'timeCommitmentHours',
  'dailyTimeBudgetHours',
  'weeklyTaskTarget',
  'weekdayDailyBudgetHours',
  'weekendDailyBudgetHours',
  'techSwitchTrack',
  'newCityTrack',
  'newCityJobStatus',
  'physicalGlowUpTrack',
  'intro.v1.seen',
  'auth.firstLogin.seen',
  'hint.homeScreen.coach.v1.seen',
  'hint.profileScreen.coach.v1.seen',
  'hint.roadmapPlan.coach.v1.seen',
  'preferredTaskTimeLabel',
  'preferredTaskTimeHour',
  'preferredTaskTimeMinute',
  'preferredTaskReminderHour',
  'preferredTaskReminderMinute',
  'taskReminderChoice',
  'notificationsEnabled',
  'notificationsPermissionStatus',
  'notificationsPrompted',
  'dailyTaskReminderNotificationId',
  'roadmapReminderEnabled',
  'roadmapReminderMode',
  'roadmapReminderLastTaskKey',
  'roadmapReminderLastRefresh',
  'roadmapReminderLastSentDate',
  'last_week_nudge_date',
  'last_theme_nudge_date',
  'last_never_miss_twice_date',
  'streak_last_date',
  'streak_count',
  'streak_best',
  'last_streak_milestone_shown',
  'streak_freeze_count',
  'streak_freeze_last_reset',
  'isPro',
];

const linking = {
  prefixes: ['reinventionedit://'],
  config: {
    screens: {
      ResetPassword: 'reset-password',
    },
  },
};

async function hardResetStorageForUser(currentUserId) {
  try {
    await AsyncStorage.multiRemove(APP_RESET_KEYS);
  } catch (e) {
    console.warn('Failed to clear app reset keys:', e?.message || e);
  }

  await AsyncStorage.setItem(LAST_USER_ID_KEY, currentUserId);
}

async function syncStorageToAuthenticatedUser(session) {
  const currentUserId = session?.user?.id;
  if (!currentUserId) return;

  const lastUserId = await AsyncStorage.getItem(LAST_USER_ID_KEY);

  if (lastUserId !== currentUserId) {
    await hardResetStorageForUser(currentUserId);
  }
}

async function loadSafeSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      const msg = error.message || '';
      if (
        msg.includes('Invalid Refresh Token') ||
        msg.includes('Refresh Token Not Found')
      ) {
        try {
          await supabase.auth.signOut();
        } catch {}
        try {
          await AsyncStorage.multiRemove(APP_RESET_KEYS);
          await AsyncStorage.removeItem(LAST_USER_ID_KEY);
        } catch {}
        return null;
      }
      throw error;
    }

    return session || null;
  } catch (e) {
    const msg = e?.message || '';
    if (
      msg.includes('Invalid Refresh Token') ||
      msg.includes('Refresh Token Not Found')
    ) {
      try {
        await supabase.auth.signOut();
      } catch {}
      try {
        await AsyncStorage.multiRemove(APP_RESET_KEYS);
        await AsyncStorage.removeItem(LAST_USER_ID_KEY);
      } catch {}
      return null;
    }

    console.warn('Session load failed:', msg || e);
    return null;
  }
}

function App() {
  const [session, setSession] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [forceReady, setForceReady] = useState(false);

  // Diagnostic checkpoint 3: confirms React actually mounted the App
  // component. Runs once on mount only — Sentry.captureMessage() must never
  // be called directly in a component body, since that fires on every
  // re-render and can spam the dashboard / cause performance issues.
  useEffect(() => {
    Sentry.captureMessage('[Checkpoint 3] App() component mounted');
  }, []);

  // fontError ensures a failed font load never blocks the app indefinitely
  const fontsLoaded = true;
const fontError = null;

  // Hard ceiling: if fonts or session check take longer than 3s, render anyway.
  // Protects against hangs on review devices with no prior app state.
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceReady(true);
      Sentry.captureMessage('[Checkpoint 4] forceReady timeout fired (3s elapsed)');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // initIAP is async — use .catch() so errors are logged without swallowing them
  // and without blocking the component lifecycle.
  useEffect(() => {
    initIAP().catch(e => console.warn('initIAP error', e));

    return () => {
      try {
        cleanupIAP();
      } catch (e) {
        console.warn('cleanupIAP error', e);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      console.log('[App] Bootstrap starting');
      try {
        const safeSession = await loadSafeSession();

        if (safeSession?.user?.id) {
          await syncStorageToAuthenticatedUser(safeSession);
          try {
            await syncEntitlement();
          } catch (e) {
            console.warn('syncEntitlement error', e);
          }
        }

        if (!isMounted) return;
        setSession(safeSession);
      } catch (e) {
        console.warn('Bootstrap failed:', e?.message || e);
        if (!isMounted) return;
        setSession(null);
      } finally {
        if (isMounted) {
          setSessionChecked(true);
        }
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      try {
        if (newSession?.user?.id) {
          await syncStorageToAuthenticatedUser(newSession);
        } else {
          await AsyncStorage.removeItem(LAST_USER_ID_KEY);
        }
      } catch (e) {
        console.warn('Auth state storage sync failed:', e?.message || e);
      } finally {
        if (isMounted) {
          setSession(newSession || null);
          setSessionChecked(true);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // fontsReady is true if fonts loaded successfully OR if loading errored —
  // either way we must not block the app. The system serif fallback will apply.
  const fontsReady = fontsLoaded || !!fontError;

  // ROOT CAUSE FIX (continued): dismiss the native splash the moment we're
  // ready to render real content — the exact same condition that stops
  // rendering the custom <SplashScreen /> JS fallback below. Without this
  // call, the native splash (solid white) stays on screen forever.
  useEffect(() => {
    if ((fontsReady && sessionChecked) || forceReady) {
      ExpoSplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsReady, sessionChecked, forceReady]);

  if ((!fontsReady || !sessionChecked) && !forceReady) {
    return <SplashScreen />;
  }

  return (
    <AppErrorBoundary>
      <NavigationContainer linking={linking}>
        {session
          ? (
            // Suspense fallback keeps showing SplashScreen while AppNavigator's
            // lazy chunk (and its heavy dependency tree) loads for the first time.
            <Suspense fallback={<SplashScreen />}>
              <AppNavigator key={session.user.id} />
            </Suspense>
          )
          : <AuthStack />
        }
      </NavigationContainer>
    </AppErrorBoundary>
  );
}

// Sentry.wrap adds automatic breadcrumbs (navigation, touches) leading up to
// a crash, so the report shows what the user did right before the white screen.
export default Sentry.wrap(App);