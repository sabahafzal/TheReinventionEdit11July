// WorkZoomLooksScreen.js
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows, tokens } from './theme';

// ─── Sub-components ────────────────────────────────────────────────────────────

const TipChip = ({ icon, title, body }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut} style={styles.chip}>
        <View style={styles.chipIconWrap}>
          <Text style={styles.chipIcon}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.chipTitle}>{title}</Text>
          <Text style={styles.chipBody}>{body}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const LookCard = ({ title, items }) => (
  <View style={styles.lookCard}>
    <Text style={styles.comboTitle}>{title}</Text>
    {items.map((item, idx) => (
      <View key={idx} style={styles.comboRow}>
        <View style={styles.comboDot} />
        <Text style={styles.comboItem}>{item}</Text>
      </View>
    ))}
  </View>
);

const CheckRow = ({ label, checked, onToggle }) => (
  <Pressable onPress={onToggle} style={styles.checkRow}>
    <Ionicons
      name={checked ? 'checkbox' : 'square-outline'}
      size={22}
      color={checked ? colors.dustyRose : colors.champagne}
      style={{ marginRight: 12 }}
    />
    <Text style={[styles.checkLabel, checked && styles.checkLabelDone]}>{label}</Text>
  </Pressable>
);

// ─── Section row — the minimal list item ───────────────────────────────────────

const SectionRow = ({ emoji, title, tag, onPress, isLast }) => (
  <Pressable
    onPress={onPress}
    style={[styles.sectionRow, !isLast && styles.sectionRowBorder]}
    android_ripple={{ color: colors.linen }}
  >
    <View style={styles.sectionDot} />
    <Text style={styles.sectionRowLabel}>{title}</Text>
    <View style={styles.sectionTag}>
      <Text style={styles.sectionTagText}>{tag}</Text>
    </View>
  </Pressable>
);

// ─── Expandable detail panel ───────────────────────────────────────────────────

const DetailPanel = ({ title, children, visible }) => {
  if (!visible) return null;
  return (
    <View style={styles.detailPanel}>
      <Text style={styles.detailTitle}>{title}</Text>
      {children}
    </View>
  );
};

// ─── Main screen ───────────────────────────────────────────────────────────────

const SECTIONS = [
  { key: 'quickwins',  emoji: '✨', label: 'Quick Wins',           tag: '4 tips'   },
  { key: 'lookbook',   emoji: '👗', label: 'Lookbook',             tag: '3 looks'  },
  { key: 'grooming',   emoji: '💄', label: 'Zoom-Ready Grooming',  tag: '3 tips'   },
  { key: 'protips',    emoji: '📝', label: 'Pro Tips Checklist',   tag: '3 items'  },
  { key: 'realtalk',   emoji: '💬', label: 'Real Talk',            tag: 'Bonus'    },
];

