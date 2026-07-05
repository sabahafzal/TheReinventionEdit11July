// screens/PhysicalGlowUpThemesScreen.js
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { roadmapsConfig } from '../config/roadmapsConfig';
import { roadmapTasks } from './roadmapTasks';

const ROADMAP_KEY = 'physical_glow_up';
const TRACK_KEY = 'physicalGlowUpTrack';

export default function PhysicalGlowUpThemesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { roadmap = ROADMAP_KEY, duration } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState(null);
  const [themes, setThemes] = useState([]); // [{label, key}]
  const [statusByKey, setStatusByKey] = useState({}); // { [key]: 'done' | 'active' | 'locked' }

  const loadTrackAndThemes = useCallback(async () => {
    setLoading(true);
    try {
      const t = await AsyncStorage.getItem(TRACK_KEY);
      setTrack(t);

      const cfg = roadmapsConfig?.[roadmap];
      const listed =
        (t && cfg?.tracks?.[t]?.themes) ? cfg.tracks[t].themes : [];

      // normalise to {label, key}
      const normalized = (listed || []).map(th => ({
        label: th.title || th.label || th.key,
        key: th.key,
      }));
      setThemes(normalized);
    } catch (e) {
      console.warn('PhysicalGlowUpThemesScreen load error:', e);
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

        // 2) Compare to task totals (use tasks for the selected track's themes)
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

  const goPickTrack = () => navigation.navigate('PhysicalGlowUpTrack');

  const handleSelect = (themeKey) => {
    const state = statusByKey[themeKey];
    if (state === 'locked') {
      Alert.alert('Locked', 'Complete earlier steps to unlock this one.');
      return;
    }
    navigation.navigate('PhysicalGlowUpPlan', {
      roadmap,
      theme: themeKey,
      duration,
    });
  };

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
        Follow these steps in order for a strong, energized, confident you:
      </Text>

      {/* Prompt to pick track if none selected */}
      {!track && (
        <TouchableOpacity onPress={goPickTrack} style={styles.banner} activeOpacity={0.9}>
          <Text style={styles.bannerTitle}>Choose your workout style</Text>
          <Text style={styles.bannerText}>
            Do you prefer working out in a gym or at home? Pick your path to tailor the plan.
          </Text>
          <Text style={styles.cardLink}>Pick your path →</Text>
        </TouchableOpacity>
      )}

      {/* If there’s still no themes (no track), stop here */}
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

  // Banner (palette consistent with New City)
  banner: {
    backgroundColor: '#F8EFF7',
    borderWidth: 1,
    borderColor: '#E9D3E7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#7a4a74' },
  bannerText: { marginTop: 6, fontSize: 13, color: '#555' },

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

  cardLink: { marginTop: 8, color: '#7a4a74', fontWeight: '700' },
});
