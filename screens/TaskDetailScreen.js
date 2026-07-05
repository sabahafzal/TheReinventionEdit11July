// screens/TaskDetailScreen.js
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

import PlanLayout, { PLAN_THEME, PLAN_UI, PLAN_BUTTONS } from '../components/PlanLayout';
import { colors } from './theme';
import { roadmapTasks } from './roadmapTasks';

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLE_TASK_TEXT = 'Explore common tech roles and pick your first track';
const ROLE_KEY       = 'techSwitch.selectedRole';
const TRACK_KEY      = 'techSwitchTrack';


// ── Role → track map ──────────────────────────────────────────────────────────

const ROLE_TO_TRACK = {
  'Data Analyst':                    'data',
  //'Data Scientist':                  'data',
  //'Machine Learning Engineer':       'data',
  //'Data Engineer':                   'data',
  //'BI Analyst / Analytics Engineer': 'data',
  'Frontend Developer':              'frontend',
  //'Mobile App Developer':            'frontend',
  //'Web Developer':                   'frontend',
  'Product Manager':                 'product',
  //'Technical Product Manager':       'product',
  //'Growth Product Manager':          'product',
  'UX Designer':                     'ux',
  //'Product Designer':                'ux',
  //'UX Researcher':                   'ux',
  'DevOps Engineer':                 'devops',
  //'Platform Engineer':               'devops',
  //'Site Reliability Engineer (SRE)': 'devops',
  //'ML Engineer':                     'ai',
  'AI Engineer':                     'ai',
  //'Applied AI Engineer':             'ai',
  //'LLM Engineer':                    'ai',
  //'GenAI Engineer':                  'ai',
  //'AI Product Engineer':             'ai',
};

const ROLES = Object.keys(ROLE_TO_TRACK);



// ── Supabase helper ───────────────────────────────────────────────────────────

const syncTrackToSupabase = async (track) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await supabase
      .from('profiles')
      .update({ tech_switch_track: track })
      .eq('id', session.user.id);
  } catch {}
};

// ── Inline role picker ────────────────────────────────────────────────────────