export default function WorkZoomLooksScreen() {
  const navigation = useNavigation();
  const [openSections, setOpenSections] = useState(new Set());

  // Checklist state
  const [tips, setTips] = useState([false, false, false]);
  const toggleTip = (i) => {
    const next = [...tips];
    next[i] = !next[i];
    setTips(next);
  };

  // Lookbook carousel state
  const looks = [
    { title: 'Classic Boss',       items: ['White shirt or blouse', 'Gold/silver hoop earrings', 'Hair pulled back'] },
    { title: 'Creative Pro',       items: ['Bright, fitted sweater', 'Fun scarf or chunky necklace', 'Statement glasses'] },
    { title: 'Effortlessly Chic',  items: ['Neutral tee + tailored blazer', 'Delicate pendant necklace', 'Soft, glowy makeup (optional)'] },
  ];
  const [lookIdx, setLookIdx] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  const animateTo = (nextIdx) => {
    Animated.sequence([
      Animated.timing(fade, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    setLookIdx(nextIdx);
  };

  const toggleSection = (key) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const openAll = () =>
    setOpenSections(new Set(SECTIONS.map((s) => s.key)));

  const copyHashtag = () => Alert.alert('Copied', '#WorkZoomLooks');

  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* Back */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={colors.bodyMuted} />
          </TouchableOpacity>
          <Text style={styles.backLabel}>Style Guide</Text>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>💻</Text>
          <Text style={styles.heroTitle}>Work Zoom Looks</Text>
          <Text style={styles.heroSub}>
            Show up polished for every remote meeting — no effort required.
          </Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={openAll}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>Start reading</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Section list */}
        <View style={styles.listWrap}>
          {SECTIONS.map((s, idx) => (
            <View key={s.key}>
              <SectionRow
                emoji={s.emoji}
                title={s.label}
                tag={s.tag}
                isLast={idx === SECTIONS.length - 1 && !openSections.has(s.key)}
                onPress={() => toggleSection(s.key)}
              />

              {/* ── Quick Wins ── */}
              {s.key === 'quickwins' && (
                <DetailPanel title="✨ Quick Wins for Every Zoom Call" visible={openSections.has('quickwins')}>
                  <TipChip icon="🧥" title="Light Layers"    body="Blazer, chic cardigan, or crisp shirt over a tee = instant polish." />
                  <TipChip icon="💎" title="Solid Colours"   body="Jewel tones, navy, and soft whites pop on camera." />
                  <TipChip icon="🧣" title="Neck Up Focus"   body="Collars, statement necklaces, scarves, or a bold lip do all the work." />
                  <TipChip icon="📺" title="Minimal Prints"  body="Subtle stripes are fine; busy patterns can be distracting." />
                </DetailPanel>
              )}

              {/* ── Lookbook ── */}
              {s.key === 'lookbook' && (
                <DetailPanel title="👗 Lookbook: 3 Easy Combos" visible={openSections.has('lookbook')}>
                  <View style={styles.lookbookRow}>
                    <TouchableOpacity
                      onPress={() => { if (lookIdx > 0) animateTo(lookIdx - 1); }}
                      disabled={lookIdx === 0}
                      style={[styles.navBtn, lookIdx === 0 && styles.navBtnDisabled]}
                    >
                      <Ionicons name="chevron-back" size={18} color={lookIdx === 0 ? colors.champagne : colors.deepRose} />
                    </TouchableOpacity>
                    <Animated.View style={{ flex: 1, minWidth: 0, opacity: fade, marginHorizontal: spacing.sm }}>
                      <LookCard title={looks[lookIdx].title} items={looks[lookIdx].items} />
                    </Animated.View>
                    <TouchableOpacity
                      onPress={() => { if (lookIdx < looks.length - 1) animateTo(lookIdx + 1); }}
                      disabled={lookIdx === looks.length - 1}
                      style={[styles.navBtn, lookIdx === looks.length - 1 && styles.navBtnDisabled]}
                    >
                      <Ionicons name="chevron-forward" size={18} color={lookIdx === looks.length - 1 ? colors.champagne : colors.deepRose} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.dotsRow}>
                    {looks.map((_, i) => (
                      <View key={i} style={[styles.dot, i === lookIdx && styles.dotActive]} />
                    ))}
                  </View>
                  <Text style={styles.carouselHint}>{lookIdx + 1} / {looks.length}</Text>
                </DetailPanel>
              )}

              {/* ── Grooming ── */}
              {s.key === 'grooming' && (
                <DetailPanel title="💄 Zoom-Ready Grooming" visible={openSections.has('grooming')}>
                  <Text style={styles.bullet}><Text style={styles.bold}>Face: </Text>Quick concealer + blush = instant energy.</Text>
                  <Text style={styles.bullet}><Text style={styles.bold}>Hair: </Text>Tame flyaways with water or dry shampoo. Headbands and clips = easy fix.</Text>
                  <Text style={styles.bullet}><Text style={styles.bold}>Lighting: </Text>Face a window or put a lamp behind your screen for a glow-up.</Text>
                </DetailPanel>
              )}

              {/* ── Pro Tips ── */}
              {s.key === 'protips' && (
                <DetailPanel title="📝 Pro Tips" visible={openSections.has('protips')}>
                  <CheckRow label="Test your camera before the call."                         checked={tips[0]} onToggle={() => toggleTip(0)} />
                  <CheckRow label="Keep a 'Zoom Top' near your desk for last-minute calls."   checked={tips[1]} onToggle={() => toggleTip(1)} />
                  <CheckRow label="Hydrate! It keeps your skin and energy fresh."             checked={tips[2]} onToggle={() => toggleTip(2)} />
                </DetailPanel>
              )}

              {/* ── Real Talk ── */}
              {s.key === 'realtalk' && (
                <DetailPanel title="💬 Real Talk" visible={openSections.has('realtalk')}>
                  <Text style={styles.bullet}>
                    Nobody expects perfection. Wear what makes you feel confident and if that's a hoodie and earrings, you do you.
                  </Text>
                  <Text style={[styles.bullet, { marginTop: spacing.sm }]}>
                    Snap your favourite Zoom look and tag us: <Text style={styles.bold}>#WorkZoomLooks</Text> 💼✨
                  </Text>
                  <TouchableOpacity style={styles.copyBtn} onPress={copyHashtag}>
                    <Ionicons name="copy-outline" size={15} color={colors.deepRose} />
                    <Text style={styles.copyBtnText}>Copy hashtag</Text>
                  </TouchableOpacity>
                </DetailPanel>
              )}
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  background: {
    flex: 1,
    backgroundColor: colors.warmWhite,
  },

  scrollContainer: {
    paddingBottom: spacing.xxxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.screenPaddingH,
    paddingTop: spacing.screenPaddingTop,
    marginBottom: spacing.xl,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: colors.linen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLabel: {
    ...typography.actionSub,
    color: colors.bodyMuted,
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.screenPaddingH,
    paddingBottom: spacing.xl,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  heroTitle: {
    ...typography.screenTitle,
    fontSize: 30,
    marginBottom: spacing.sm,
  },
  heroSub: {
    ...typography.bodyLarge,
    color: colors.bodyMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  ctaBtn: {
    ...tokens.buttonPrimary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: 13,
  },
  ctaBtnText: {
    ...typography.buttonPrimary,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.subtleBorder,
    marginHorizontal: spacing.screenPaddingH,
    marginBottom: spacing.md,
  },

  // Section list
  listWrap: {
    paddingHorizontal: spacing.screenPaddingH,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  sectionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
  },
  sectionDot: {
    width: 7,
    height: 7,
    borderRadius: radii.dot,
    backgroundColor: colors.dustyRose,
  },
  sectionRowLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.ink,
    letterSpacing: 0.1,
  },
  sectionTag: {
    backgroundColor: 'rgba(160,97,58,0.10)',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  sectionTagText: {
    ...typography.eyebrow,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.clay,
  },

  // Detail panel
  detailPanel: {
    backgroundColor: colors.offWhite,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.subtleBorder,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.md,
  },

  // Tip chips
  chip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  chipIconWrap: {
    ...tokens.actionIconBox,
    marginRight: spacing.sm,
  },
  chipIcon: { fontSize: 16 },
  chipTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.deepRose,
    marginBottom: 2,
  },
  chipBody: {
    ...typography.body,
    color: colors.bodyMuted,
  },

  // Lookbook
  lookbookRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    backgroundColor: colors.linen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: { opacity: 0.4 },
  lookCard: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    padding: spacing.md,
  },
  comboTitle: {
    fontFamily: 'serif',
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.deepRose,
    marginBottom: spacing.sm,
  },
  comboRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  comboDot: {
    width: 5,
    height: 5,
    borderRadius: radii.dot,
    backgroundColor: colors.dustyRose,
  },
  comboItem: {
    ...typography.body,
    color: colors.bodyMuted,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.fawn,
  },
  dotActive: {
    backgroundColor: colors.deepRose,
  },
  carouselHint: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: 5,
    color: colors.caption,
  },

  // Grooming bullets
  bullet: {
    ...typography.body,
    color: colors.bodyMuted,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
    color: colors.ink,
  },

  // Checklist
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  checkLabel: {
    ...typography.body,
    color: colors.bodyMuted,
    flex: 1,
  },
  checkLabelDone: {
    color: colors.champagne,
    textDecorationLine: 'line-through',
  },

  // Copy button
  copyBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.roseTint08,
    borderWidth: 1.5,
    borderColor: colors.roseTint18,
  },
  copyBtnText: {
    ...typography.badge,
    color: colors.deepRose,
    textTransform: 'none',
    letterSpacing: 0.3,
    fontSize: 12,
  },
});