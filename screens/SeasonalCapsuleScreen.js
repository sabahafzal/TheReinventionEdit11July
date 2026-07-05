// SeasonalCapsuleScreen.js
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
import Svg, { Path, Rect, Line } from 'react-native-svg';
import { colors, typography, spacing, radii, tokens } from './theme';

// ─── Sub-components ────────────────────────────────────────────────────────────

const SkirtIcon = () => (
  <Svg width={20} height={28} viewBox="0 0 80 137">
    <Rect x="0" y="0" width="80" height="14" rx="3" fill="#C49A8A" />
    <Path d="M0 14 L-32 130 Q40 148 112 130 L80 14 Z" fill="#D4A899" />
    <Line x1="32" y1="14" x2="26" y2="130" stroke="#C49A8A" strokeWidth="1" opacity="0.6" />
    <Line x1="48" y1="14" x2="54" y2="130" stroke="#C49A8A" strokeWidth="1" opacity="0.6" />
  </Svg>
);

const Tile = ({ text, icon, svgIcon }) => (
  <View style={styles.tile}>
    {svgIcon ? <View style={styles.tileIcon}>{svgIcon}</View> : !!icon && <Text style={styles.tileIcon}>{icon}</Text>}
    <Text style={styles.tileText}>{text}</Text>
  </View>
);

