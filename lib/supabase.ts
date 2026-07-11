// lib/supabase.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// IMPORTANT: this file is imported very early (App.js -> AuthStack -> ... -> here),
// before Sentry.init() has necessarily run, because Metro/Babel hoists all
// `import` statements above other top-level code regardless of source order.
// A `throw` here previously crashed the app instantly on cold launch with NO
// error visible anywhere — not in Sentry, not in an error boundary — because
// it happened before any error-catching machinery was set up. This is a
// leading suspect for the white-screen bug: if EXPO_PUBLIC_SUPABASE_URL or
// EXPO_PUBLIC_SUPABASE_ANON_KEY are unset in EAS's "production" environment
// specifically (as opposed to "preview", where they may have been set first),
// every single production build would white-screen instantly, every time.
//
// Fallback to empty strings instead of throwing — this lets the app boot far
// enough for the error boundary / Sentry / the UI itself to actually report
// what's wrong, instead of dying silently before anything can see it.
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '[supabase.ts] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Check that these are set in the correct EAS environment (production vs preview) ' +
    'at expo.dev -> your project -> Environment Variables.'
  );
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.invalid',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);