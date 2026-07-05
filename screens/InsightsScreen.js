// screens/InsightsScreen.js
//
// Top-level tab container shown as the "Insights" bottom tab.
// Hosts two segmented sub-tabs: Reflect and Analytics.
// The actual screens (ReflectionScreen, AnalyticsScreen) live below
// and are unchanged — this is purely a shell that switches between them.

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

import ReflectionScreen  from './ReflectionScreen';
import AnalyticsScreen   from './AnalyticsScreen';
import { colors, spacing, radii } from './theme';

const TABS = [
  { key: 'reflect',   label: 'Reflect'   },
  { key: 'analytics', label: 'Analytics' },
];

export default function InsightsScreen() {
  const [activeTab, setActiveTab] = useState('reflect');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={styles.safe}>

        {/* ── Segmented pill toggle ── */}
        <View style={styles.toggleWrap}>
          <View style={styles.toggle}>
            {TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                  onPress={() => setActiveTab(tab.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.toggleLabel, active && styles.toggleLabelActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

      </SafeAreaView>

      {/* ── Screen content — fills remaining space ── */}
      <View style={styles.content}>
        {activeTab === 'reflect'
          ? <ReflectionScreen />
          : <AnalyticsScreen />
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.warmWhite,
  },

  safe: {
    backgroundColor: colors.warmWhite,
  },

  toggleWrap: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md + 38,
    paddingBottom: spacing.sm,
    backgroundColor: colors.warmWhite,
  },

  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.offWhite,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.softBorder,
    padding: 3,
  },

  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.pill,
    alignItems: 'center',
  },

  toggleBtnActive: {
    backgroundColor: colors.deepRose,
  },

  toggleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.bodyMuted,
    letterSpacing: 0.2,
  },

  toggleLabelActive: {
    color: '#fff',
  },

  content: {
    flex: 1,
  },
});