// screens/PrivacyPolicyScreen.js
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
import { colors, typography, spacing, radii, shadows } from './theme';

// ─── Content ──────────────────────────────────────────────────────────────────

const LAST_UPDATED = 'April 2026';
const CONTACT_EMAIL = 'info@thereinventionedit.com';
const TERMS_OF_SERVICE_URL = 'https://thereinventionedit.com/terms-of-service';

const SECTIONS = [
  {
    title: '1. Who We Are',
    body: `The Reinvention Edit ("we", "us", "our") is a personal development app designed to help users build structured roadmaps and track progress across life goals.\n\nIf you have any questions about this Privacy Policy, please contact us at ${CONTACT_EMAIL}.`,
  },
  {
    title: '2. Information We Collect',
    body: `We collect information you provide directly to us, including:\n\n• Account information: your name, email address, and password when you register\n• Profile data: your selected roadmap, time commitment preferences, and progress milestones\n• User-generated content: reflections, check-ins, mood and gratitude entries, and community posts you submit\n• Communications: messages you send us, including feedback and support requests\n\nWe also collect certain information automatically when you use the App, including device information, usage data, and crash reports to help us improve the App.\n\nIf you choose to add a profile photo, it is stored locally on your device only and is not uploaded to our servers.`,
  },
  {
    title: '2a. Mood & Wellbeing Data',
    body: `As part of the App's daily reflection feature, you may optionally record a mood rating and gratitude notes alongside your written reflections. This data is used solely to power your personal reflection history within the App and is never used for advertising or shared with third parties.\n\nThis information is not a substitute for professional medical or psychological advice — see Section 10 of our Terms of Service for more detail.`,
  },
  {
    title: '3. How We Use Your Information',
    body: `We use the information we collect to:\n\n• Provide, maintain, and improve the App and its features\n• Personalise your experience and deliver relevant roadmap content\n• Send you notifications and reminders you have opted into\n• Respond to your comments and support requests\n• Monitor and analyse usage trends to improve functionality\n• Detect and prevent fraudulent or harmful activity\n\nWe do not use your data for advertising purposes, and we do not sell your personal information to third parties.`,
  },
  {
    title: '4. Legal Basis for Processing (UK & EEA Users)',
    body: `If you are located in the UK or European Economic Area, we process your personal data on the following legal bases:\n\n• Contract: to provide you with the services you have signed up for\n• Legitimate interests: to improve the App and ensure its security\n• Consent: where you have opted in to notifications or optional features\n• Legal obligation: where we are required to process data by law\n\nYou may withdraw consent at any time without affecting the lawfulness of processing carried out before withdrawal.`,
  },
  {
    title: '5. Data Sharing',
    body: `We do not sell, trade, or rent your personal information. We may share your data only in the following limited circumstances:\n\n• Service providers: trusted third-party providers who assist us in operating the App (e.g. hosting, analytics, push notifications), bound by confidentiality obligations\n• Legal compliance: where required by law, court order, or governmental authority\n• Business transfers: in connection with a merger, acquisition, or sale of assets, where your data may be transferred as part of that transaction\n\nWe require all third parties to respect the security of your personal data and to treat it in accordance with applicable law.`,
  },
  {
    title: '6. Data Retention',
    body: `We retain your personal data for as long as your account is active or as needed to provide you with our services.\n\nIf you delete your account, we will delete or anonymise your personal data within 30 days, except where we are required to retain certain information for legal or compliance purposes.\n\nYou can delete your account at any time from the Profile screen within the App.`,
  },
  {
    title: '7. Your Rights',
    body: `Depending on your location, you may have the following rights regarding your personal data:\n\n• Access: request a copy of the personal data we hold about you\n• Rectification: request that we correct inaccurate or incomplete data\n• Erasure: request that we delete your personal data ("right to be forgotten")\n• Restriction: request that we limit how we use your data\n• Portability: request your data in a structured, machine-readable format\n• Objection: object to our processing of your data in certain circumstances\n\nTo exercise any of these rights, please contact us at ${CONTACT_EMAIL}. We will respond within 30 days.`,
  },
  {
    title: '8. Cookies & Tracking Technologies',
    body: `The App uses limited tracking technologies to help us understand how users interact with the App, including anonymised analytics. We do not use cookies for advertising or cross-site tracking.\n\nWhere required by law, we will seek your consent before using any non-essential tracking technologies.`,
  },
  {
    title: '9. Push Notifications',
    body: `With your permission, we may send you push notifications to remind you of your planned task times and milestones. You can opt out of push notifications at any time through your device settings or within the App's Profile screen.\n\nWe do not use push notifications for marketing or promotional purposes without your explicit consent.`,
  },
  {
    title: '10. Children\'s Privacy',
    body: `The App is not directed to children under the age of 16. We do not knowingly collect personal information from anyone under 16.\n\nIf you believe a child under 16 has provided us with personal information, please contact us at ${CONTACT_EMAIL} and we will take steps to delete that information promptly.`,
  },
  {
    title: '11. Data Security',
    body: `We take appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, or destruction. These include encryption in transit, access controls, and regular security reviews.\n\nHowever, no method of transmission over the internet or electronic storage is completely secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee its absolute security.`,
  },
  {
    title: '12. International Transfers',
    body: `Your information may be transferred to and processed in countries other than the one in which you reside. If we transfer your data outside the UK or EEA, we ensure appropriate safeguards are in place (such as standard contractual clauses) in accordance with applicable data protection law.`,
  },
  {
    title: '13. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page and, where the changes are material, notify you via the App or by email.\n\nYour continued use of the App after any changes constitutes your acceptance of the revised Privacy Policy.`,
  },
  {
    title: '14. Contact Us',
    body: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:\n\n${CONTACT_EMAIL}\n\nThe Reinvention Edit\nthereinventionedit.com`,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();
  const scrollRef = useRef(null);

  const handleTermsOfService = () => {
    navigation.navigate('TermsOfService');
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
            <Text style={{ fontSize: 22, color: colors.ink }}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
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
          <Text style={styles.heroSub}>Privacy Policy</Text>
          <View style={styles.heroRule} />
          <Text style={styles.lastUpdated}>Last updated: {LAST_UPDATED}</Text>
        </View>

        {/* ── Intro ── */}
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            Your privacy matters to us. This policy explains what information we collect, how we use it, and the choices you have.
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
          <TouchableOpacity style={styles.footerLink} onPress={handleTermsOfService}>
            <Text style={styles.footerLinkText}>Terms of Service</Text>
            <Text style={styles.footerChevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.footerDivider} />
          <TouchableOpacity style={styles.footerLink} onPress={handleEmail}>
            <Text style={styles.footerLinkText}>{CONTACT_EMAIL}</Text>
            <Text style={styles.footerChevron}>›</Text>
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
  footerChevron: {
    fontSize: 18,
    color: colors.champagne,
    marginLeft: 'auto',
  },
  footerDivider: {
    height: 1,
    backgroundColor: colors.subtleBorder,
    marginHorizontal: spacing.xs,
  },
});