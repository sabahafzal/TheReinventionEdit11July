// screens/WelcomeGuideModal.js
import React, { useMemo, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, radii, tokens } from './theme';
import { buyPremium, buyPremiumAnnual, getProducts, PRODUCT_ID_MONTHLY, PRODUCT_ID_ANNUAL } from '../lib/iap';

const { height } = Dimensions.get('window');

// ─── Data ─────────────────────────────────────────────────────────────────────

const ROADMAP_ACHIEVEMENTS = {
  new_city: [
    'Feel settled, confident, and far less overwhelmed in your new city.',
    'Build routines, practical systems, and a daily life that actually works.',
    'Feel more at home socially, emotionally, and logistically.',
  ],
  tech_switch: [
    'Build real momentum toward a career in tech with a clearer path forward.',
    'Develop practical skills, portfolio proof, and more confidence in your direction.',
    'Feel ready to apply, interview, and position yourself professionally.',
  ],
  financial_glow_up: [
    'Feel more in control of your money, spending, and financial habits.',
    'Build smarter routines around saving, planning, and financial confidence.',
    'Create a lifestyle that feels more secure, intentional, and elevated.',
  ],
  physical_glow_up: [
    'Create healthier routines that make you feel stronger, energised, and more put together.',
    'Build consistency with movement, food, and habits that support your glow-up.',
    'Feel more confident in your body and daily self-care.',
  ],
  mental_glow_up: [
    'Feel calmer, more grounded, and more emotionally in charge of your life.',
    'Build mindset habits that support confidence, resilience, and self-trust.',
    'Create more clarity around who you are and where you are going.',
  ],
};

const ROADMAP_TITLES = {
  new_city: 'Starting Over in a New City',
  tech_switch: 'Switching Into Tech',
  financial_glow_up: 'Financial Glow-Up',
  physical_glow_up: 'Physical Glow-Up',
  mental_glow_up: 'Mental Glow-Up',
};

const FREE_BULLETS = [
  'Structured roadmaps for career, city life, health, and mindset.',
  'Step-by-step daily tasks with progress tracking.',
  'Streak tracking and motivational reminders.',
  'Up to 20 hours of guided reinvention across all roadmaps.',
];

const HOW_IT_WORKS = [
  { step: '1', label: 'Pick', sub: 'Choose a roadmap' },
  { step: '2', label: 'Do', sub: "Complete today's task" },
  { step: '3', label: 'Grow', sub: 'Watch progress stack up' },
];

