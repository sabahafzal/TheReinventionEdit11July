// screens/BrandVaultScreen.js
//
// Self-contained Personal Brand Vault screen.
// Drop into /screens/ — no changes to other files needed yet.
//
// Navigation wiring (when ready):
//   Add to your navigator:
//     <Stack.Screen name="BrandVault" component={BrandVaultScreen} options={{ headerShown: false }} />
//   Navigate to it from anywhere:
//     navigation.navigate('BrandVault')
//
// Dependencies (all already in your project):
//   react-navigation, @react-native-async-storage/async-storage,
//   expo-linear-gradient, @expo/vector-icons, expo-sharing,
//   theme.js, PremiumUpsellModal, paywall.js

import React, {
  useState, useCallback, useEffect, useRef,
} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Animated, SafeAreaView, StatusBar,
  Alert, Share, Clipboard, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography, spacing, radii, shadows, tokens } from './theme';
import { isProUser } from '../lib/paywall';
import PremiumUpsellModal from '../components/PremiumUpsellModal';

// ─── Storage keys ─────────────────────────────────────────────────────────────
const VAULT_KEY = (assetKey) => `brand_vault_${assetKey}`;
const SHARE_COUNT_KEY = (assetKey) => `brand_vault_shares_${assetKey}`;
const SHARE_DATE_KEY  = (assetKey) => `brand_vault_last_share_${assetKey}`;

