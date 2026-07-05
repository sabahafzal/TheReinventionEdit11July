// components/SubscriptionBadge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '../screens/theme';

/**
 * SubscriptionBadge
 * Renders a "Premium" or "Free" pill badge, absolutely positioned
 * in the top-right corner of its nearest `position: relative` parent.
 *
 * Usage:
 *   <View style={{ position: 'relative' }}>
 *     ...header content...
 *     <SubscriptionBadge isPro={isPro} />
 *   </View>
 */
export default function SubscriptionBadge({ isPro }) {
  return (
    <View style={[styles.badge, isPro ? styles.badgePremium : styles.badgeFree]}>
      {isPro && <View style={styles.dot} />}
      <Text style={[styles.text, isPro ? styles.textPremium : styles.textFree]}>
        {isPro ? 'Premium' : 'Free'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  badgePremium: {
    backgroundColor: colors.deepRose,
    borderColor: colors.deepRose,
  },
  badgeFree: {
    backgroundColor: colors.roseTint08,
    borderColor: colors.roseTint15,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  text: {
    ...typography.badge,
  },
  textPremium: {
    color: colors.white,
  },
  textFree: {
    color: colors.deepRose,
  },
});