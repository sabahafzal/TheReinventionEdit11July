// components/PlanLayout.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, radii, gradients, shadows } from '../screens/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// ─── Plan-specific accent colours ─────────────────────────────────────────────
// The green/sage palette is unique to roadmap plan screens and lives here.
const PLAN_GREEN = {
  highlight: '#6F8F86',   // primary action bg / selected / progress
  mutedFill: '#AEC2B9',   // secondary fill (Details button)
};

/**
 * ✅ Single source of truth for ALL plan colours.
 * Re-exported so plan screens can import a single object.
 */
export const PLAN_THEME = {
  gradient:       gradients.planBackground,          // kept for reference; no longer used as bg
  highlight:      PLAN_GREEN.highlight,
  mutedFill:      PLAN_GREEN.mutedFill,
  cardBg:         colors.card,                       // '#ffffff'
  textPrimary:    colors.ink,                        // '#1e150e'
  textSecondary:  colors.bodyMuted,                  // 'rgba(30,21,14,0.58)'
  white:          colors.white,
  black:          colors.ink,
  borderLight:    colors.softBorder,                 // 'rgba(30,21,14,0.10)'
  disabledBg:     colors.linen,                      // '#ede6d8'
  disabledBorder: colors.fawn,                       // '#ddd2c0'
  mutedText:      colors.caption,                    // 'rgba(30,21,14,0.42)'
  subtleText:     colors.bodyMuted,
  softCard:       colors.offWhite,                   // '#f5f0e6'
  lockedText:     colors.champagne,                  // '#c8b89e'
};

/**
 * ✅ Reusable plan button styles (use in plan screens)
 * - Mark complete => primarySmall
 * - Details       => secondarySmall
 */
export const PLAN_BUTTONS = StyleSheet.create({
  smallBase: {
    paddingVertical:   spacing.sm,
    paddingHorizontal: spacing.md - 2,
    borderRadius:      radii.sm,
    borderWidth:       1,
    alignItems:        'center',
    justifyContent:    'center',
  },
  primarySmall: {
    backgroundColor: colors.deepRose,
    borderColor:     colors.deepRose,
  },
  primarySmallText: {
    color:      colors.white,
    fontWeight: '800',
  },
  secondarySmall: {
    backgroundColor: colors.roseTint08,
    borderColor:     colors.roseTint18,
  },
  secondarySmallText: {
    color:      colors.deepRose,
    fontWeight: '800',
  },
  disabledSmall: {
    backgroundColor: colors.linen,
    borderColor:     colors.fawn,
  },
});

/**
 * ✅ Shared chip / pill / card styles for plan screens
 */
export const PLAN_UI = StyleSheet.create({
  pill: {
    alignSelf:         'center',
    backgroundColor:   colors.roseTint08,
    borderColor:       colors.roseTint18,
    borderWidth:       1,
    borderRadius:      radii.pill,
    paddingVertical:   spacing.sm - 2,
    paddingHorizontal: spacing.md,
    marginBottom:      spacing.md - 2,
  },
  pillText: {
    color:     colors.deepRose,
    textAlign: 'center',
    fontWeight: '700',
  },
  chip: {
    paddingVertical:   spacing.sm - 2,
    paddingHorizontal: spacing.md - 2,
    borderRadius:      radii.pill,
    borderWidth:       1,
    borderColor:       colors.softBorder,
    backgroundColor:   colors.card,
  },
  chipActive: {
    backgroundColor: colors.deepRose,
    borderColor:     colors.deepRose,
  },
  chipText: {
    color:      colors.bodyMuted,
    fontWeight: '700',
  },
  chipTextActive: {
    color:      colors.white,
    fontWeight: '700',
  },
  card: {
    padding:         spacing.md,
    marginBottom:    spacing.sm,
    backgroundColor: colors.offWhite,
    borderRadius:    radii.md,
    borderWidth:     1,
    borderColor:     colors.subtleBorder,
  },
  cardDone: {
    backgroundColor: colors.dustyRose,
    borderColor:     colors.dustyRose,
  },
  cardLocked: {
    opacity: 0.55,
  },
  cardText: {
    fontSize: 16,
    color:    colors.bodyMuted,
  },
  cardTextDone: {
    color:      colors.white,
    fontWeight: '700',
  },
  cardTextLocked: {
    color: colors.champagne,
  },
  duration: {
    color:     colors.caption,
    fontSize:  14,
    marginTop: spacing.xs - 2,
  },
  lockedMsg: {
    fontSize:  12,
    color:     colors.champagne,
    marginTop: spacing.sm - 2,
  },
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function PlanLayout({
  title,
  subtitle,
  loading = false,
  actionLabel = null,
  onActionPress = null,
  children,
}) {
  const navigation = useNavigation();

  if (loading) {
    return (
      <SafeAreaView style={styles.background} edges={['top', 'left', 'right']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.deepRose} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.background} edges={['top', 'left', 'right']}>
      {/* Custom nav bar — visible on both iOS and Android */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{title}</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {subtitle && (
          <View style={styles.header}>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        )}

        <View style={styles.contentCard}>{children}</View>

        {actionLabel && onActionPress && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onActionPress}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex:            1,
    backgroundColor: colors.warmWhite,   // #faf7f2 — matches ProfileScreen
  },

  loadingWrap: {
    flex:            1,
    backgroundColor: colors.warmWhite,
    justifyContent:  'center',
    alignItems:      'center',
  },

  navBar: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: spacing.screenPaddingH - 6,
    paddingVertical:   12,
    borderBottomWidth: 1,
    borderBottomColor: colors.softBorder,
    backgroundColor:   colors.warmWhite,
  },
  backBtn: {
    width:  36,
    height: 36,
    justifyContent: 'center',
    alignItems:     'flex-start',
  },
  navTitle: {
    flex:       1,
    textAlign:  'center',
    ...typography.screenTitle,
    fontSize:   20,
  },
  navSpacer: {
    width: 36,   // mirrors backBtn width to keep title centred
  },

  container: {
    paddingHorizontal: spacing.screenPaddingH - 6, // ~20 px
    paddingTop:        spacing.md,                 // small gap below nav bar
    paddingBottom:     60,
  },

  header: {
    alignItems:   'center',
    marginBottom: spacing.sectionGap - 2,
  },

  subtitle: {
    ...typography.bodyLarge,
    textAlign: 'center',
    color:     colors.bodyMuted,
    opacity:   0.85,
  },

  contentCard: {
    backgroundColor: colors.card,
    borderRadius:    radii.lg + 2,   // 16
    padding:         spacing.md + 2, // 16
    marginBottom:    spacing.sectionGap + 2, // 24
    ...shadows.card,
  },

  primaryButton: {
    backgroundColor: colors.deepRose,
    paddingVertical: spacing.lg - 2, // 16
    borderRadius:    radii.md,       // 12
    alignItems:      'center',
  },

  primaryButtonText: {
    ...typography.buttonPrimary,
    color:         colors.white,
    fontSize:      16,
    fontWeight:    '600',
    letterSpacing: 0.5,
    textTransform: 'none',
  },
});