// ─── Asset definitions ────────────────────────────────────────────────────────
// Each asset has a key, display metadata, and its editable fields.
const ASSET_GROUPS = [
  {
    group: 'Identity',
    assets: [
      {
        key:     'brand_story',
        symbol:  '✦',
        title:   'Brand story & bios',
        hint:    'Your arc, your "only I" statement, bios in three lengths',
        color:   colors.deepRose,
        tint:    colors.roseTint08,
        shareable: true,
        fields: [
          { key: 'one_liner',  label: 'One-liner', placeholder: 'e.g. AI & data consultant building tools at the intersection of brand and technology. 15–20 words.', multiline: false, hint: 'For social profiles and introductions' },
          { key: 'short_bio',  label: 'Short bio', placeholder: 'Write your short bio here (50–75 words). Who you are, where you came from, what you\'re building.', multiline: true, hint: 'For speaker profiles and event listings' },
          { key: 'long_bio',   label: 'Long bio', placeholder: 'Write your long bio here (150–200 words) in third person. Cover your current focus, your most relevant past chapter, your "only I" statement, and one human detail.', multiline: true, hint: 'For press and LinkedIn' },
          { key: 'only_i',     label: '"Only I" statement', placeholder: 'e.g. I\'m the only person who ran a fashion PR agency, holds a data & AI master\'s, and has shipped a mobile app.', multiline: true, hint: 'Your positioning anchor' },
          { key: 'pillars',    label: 'Brand pillars', placeholder: 'List your 3 brand pillars — the topics you want to be known for. One per line.', multiline: true, hint: 'The filter for everything you create' },
        ],
      },
      {
        key:     'linkedin',
        symbol:  '◎',
        title:   'LinkedIn copy',
        hint:    'Headline, About section, Featured copy — ready to paste',
        color:   colors.clay,
        tint:    'rgba(160,97,58,0.08)',
        shareable: false,
        fields: [
          { key: 'headline',  label: 'Headline', placeholder: 'e.g. AI & Data Consultant | Helping teams turn data into decisions | Building @TheReinventionEdit', multiline: false, hint: 'Keep under 220 characters' },
          { key: 'about',     label: 'About section', placeholder: 'Write your LinkedIn About section here (200–300 words). Start with a hook — the first two lines appear before "see more."', multiline: true, hint: 'Written in first person, using your brand voice' },
          { key: 'featured',  label: 'Featured section notes', placeholder: 'Note what you\'re pinning and why — App Store link, key post, portfolio piece.', multiline: true, hint: 'Prime real estate — use it intentionally' },
        ],
      },
    ],
  },
  {
    group: 'Media',
    assets: [
      {
        key:     'press_kit',
        symbol:  '◈',
        title:   'Press kit',
        hint:    'Bios, talking points, headshot link — shareable in one tap',
        color:   colors.sage,
        tint:    'rgba(90,115,88,0.08)',
        shareable: true,
        fields: [
          { key: 'talking_points', label: 'Talking points', placeholder: 'List your 5–7 specific talking points. Each should follow: [Counterintuitive insight] + [Who it\'s for] + [Why now]. One per line.', multiline: true, hint: 'Specific angles get bookings — vague topics don\'t' },
          { key: 'headshot_url',   label: 'Headshot link', placeholder: 'Paste your headshot link here (Google Drive, Dropbox, etc. set to public).', multiline: false, hint: 'Minimum 1MB / 1000px wide' },
          { key: 'media_history',  label: 'Previous features & appearances', placeholder: 'List any previous press mentions, podcast appearances, or speaking credits. If none yet, leave blank — this section fills over time.', multiline: true, hint: 'Builds over time with every pitch you send' },
          { key: 'contact',        label: 'Press contact details', placeholder: 'Your professional email and LinkedIn URL — what you\'d give a journalist.', multiline: false, hint: 'Keep separate from personal accounts' },
        ],
      },
      {
        key:     'speaker_profile',
        symbol:  '◉',
        title:   'Speaker one-pager',
        hint:    'One-page PDF for event applications and panel submissions',
        color:   '#7a5c35',
        tint:    'rgba(122,92,53,0.08)',
        shareable: true,
        fields: [
          { key: 'speaker_intro', label: 'Speaker intro (one paragraph)', placeholder: 'A sharp paragraph about who you are as a speaker — your background, your style, why audiences connect with you.', multiline: true, hint: 'Written in third person for event programmes' },
          { key: 'topics',        label: 'Talk topics (3 options)', placeholder: 'List 3 talk topics with a 1-sentence description each. Specific is better than broad.', multiline: true, hint: 'Give organisers options — they\'ll pick what fits their audience' },
          { key: 'social_proof',  label: 'Credentials & social proof', placeholder: 'Your key credentials — app in the App Store, master\'s degree, agency background, notable clients or companies.', multiline: true, hint: 'What makes you credible for this topic' },
        ],
      },
    ],
  },
  {
    group: 'Content',
    assets: [
      {
        key:     'content_calendar',
        symbol:  '✷',
        title:   'Content calendar',
        hint:    '4-week plan · 12 posts · rotate 3 post types',
        color:   '#3a5c6e',
        tint:    'rgba(58,92,110,0.08)',
        shareable: false,
        fields: [
          { key: 'platform',      label: 'Platform focus', placeholder: 'Which platform are you focusing on first? (LinkedIn, Instagram, Substack, etc.) And why?', multiline: false, hint: 'One platform done well beats three done badly' },
          { key: 'post_types',    label: 'Your 3 post types', placeholder: 'Describe your 3 rotating post types with one example each:\n1. Perspective post —\n2. Behind the scenes —\n3. Insight post —', multiline: true, hint: 'Rotate these rather than defaulting to whichever feels easiest' },
          { key: 'week1',         label: 'Week 1 posts', placeholder: 'List 3 post ideas for week 1. Just headline + post type is enough to start.', multiline: true, hint: '' },
          { key: 'week2',         label: 'Week 2 posts', placeholder: 'List 3 post ideas for week 2.', multiline: true, hint: '' },
          { key: 'week3',         label: 'Week 3 posts', placeholder: 'List 3 post ideas for week 3.', multiline: true, hint: '' },
          { key: 'week4',         label: 'Week 4 posts', placeholder: 'List 3 post ideas for week 4.', multiline: true, hint: '' },
          { key: 'content_bank',  label: 'Content bank (ongoing ideas)', placeholder: 'Drop ideas here as they come. One line each, just enough to remember the spark.', multiline: true, hint: 'Add 2–3 ideas every Sunday evening' },
        ],
      },
      {
        key:     'pitch_templates',
        symbol:  '⬡',
        title:   'Pitch template library',
        hint:    'Podcast & speaking pitches — ready to customise and send',
        color:   colors.deepRose,
        tint:    colors.roseTint08,
        shareable: false,
        fields: [
          { key: 'podcast_pitch', label: 'Podcast pitch template', placeholder: 'Write your podcast pitch template here with [BRACKETS] for the parts you\'ll customise per show.\n\nKeep it under 150 words. Subject line formula: "Guest pitch: [Your specific angle]"', multiline: true, hint: 'Specific to each show — always reference a recent episode' },
          { key: 'speaking_pitch', label: 'Speaking / event pitch', placeholder: 'Write your speaking pitch template here — for event organisers and conference submissions.\n\nInclude: who you are (one line), your talk topic, why it\'s right for their audience, your speaker profile link.', multiline: true, hint: 'Smaller events are easier to break into first' },
          { key: 'targets',       label: 'Pitch target list', placeholder: 'List your target podcasts and events. Format:\nName | Host/Organiser | Topic alignment | Status\n\nTrack: Date sent | Followed up | Response', multiline: true, hint: 'Follow up once after 10–14 days — one follow-up is professional' },
        ],
      },
    ],
  },
];

