// MinimalMakeupScreen.js
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
import { colors, typography, spacing, radii, tokens } from './theme';

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

const SectionRow = ({ title, tag, onPress, isLast }) => (
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

const DetailPanel = ({ title, children, visible }) => {
  if (!visible) return null;
  return (
    <View style={styles.detailPanel}>
      <Text style={styles.detailTitle}>{title}</Text>
      {children}
    </View>
  );
};

// ─── Screen config ─────────────────────────────────────────────────────────────

const SECTIONS = [
  { key: 'routine',  label: 'Step-by-Step Routine',  tag: '5 steps'  },
  { key: 'protips',  label: 'Pro Tips Checklist',     tag: '3 items'  },
  { key: 'realtalk', label: 'Real Talk',              tag: 'Bonus'    },
];

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function MinimalMakeupScreen() {
  const navigation = useNavigation();
  const [openSections, setOpenSections] = useState(new Set());

  const [tips, setTips] = useState([false, false, false]);
  const toggleTip = (i) => {
    const next = [...tips];
    next[i] = !next[i];
    setTips(next);
  };

  const toggleSection = (key) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const openAll = () =>
    setOpenSections(new Set(SECTIONS.map((s) => s.key)));

  const copyHashtag = () => Alert.alert('Copied', '#MinimalMakeupGlow');

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
          <Text style={styles.heroEmoji}>💄</Text>
          <Text style={styles.heroTitle}>Minimal Makeup</Text>
          <Text style={styles.heroSub}>
            A fresh, polished look in 5 minutes.Highlight your natural glow, effortlessly.
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
                title={s.label}
                tag={s.tag}
                isLast={idx === SECTIONS.length - 1 && !openSections.has(s.key)}
                onPress={() => toggleSection(s.key)}
              />

              {/* ── Step-by-Step Routine ── */}
              {s.key === 'routine' && (
                <DetailPanel title="🪞 Step-by-Step Routine" visible={openSections.has('routine')}>
                  <TipChip
                    icon="🫧"
                    title="Fresh Base"
                    body="Cleanse and moisturise. Add a BB cream or tinted moisturiser if needed."
                  />
                  <TipChip
                    icon="✨"
                    title="Conceal & Brighten"
                    body="Concealer under eyes and on blemishes. Optional: illuminating highlighter."
                  />
                  <TipChip
                    icon="👀"
                    title="Brows & Eyes"
                    body="Brush brows and fill in gaps. Curl lashes and add mascara for an instant lift."
                  />
                  <TipChip
                    icon="🌸"
                    title="Natural Flush"
                    body="Cream blush or a dab of lipstick on cheeks for a healthy glow."
                  />
                  <TipChip
                    icon="💋"
                    title="Lips"
                    body="Tinted balm, gloss, or nude lipstick; hydrated and effortless."
                  />
                </DetailPanel>
              )}

              {/* ── Pro Tips ── */}
              {s.key === 'protips' && (
                <DetailPanel title="📝 Pro Tips" visible={openSections.has('protips')}>
                  <CheckRow
                    label="Keep travel minis in your bag or at your desk."
                    checked={tips[0]}
                    onToggle={() => toggleTip(0)}
                  />
                  <CheckRow
                    label="Multi-use products save time. Try a cream stick for lips and cheeks."
                    checked={tips[1]}
                    onToggle={() => toggleTip(1)}
                  />
                  <CheckRow
                    label="Mist your face with setting spray or water for a natural finish."
                    checked={tips[2]}
                    onToggle={() => toggleTip(2)}
                  />
                </DetailPanel>
              )}

              {/* ── Real Talk ── */}
              {s.key === 'realtalk' && (
                <DetailPanel title="💬 Real Talk" visible={openSections.has('realtalk')}>
                  <Text style={styles.bullet}>
                    Minimal makeup = maximum confidence. Show up as you are, just a little brighter!
                  </Text>
                  <Text style={[styles.bullet, { marginTop: spacing.sm }]}>
                    Share your 5-minute makeup selfie and tag us:{' '}
                    <Text style={styles.bold}>#MinimalMakeupGlow</Text> 💖
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

  // Bullets
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
    fontSize: 12,
    fontWeight: '600',
    color: colors.deepRose,
    letterSpacing: 0.3,
  },
});