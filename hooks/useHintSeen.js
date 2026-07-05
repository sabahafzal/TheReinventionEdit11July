// hooks/useHintSeen.js
//
// Tracks whether a named hint or coach mark has been dismissed.
// Backed by AsyncStorage so it persists across app sessions.
//
// Usage:
//   const { seen, markSeen, reset } = useHintSeen('homeScreen.themeProgress');
//
// Keys follow the pattern:  hint.<id>.seen
// Call reset() during development to re-trigger the coach mark.

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'hint.';
const SUFFIX = '.seen';

export function useHintSeen(id) {
  const key = `${PREFIX}${id}${SUFFIX}`;
  const [seen, setSeen] = useState(true); // default true to avoid flash
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(key)
      .then((val) => {
        if (active) {
          setSeen(val === 'true');
          setLoaded(true);
        }
      })
      .catch(() => {
        if (active) setLoaded(true);
      });
    return () => { active = false; };
  }, [key]);

  const markSeen = useCallback(async () => {
    setSeen(true);
    await AsyncStorage.setItem(key, 'true');
  }, [key]);

  const reset = useCallback(async () => {
    setSeen(false);
    await AsyncStorage.removeItem(key);
  }, [key]);

  return { seen, loaded, markSeen, reset };
}