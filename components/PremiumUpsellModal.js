// components/PremiumUpsellModal.js
import React, { useMemo, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  buyPremium,
  buyPremiumAnnual,
  restorePurchases,
  getProducts,
  PRODUCT_ID_MONTHLY,
  PRODUCT_ID_ANNUAL,
} from '../lib/iap';
import { colors, typography, spacing, radii } from '../screens/theme';

// ─── Static plan config (no prices — those come from the store) ───────────────
const PLAN_CONFIG = {
  annual: {
    label:  'Annual',
    saving: 'BEST VALUE',
    cta:    'Start 7-day free trial',
  },
  monthly: {
    label:  'Monthly',
    saving: null,
    cta:    'Start 7-day free trial',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function PremiumUpsellModal({ visible, onClose }) {
  const navigation = useNavigation();
  const [buying, setBuying]             = useState(false);
  const [restoring, setRestoring]       = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [products, setProducts]         = useState({});

  // Fetch live prices from the store each time the modal opens
  useEffect(() => {
    if (!visible) return;
    getProducts()
      .then((list) => {
        const map = {};
        list.forEach((p) => { map[p.productId] = p; });
        setProducts(map);
      })
      .catch(() => {});
  }, [visible]);

  // Resolve localizedPrice from the store product, fall back to '—' while loading
  const monthlyPrice = products[PRODUCT_ID_MONTHLY]?.localizedPrice ?? '—';
  const annualPrice  = products[PRODUCT_ID_ANNUAL]?.localizedPrice  ?? '—';

  // Build the full plan objects the JSX consumes — derived from live store data
  const PLANS = {
    annual: {
      ...PLAN_CONFIG.annual,
      price:       `${annualPrice}/yr`,
      subLabel:    'Save 50% vs monthly',
      pricingNote: `7 days free, then ${annualPrice}/year unless cancelled before the trial ends.`,
    },
    monthly: {
      ...PLAN_CONFIG.monthly,
      price:       `${monthlyPrice}/mo`,
      subLabel:    'Billed monthly',
      pricingNote: `7 days free, then ${monthlyPrice}/month unless cancelled before the trial ends.`,
    },
  };

  const comparisonRows = useMemo(
    () => [
      { label: 'Guided roadmap access',                    free: 'Included',           premium: 'Included'  },
      { label: 'Step-by-step tasks',                       free: 'Included',           premium: 'Included'  },
      { label: 'Progress tracking',                        free: 'Included',           premium: 'Included'  },
      { label: 'Streak tracking',                          free: 'Included',           premium: 'Included'  },
      { label: 'Personal Reinvention Score',               free: 'Included',           premium: 'Included'  },
      { label: 'Reflection insights & weekly summaries',   free: 'Included',           premium: 'Included'  },
      { label: 'Monthly streak freezes',                   free: '1 per month',        premium: 'Unlimited' },
      { label: 'Roadmap hours',                            free: 'Up to 20 hrs total', premium: 'Unlimited' },
      { label: 'All roadmaps & advanced tracks',           free: 'Limited',            premium: 'Unlocked'  },
      { label: 'Reinvention Circles accountability groups', free: 'Not included',      premium: 'Unlocked'  },
      { label: 'AI weekly roadmap adaptation',             free: 'Not included',       premium: 'Unlocked'  },
      { label: 'Calendar export',                          free: 'Locked',             premium: 'Unlocked'  },
      { label: 'Smart reshuffle when time changes',        free: 'Not included',       premium: 'Unlocked'  },
      { label: 'Advanced progress analytics',              free: 'Basic only',         premium: 'Unlocked'  },
      { label: 'Exclusive style, career & life guides',    free: 'Not included',       premium: 'Unlocked'  },
    ],
    []
  );

  const premiumHighlights = useMemo(
    () => [
      'Start with a 7-day free trial',
      'Unlimited roadmap hours',
      'Unlimited streak freezes; your streak is always protected',
      'Full Premium access across your reinvention journey',
      'Best fit if you want more flexibility, deeper support, and smarter planning',
    ],
    []
  );

  const handleBuy = async () => {
    if (buying) return;
    try {
      setBuying(true);
      const ok = selectedPlan === 'annual'
        ? await buyPremiumAnnual()
        : await buyPremium();
      if (ok) onClose?.();
    } catch (e) {
      console.error('Purchase failed', e);
    } finally {
      setBuying(false);
    }
  };

  const handleRestore = async () => {
    if (restoring) return;
    try {
      setRestoring(true);
      const restored = await restorePurchases();
      if (restored) onClose?.();
    } catch (e) {
      console.error('Restore failed', e);
    } finally {
      setRestoring(false);
    }
  };

  const plan = PLANS[selectedPlan];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Icon */}
            <View style={styles.iconWrap}>
              <Ionicons name="diamond-outline" size={30} color={colors.deepRose} />
            </View>

            <Text style={styles.title}>Start your 7-day free trial</Text>
            <Text style={styles.subtitle}>
              Try Premium free for 7 days, then unlock the full Reinvention Edit
              experience with deeper support, more flexibility, and upcoming smart
              features. Cancel anytime before the trial ends.
            </Text>

            {/* Why people upgrade */}
            <View style={styles.heroCard}>
              <Text style={styles.heroEyebrow}>WHY PEOPLE UPGRADE</Text>
              <View style={styles.heroRule} />
              {premiumHighlights.map((item, idx) => (
                <View key={idx} style={styles.heroBulletRow}>
                  <View style={styles.heroPip} />
                  <Text style={styles.heroBulletText}>{item}</Text>
                </View>
              ))}
            </View>

            {/* ── Plan toggle ── */}
            <Text style={styles.sectionTitle}>Choose your plan</Text>
            <View style={styles.toggleWrap}>
              {['annual', 'monthly'].map((planKey) => {
                const p      = PLANS[planKey];
                const active = selectedPlan === planKey;
                return (
                  <TouchableOpacity
                    key={planKey}
                    style={[styles.toggleOption, active && styles.toggleOptionActive]}
                    onPress={() => setSelectedPlan(planKey)}
                    activeOpacity={0.8}
                  >
                    {p.saving ? (
                      <View style={styles.savingBadge}>
                        <Text style={styles.savingBadgeText}>{p.saving}</Text>
                      </View>
                    ) : null}
                    <Text style={[styles.toggleLabel, active && styles.toggleLabelActive]}>
                      {p.label}
                    </Text>
                    <Text style={[styles.togglePrice, active && styles.togglePriceActive]}>
                      {p.price}
                    </Text>
                    <Text style={[styles.toggleSub, active && styles.toggleSubActive]}>
                      {p.subLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Free vs Premium table */}
            <Text style={styles.sectionTitle}>Free vs Premium</Text>

            <View style={styles.comparisonCard}>
              <View style={styles.headerRow}>
                <View style={[styles.labelCell, styles.headerLabelCell]}>
                  <Text style={styles.headerLabelText}>Feature</Text>
                </View>
                <View style={[styles.planCell, styles.freeHeaderCell]}>
                  <Text style={styles.planHeaderText}>Free</Text>
                </View>
                <View style={[styles.planCell, styles.premiumHeaderCell]}>
                  <Text style={styles.planHeaderText}>Premium</Text>
                </View>
              </View>

              {comparisonRows.map((row, idx) => (
                <View
                  key={`${row.label}-${idx}`}
                  style={[
                    styles.compareRow,
                    idx === comparisonRows.length - 1 && styles.compareRowLast,
                  ]}
                >
                  <View style={styles.labelCell}>
                    <Text style={styles.featureLabel}>{row.label}</Text>
                  </View>
                  <View style={[styles.planCell, styles.freeCell]}>
                    <Text style={styles.freeValue}>{row.free}</Text>
                  </View>
                  <View style={[styles.planCell, styles.premiumCell]}>
                    <Text style={styles.premiumValue}>{row.premium}</Text>
                  </View>
                </View>
              ))}
            </View>

            <Text style={styles.note}>
              Premium includes what is already unlocked today plus the planned smart
              features being added next, so the upgrade feels more valuable over time.
            </Text>

            {/* Dynamic pricing note — uses live store price */}
            <Text style={styles.pricingNote}>{plan.pricingNote}</Text>

            {/* Legal links — required by Apple */}
            <View style={styles.legalRow}>
              <TouchableOpacity onPress={() => { onClose?.(); navigation.navigate('TermsOfService'); }} activeOpacity={0.7}>
                <Text style={styles.legalLink}>Terms of Use</Text>
              </TouchableOpacity>
              <Text style={styles.legalSep}>·</Text>
              <TouchableOpacity onPress={() => { onClose?.(); navigation.navigate('PrivacyPolicy'); }} activeOpacity={0.7}>
                <Text style={styles.legalLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[styles.button, buying && styles.buttonDisabled]}
              onPress={handleBuy}
              activeOpacity={0.9}
              disabled={buying}
            >
              {buying ? (
                <ActivityIndicator color={colors.warmWhite} />
              ) : (
                <Text style={styles.buttonText}>{plan.cta}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              activeOpacity={0.85}
              disabled={restoring}
            >
              {restoring ? (
                <ActivityIndicator color={colors.clay} />
              ) : (
                <Text style={styles.restoreText}>Restore Purchases</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeText}>Not now</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles — uses theme.js throughout ────────────────────────────────────────
const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },

  container: {
    width: '100%',
    maxWidth: 430,
    maxHeight: '92%',
    backgroundColor: colors.warmWhite,
    borderRadius: radii.xxl,
    borderWidth: 1.5,
    borderColor: colors.fawn,
    overflow: 'hidden',
  },

  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },

  // ── Icon ──────────────────────────────────────────────────────────────────
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.roseTint08,
    borderWidth: 1.5,
    borderColor: colors.roseTint15,
    marginBottom: spacing.md,
  },

  // ── Header copy ───────────────────────────────────────────────────────────
  title: {
    fontFamily: 'serif',
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.bodyMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  // ── Why upgrade card ──────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: colors.linen,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.fawn,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  heroEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.clay,
    marginBottom: spacing.xs,
  },

  heroRule: {
    height: 1,
    backgroundColor: colors.clayRule,
    marginBottom: spacing.md,
  },

  heroBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },

  heroPip: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.dustyRose,
    marginTop: 7,
    flexShrink: 0,
  },

  heroBulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: colors.ink,
    fontWeight: '500',
  },

  // ── Section title ─────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.clay,
    marginBottom: spacing.sm,
  },

  // ── Plan toggle ───────────────────────────────────────────────────────────
  toggleWrap: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  toggleOption: {
    flex: 1,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    backgroundColor: colors.offWhite,
    paddingTop: 18,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    position: 'relative',
  },

  toggleOptionActive: {
    borderColor: colors.deepRose,
    backgroundColor: colors.roseTint08,
  },

  savingBadge: {
    position: 'absolute',
    top: -11,
    backgroundColor: colors.deepRose,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },

  savingBadgeText: {
    color: colors.warmWhite,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  toggleLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.caption,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  toggleLabelActive: {
    color: colors.deepRose,
  },

  togglePrice: {
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 2,
    letterSpacing: -0.3,
  },

  togglePriceActive: {
    color: colors.ink,
  },

  toggleSub: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.caption,
    textAlign: 'center',
    lineHeight: 15,
  },

  toggleSubActive: {
    color: colors.midRose,
  },

  // ── Comparison table ──────────────────────────────────────────────────────
  comparisonCard: {
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.card,
    marginBottom: spacing.md,
  },

  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.softBorder,
    backgroundColor: colors.linen,
  },

  headerLabelCell: {
    backgroundColor: colors.linen,
  },

  headerLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.bodyMuted,
    letterSpacing: 0.3,
  },

  labelCell: {
    flex: 1.2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },

  planCell: {
    flex: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },

  freeHeaderCell: {
    backgroundColor: colors.offWhite,
  },

  premiumHeaderCell: {
    backgroundColor: colors.roseTint08,
  },

  planHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 0.3,
  },

  compareRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
  },

  compareRowLast: {
    borderBottomWidth: 0,
  },

  featureLabel: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.ink,
    fontWeight: '500',
  },

  freeCell: {
    backgroundColor: colors.offWhite,
  },

  premiumCell: {
    backgroundColor: colors.roseTint08,
  },

  freeValue: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.caption,
    fontWeight: '600',
    textAlign: 'center',
  },

  premiumValue: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.sage,
    fontWeight: '700',
    textAlign: 'center',
  },

  // ── Footer copy ───────────────────────────────────────────────────────────
  note: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.bodyMuted,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  pricingNote: {
    fontSize: 11,
    lineHeight: 17,
    color: colors.caption,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  // ── CTA button ────────────────────────────────────────────────────────────
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.deepRose,
    borderRadius: radii.pill,
    paddingVertical: 15,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonDisabled: {
    opacity: 0.75,
  },

  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.warmWhite,
  },

  // ── Restore & dismiss ─────────────────────────────────────────────────────
  restoreButton: {
    marginTop: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
  },

  restoreText: {
    color: colors.clay,
    fontSize: 13,
    fontWeight: '600',
  },

  closeButton: {
    marginTop: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },

  closeText: {
    color: colors.caption,
    fontSize: 13,
    fontWeight: '500',
  },

  // ── Legal links ───────────────────────────────────────────────────────────
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },

  legalLink: {
    fontSize: 11,
    color: colors.clay,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

  legalSep: {
    fontSize: 11,
    color: colors.caption,
  },
});