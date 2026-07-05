// screens/MentalGlowUpThemesScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { roadmapsConfig } from '../config/roadmapsConfig';
import { roadmapTasks } from './roadmapTasks';

const ROADMAP_KEY = 'mental_glow_up';

export default function MentalGlowUpThemesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { roadmap = ROADMAP_KEY, duration } = route.params || {};

  // ✅ Single source of truth for order + labels
  const themes = useMemo(
    () => (roadmapsConfig?.[roadmap]?.themes || []).map(t => ({ label: t.label, key: t.key })),
    [roadmap]
  );

  const [statusByKey, setStatusByKey] = useState({}); // { [key]: 'done' | 'active' | 'locked' }

  useEffect(() => {
    const load = async () => {
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
    load();
  }, [roadmap, themes]);

  const handleSelect = (themeKey) => {
    const state = statusByKey[themeKey];
    if (state === 'locked') {
      Alert.alert('Locked', 'Complete earlier steps to unlock this one.');
      return;
    }
    navigation.navigate('MentalGlowUpPlan', {
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>The Journey Ahead</Text>
      <Text style={styles.subtitle}>
        Follow these steps in order — your calm, confident era starts here:
      </Text>

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
});
