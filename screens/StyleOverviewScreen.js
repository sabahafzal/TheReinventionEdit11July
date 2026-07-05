// StyleOverviewScreen.js
import React, { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, radii, shadows } from './theme';
import { isProUser } from '../lib/paywall';
import PremiumUpsellModal from '../components/PremiumUpsellModal';

const styleSections = [
  { label: "Work Zoom Looks",  desc: "Polished style for every remote meeting.", screen: "WorkZoomLooks",  emoji: "💻", index: "01" },
  { label: "After Work Style", desc: "Desk to drinks — effortless after-hours chic.", screen: "AfterWorkStyle", emoji: "🌇", index: "02" },
  { label: "Minimal Makeup",   desc: "A fresh, glowing look in five minutes flat.", screen: "MinimalMakeup",  emoji: "💄", index: "03" },
  { label: "Seasonal Capsule", desc: "Smart wardrobe planning for each season.", screen: "SeasonalCapsule", emoji: "🧥", index: "04" },
];

export default function StyleOverviewScreen() {
  const navigation = useNavigation();
  const [isPro, setIsPro] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);

 useFocusEffect(useCallback(() => {
  isProUser().then(setIsPro);
}, []));

  return (
    <View style={styles.background}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Masthead ── */}
        <View style={styles.masthead}>
          <Text style={styles.mastheadEyebrow}>The Reinvention Edit</Text>
          <View style={styles.mastheadRule} />
          <Text style={styles.mastheadTitle}>Style Guide</Text>
          <Text style={styles.mastheadSub}>Four chapters. One wardrobe revolution.</Text>
          <View style={styles.mastheadBottomRule} />
        </View>

        {/* ── Issue line ── */}
        <View style={styles.issueLine}>
          <Text style={styles.issueText}>VOL. I</Text>
          <View style={styles.issueDot} />
          <Text style={styles.issueText}>STYLE & BEAUTY</Text>
          <View style={styles.issueDot} />
          <Text style={styles.issueText}>4 GUIDES</Text>
        </View>

        {/* ── Section entries ── */}
        <View style={styles.entriesWrap}>
          {styleSections.map((section, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                if (!isPro) { setShowUpsell(true); return; }
                navigation.navigate(section.screen);
              }}
              activeOpacity={0.7}
              style={[
                styles.entry,
                idx < styleSections.length - 1 && styles.entryBorder,
              ]}
            >
              {/* Index number */}
              <Text style={[styles.entryIndex, !isPro && styles.lockedText]}>
                {section.index}
              </Text>

              {/* Text block */}
              <View style={styles.entryText}>
                <Text style={[styles.entryTitle, !isPro && styles.lockedText]}>
                  {section.label}
                </Text>
                <Text style={styles.entryDesc}>{section.desc}</Text>
              </View>

              {/* Right side */}
              <View style={styles.entryRight}>
                {isPro ? (
                  <>
                    <Text style={styles.entryEmoji}>{section.emoji}</Text>
                    <Text style={styles.entryArrow}>→</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.lockIcon}>🔒</Text>
                    <Text style={styles.premiumBadge}>PREMIUM</Text>
                  </>
                )}
              </View>

              {/* Frosted overlay for free users */}
              {!isPro && <View style={styles.lockedOverlay} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Premium nudge banner (free only) ── */}
        {!isPro && (
          <TouchableOpacity
            style={styles.upgradeBanner}
            onPress={() => setShowUpsell(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.upgradeBannerEmoji}>✨</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.upgradeBannerTitle}>Unlock all Style Guides</Text>
              <Text style={styles.upgradeBannerSub}>Start your 7-day free trial</Text>
            </View>
            <Text style={styles.upgradeBannerArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <View style={styles.footerRule} />
          <Text style={styles.footerText}>Curated for your reinvention</Text>
          <View style={styles.footerRule} />
        </View>

      </ScrollView>

      <PremiumUpsellModal visible={showUpsell} onClose={() => setShowUpsell(false)} />
    </View>
  );
}

const styles = StyleSheet.create({

  background: {
    flex: 1,
    backgroundColor: colors.warmWhite,
  },

  container: {
    flexGrow: 1,
    paddingBottom: spacing.xxxl,
  },

  // ── Masthead ──────────────────────────────────────────────────────────────────

  masthead: {
    alignItems: 'center',
    paddingTop: spacing.screenPaddingTop,
    paddingHorizontal: spacing.screenPaddingH,
    paddingBottom: spacing.xl,
  },

  mastheadEyebrow: {
    ...typography.eyebrow,
    fontSize: 9,
    letterSpacing: 3.5,
    color: colors.clay,
    marginBottom: spacing.sm,
  },

  mastheadRule: {
    width: 32,
    height: 1.5,
    backgroundColor: colors.deepRose,
    marginBottom: spacing.sm,
  },

mastheadTitle: {
  fontFamily: 'DancingScript',
  fontSize: 40,
  color: colors.ink,
  lineHeight: 52,        // tighten so two lines don't overflow
  marginBottom: spacing.xs,
  textAlign: 'center',  // already implied by alignItems on parent
},

  mastheadSub: {
    fontFamily: 'serif',
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.bodyMuted,
    letterSpacing: 0.3,
  },

  mastheadBottomRule: {
    width: '100%',
    height: 1.5,
    backgroundColor: colors.ink,
    marginTop: spacing.md,
  },

  // ── Issue line ────────────────────────────────────────────────────────────────

  issueLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
    paddingHorizontal: spacing.screenPaddingH,
  },

  issueText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.caption,
  },

  issueDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.dustyRose,
  },

  // ── Entry rows ────────────────────────────────────────────────────────────────

  entriesWrap: {
    paddingHorizontal: spacing.screenPaddingH,
  },

  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },

  entryBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
  },

  entryIndex: {
    fontFamily: 'serif',
    fontSize: 28,
    fontStyle: 'italic',
    color: colors.dustyRose,
    width: 36,
    lineHeight: 32,
  },

  entryText: {
    flex: 1,
  },

  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: -0.1,
    marginBottom: 5,
  },

  entryDesc: {
    fontFamily: 'serif',
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.bodyMuted,
    lineHeight: 19,
  },

  entryRight: {
    alignItems: 'center',
    gap: spacing.xs,
  },

  entryEmoji: {
    fontSize: 22,
  },

  entryArrow: {
    fontSize: 12,
    color: colors.deepRose,
    fontWeight: '600',
  },

  // ── Paywall ───────────────────────────────────────────────────────────────────

  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250,247,242,0.55)',
    borderRadius: 0,
  },

  lockedText: {
    opacity: 0.38,
  },

  lockIcon: {
    fontSize: 18,
    marginBottom: 2,
  },

  premiumBadge: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.deepRose,
  },

  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.screenPaddingH,
    marginTop: spacing.xl,
    backgroundColor: colors.roseTint08,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.roseTint30,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  upgradeBannerEmoji: {
    fontSize: 22,
  },

  upgradeBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 2,
  },

  upgradeBannerSub: {
    fontSize: 12,
    color: colors.deepRose,
    fontWeight: '600',
  },

  upgradeBannerArrow: {
    fontSize: 16,
    color: colors.deepRose,
    fontWeight: '700',
  },

  // ── Footer ────────────────────────────────────────────────────────────────────

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.screenPaddingH,
    paddingTop: spacing.xl,
  },

  footerRule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.subtleBorder,
  },

  footerText: {
    fontFamily: 'serif',
    fontSize: 11,
    fontStyle: 'italic',
    color: colors.caption,
    letterSpacing: 0.3,
  },

});