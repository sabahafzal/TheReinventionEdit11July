// screens/PhysicalGlowUpTrackScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { colors } from './theme';

const TRACK_KEY = 'physicalGlowUpTrack';

export default function PhysicalGlowUpTrackScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const options = [
    {
      id: 'gym',
      title: 'Working out in a gym',
      subtitle: 'Barbells, machines, progressive overload — the classic strength route.',
      icon: 'barbell-outline',
    },
    {
      id: 'home',
      title: 'Working out at home',
      subtitle: 'Bodyweight or minimal gear — efficient, consistent, and cosy.',
      icon: 'home-outline',
    },
  ];

  useEffect(() => {
    AsyncStorage.getItem(TRACK_KEY).then((val) => {
      if (val) setSelected(val);
    });
  }, []);

  const saveChoice = async () => {
    if (!selected) {
      Alert.alert('Pick one', 'Please choose your workout style to continue.');
      return;
    }
    try {
      setSaving(true);
      await AsyncStorage.setItem(TRACK_KEY, selected);

      // Persist to Supabase — non-blocking
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { error } = await supabase
            .from('profiles')
            .update({ physical_glow_up_track: selected })
            .eq('id', session.user.id);
          if (error) console.warn('Supabase update failed (physical_glow_up_track):', error.message);
        }
      } catch (e) {
        console.warn('Supabase sync error:', e?.message || e);
      }

      navigation.navigate('PhysicalGlowUpPlan', { roadmap: 'physical_glow_up' });
    } catch (e) {
      console.error(e);
      Alert.alert('Could not save', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose your workout style</Text>
      <Text style={styles.subtitle}>
        We'll tailor your themes & tasks for the gym or for an at-home routine.
      </Text>

      <View style={{ gap: 12, marginTop: 20 }}>
        {options.map((opt) => {
          const active = selected === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              activeOpacity={0.9}
              style={[styles.card, active && styles.cardActive]}
              onPress={() => setSelected(opt.id)}
            >
              <View style={styles.row}>
                <Ionicons
                  name={opt.icon}
                  size={22}
                  color={active ? '#3D402F' : '#7a4a74'}
                  style={{ marginRight: 8 }}
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
        disabled={saving}
        onPress={saveChoice}
        style={[styles.cta, !selected && { opacity: 0.5 }]}
        activeOpacity={0.9}
      >
        <Text style={styles.ctaText}>{saving ? 'Saving…' : 'Continue'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 28, backgroundColor: '#FCF9D8' },
  title: { fontSize: 20, fontWeight: '800', color: '#3D402F' },
  subtitle: { marginTop: 6, fontSize: 14, color: '#7a4a74' },

  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9D3E7',
  },
  cardActive: {
    borderColor: '#D6A5D2',
    backgroundColor: '#FFFFFF',
    shadowColor: colors.ink,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#3D402F' },
  cardTitleActive: { color: '#3D402F' },
  cardSub: { marginTop: 4, color: '#7a4a74' },
  cardSubActive: { color: '#3D402F' },

  cta: {
    marginTop: 20,
    backgroundColor: '#3D402F',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '700' },
});