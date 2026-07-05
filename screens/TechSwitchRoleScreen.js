// screens/TechSwitchRoleScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { colors, typography, spacing, radii } from './theme';

const ROLE_KEY = 'techSwitch.selectedRole';
const TRACK_KEY = 'techSwitchTrack';

// ─── Roles ────────────────────────────────────────────────────────────────────
// One role per track. Descriptions mirror the task explanation in roadmapTasks.js
// so the user reads the same language in both places.
// Tracks must match roadmapsConfig.js keys: data | frontend | product | ux | devops | ai

const ROLES = [
  {
    role: 'Data Analyst',
    track: 'data',
    description: 'Turn data into clear answers using SQL, spreadsheets, and dashboards.',
  },
  {
    role: 'Frontend Developer',
    track: 'frontend',
    description: 'Build what users see and click — websites and apps with HTML, CSS, and JavaScript.',
  },
  {
    role: 'Product Manager',
    track: 'product',
    description: 'Decide what gets built and why — no coding required, lots of communication.',
  },
  {
    role: 'UX Designer',
    track: 'ux',
    description: 'Design how products feel to use — research, wireframes, and user testing.',
  },
  {
    role: 'DevOps Engineer',
    track: 'devops',
    description: 'Keep software running reliably — pipelines, cloud infrastructure, and automation.',
  },
  {
    role: 'AI Engineer',
    track: 'ai',
    description: 'Build AI-powered products by integrating models and tools into real applications.',
  },
];

// Lookup helpers derived from ROLES so there is one source of truth
const ROLE_TO_TRACK = Object.fromEntries(ROLES.map(({ role, track }) => [role, track]));
const ROLE_NAMES    = ROLES.map((r) => r.role);

// ── Supabase helpers ──────────────────────────────────────────────────────────

