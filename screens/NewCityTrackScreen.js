// screens/NewCityTrackScreen.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import PlanLayout, { PLAN_THEME } from '../components/PlanLayout';

const TRACK_KEY = 'newCityTrack';                 // moving_country | moving_city_only
const JOB_STATUS_KEY = 'newCityJobStatus';        // job_secured | job_needed

// optional: if you keep user profile in Supabase
let supabase;
try {
  supabase = require('../lib/supabase').supabase;
} catch (e) {
  supabase = null;
}

const MOVE_OPTIONS = [
  {
    id: 'moving_country',
    title: 'Moving Country',
    subtitle: 'Visas, bank/HMRC, utilities, new SIM… the full leap.',
    icon: 'airplane-outline',
  },
  {
    id: 'moving_city_only',
    title: 'Moving City (same country)',
    subtitle: 'Neighbourhoods, council tax, commute, community.',
    icon: 'business-outline',
  },
];

const JOB_OPTIONS = [
  {
    id: 'job_secured',
    title: 'I already have a job',
    subtitle: 'Prioritise housing, admin, onboarding & community.',
    icon: 'briefcase-outline',
  },
  {
    id: 'job_needed',
    title: 'I need to secure a job',
    subtitle: 'Front-load job search, networking & finances.',
    icon: 'search-outline',
  },
];

export default function NewCityTrackScreen() {
  const navigation = useNavigation();

  const [moveType, setMoveType] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [storedTrack, storedJob] = await AsyncStorage.multiGet([TRACK_KEY, JOB_STATUS_KEY]);
        if (storedTrack?.[1]) setMoveType(storedTrack[1]);
        if (storedJob?.[1]) setJobStatus(storedJob[1]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const canContinue = useMemo(() => !!moveType && !!jobStatus, [moveType, jobStatus]);

  const saveChoice = async () => {
    if (!canContinue) {
      Alert.alert('Almost there', 'Please choose both your move type and job status.');
      return;
    }

    try {
      setSaving(true);

      await AsyncStorage.multiSet([
        [TRACK_KEY, moveType],
        [JOB_STATUS_KEY, jobStatus],
      ]);

      // Mirror to Supabase profile if available
if (supabase) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (userId) {
      const { error: upErr } = await supabase
        .from('profiles')
        .update({ new_city_track: moveType, new_city_job_status: jobStatus })
        .eq('id', userId);
      if (upErr) throw upErr;
    }
  } catch (e) {
    console.warn('Supabase profile update failed:', e?.message || e);
  }
}
      // Go straight to the plan; answers will show at the top
      navigation.replace('RoadmapPlan', { roadmap: 'new_city', startAtWeek: 0 });
    } catch (e) {
      console.error(e);
      Alert.alert('Could not save', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PlanLayout
      title="Tune your New City plan"
      subtitle="First pick how you’re moving. Then tell us your job situation so we can prioritise the right steps."
      loading={loading}
    >
      {/* 1) Moving type */}
      <Text style={styles.sectionTitle}>1) How are you moving?</Text>
      <View style={styles.list}>
        {MOVE_OPTIONS.map((opt) => {
          const active = moveType === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              activeOpacity={0.9}
              style={[styles.card, active && styles.cardActive]}
              onPress={() => setMoveType(opt.id)}
            >
              <View style={styles.row}>
                <Ionicons
                  name={opt.icon}
                  size={22}
                  color={active ? PLAN_THEME.textPrimary : PLAN_THEME.subtleText}
                  style={{ marginRight: 10 }}
                />
                <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>
                  {opt.title}
                </Text>
              </View>
              <Text style={[styles.cardSub, active && styles.cardSubActive]}>
                {opt.subtitle}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2) Job status */}
      <Text style={[styles.sectionTitle, { marginTop: 18 }]}>2) What’s your job status?</Text>
      <View style={styles.list}>
        {JOB_OPTIONS.map((opt) => {
          const active = jobStatus === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              activeOpacity={0.9}
              style={[styles.card, active && styles.cardActive]}
              onPress={() => setJobStatus(opt.id)}
            >
              <View style={styles.row}>
                <Ionicons
                  name={opt.icon}
                  size={22}
                  color={active ? PLAN_THEME.textPrimary : PLAN_THEME.subtleText}
                  style={{ marginRight: 10 }}
                />
                <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>
                  {opt.title}
                </Text>
              </View>
              <Text style={[styles.cardSub, active && styles.cardSubActive]}>
                {opt.subtitle}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        disabled={!canContinue || saving}
        onPress={saveChoice}
        style={[styles.cta, (!canContinue || saving) && { opacity: 0.5 }]}
        activeOpacity={0.9}
      >
        <Text style={styles.ctaText}>{saving ? 'Saving…' : 'Save & Continue'}</Text>
      </TouchableOpacity>

      {!canContinue && (
        <Text style={styles.helperText}>
          Select one option in each section to continue.
        </Text>
      )}
    </PlanLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginTop: 2,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '800',
    color: PLAN_THEME.textPrimary,
  },

  list: {
    gap: 12,
  },

  card: {
    backgroundColor: PLAN_THEME.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: PLAN_THEME.borderLight,
  },

  cardActive: {
    borderColor: PLAN_THEME.highlight,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: PLAN_THEME.textPrimary,
  },

  cardTitleActive: {
    color: PLAN_THEME.textPrimary,
  },

  cardSub: {
    marginTop: 6,
    color: PLAN_THEME.textSecondary,
    opacity: 0.85,
    lineHeight: 18,
  },

  cardSubActive: {
    opacity: 1,
  },

  cta: {
    marginTop: 20,
    backgroundColor: PLAN_THEME.highlight,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  ctaText: {
    fontWeight: '800',
    color: PLAN_THEME.white,
    fontSize: 16,
  },

  helperText: {
    marginTop: 10,
    textAlign: 'center',
    color: PLAN_THEME.mutedText,
    fontSize: 12,
  },
});