const PREMIUM_BULLETS = [
  'Unlimited roadmap hours',
  'Access to all reinvention roadmaps and advanced tracks',
  'AI-adapted weekly plans that match your available time',
  'Smart roadmap reshuffle when life gets busy',
  'Reinvention Circles accountability groups',
  'Progress analytics across themes and roadmaps',
  'Advanced reflection insights and weekly summaries',
  'Exclusive style, career, and life strategy guides',
  'your personal Reinvention Score',
  'Future feature: A personal branding vault to store and share your key personal brand assets',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function EyebrowRow({ label }) {
  return (
    <View style={styles.eyebrowRow}>
      <Text style={styles.eyebrow}>{label}</Text>
      <View style={styles.eyebrowRule} />
    </View>
  );
}

function BulletRow({ text }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.pip} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WelcomeGuideModal({
  visible,
  onClose,
  onGoToRoadmap,
  roadmapKey,
}) {
  const navigation = useNavigation();
  const [monthlyPrice, setMonthlyPrice] = useState(null);
  const [annualPrice, setAnnualPrice]   = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('annual');

  // Fetch live prices from the store so they can be shown before purchase,
  // as required by App Store guideline 3.1.2(c).
  useEffect(() => {
    if (!visible) return;
    getProducts()
      .then((list) => {
        const m = list.find((x) => x.productId === PRODUCT_ID_MONTHLY);
        const a = list.find((x) => x.productId === PRODUCT_ID_ANNUAL);
        if (m) setMonthlyPrice(m.localizedPrice);
        if (a) setAnnualPrice(a.localizedPrice);
      })
      .catch(() => {});
  }, [visible]);

  const achievementBullets = useMemo(
    () =>
      ROADMAP_ACHIEVEMENTS[roadmapKey] || [
        'Finish with more clarity, confidence, and momentum.',
        'Turn a big life goal into small steps you can actually follow.',
        'Build consistency through structured progress that feels good.',
      ],
    [roadmapKey]
  );

  const achievementTitle = useMemo(() => {
    const roadmapTitle = ROADMAP_TITLES[roadmapKey];
    return roadmapTitle
      ? `What you'll achieve · ${roadmapTitle}`
      : "What you'll achieve";
  }, [roadmapKey]);

  const handleStartTrial = async () => {
    if (selectedPlan === 'annual') {
      await buyPremiumAnnual();
    } else {
      await buyPremium();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >

            {/* ── Header band ── */}
            <View style={styles.headerBand}>
              <View style={styles.badgeWrap}>
                <Text style={styles.badge}>The Reinvention Edit</Text>
              </View>
              <Text style={styles.heroTitle}>
                Your glow-up,{'\n'}
                <Text style={styles.heroTitleItalic}>but organised</Text>
              </Text>
              <Text style={styles.heroSub}>
                Career pivots, new city starts, feel-good routines, turned into
                small steps you can actually finish.
              </Text>
            </View>

            {/* ── Body ── */}
            <View style={styles.body}>

              {/* Achievement */}
              <View style={styles.achieveCard}>
                <Text style={styles.achieveTitle}>{achievementTitle}</Text>
                {achievementBullets.map((bullet, i) => (
                  <BulletRow key={i} text={bullet} />
                ))}
              </View>

              {/* Included free */}
              <EyebrowRow label="Included free" />
              <View style={styles.freeBullets}>
                {FREE_BULLETS.map((bullet, i) => (
                  <BulletRow key={i} text={bullet} />
                ))}
              </View>

              {/* How it works */}
              <EyebrowRow label="How it works" />
              <View style={styles.stepsRow}>
                {HOW_IT_WORKS.map(({ step, label, sub }) => (
                  <View key={step} style={styles.stepCard}>
                    <Text style={styles.stepNumber}>{step}</Text>
                    <Text style={styles.stepLabel}>{label}</Text>
                    <Text style={styles.stepSub}>{sub}</Text>
                  </View>
                ))}
              </View>

              {/* Bridge — narrowed before premium */}
              <View style={styles.upsellBridge}>
                <Text style={styles.upsellBridgeText}>
                  Start free. Upgrade whenever{'\n'}you want more support.
                </Text>
              </View>

              {/* Premium — linen card */}
              <View style={styles.upgradeCard}>
                <Text style={styles.upgradeTitleItalic}>Premium</Text>
                <View style={styles.upgradeBullets}>
                  {PREMIUM_BULLETS.map((bullet, i) => (
                    <BulletRow key={i} text={bullet} />
                  ))}
                </View>
                <Text style={styles.upgradeNote}>
                  Deeper support, more flexibility, more personalised.
                </Text>

                {/* ── Plan toggle ── */}
                <View style={styles.planToggleRow}>
                  {['annual', 'monthly'].map((planKey) => {
                    const active = selectedPlan === planKey;
                    const label  = planKey === 'annual' ? 'Annual' : 'Monthly';
                    const price  = planKey === 'annual' ? annualPrice : monthlyPrice;
                    const sub    = planKey === 'annual' ? 'Save vs monthly' : 'Billed monthly';
                    return (
                      <TouchableOpacity
                        key={planKey}
                        style={[styles.planOption, active && styles.planOptionActive]}
                        onPress={() => setSelectedPlan(planKey)}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.planOptionLabel, active && styles.planOptionLabelActive]}>
                          {label}
                        </Text>
                        <Text style={[styles.planOptionPrice, active && styles.planOptionPriceActive]}>
                          {price ? `${price}/${planKey === 'annual' ? 'yr' : 'mo'}` : '—'}
                        </Text>
                        <Text style={[styles.planOptionSub, active && styles.planOptionSubActive]}>
                          {sub}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* CTA buttons */}
              <View style={styles.ctaRow}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonTrial]}
                  onPress={handleStartTrial}
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonTrialText}>7 days free Premium trial</Text>
                  <Text style={styles.buttonTrialSub}>
                    {selectedPlan === 'annual'
                      ? `Premium (Annual)${annualPrice ? ` · Then ${annualPrice}/year` : ''}`
                      : `Premium (Monthly)${monthlyPrice ? ` · Then ${monthlyPrice}/month` : ''}`}
                    {' '}· Automatically renews, but you can cancel at any time
                  </Text>
                </TouchableOpacity>

                {/* Legal links — required by Apple */}
                <View style={styles.legalRow}>
                  <TouchableOpacity
                    onPress={() => { onClose?.(); navigation.navigate('TermsOfService'); }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.legalLink}>Terms of Use</Text>
                  </TouchableOpacity>
                  <Text style={styles.legalSep}>·</Text>
                  <TouchableOpacity
                    onPress={() => { onClose?.(); navigation.navigate('PrivacyPolicy'); }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.legalLink}>Privacy Policy</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={onGoToRoadmap}
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonPrimaryText}>Start my reinvention free</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={onClose}
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonSecondaryText}>Explore later</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  // Overlay — overlayDark scrim (tokens.modalOverlay)
  overlay: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },

  // Modal card — warmWhite, softBorder (tokens.modalCard)
  card: {
    width: '100%',
    maxWidth: 480,
    maxHeight: height * 0.9,
    backgroundColor: colors.warmWhite,
    borderRadius: radii.xxl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    overflow: 'hidden',
    alignSelf: 'center',
  },

  scrollContent: {
    paddingBottom: spacing.xl,
  },

  // ── Header band ──────────────────────────────────────────────────────────────
  headerBand: {
    backgroundColor: colors.offWhite,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.fawn,
    alignItems: 'center',
  },

  badgeWrap: {
    marginBottom: spacing.sm,
  },

  // Badge — roseTint08 bg, roseTint15 border (tokens.badge)
  badge: {
    ...typography.badge,
    backgroundColor: colors.roseTint08,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.roseTint15,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    overflow: 'hidden',
  },

  heroTitle: {
    fontFamily: 'serif',
    fontSize: 21,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: -0.2,
    marginBottom: spacing.xs,
  },

  heroTitleItalic: {
    fontFamily: 'serif',
    fontStyle: 'italic',
    color: colors.deepRose,
  },

  heroSub: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.bodyMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.sm,
  },

  // ── Body ─────────────────────────────────────────────────────────────────────
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  // Achievement card — offWhite bg, fawn border
  achieveCard: {
    backgroundColor: colors.offWhite,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.fawn,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },

  achieveTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 0.1,
    marginBottom: spacing.sm,
  },

  // Eyebrow row — clay text + clayRule line (tokens.eyebrowRow / eyebrowRule)
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },

  eyebrow: {
    ...typography.eyebrow,
  },

  eyebrowRule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.clayRule,
  },

  // Free bullets
  freeBullets: {
    marginBottom: spacing.lg,
  },

  // How it works — 3-step cards
  stepsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },

  stepCard: {
    flex: 1,
    backgroundColor: colors.offWhite,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.fawn,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },

  stepNumber: {
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontSize: 18,
    color: colors.deepRose,
    lineHeight: 22,
    marginBottom: 2,
  },

  stepLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.ink,
    marginBottom: 2,
  },

  stepSub: {
    fontSize: 9,
    fontWeight: '400',
    color: colors.caption,
    textAlign: 'center',
    lineHeight: 13,
  },

  // Narrowed upsell bridge before premium
  upsellBridge: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },

  upsellBridgeText: {
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.deepRose,
    textAlign: 'center',
    lineHeight: 19,
  },

  // Upgrade card — linen bg, roseTint30 border (tokens.linenCard)
  upgradeCard: {
    backgroundColor: colors.linen,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.roseTint30,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  upgradeEye: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.deepRose,
    marginBottom: spacing.xs,
  },

  upgradeTitle: {
    fontFamily: 'serif',
    fontSize: 17,
    color: colors.ink,
    lineHeight: 23,
    marginBottom: spacing.md,
  },

  upgradeTitleItalic: {
    fontStyle: 'italic',
    color: colors.deepRose,
  },

  upgradeBullets: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },

  upgradeNote: {
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.caption,
    lineHeight: 17,
    marginTop: spacing.xs,
  },

  // Plan toggle — inside the Premium linen card
  planToggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  planOption: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.roseTint30,
    backgroundColor: colors.warmWhite,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },

  planOptionActive: {
    backgroundColor: colors.deepRose,
    borderColor: colors.deepRose,
  },

  planOptionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 2,
  },

  planOptionLabelActive: {
    color: colors.warmWhite,
  },

  planOptionPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.deepRose,
    marginBottom: 2,
  },

  planOptionPriceActive: {
    color: colors.warmWhite,
  },

  planOptionSub: {
    fontSize: 9,
    fontWeight: '400',
    color: colors.caption,
  },

  planOptionSubActive: {
    color: colors.warmWhite,
    opacity: 0.8,
  },

  // Bullet pip — dustyRose (upgradeBulletPip)
  pip: {
    width: 5,
    height: 5,
    borderRadius: radii.dot,
    backgroundColor: colors.dustyRose,
    flexShrink: 0,
    marginTop: 6,
  },

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },

  bulletText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '300',
    color: colors.bodyLight,
    lineHeight: 18,
    letterSpacing: 0.1,
  },

  // CTA row
  ctaRow: {
    flexDirection: 'column',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },

  button: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Primary — deepRose (tokens.buttonPrimary)
  buttonPrimary: {
    backgroundColor: colors.deepRose,
  },

  buttonPrimaryText: {
    ...typography.buttonPrimary,
  },

  // Secondary — ghost, softBorder
  buttonSecondary: {
    borderWidth: 1.5,
    borderColor: colors.softBorder,
  },

  buttonSecondaryText: {
    ...typography.modalCancel,
  },

  // Trial CTA — linen bg, roseTint30 border
  buttonTrial: {
    backgroundColor: colors.deepRose,
    paddingVertical: 15,
  },

  buttonTrialText: {
    ...typography.buttonPrimary,
    fontSize: 15,
    marginBottom: 2,
  },

  buttonTrialSub: {
    fontSize: 10,
    fontWeight: '400',
    color: colors.warmWhite,
    opacity: 0.75,
    letterSpacing: 0.2,
    textAlign: 'center',
  },

  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
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