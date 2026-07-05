// screens/NewCityThemesScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { roadmapsConfig } from '../config/roadmapsConfig';
import { roadmapTasks } from './roadmapTasks';

const ROADMAP_KEY = 'new_city';
const TRACK_KEY = 'newCityTrack';
const JOB_STATUS_KEY = 'newCityJobStatus';

// ---- Helpers ----
const formatThemeLabel = (themeKey) =>
  String(themeKey || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const dedupeInOrder = (arr) => {
  const seen = new Set();
  const out = [];
  (arr || []).forEach(k => {
    if (k && !seen.has(k)) {
      seen.add(k);
      out.push(k);
    }
  });
  return out;
};

// Map UI track id -> config track id (handles moving_city_only vs moving_city)
const mapToConfigTrackId = (roadmapKey, selectedTrack) => {
  const cfg = roadmapsConfig?.[roadmapKey];
  if (!cfg?.tracks) return selectedTrack;
  if (cfg.tracks[selectedTrack]) return selectedTrack;
  if (selectedTrack === 'moving_city_only' && cfg.tracks['moving_city']) return 'moving_city';
  return selectedTrack;
};

// Pull job-status presets (prepend + hide) from config
const getJobPresets = (roadmapKey, selectedJobStatus) => {
  const cfg = roadmapsConfig?.[roadmapKey];
  const opts = cfg?.jobStatus?.options || [];
  const sel = opts.find(o => o.key === selectedJobStatus);
  const presets = sel?.presets || {};
  return {
    prepend: Array.isArray(presets.prependThemes) ? presets.prependThemes : [],
    hide: Array.isArray(presets.hideThemes) ? presets.hideThemes : [],
  };
};

export default function NewCityThemesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { roadmap = ROADMAP_KEY, duration } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [themes, setThemes] = useState([]); // [{label, key}]

  const [statusByKey, setStatusByKey] = useState({}); // { [key]: 'done' | 'active' | 'locked' }

  const loadTrackAndThemes = useCallback(async () => {
    setLoading(true);
    try {
      const [t, j] = await AsyncStorage.multiGet([TRACK_KEY, JOB_STATUS_KEY]);
      const trackVal = t?.[1] || null;
      const jobVal = j?.[1] || null;
      setTrack(trackVal);
      setJobStatus(jobVal);

      const cfg = roadmapsConfig?.[roadmap];
      const cfgTrackId = mapToConfigTrackId(roadmap, trackVal);

      // 1) Base list from the chosen track; otherwise fallback to config top-level or tasks keys
      let baseThemesArr = [];
      if (cfgTrackId && cfg?.tracks?.[cfgTrackId]?.themes) {
        baseThemesArr = cfg.tracks[cfgTrackId].themes; // [{ key, title }]
      } else if (Array.isArray(cfg?.themes) && cfg.themes.length) {
        baseThemesArr = cfg.themes; // [{ key, title }]
      } else {
        // Fallback to roadmapTasks keys if config lacks theme listings
        const keys = Object.keys(roadmapTasks?.[roadmap] || {});
        baseThemesArr = keys.map(k => ({ key: k, title: formatThemeLabel(k) }));
      }

      // 2) Apply job presets: prepend + hide
      const { prepend, hide } = getJobPresets(roadmap, jobVal);
      const baseKeys = baseThemesArr.map(t => t.key);
      let orderedKeys = dedupeInOrder([...(prepend || []), ...baseKeys]);

      if (hide && hide.length) {
        const toHide = new Set(hide);
        orderedKeys = orderedKeys.filter(k => !toHide.has(k));
      }

      // 3) Normalize to screen-friendly shape {label, key}
      const labelByKey = {};
      baseThemesArr.forEach(t => {
        labelByKey[t.key] = t.title || t.label || formatThemeLabel(t.key);
      });

      const normalized = orderedKeys.map(k => ({
        key: k,
        label: labelByKey[k] || formatThemeLabel(k),
      }));

      // If you prefer to show nothing until a track is picked, uncomment the next line:
      // if (!trackVal) { setThemes([]); return; }

      setThemes(normalized);
    } catch (e) {
      console.warn('NewCityThemesScreen load error:', e);
      setThemes([]);
    } finally {
      setLoading(false);
    }
  }, [roadmap]);

  useFocusEffect(
    useCallback(() => {
      loadTrackAndThemes();
    }, [loadTrackAndThemes])
  );

  // Recompute step statuses whenever themes change
  useEffect(() => {
    const compute = async () => {
      if (!themes.length) {
        setStatusByKey({});
        return;
      }
      try {
        // 1) Load per-theme progress from storage
        const keys = themes.map(t => `progress_${roadmap}_${t.key}`);
        const rows = await AsyncStorage.multiGet(keys);

        const progressMap = {};
        rows.forEach(([k, v]) => { progressMap[k] = v ? JSON.parse(v) : []; });

        // 2) Compare to task totals
        const tasksByTheme = themes.map(t => (roadmapTasks?.[roadmap]?.[t.key] || []));
        const isComplete = (k, idx) => {
          const doneArr = progressMap[`progress_${roadmap}_${k}`] || [];
          const total = tasksByTheme[idx]?.length || 0;
          return total > 0 && Array.isArray(doneArr) && doneArr.length >= total;
        };

        // 3) Find first incomplete theme
        let firstIncompleteIdx = -1;
        for (let i = 0; i < themes.length; i++) {
          if (!isComplete(themes[i].key, i)) { firstIncompleteIdx = i; break; }
        }

        // 4) Assign status
        const next = {};
        if (firstIncompleteIdx === -1) {
          themes.forEach(t => { next[t.key] = 'done'; });
        } else {
          themes.forEach((t, idx) => {
            if (idx < firstIncompleteIdx) next[t.key] = 'done';
            else if (idx === firstIncompleteIdx) next[t.key] = 'active';
            else next[t.key] = 'locked';
          });
        }
        setStatusByKey(next);
      } catch (e) {
        // Fallback so the user still sees an order cue
        const fallback = {};
        themes.forEach((t, idx) => { fallback[t.key] = idx === 0 ? 'active' : 'locked'; });
        setStatusByKey(fallback);
      }
    };
    compute();
  }, [roadmap, themes]);

  const handleSelect = (themeKey) => {
    const state = statusByKey[themeKey];
    if (state === 'locked') {
      Alert.alert('Locked', 'Complete earlier steps to unlock this one.');
      return;
    }
    navigation.navigate('RoadmapPlan', {
  roadmap,
  theme: themeKey,
  duration,
});
  };

  const goPickTrack = () => navigation.navigate('NewCityTrackModal');

  const nodeStyleFor = (state) => {
    switch (state) {
      case 'done': return [styles.node, styles.nodeDone];
      case 'active': return [styles.node, styles.nodeActive];
      default: return [styles.node, styles.nodeLocked];
    }
  };

  const badgeStyleFor = (state) => {
    switch (state) {
      case 'done': return [styles.badge, styles.badgeDone];
      case 'active': return [styles.badge, styles.badgeActive];
      default: return [styles.badge, styles.badgeLocked];
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#7a4a74" />
        <Text style={{ marginTop: 10, color: '#555' }}>Loading your path…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>The Journey Ahead</Text>
      <Text style={styles.subtitle}>
        Follow these steps in order to settle in faster (and cut the chaos in half):
      </Text>

      {/* Prompt to pick track if none selected */}
      {!track && (
        <TouchableOpacity onPress={goPickTrack} style={styles.banner}>
          <Text style={styles.bannerTitle}>Choose your path</Text>
          <Text style={styles.bannerText}>
            Are you moving country + city, or just moving to a new city in the same country?
          </Text>
          <Text style={styles.cardLink}>Pick your path →</Text>
        </TouchableOpacity>
      )}

      {/* If there’s still no themes (no config/tasks), stop here */}
      {!themes.length ? (
        <View />
      ) : (
        <>
          {/* ——— Top stepper ——— */}
          <View style={styles.stepperWrap}>
            {themes.map((t, idx) => {
              const state = statusByKey[t.key] || 'locked';
              return (
                <View key={t.key} style={styles.stepperItem}>
                  {idx !== 0 && (
                    <View
                      style={[
                        styles.connector,
                        styles.connectorLeft,
                        state === 'locked' ? styles.connectorDim : null,
                      ]}
                    />
                  )}

                  <View style={nodeStyleFor(state)}>
                    {state === 'done' ? (
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    ) : (
                      <Text style={[styles.nodeText, state === 'locked' && { color: '#bbb' }]}>
                        {idx + 1}
                      </Text>
                    )}
                  </View>

                  {idx !== themes.length - 1 && (
                    <View
                      style={[
                        styles.connector,
                        styles.connectorRight,
                        state === 'locked' ? styles.connectorDim : null,
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>

          {/* ——— Numbered cards ——— */}
          {themes.map((t, idx) => {
            const state = statusByKey[t.key] || 'locked';
            const locked = state === 'locked';
            const done = state === 'done';
            const active = state === 'active';

            return (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.card,
                  done && styles.cardDone,
                  active && styles.cardActive,
                  locked && styles.cardLocked,
                ]}
                onPress={() => handleSelect(t.key)}
                activeOpacity={0.9}
              >
                <View style={badgeStyleFor(state)}>
                  <Text style={[styles.badgeText, done && styles.badgeTextDone]}>{idx + 1}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardText, done && styles.cardTextDone]}>{t.label}</Text>
                  <Text style={styles.cardHint}>
                    {locked
                      ? 'Complete earlier steps to unlock'
                      : active
                      ? 'Start here next'
                      : 'Completed ✅'}
                  </Text>
                </View>

                {locked ? (
                  <Ionicons name="lock-closed-outline" size={20} color="#888" />
                ) : done ? (
                  <Ionicons name="checkmark-circle" size={22} color="#7a4a74" />
                ) : (
                  <Ionicons name="arrow-forward" size={20} color="#7a4a74" />
                )}
              </TouchableOpacity>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D6A5D2',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 18, textAlign: 'center' },

  // Banner (choose track)
  banner: {
    backgroundColor: '#F8EFF7',
    borderWidth: 1,
    borderColor: '#E9D3E7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#7a4a74' },
  bannerText: { marginTop: 6, fontSize: 13, color: '#6b5d53', lineHeight: 18 },

  // Stepper
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  stepperItem: { flex: 1, alignItems: 'center', position: 'relative' },
  node: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  nodeDone: { backgroundColor: '#D6A5D2', borderColor: '#B877B1' },
  nodeActive: { backgroundColor: '#F8EFF7', borderColor: '#D6A5D2' },
  nodeLocked: { backgroundColor: '#F2F2F2', borderColor: '#DDD' },
  nodeText: { fontWeight: '800', color: '#7a4a74' },

  connector: {
    position: 'absolute',
    top: '50%',
    height: 2,
    backgroundColor: '#E9D3E7',
  },
  connectorDim: { backgroundColor: '#eee' },
  connectorLeft: { left: 0, right: '50%', marginRight: 18 },
  connectorRight: { left: '50%', right: 0, marginLeft: 18 },

  // Cards
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F6F8',
    marginBottom: 12,
    borderColor: '#E9D3E7',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardActive: { backgroundColor: '#FFF8FE', borderColor: '#D6A5D2' },
  cardLocked: { opacity: 0.7 },
  cardDone: { backgroundColor: '#F1E6F0' },
  cardText: { fontSize: 16, color: '#333', fontWeight: '600' },
  cardTextDone: { color: '#6e3e69' },
  cardHint: { fontSize: 12, color: '#7a4a74', marginTop: 2 },

  // Number badge
  badge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  badgeActive: { backgroundColor: '#F8EFF7', borderColor: '#D6A5D2' },
  badgeLocked: { backgroundColor: '#F2F2F2', borderColor: '#DDD' },
  badgeDone: { backgroundColor: '#D6A5D2', borderColor: '#B877B1' },
  badgeText: { color: '#7a4a74', fontWeight: '800' },
  badgeTextDone: { color: '#fff' },

  // Links
  cardLink: { marginTop: 8, fontSize: 13, color: '#7a4a74', fontWeight: '700' },
});