function InlineRolePicker({ onSaved }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [saved, setSaved]               = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await AsyncStorage.getItem(ROLE_KEY);
        if (r) setSelectedRole(r);
        // If track already saved too, restore success state
        const t = await AsyncStorage.getItem(TRACK_KEY);
        if (r && t) setSaved(true);
      } catch {}
    })();
  }, []);

  const selectedTrack = selectedRole ? ROLE_TO_TRACK[selectedRole] : null;

  const handleSave = async () => {
    if (!selectedRole) return;
    const track = ROLE_TO_TRACK[selectedRole];
    try {
      await AsyncStorage.setItem(ROLE_KEY,  selectedRole);
      await AsyncStorage.setItem(TRACK_KEY, track);
    } catch {
      Alert.alert('Save error', 'Could not save your selection. Please try again.');
      return;
    }
    syncTrackToSupabase(track);
    setSaved(true);
    onSaved?.({ role: selectedRole, track });
  };

  if (saved) {
    return (
      <View style={pickerStyles.successCard}>
        <Text style={pickerStyles.successIcon}>✓</Text>
        <Text style={pickerStyles.successTitle}>Track saved!</Text>
        <Text style={pickerStyles.successRole}>{selectedRole}</Text>
        <View style={pickerStyles.successPill}>
          <Text style={pickerStyles.successPillText}>{ROLE_TO_TRACK[selectedRole]?.toUpperCase()}</Text>
        </View>
        <TouchableOpacity
          style={pickerStyles.changeAgainBtn}
          onPress={() => setSaved(false)}
          activeOpacity={0.8}
        >
          <Text style={pickerStyles.changeAgainText}>Change selection</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={pickerStyles.wrap}>
      <Text style={pickerStyles.heading}>Pick your first track</Text>
      <Text style={pickerStyles.sub}>
        Choose the role that sounds most interesting — this sets your track and personalises your roadmap. You can always change it later.
      </Text>

      {ROLES.map((role) => {
        const active = selectedRole === role;
        return (
          <TouchableOpacity
            key={role}
            onPress={() => setSelectedRole(role)}
            style={[pickerStyles.card, active && pickerStyles.cardActive]}
            activeOpacity={0.85}
          >
            <Text style={[pickerStyles.cardTitle, active && pickerStyles.cardTitleActive]}>{role}</Text>
            <Text style={[pickerStyles.cardMeta, active && pickerStyles.cardMetaActive]}>
              Track: {ROLE_TO_TRACK[role]}
            </Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        onPress={handleSave}
        disabled={!selectedRole}
        style={[pickerStyles.cta, !selectedRole && pickerStyles.ctaDisabled]}
        activeOpacity={0.9}
      >
        <Text style={pickerStyles.ctaText}>
          {selectedRole ? `Start with ${selectedTrack} track →` : 'Select a role to continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  wrap:    { marginTop: 6 },
  heading: { fontSize: 18, fontWeight: '800', color: colors.deepRose, marginBottom: 6 },
  sub:     { fontSize: 14, lineHeight: 20, color: colors.bodyMuted, marginBottom: 14 },

  card: {
    backgroundColor: colors.offWhite,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.softBorder,
  },
  cardActive:      { backgroundColor: colors.deepRose, borderColor: colors.deepRose },
  cardTitle:       { fontSize: 15, fontWeight: '700', color: colors.ink },
  cardTitleActive: { color: colors.white },
  cardMeta:        { marginTop: 4, fontSize: 12, color: colors.bodyMuted },
  cardMetaActive:  { color: colors.white, opacity: 0.85 },

  cta:         { marginTop: 8, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: colors.deepRose },
  ctaDisabled: { backgroundColor: colors.dustyRose },
  ctaText:     { color: colors.white, fontWeight: '800', fontSize: 15 },

  successCard: {
    marginTop: 6,
    backgroundColor: colors.roseTint08,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.roseTint18,
    padding: 20,
    alignItems: 'center',
  },
  successIcon:     { fontSize: 28, color: colors.deepRose, marginBottom: 6 },
  successTitle:    { fontSize: 16, fontWeight: '800', color: colors.deepRose, marginBottom: 4 },
  successRole:     { fontSize: 15, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  successPill: {
    marginTop: 8,
    backgroundColor: colors.deepRose,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  successPillText: { color: colors.white, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  changeAgainBtn:  { marginTop: 14 },
  changeAgainText: { color: colors.deepRose, fontWeight: '700', textDecorationLine: 'underline', fontSize: 13 },
});

// ── Track banner (all other tech_switch tasks) ────────────────────────────────

function TechTrackBanner({ navigation }) {
  const [role,  setRole]  = useState(null);
  const [track, setTrack] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await AsyncStorage.getItem(ROLE_KEY);
      const t = await AsyncStorage.getItem(TRACK_KEY);
      setRole(r  || null);
      setTrack(t || null);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => navigation.addListener('focus', load), [navigation, load]);

  return (
    <View style={bannerStyles.banner}>
      <View style={bannerStyles.left}>
        <Text style={bannerStyles.label}>CURRENT TRACK</Text>
        <Text style={bannerStyles.role} numberOfLines={1}>
          {role ? role : 'No track selected yet'}
        </Text>
        {track ? (
          <View style={bannerStyles.pill}>
            <Text style={bannerStyles.pillText}>{track.toUpperCase()}</Text>
          </View>
        ) : null}
      </View>
      <TouchableOpacity
        style={bannerStyles.changeBtn}
        onPress={() => navigation.navigate('TechSwitchRole')}
        activeOpacity={0.8}
      >
        <Text style={bannerStyles.changeBtnText}>{role ? 'Change' : 'Pick track'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const bannerStyles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.offWhite,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.softBorder,
  },
  left:          { flex: 1, marginRight: 10 },
  label:         { fontSize: 10, fontWeight: '800', color: colors.bodyMuted, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2 },
  role:          { fontSize: 15, fontWeight: '700', color: colors.ink },
  pill:          { alignSelf: 'flex-start', marginTop: 6, backgroundColor: colors.roseTint08, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: colors.roseTint18 },
  pillText:      { color: colors.deepRose, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  changeBtn:     { backgroundColor: colors.deepRose, borderRadius: 8, paddingHorizontal: 13, paddingVertical: 9 },
  changeBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 },
});

// ── Main screen ───────────────────────────────────────────────────────────────

export default function TaskDetailScreen() {
  const route      = useRoute();
  const navigation = useNavigation();

  const { taskId, taskText, roadmapKey, themeKey, explanation } = route.params || {};

  const isRoleTask = roadmapKey === 'tech_switch' && taskText === ROLE_TASK_TEXT;

  const [note,       setNote]       = useState('');
  const [checkedMap, setCheckedMap] = useState({});

  const checklistKey = useMemo(
    () => `taskChecklist:${taskId || taskText || 'unknown'}`,
    [taskId, taskText]
  );
  const storageKey = useMemo(
    () => `taskNotes:${taskId || taskText || 'unknown'}`,
    [taskId, taskText]
  );

  useEffect(() => {
    navigation.setOptions({ title: 'Task Details' });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(checklistKey);
        if (raw) setCheckedMap(JSON.parse(raw));
      } catch {}
    })();
  }, [checklistKey]);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(storageKey);
        if (saved) setNote(saved);
      } catch {}
    })();
  }, [storageKey]);

  const toggleChecklistItem = async (item) => {
    const next = { ...(checkedMap || {}) };
    if (next[item]) delete next[item];
    else next[item] = true;
    setCheckedMap(next);
    try { await AsyncStorage.setItem(checklistKey, JSON.stringify(next)); } catch {}
  };

  const lookedUpExplanation = useMemo(() => {
    try {
      if (!roadmapKey || !themeKey || !taskText) return null;
      const list  = roadmapTasks?.[roadmapKey]?.[themeKey] || [];
      const match = list.find(t => String(t.task) === String(taskText));
      return match?.explanation || null;
    } catch { return null; }
  }, [roadmapKey, themeKey, taskText]);

  const finalExplanation =
    explanation ||
    lookedUpExplanation ||
    'No specific details have been added yet. You can still use notes below.';

  const resolvedChecklist = useMemo(() => {
    try {
      if (!roadmapKey || !themeKey || !taskText) return [];
      const list  = roadmapTasks?.[roadmapKey]?.[themeKey] || [];
      const match = list.find(t => String(t.task) === String(taskText));
      return Array.isArray(match?.checklist) ? match.checklist : [];
    } catch { return []; }
  }, [roadmapKey, themeKey, taskText]);

  const onSave = async () => {
    try {
      await AsyncStorage.setItem(storageKey, note || '');
      Alert.alert('Saved', 'Your notes were saved for this task.');
    } catch {
      Alert.alert('Save failed', 'Could not save your notes. Try again.');
    }
  };

  return (
    <PlanLayout
      title={taskText || 'Task'}
      subtitle={[themeKey && format(themeKey), roadmapKey && format(roadmapKey)]
        .filter(Boolean)
        .join(' \u00b7 ')}
    >
      {/* Track banner for all tech_switch tasks except the role picker itself */}
      {roadmapKey === 'tech_switch' && !isRoleTask && (
        <TechTrackBanner navigation={navigation} />
      )}

      {/* Explanation card — always shown first */}
      <View style={PLAN_UI.card}>
        <Text style={styles.bodyText}>{finalExplanation}</Text>

        {resolvedChecklist.map((item, idx) => {
          const done = !!checkedMap[item];
          return (
            <TouchableOpacity
              key={`${item}-${idx}`}
              onPress={() => toggleChecklistItem(item)}
              activeOpacity={0.8}
              style={{ flexDirection: 'row', marginBottom: 6, marginTop: 4 }}
            >
              <Text style={{ marginRight: 8 }}>{done ? '\u2611\ufe0e' : '\u2610'}</Text>
              <Text style={[styles.bodyText, done && { textDecorationLine: 'line-through', opacity: 0.6 }]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Inline role picker — only for the role exploration task */}
      {isRoleTask && (
        <View style={PLAN_UI.card}>
          <InlineRolePicker />
        </View>
      )}

      {/* Notes */}
      <View style={PLAN_UI.card}>
        <Text style={styles.sectionTitle}>Your notes</Text>
        <TextInput
          style={styles.input}
          value={note}
          onChangeText={setNote}
          placeholder="Add notes and links here"
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[PLAN_BUTTONS.smallBase, PLAN_BUTTONS.primarySmall, styles.saveBtn]}
          onPress={onSave}
          activeOpacity={0.9}
        >
          <Text style={PLAN_BUTTONS.primarySmallText}>Save notes</Text>
        </TouchableOpacity>
      </View>
    </PlanLayout>
  );
}

const format = (s = '') =>
  String(s).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PLAN_THEME.textPrimary,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: PLAN_THEME.textSecondary,
  },
  input: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: PLAN_THEME.borderLight,
    borderRadius: 12,
    padding: 12,
    backgroundColor: PLAN_THEME.white,
    color: PLAN_THEME.textPrimary,
    marginTop: 6,
  },
  saveBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
});