const CapsuleGrid = ({ items }) => (
  <View style={styles.grid}>
    {items.map((it, i) => (
      <Tile
        key={`${it.text}-${i}`}
        text={it.text}
        icon={it.icon}
        svgIcon={it.svgIcon}
      />
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
  { key: 'spring',   label: 'Spring Capsule',           tag: '6 pieces' },
  { key: 'summer',   label: 'Summer Capsule',           tag: '6 pieces' },
  { key: 'autumn',   label: 'Autumn Capsule',           tag: '6 pieces' },
  { key: 'winter',   label: 'Winter Capsule',           tag: '6 pieces' },
  { key: 'howto',    label: 'How To Build Your Capsule', tag: '5 steps'  },
  { key: 'protips',  label: 'Pro Tips Checklist',       tag: '3 items'  },
  { key: 'realtalk', label: 'Real Talk',                tag: 'Bonus'    },
];

// ─── Seasonal data ─────────────────────────────────────────────────────────────

const SPRING_ITEMS = [
  { text: 'Light trench coat',      icon: '🧥' },
  { text: 'Soft knit sweaters',     icon: '🧶' },
  { text: 'Cropped denim / chinos', icon: '👖' },
  { text: 'Classic white trainers', icon: '👟' },
  { text: 'Floral blouse / tee',    icon: '🌸' },
  { text: 'Silk scarf for layering',icon: '🧣' },
];

const SUMMER_ITEMS = [
  { text: 'Breathable linen dress',   icon: '👗' },
  { text: 'Tailored shorts',          icon: '🩳' },
  { text: 'Lightweight button-up',    icon: '👚' },
  { text: 'Comfy sandals',            icon: '🩴' },
  { text: 'Straw hat or tote',        icon: '👒' },
  { text: 'Denim jacket (evenings)',  icon: '🧥' },
];

const AUTUMN_ITEMS = [
  { text: 'Wool blazer or coat',        icon: '🧥' },
  { text: 'Long-sleeve tees & knits',   icon: '👕' },
  { text: 'Dark denim / corduroy',      icon: '👖' },
  { text: 'Ankle boots',                icon: '👢' },
  { text: 'Chunky scarf',               icon: '🧣' },
  { text: 'Midi skirt for layering',    svgIcon: <SkirtIcon /> },
];

const WINTER_ITEMS = [
  { text: 'Tailored wool coat',     icon: '🧥' },
  { text: 'Cashmere / chunky knits',icon: '🧶' },
  { text: 'Thermal leggings',       icon: '🧦' },
  { text: 'Waterproof boots',       icon: '🥾' },
  { text: 'Beanie & gloves',        icon: '🧤' },
  { text: 'Layering turtleneck',    icon: '🧣' },
];

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function SeasonalCapsuleScreen() {
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

  const copyHashtag = () => Alert.alert('Copied', '#SeasonalCapsuleStyle');

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
          <Text style={styles.heroEmoji}>🧥</Text>
          <Text style={styles.heroTitle}>Seasonal Capsule</Text>
          <Text style={styles.heroSub}>
            Smart wardrobe planning for each season. Simplify your closet, elevate your style.
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

              {/* ── Spring ── */}
              {s.key === 'spring' && (
                <DetailPanel title="🌸 Spring Capsule" visible={openSections.has('spring')}>
                  <CapsuleGrid items={SPRING_ITEMS} />
                </DetailPanel>
              )}

              {/* ── Summer ── */}
              {s.key === 'summer' && (
                <DetailPanel title="☀️ Summer Capsule" visible={openSections.has('summer')}>
                  <CapsuleGrid items={SUMMER_ITEMS} />
                </DetailPanel>
              )}

              {/* ── Autumn ── */}
              {s.key === 'autumn' && (
                <DetailPanel title="🍁 Autumn Capsule" visible={openSections.has('autumn')}>
                  <CapsuleGrid items={AUTUMN_ITEMS} />
                </DetailPanel>
              )}

              {/* ── Winter ── */}
              {s.key === 'winter' && (
                <DetailPanel title="❄️ Winter Capsule" visible={openSections.has('winter')}>
                  <CapsuleGrid items={WINTER_ITEMS} />
                </DetailPanel>
              )}

              {/* ── How To Build ── */}
              {s.key === 'howto' && (
                <DetailPanel title="🛠️ How To Build Your Capsule" visible={openSections.has('howto')}>
                  <Text style={styles.bullet}>
                    1. <Text style={styles.bold}>Pick a colour palette</Text> for easy mixing. Think neutrals with 1–2 accent colours.
                  </Text>
                  <Text style={styles.bullet}>
                    2. <Text style={styles.bold}>Choose versatile basics</Text> you can wear on repeat.
                  </Text>
                  <Text style={styles.bullet}>
                    3. <Text style={styles.bold}>Add 2–3 statement pieces</Text> for personality each season.
                  </Text>
                  <Text style={styles.bullet}>
                    4. <Text style={styles.bold}>Swap out</Text> only what you need and donate or store the rest.
                  </Text>
                  <Text style={styles.bullet}>
                    5. <Text style={styles.bold}>Quality over quantity:</Text> invest in well-made staples.
                  </Text>
                </DetailPanel>
              )}

              {/* ── Pro Tips ── */}
              {s.key === 'protips' && (
                <DetailPanel title="📝 Pro Tips" visible={openSections.has('protips')}>
                  <CheckRow
                    label={`Try the "hanger test": hang everything you'll wear for the season at the front of your closet.`}
                    checked={tips[0]}
                    onToggle={() => toggleTip(0)}
                  />
                  <CheckRow
                    label="Photograph outfit combos to save time on busy mornings."
                    checked={tips[1]}
                    onToggle={() => toggleTip(1)}
                  />
                  <CheckRow
                    label="Accessories transform a capsule.Don't forget jewellery, scarves, and bags!"
                    checked={tips[2]}
                    onToggle={() => toggleTip(2)}
                  />
                </DetailPanel>
              )}

              {/* ── Real Talk ── */}
              {s.key === 'realtalk' && (
                <DetailPanel title="💬 Real Talk" visible={openSections.has('realtalk')}>
                  <Text style={styles.bullet}>
                    Capsule wardrobes aren't about restriction, they are about freedom. Less stress,
                    more style, and always seasonally chic.
                  </Text>
                  <Text style={[styles.bullet, { marginTop: spacing.sm }]}>
                    Share your capsule combos and tag us:{' '}
                    <Text style={styles.bold}>#SeasonalCapsuleStyle</Text> ✨
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

  // Capsule grid tiles
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  tile: {
    width: '50%',
    paddingHorizontal: 5,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  tileIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  tileText: {
    fontSize: 13,
    color: colors.bodyMuted,
    lineHeight: 18,
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
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
  },
  checkLabel: {
    ...typography.body,
    color: colors.bodyMuted,
    flex: 1,
    lineHeight: 20,
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