const syncTrackToSupabase = async (track) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ tech_switch_track: track })
      .eq('id', session.user.id);
    if (error) console.warn('Failed to sync tech_switch_track:', error.message);
  } catch (e) {
    console.warn('Supabase sync error:', e?.message || e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

export default function TechSwitchRoleScreen() {
  const navigation = useNavigation();
  const route      = useRoute();
  const fromDay4   = !!route.params?.fromDay4;
  const fromTask   = !!route.params?.fromTask;
  const returnTo   = route.params?.returnTo;

  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const savedRole = await AsyncStorage.getItem(ROLE_KEY);
        if (savedRole) setSelectedRole(savedRole);
      } catch {}
    })();
  }, []);

  const selectedTrack = useMemo(
    () => (selectedRole ? ROLE_TO_TRACK[selectedRole] : null),
    [selectedRole]
  );

  const finishAndReturn = () => {
    if (returnTo?.name) {
      navigation.replace(returnTo.name, returnTo.params || {});
    } else if (fromTask) {
      navigation.navigate('TechSwitchThemes');
    } else {
      navigation.goBack();
    }
  };

  const saveAndClose = async () => {
    if (!selectedRole) return;
    const track = ROLE_TO_TRACK[selectedRole];

    try {
      await AsyncStorage.setItem(ROLE_KEY, selectedRole);
      await AsyncStorage.setItem(TRACK_KEY, track);
    } catch (e) {
      Alert.alert('Save error', 'Could not save your selection. Please try again.');
      return;
    }

    syncTrackToSupabase(track);

    if (fromTask) {
      finishAndReturn();
    } else {
      Alert.alert('Saved', `Role: ${selectedRole}\nTrack: ${track.toUpperCase()}`);
      finishAndReturn();
    }
  };

  const clearSelection = async () => {
    try {
      await AsyncStorage.removeItem(ROLE_KEY);
      await AsyncStorage.removeItem(TRACK_KEY);
    } catch {}
    setSelectedRole(null);
    syncTrackToSupabase(null);
    Alert.alert('Cleared', 'Role & track cleared — showing the general roadmap again.');
    finishAndReturn();
  };

  const renderItem = ({ item }) => {
    const active = selectedRole === item.role;
    return (
      <TouchableOpacity
        onPress={() => setSelectedRole(item.role)}
        style={[styles.card, active && styles.cardActive]}
        activeOpacity={0.85}
      >
        <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>{item.role}</Text>
        <Text style={[styles.cardMeta,  active && styles.cardMetaActive]}>{item.description}</Text>
      </TouchableOpacity>
    );
  };

  const canContinue = !!selectedRole;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {fromTask
            ? 'Pick your first track'
            : fromDay4
            ? 'Day 4: Pick your target role'
            : 'Pick your target role'}
        </Text>
        <Text style={styles.subtitle}>
          {fromTask
            ? 'Choose the role that sounds most interesting. This sets your track and personalises your roadmap.'
            : 'This choice will personalise your themes and tasks. You can always change it later.'}
        </Text>

        {fromDay4 && !fromTask && (
          <View style={styles.pill}>
            <Text style={styles.pillText}>Unlocked in "Tech Exploration & Role Discovery"</Text>
          </View>
        )}
        {fromTask && (
          <View style={styles.pill}>
            <Text style={styles.pillText}>Step 2 of the task: pick one track to start</Text>
          </View>
        )}
      </View>

      <FlatList
        data={ROLES}
        keyExtractor={(r) => r.role}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          disabled={!canContinue}
          onPress={saveAndClose}
          style={[styles.cta, !canContinue && styles.ctaDisabled]}
          activeOpacity={0.9}
        >
          <Text style={styles.ctaText}>
            {canContinue ? 'Save and continue' : 'Select a role to continue'}
          </Text>
          {selectedTrack && !fromTask && (
            <Text style={styles.ctaMeta}>Track: {selectedTrack}</Text>
          )}
        </TouchableOpacity>

        {!fromTask && (
          <TouchableOpacity
            onPress={clearSelection}
            style={[styles.card, styles.secondary, { marginTop: 10 }]}
            activeOpacity={0.85}
          >
            <Text style={styles.cardTitle}>Clear Role & Track</Text>
            <Text style={styles.cardMeta}>Back to general roadmap</Text>
          </TouchableOpacity>
        )}

        {!fromTask && (
          <TouchableOpacity
            onPress={finishAndReturn}
            style={styles.linkBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.warmWhite },

  header: {
    paddingTop: spacing.screenPaddingTop,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.softBorder,
    backgroundColor: colors.warmWhite,
  },

  title: {
    ...typography.sectionTitle,
    color: colors.dustyRose,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.xs,
    ...typography.body,
    color: colors.bodyMuted,
    textAlign: 'center',
  },

  pill: {
    alignSelf: 'center',
    marginTop: spacing.sm,
    backgroundColor: colors.offWhite,
    borderColor: colors.dustyRose,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  pillText: {
    ...typography.badge,
    color: colors.deepRose,
  },

  listContent: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },

  card: {
    backgroundColor: colors.linen,
    padding: spacing.lg,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  cardActive: {
    backgroundColor: colors.dustyRose,
  },
  cardTitle: {
    ...typography.actionLabel,
  },
  cardTitleActive: { color: colors.white },
  cardMeta: {
    marginTop: spacing.xs,
    ...typography.caption,
    lineHeight: 17,
  },
  cardMetaActive: { color: colors.white, opacity: 0.95 },

  secondary: { backgroundColor: colors.offWhite },

  footer: {
    padding: spacing.lg,
    paddingTop: spacing.xs,
    backgroundColor: colors.warmWhite,
  },

  cta: {
    marginTop: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    backgroundColor: colors.dustyRose,
  },
  ctaDisabled: {
    backgroundColor: colors.fawn,
  },
  ctaText: {
    ...typography.buttonPrimary,
    includeFontPadding: false,
  },
  ctaMeta: {
    ...typography.caption,
    color: colors.white,
    marginTop: spacing.xs,
    opacity: 0.95,
  },

  linkBtn: { alignItems: 'center', paddingVertical: spacing.md },
  linkText: {
    ...typography.actionLabel,
    color: colors.deepRose,
    textDecorationLine: 'underline',
  },
});