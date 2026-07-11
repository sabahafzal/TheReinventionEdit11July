// App.js
import * as Sentry from '@sentry/react-native';

// Sentry MUST be initialized before any other imports that could throw —
// this is what lets us catch crashes that happen during module load,
// which React error boundaries structurally cannot catch (they only
// catch errors that happen during render, after the app has already
// started running). This is likely how we finally see the real cause
// of the white screen if it's a native/module-load crash.
Sentry.init({
  dsn: 'https://beab71e11cd91a740626271fa86cc054@o4511717414862848.ingest.de.sentry.io/4511717419057232',
  debug: false,
  tracesSampleRate: 1.0,
  // Captures native iOS/Android crashes in addition to JS errors.
  enableNative: true,
});

// Diagnostic checkpoint 1: fires even without a crash, as long as JS module
// evaluation reaches this line. If this never appears in Sentry, the app
// isn't getting this far in JS at all — points to a native-level issue.
Sentry.captureMessage('[Checkpoint 1] Sentry initialized, App.js module evaluating');

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
  // Diagnostic checkpoint 3: fires on every render, confirms React reached
  // the point of actually rendering the App component.
  Sentry.captureMessage('[Checkpoint 3] App() component function called');

  const [session, setSession] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [forceReady, setForceReady] = useState(false);

  // fontError ensures a failed font load never blocks the app indefinitely
  const [fontsLoaded, fontError] = useFonts({
    DancingScript: require('./assets/fonts/DancingScript-Regular.ttf'),
    PlayfairDisplay: require('./assets/fonts/PlayfairDisplay-Regular.ttf'),
    PlayfairDisplay_Italic: require('./assets/fonts/PlayfairDisplay-Italic.ttf'),
  });

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