// Flat list for easy lookup
const ALL_ASSETS = ASSET_GROUPS.flatMap(g => g.assets);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatus = (data) => {
  if (!data || Object.keys(data).length === 0) return 'empty';
  const values = Object.values(data).filter(v => v && v.trim().length > 0);
  if (values.length === 0) return 'empty';
  const asset = ALL_ASSETS.find(a => a.fields && a.fields.length > 0);
  return values.length >= 2 ? 'ready' : 'draft';
};

const getAssetStatus = (assetKey, data) => {
  if (!data || Object.keys(data).length === 0) return 'empty';
  const assetDef = ALL_ASSETS.find(a => a.key === assetKey);
  if (!assetDef) return 'empty';
  const filled = assetDef.fields.filter(f => data[f.key] && data[f.key].trim().length > 10);
  if (filled.length === 0) return 'empty';
  if (filled.length < Math.ceil(assetDef.fields.length / 2)) return 'draft';
  return 'ready';
};

const relativeTime = (isoString) => {
  if (!isoString) return null;
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)}w ago`;
};

const StatusPill = ({ status }) => {
  const cfg = {
    ready: { label: 'Ready',       bg: 'rgba(90,115,88,0.10)',   border: 'rgba(90,115,88,0.28)',   color: colors.sage },
    draft: { label: 'Draft',       bg: 'rgba(160,97,58,0.10)',   border: 'rgba(160,97,58,0.28)',   color: colors.clay },
    empty: { label: 'Not started', bg: 'rgba(30,21,14,0.05)',    border: 'rgba(30,21,14,0.14)',    color: colors.caption },
  }[status] || {};
  return (
    <View style={[s.pill, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[s.pillText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

// ─── Edit modal ───────────────────────────────────────────────────────────────

function EditModal({ asset, data, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...data });

  const handleChange = (fieldKey, val) => setDraft(prev => ({ ...prev, [fieldKey]: val }));

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.warmWhite }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <SafeAreaView>
          <View style={s.editHeader}>
            <TouchableOpacity onPress={onClose} style={s.editHeaderBtn}>
              <Text style={s.editCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={s.editHeaderTitle} numberOfLines={1}>{asset.title}</Text>
            <TouchableOpacity onPress={handleSave} style={s.editHeaderBtn}>
              <Text style={s.editSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.editBody}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Asset eyebrow */}
          <View style={[s.editEyebrowBox, { backgroundColor: asset.tint }]}>
            <Text style={[s.editSymbol, { color: asset.color }]}>{asset.symbol}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.editAssetTitle, { color: asset.color }]}>{asset.title}</Text>
              <Text style={s.editAssetHint}>{asset.hint}</Text>
            </View>
          </View>

          {/* Fields */}
          {asset.fields.map((field, i) => (
            <View key={field.key} style={s.fieldWrap}>
              <Text style={s.fieldLabel}>{field.label}</Text>
              {field.hint ? <Text style={s.fieldHint}>{field.hint}</Text> : null}
              <TextInput
                style={[s.fieldInput, field.multiline && s.fieldInputMulti]}
                value={draft[field.key] || ''}
                onChangeText={(v) => handleChange(field.key, v)}
                placeholder={field.placeholder}
                placeholderTextColor={colors.champagne}
                multiline={field.multiline}
                numberOfLines={field.multiline ? 6 : 1}
                autoCapitalize="sentences"
                returnKeyType={field.multiline ? 'default' : 'next'}
                scrollEnabled={false}
              />
            </View>
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Share modal ──────────────────────────────────────────────────────────────

function ShareModal({ asset, shareCount, lastShared, onShare, onClose }) {
  const fakeLink = `re-edit.app/brand/${asset.key.replace('_', '-')}`;

  const handleCopy = () => {
    Clipboard.setString(fakeLink);
    Alert.alert('Link copied', 'Paste it into any email, pitch, or message.');
  };

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: `View my ${asset.title}: https://${fakeLink}`,
        url: `https://${fakeLink}`,
      });
      onShare();
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />

          {/* Title */}
          <View style={s.modalHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.modalEyebrow}>Share your asset</Text>
              <Text style={s.modalTitle}>{asset.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={20} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <View style={s.divider} />

          {/* Shareable link */}
          <Text style={s.shareLabel}>Your shareable link</Text>
          <TouchableOpacity style={s.shareLinkBox} onPress={handleCopy} activeOpacity={0.8}>
            <Text style={s.shareLinkText} numberOfLines={1}>{fakeLink}</Text>
            <Text style={s.shareLinkCopy}>Copy</Text>
          </TouchableOpacity>

          {/* Share options */}
          <Text style={[s.shareLabel, { marginTop: spacing.lg }]}>Share to</Text>

          {[
            { icon: 'copy-outline',         label: 'Copy link',        sub: 'Paste into any email or message',        onPress: handleCopy },
            { icon: 'share-outline',         label: 'Share via…',       sub: 'Messages, WhatsApp, email, and more',    onPress: handleNativeShare },
            { icon: 'eye-outline',           label: 'Preview live link', sub: 'See exactly what the recipient sees',   onPress: () => Alert.alert('Preview', `https://${fakeLink}`) },
            { icon: 'download-outline',      label: 'Export as PDF',     sub: 'Download to your files or camera roll', onPress: () => Alert.alert('Export', 'PDF export coming soon.') },
          ].map((opt, i) => (
            <TouchableOpacity key={i} style={s.shareOption} onPress={opt.onPress} activeOpacity={0.8}>
              <View style={s.shareOptionIcon}>
                <Ionicons name={opt.icon} size={18} color={colors.clay} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.shareOptionLabel}>{opt.label}</Text>
                <Text style={s.shareOptionSub}>{opt.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={colors.champagne} />
            </TouchableOpacity>
          ))}

          {/* Activity */}
          {shareCount > 0 && (
            <View style={s.activityBox}>
              <Ionicons name="pulse-outline" size={13} color={colors.sage} />
              <Text style={s.activityText}>
                Shared {shareCount} time{shareCount !== 1 ? 's' : ''}
                {lastShared ? ` · last ${relativeTime(lastShared)}` : ''}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Asset card ───────────────────────────────────────────────────────────────

function AssetCard({ asset, data, shareCount, lastShared, onEdit, onShare }) {
  const status = getAssetStatus(asset.key, data);
  const isEmpty = status === 'empty';

  const firstFilledField = asset.fields.find(f => data?.[f.key]?.trim().length > 5);
  const preview = firstFilledField ? data[firstFilledField.key] : null;

  return (
    <View style={[s.assetCard, isEmpty && s.assetCardEmpty]}>
      <View style={s.assetTop}>
        <View style={[s.assetIconBox, { backgroundColor: asset.tint }]}>
          <Text style={[s.assetSymbol, { color: asset.color }]}>{asset.symbol}</Text>
        </View>
        <View style={s.assetMeta}>
          <Text style={[s.assetTitle, isEmpty && s.assetTitleEmpty]}>{asset.title}</Text>
          <Text style={s.assetHint} numberOfLines={1}>{asset.hint}</Text>
          <View style={s.assetPillRow}>
            <StatusPill status={status} />
            {asset.shareable && status === 'ready' && (
              <View style={s.pill}>
                <Ionicons name="link-outline" size={10} color={colors.caption} style={{ marginRight: 3 }} />
                <Text style={[s.pillText, { color: colors.caption }]}>Shareable</Text>
              </View>
            )}
            {shareCount > 0 && (
              <View style={s.pill}>
                <Text style={[s.pillText, { color: colors.caption }]}>Shared {shareCount}×</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Preview snippet */}
      {preview && (
        <Text style={s.assetPreview} numberOfLines={2}>{preview}</Text>
      )}

      {/* Actions */}
      <View style={s.assetActions}>
        <TouchableOpacity
          style={[s.assetBtn, !isEmpty && s.assetBtnSecondary]}
          onPress={onEdit}
          activeOpacity={0.8}
        >
          <Text style={[s.assetBtnText, !isEmpty && s.assetBtnTextSecondary]}>
            {isEmpty ? 'Start building' : 'Edit'}
          </Text>
        </TouchableOpacity>

        {!isEmpty && (
          <TouchableOpacity style={s.assetBtn} onPress={onEdit} activeOpacity={0.8}>
            <Text style={s.assetBtnText}>Preview</Text>
          </TouchableOpacity>
        )}

        {asset.shareable && !isEmpty && (
          <TouchableOpacity
            style={[s.assetBtn, s.assetBtnPrimary]}
            onPress={onShare}
            activeOpacity={0.85}
          >
            <Ionicons name="share-outline" size={13} color={colors.warmWhite} style={{ marginRight: 4 }} />
            <Text style={[s.assetBtnText, s.assetBtnTextPrimary]}>Share link</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function BrandVaultScreen() {
  const navigation = useNavigation();

  const [loading, setLoading]         = useState(true);
  const [isPro, setIsPro]             = useState(false);
  const [showUpsell, setShowUpsell]   = useState(false);
  const [assetData, setAssetData]     = useState({});   // { [assetKey]: { fieldKey: value } }
  const [shareCounts, setShareCounts] = useState({});   // { [assetKey]: number }
  const [shareDates, setShareDates]   = useState({});   // { [assetKey]: isoString }
  const [filter, setFilter]           = useState('all');
  const [editingAsset, setEditingAsset] = useState(null);
  const [sharingAsset, setSharingAsset] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const pro = await isProUser();
      setIsPro(pro);

      const dataKeys   = ALL_ASSETS.map(a => VAULT_KEY(a.key));
      const countKeys  = ALL_ASSETS.map(a => SHARE_COUNT_KEY(a.key));
      const dateKeys   = ALL_ASSETS.map(a => SHARE_DATE_KEY(a.key));

      const [dataRows, countRows, dateRows] = await Promise.all([
        AsyncStorage.multiGet(dataKeys),
        AsyncStorage.multiGet(countKeys),
        AsyncStorage.multiGet(dateKeys),
      ]);

      const data = {};
      dataRows.forEach(([k, v]) => {
        const assetKey = k.replace('brand_vault_', '');
        data[assetKey] = v ? JSON.parse(v) : {};
      });

      const counts = {};
      countRows.forEach(([k, v]) => {
        const assetKey = k.replace('brand_vault_shares_', '');
        counts[assetKey] = v ? parseInt(v, 10) : 0;
      });

      const dates = {};
      dateRows.forEach(([k, v]) => {
        const assetKey = k.replace('brand_vault_last_share_', '');
        dates[assetKey] = v || null;
      });

      setAssetData(data);
      setShareCounts(counts);
      setShareDates(dates);
    } catch (e) {
      console.warn('BrandVaultScreen loadData error:', e);
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 320, useNativeDriver: true }).start();
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  // ── Save asset ────────────────────────────────────────────────────────────
  const handleSaveAsset = async (assetKey, draft) => {
    try {
      await AsyncStorage.setItem(VAULT_KEY(assetKey), JSON.stringify(draft));
      setAssetData(prev => ({ ...prev, [assetKey]: draft }));
    } catch (e) {
      console.warn('BrandVaultScreen save error:', e);
    }
  };

  // ── Record share ──────────────────────────────────────────────────────────
  const handleShare = async (assetKey) => {
    try {
      const prev  = shareCounts[assetKey] || 0;
      const next  = prev + 1;
      const now   = new Date().toISOString();
      await AsyncStorage.setItem(SHARE_COUNT_KEY(assetKey), String(next));
      await AsyncStorage.setItem(SHARE_DATE_KEY(assetKey), now);
      setShareCounts(c => ({ ...c, [assetKey]: next }));
      setShareDates(d => ({ ...d, [assetKey]: now }));
    } catch (e) {
      console.warn('BrandVaultScreen share record error:', e);
    }
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const readyCount   = ALL_ASSETS.filter(a => getAssetStatus(a.key, assetData[a.key]) === 'ready').length;
  const draftCount   = ALL_ASSETS.filter(a => getAssetStatus(a.key, assetData[a.key]) === 'draft').length;
  const totalShares  = Object.values(shareCounts).reduce((s, n) => s + n, 0);

  // ── Filter ────────────────────────────────────────────────────────────────
  const FILTERS = ['all', 'ready', 'draft', 'empty'];
  const filteredGroups = ASSET_GROUPS.map(g => ({
    ...g,
    assets: g.assets.filter(a => {
      if (filter === 'all') return true;
      return getAssetStatus(a.key, assetData[a.key]) === filter;
    }),
  })).filter(g => g.assets.length > 0);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={s.loadingWrap}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={colors.dustyRose} />
        <Text style={s.loadingText}>Opening your vault…</Text>
      </View>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <StatusBar barStyle="light-content" />

      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        <ScrollView
          style={s.bg}
          contentContainerStyle={s.container}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero ──────────────────────────────────────────────────────── */}
          <LinearGradient
            colors={['#2b1515', '#7a3535']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.hero}
          >
            <SafeAreaView>
              <TouchableOpacity
                style={s.backBtn}
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="chevron-back" size={18} color="rgba(250,247,242,0.65)" />
                <Text style={s.backText}>Back</Text>
              </TouchableOpacity>

              <View style={s.heroBadge}>
                <Text style={s.heroBadgeText}>PREMIUM · PERSONAL BRAND</Text>
              </View>

              <Text style={s.heroTitle}>Brand Vault</Text>
              <Text style={s.heroSub}>
                Your brand assets — built, stored, and ready to share in one tap.
              </Text>

              {/* Stats row */}
              <View style={s.statsRow}>
                <View style={s.statItem}>
                  <Text style={s.statVal}>{readyCount}</Text>
                  <Text style={s.statLabel}>ready</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statItem}>
                  <Text style={s.statVal}>{draftCount}</Text>
                  <Text style={s.statLabel}>in progress</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statItem}>
                  <Text style={s.statVal}>{totalShares}</Text>
                  <Text style={s.statLabel}>times shared</Text>
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>

          {/* ── Free gate ─────────────────────────────────────────────────── */}
          {!isPro && (
            <View style={s.gateWrap}>
              <View style={s.gateCard}>
                <View style={s.gateIconBox}>
                  <Text style={s.gateIconSymbol}>◈</Text>
                </View>
                <Text style={s.gateTitle}>Unlock the Brand Vault</Text>
                <Text style={s.gateBody}>
                  Build your brand story, press kit, LinkedIn copy, content calendar, and pitch templates — all stored in one place and shareable as a link.
                </Text>

                {[
                  'Six brand assets — built and stored in the app',
                  'Shareable links for your press kit and bios',
                  'Track how many times your assets are viewed',
                ].map((line, i) => (
                  <View key={i} style={s.gateFeatureRow}>
                    <Ionicons name="checkmark" size={14} color={colors.sage} />
                    <Text style={s.gateFeatureText}>{line}</Text>
                  </View>
                ))}

                <TouchableOpacity
                  style={[tokens.buttonPrimary, { marginTop: spacing.lg }]}
                  onPress={() => setShowUpsell(true)}
                  activeOpacity={0.85}
                >
                  <Text style={s.ctaText}>Unlock Premium</Text>
                </TouchableOpacity>
                <Text style={s.gateNote}>7-day free trial · Cancel any time</Text>
              </View>
            </View>
          )}

          {/* ── Filter tabs ───────────────────────────────────────────────── */}
          {isPro && (
            <View style={s.filterWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
                {FILTERS.map(f => (
                  <TouchableOpacity
                    key={f}
                    style={[s.filterTab, filter === f && s.filterTabActive]}
                    onPress={() => setFilter(f)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.filterTabText, filter === f && s.filterTabTextActive]}>
                      {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Asset groups ──────────────────────────────────────────────── */}
          {isPro && (
            <View style={s.assetsWrap}>
              {filteredGroups.length === 0 ? (
                <View style={s.emptyState}>
                  <Text style={s.emptyStateText}>No assets match this filter yet.</Text>
                </View>
              ) : (
                filteredGroups.map(group => (
                  <View key={group.group} style={s.group}>
                    <View style={s.eyebrowRow}>
                      <Text style={s.eyebrow}>{group.group}</Text>
                      <View style={s.eyebrowRule} />
                    </View>
                    {group.assets.map(asset => (
                      <AssetCard
                        key={asset.key}
                        asset={asset}
                        data={assetData[asset.key] || {}}
                        shareCount={shareCounts[asset.key] || 0}
                        lastShared={shareDates[asset.key]}
                        onEdit={() => setEditingAsset(asset)}
                        onShare={() => setSharingAsset(asset)}
                      />
                    ))}
                  </View>
                ))
              )}
            </View>
          )}

          {/* ── Locked asset previews for free users ─────────────────────── */}
          {!isPro && (
            <View style={s.assetsWrap}>
              {ASSET_GROUPS.map(group => (
                <View key={group.group} style={s.group}>
                  <View style={s.eyebrowRow}>
                    <Text style={s.eyebrow}>{group.group}</Text>
                    <View style={s.eyebrowRule} />
                  </View>
                  {group.assets.map(asset => (
                    <TouchableOpacity
                      key={asset.key}
                      style={[s.assetCard, s.assetCardLocked]}
                      onPress={() => setShowUpsell(true)}
                      activeOpacity={0.85}
                    >
                      <View style={s.assetTop}>
                        <View style={[s.assetIconBox, { backgroundColor: asset.tint, opacity: 0.5 }]}>
                          <Text style={[s.assetSymbol, { color: asset.color }]}>{asset.symbol}</Text>
                        </View>
                        <View style={s.assetMeta}>
                          <Text style={[s.assetTitle, { color: colors.champagne }]}>{asset.title}</Text>
                          <Text style={s.assetHint}>{asset.hint}</Text>
                        </View>
                        <Ionicons name="lock-closed" size={15} color={colors.champagne} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          )}

          <View style={{ height: spacing.xxxl + 20 }} />
        </ScrollView>
      </Animated.View>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {editingAsset && (
        <EditModal
          asset={editingAsset}
          data={assetData[editingAsset.key] || {}}
          onSave={(draft) => handleSaveAsset(editingAsset.key, draft)}
          onClose={() => setEditingAsset(null)}
        />
      )}

      {sharingAsset && (
        <ShareModal
          asset={sharingAsset}
          shareCount={shareCounts[sharingAsset.key] || 0}
          lastShared={shareDates[sharingAsset.key]}
          onShare={() => handleShare(sharingAsset.key)}
          onClose={() => setSharingAsset(null)}
        />
      )}

      <PremiumUpsellModal
        visible={showUpsell}
        onClose={() => setShowUpsell(false)}
        onSuccess={() => { setShowUpsell(false); loadData(); }}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  bg:          { flex: 1, backgroundColor: colors.offWhite },
  container:   { paddingBottom: spacing.xxxl },
  loadingWrap: { flex: 1, backgroundColor: colors.warmWhite, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...typography.caption, marginTop: spacing.sm, color: colors.caption },

  // ── Hero ────────────────────────────────────────────────────────────────────
  hero: { paddingHorizontal: spacing.screenPaddingH, paddingBottom: spacing.xl },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: spacing.lg, marginTop: spacing.sm, alignSelf: 'flex-start' },
  backText: { fontSize: 14, color: 'rgba(250,247,242,0.65)' },
  heroBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(250,247,242,0.12)', borderRadius: radii.pill, borderWidth: 1, borderColor: 'rgba(250,247,242,0.20)', paddingHorizontal: spacing.md, paddingVertical: 3, marginBottom: spacing.md },
  heroBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 2.5, color: 'rgba(250,247,242,0.65)' },
  heroTitle: { fontFamily: typography.fontDisplay, fontSize: 34, fontWeight: '400', color: colors.warmWhite, marginBottom: spacing.xs },
  heroSub: { fontSize: 13, color: 'rgba(250,247,242,0.55)', lineHeight: 20, marginBottom: spacing.xl },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  statItem: { alignItems: 'center' },
  statVal: { fontFamily: typography.fontDisplay, fontSize: 26, fontWeight: '400', color: colors.warmWhite, lineHeight: 30 },
  statLabel: { fontSize: 10, color: 'rgba(250,247,242,0.45)', marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(250,247,242,0.15)' },

  // ── Gate ────────────────────────────────────────────────────────────────────
  gateWrap: { paddingHorizontal: spacing.screenPaddingH, marginTop: spacing.xl },
  gateCard: { ...tokens.infoCard, padding: spacing.xl },
  gateIconBox: { width: 44, height: 44, borderRadius: radii.sm, backgroundColor: colors.roseTint08, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  gateIconSymbol: { fontSize: 20, color: colors.deepRose },
  gateTitle: { fontFamily: typography.fontDisplay, fontSize: 20, fontWeight: '400', color: colors.ink, marginBottom: spacing.sm },
  gateBody: { ...typography.body, color: colors.bodyMuted, lineHeight: 22, marginBottom: spacing.lg },
  gateFeatureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.xs },
  gateFeatureText: { ...typography.body, color: colors.bodyLight, flex: 1 },
  gateNote: { ...typography.caption, textAlign: 'center', marginTop: spacing.md, color: colors.caption },
  ctaText: { ...typography.buttonPrimary, color: colors.warmWhite },

  // ── Filters ──────────────────────────────────────────────────────────────────
  filterWrap: { paddingTop: spacing.lg },
  filterRow: { paddingHorizontal: spacing.screenPaddingH, gap: spacing.sm, paddingBottom: spacing.xs },
  filterTab: { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.softBorder, backgroundColor: colors.warmWhite },
  filterTabActive: { backgroundColor: colors.deepRose, borderColor: colors.deepRose },
  filterTabText: { fontSize: 12, fontWeight: '500', color: colors.bodyMuted },
  filterTabTextActive: { color: colors.warmWhite },

  // ── Asset groups ─────────────────────────────────────────────────────────────
  assetsWrap: { paddingHorizontal: spacing.screenPaddingH, marginTop: spacing.xl },
  group: { marginBottom: spacing.xl },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  eyebrow: { ...typography.eyebrow },
  eyebrowRule: { flex: 1, height: 1, backgroundColor: colors.clayRule },
  emptyState: { paddingVertical: spacing.xl, alignItems: 'center' },
  emptyStateText: { ...typography.body, color: colors.caption },

  // ── Asset card ───────────────────────────────────────────────────────────────
  assetCard: { ...tokens.infoCard, ...shadows.card, padding: spacing.lg, marginBottom: spacing.md },
  assetCardEmpty: { backgroundColor: 'rgba(255,255,255,0.55)', borderStyle: 'dashed', borderColor: colors.fawn },
  assetCardLocked: { opacity: 0.65 },
  assetTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.sm },
  assetIconBox: { width: 36, height: 36, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  assetSymbol: { fontSize: 16 },
  assetMeta: { flex: 1, minWidth: 0 },
  assetTitle: { ...typography.actionLabel, fontSize: 14, color: colors.ink, marginBottom: 2 },
  assetTitleEmpty: { color: colors.bodyMuted },
  assetHint: { ...typography.actionSub, color: colors.caption, marginBottom: spacing.xs },
  assetPillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  assetPreview: { fontSize: 12, color: colors.bodyMuted, lineHeight: 18, fontStyle: 'italic', marginBottom: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.subtleBorder },
  assetActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  assetBtn: { flex: 1, paddingVertical: 8, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.softBorder, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 },
  assetBtnSecondary: { backgroundColor: colors.offWhite },
  assetBtnPrimary: { backgroundColor: colors.deepRose, borderColor: colors.deepRose },
  assetBtnText: { fontSize: 11, fontWeight: '500', color: colors.bodyMuted },
  assetBtnTextSecondary: { color: colors.ink },
  assetBtnTextPrimary: { color: colors.warmWhite },

  // ── Pills ─────────────────────────────────────────────────────────────────────
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill, borderWidth: 1 },
  pillText: { fontSize: 10, fontWeight: '600' },

  // ── Share modal ───────────────────────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: colors.overlayDark, justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.warmWhite, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl, padding: spacing.xl, paddingBottom: spacing.xxxl + 8, borderWidth: 1, borderColor: colors.softBorder, borderBottomWidth: 0 },
  modalHandle: { width: 36, height: 4, backgroundColor: colors.fawn, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.lg },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.sm },
  modalEyebrow: { ...typography.eyebrow, marginBottom: 4 },
  modalTitle: { fontFamily: typography.fontDisplay, fontSize: 20, fontWeight: '400', color: colors.ink },
  divider: { height: 1, backgroundColor: colors.subtleBorder, marginVertical: spacing.lg },
  shareLabel: { ...typography.eyebrow, marginBottom: spacing.sm },
  shareLinkBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.offWhite, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.softBorder, padding: spacing.md, marginBottom: spacing.sm },
  shareLinkText: { fontSize: 12, color: colors.bodyMuted, fontFamily: 'Courier New', flex: 1, marginRight: spacing.sm },
  shareLinkCopy: { fontSize: 12, fontWeight: '600', color: colors.deepRose },
  shareOption: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.subtleBorder },
  shareOptionIcon: { width: 36, height: 36, borderRadius: radii.sm, backgroundColor: colors.linen, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  shareOptionLabel: { ...typography.actionLabel, color: colors.ink, marginBottom: 2 },
  shareOptionSub: { ...typography.actionSub, color: colors.caption },
  activityBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: 'rgba(90,115,88,0.08)', borderRadius: radii.md, padding: spacing.md, marginTop: spacing.lg },
  activityText: { fontSize: 12, color: colors.sage, flex: 1 },

  // ── Edit modal ────────────────────────────────────────────────────────────────
  editHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.screenPaddingH, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.subtleBorder, backgroundColor: colors.warmWhite },
  editHeaderBtn: { minWidth: 60 },
  editHeaderTitle: { fontFamily: typography.fontDisplay, fontSize: 16, color: colors.ink, flex: 1, textAlign: 'center', marginHorizontal: spacing.sm },
  editCancelText: { fontSize: 15, color: colors.bodyMuted },
  editSaveText: { fontSize: 15, fontWeight: '600', color: colors.deepRose, textAlign: 'right' },
  editBody: { paddingHorizontal: spacing.screenPaddingH, paddingTop: spacing.lg, paddingBottom: spacing.xxxl },
  editEyebrowBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radii.xl, padding: spacing.lg, marginBottom: spacing.xl },
  editSymbol: { fontSize: 22, flexShrink: 0 },
  editAssetTitle: { fontSize: 15, fontWeight: '600', marginBottom: 3 },
  editAssetHint: { fontSize: 12, color: colors.bodyMuted, lineHeight: 18 },
  fieldWrap: { marginBottom: spacing.xl },
  fieldLabel: { ...typography.actionLabel, color: colors.ink, marginBottom: 3 },
  fieldHint: { ...typography.caption, color: colors.caption, marginBottom: spacing.sm },
  fieldInput: { backgroundColor: colors.warmWhite, borderWidth: 1.5, borderColor: colors.softBorder, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: 14, color: colors.ink, lineHeight: 22 },
  fieldInputMulti: { minHeight: 120, textAlignVertical: 'top', paddingTop: spacing.md },
});