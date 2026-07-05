// screens/TermsOfServiceScreen.js
import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from './theme';

// ─── Content ──────────────────────────────────────────────────────────────────

const LAST_UPDATED = 'April 2026';
const CONTACT_EMAIL = 'info@thereinventionedit.com';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By downloading, accessing, or using The Reinvention Edit ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the App.\n\nThese Terms apply to all users of the App, including free and Premium subscribers.`,
  },
  {
    title: '2. About the App',
    body: `The Reinvention Edit is a personal development app designed to help users build structured roadmaps and track progress across life goals. Including career, finances, physical health, mental wellbeing, and lifestyle.\n\nThe App provides curated tasks, reflection prompts, coaching nudges, and community features to support your reinvention journey.`,
  },
  {
    title: '3. Eligibility',
    body: `You must be at least 16 years old to use the App. By using the App, you confirm that you meet this age requirement and that you have the legal capacity to enter into these Terms in your jurisdiction.`,
  },
  {
    title: '4. Your Account',
    body: `To access certain features, you must create an account. You are responsible for:\n\n• Providing accurate and up-to-date registration information\n• Maintaining the confidentiality of your login credentials\n• All activity that occurs under your account\n\nPlease notify us immediately at ${CONTACT_EMAIL} if you suspect any unauthorised use of your account.`,
  },
  {
    title: '5. Subscriptions & In-App Purchases',
    body: `The App offers a free tier and a Premium subscription ("Premium"). Premium features are unlocked upon purchase of a subscription.\n\nFree Trial: New users may be eligible for a 7-day free trial of Premium. At the end of the trial period, you will be charged the applicable subscription fee unless you cancel before the trial ends.\n\nBilling: Subscriptions are billed on a recurring basis (monthly or annually, as selected) through the Apple App Store or Google Play Store. Payment is charged to your account at confirmation of purchase.\n\nCancellation: You may cancel your subscription at any time through your device's app store settings. Cancellation takes effect at the end of the current billing period; no partial refunds are issued.\n\nRefunds: All purchases are subject to the refund policy of the relevant app store. We do not process refunds directly.`,
  },
  {
    title: '6. Acceptable Use',
    body: `You agree not to use the App to:\n\n• Violate any applicable law or regulation\n• Harass, harm, or intimidate other users\n• Upload or transmit malicious code or content\n• Attempt to reverse-engineer or gain unauthorised access to the App\n• Use the App for any commercial purpose without our prior written consent\n• Scrape, copy, or republish App content without permission\n\nWe reserve the right to suspend or terminate accounts that violate these conditions.`,
  },
  {
    title: '7. Community Features',
    body: `The App includes community features such as Reinvention Circles. When participating in community spaces, you agree to:\n\n• Be respectful and constructive in all interactions\n• Not share personal information about other users without their consent\n• Not post content that is offensive, discriminatory, or harmful\n\nWe reserve the right to remove content or restrict access to community features at our discretion.`,
  },
  {
    title: '8. Intellectual Property',
    body: `All content within the App, including roadmap tasks, coaching copy, design, illustrations, and brand assets is owned by or licensed to The Reinvention Edit and is protected by applicable intellectual property laws.\n\nYou may not reproduce, distribute, or create derivative works from App content without our express written permission.`,
  },
  {
    title: '9. User-Generated Content',
    body: `Where the App allows you to submit content (such as reflections, check-ins, or community posts), you retain ownership of that content. By submitting content, you grant us a non-exclusive, royalty-free licence to use, store, and display it solely for the purpose of operating and improving the App.\n\nYou are solely responsible for content you submit and confirm it does not infringe any third-party rights.`,
  },
  {
    title: '10. Disclaimers',
    body: `The App provides general personal development tools and content for informational and motivational purposes only. It is not a substitute for professional advice.\n\nThe Reinvention Edit does not provide financial, legal, medical, or psychological advice. Always consult a qualified professional before making significant life decisions.\n\nThe App is provided "as is" without warranties of any kind. We do not guarantee that the App will be error-free, uninterrupted, or meet your specific expectations.`,
  },
  {
    title: '11. Limitation of Liability',
    body: `To the maximum extent permitted by law, The Reinvention Edit shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the App, including loss of data, loss of progress, or loss of profits.\n\nOur total liability to you for any claim arising from these Terms shall not exceed the amount you paid for Premium in the 12 months preceding the claim.`,
  },
  {
    title: '12. Privacy',
    body: `Your use of the App is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the App, you consent to the practices described in our Privacy Policy.`,
  },
  {
    title: '13. Changes to These Terms',
    body: `We may update these Terms from time to time. When we do, we will update the "Last updated" date at the top of this page and, where the changes are material, notify you via the App or by email.\n\nYour continued use of the App after any changes constitutes your acceptance of the revised Terms.`,
  },
  {
    title: '14. Termination',
    body: `We reserve the right to suspend or terminate your account and access to the App at any time, with or without notice, if we reasonably believe you have violated these Terms.\n\nYou may delete your account at any time from the Profile screen. Upon deletion, your personal data will be handled in accordance with our Privacy Policy.`,
  },
  {
    title: '15. Governing Law',
    body: `These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.`,
  },
  {
    title: '16. Contact Us',
    body: `If you have any questions about these Terms, please contact us at:\n\n${CONTACT_EMAIL}\n\nThe Reinvention Edit\nthereinventionedit.com`,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function TermsOfServiceScreen() {
  const navigation = useNavigation();
  const scrollRef = useRef(null);

  const handlePrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${CONTACT_EMAIL}`).catch(() => {});
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.warmWhite} />

      {/* ── Header ── */}
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')}
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={22} color={colors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <View style={styles.backBtn} />
        </View>
      </SafeAreaView>

      {/* ── Body ── */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>The Reinvention Edit</Text>
          <Text style={styles.heroSub}>Terms of Service</Text>
          <View style={styles.heroRule} />
          <Text style={styles.lastUpdated}>Last updated: {LAST_UPDATED}</Text>
        </View>

        {/* ── Intro ── */}
        <View style={styles.introCard}>
          <Ionicons name="document-text-outline" size={20} color={colors.deepRose} style={{ marginBottom: spacing.xs }} />
          <Text style={styles.introText}>
            Please read these Terms carefully before using the App. They set out your rights and responsibilities as a user.
          </Text>
        </View>

        {/* ── Sections ── */}
        {SECTIONS.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionRule} />
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        {/* ── Footer links ── */}
        <View style={styles.footerCard}>
          <Text style={styles.footerLabel}>Related documents</Text>
          <TouchableOpacity style={styles.footerLink} onPress={handlePrivacyPolicy}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.deepRose} />
            <Text style={styles.footerLinkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.champagne} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <View style={styles.footerDivider} />
          <TouchableOpacity style={styles.footerLink} onPress={handleEmail}>
            <Ionicons name="mail-outline" size={16} color={colors.deepRose} />
            <Text style={styles.footerLinkText}>{CONTACT_EMAIL}</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.champagne} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor: colors.warmWhite,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  headerSafe: {
    backgroundColor: colors.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.softBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 32,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.actionLabel,
    fontSize: 15,
    color: colors.ink,
  },

  // ── Scroll / layout ──────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },

  // ── Hero ────────────────────────────────────────────────────────────────────
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  heroTitle: {
    fontFamily: 'DancingScript',
    fontSize: 28,
    color: colors.ink,
    marginBottom: 2,
  },
  heroSub: {
    ...typography.eyebrow,
    fontSize: 10,
    color: colors.clay,
    marginBottom: spacing.md,
  },
  heroRule: {
    width: 48,
    height: 2,
    backgroundColor: colors.dustyRose,
    borderRadius: 1,
    marginBottom: spacing.sm,
  },
  lastUpdated: {
    ...typography.caption,
    color: colors.caption,
  },

  // ── Intro card ───────────────────────────────────────────────────────────
  introCard: {
    backgroundColor: colors.roseTint08,
    borderWidth: 1,
    borderColor: colors.roseTint15,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: 'flex-start',
  },
  introText: {
    ...typography.body,
    color: colors.bodyMuted,
    lineHeight: 22,
  },

  // ── Section ─────────────────────────────────────────────────────────────
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'serif',
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.xs,
    letterSpacing: -0.1,
  },
  sectionRule: {
    height: 1,
    backgroundColor: colors.clayRule,
    marginBottom: spacing.sm,
  },
  sectionBody: {
    ...typography.body,
    color: colors.bodyMuted,
    lineHeight: 22,
  },

  // ── Footer card ──────────────────────────────────────────────────────────
  footerCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.softBorder,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginTop: spacing.sm,
    ...shadows?.card,
  },
  footerLabel: {
    ...typography.eyebrow,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  footerLinkText: {
    ...typography.actionLabel,
    color: colors.ink,
    flex: 1,
  },
  footerDivider: {
    height: 1,
    backgroundColor: colors.subtleBorder,
    marginHorizontal: spacing.xs,
  },
});