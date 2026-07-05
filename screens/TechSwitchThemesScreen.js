// screens/TechSwitchThemesScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { roadmapsConfig } from '../config/roadmapsConfig';

const TRACK_KEY = 'techSwitchTrack';
const ROLE_KEY  = 'techSwitch.selectedRole';

export default function TechSwitchThemesScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState(null);
  const [role, setRole] = useState(null);
  const [themes, setThemes] = useState([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [t, r] = await Promise.all([
        AsyncStorage.getItem(TRACK_KEY),
        AsyncStorage.getItem(ROLE_KEY),
      ]);
      setTrack(t);
      setRole(r);

      // Align with HomeScreen + roadmapsConfig shape (UNCHANGED FUNCTIONALITY)
      const cfg = roadmapsConfig?.tech_switch;
      const listed =
        (t && cfg?.tracks?.[t]?.themes) ? cfg.tracks[t].themes
        : (cfg?.generalThemes ?? []);
      setThemes(listed.map(th => ({
        key: th.key, title: th.title, description: th.description,
      })));
    } catch (e) {
      console.warn('TechSwitchThemesScreen load error:', e);
      Alert.alert('Error', 'Could not load Tech Switch themes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const goEditRole = () => navigation.navigate('TechSwitchRole');

  const openTheme = (theme) => {
    navigation.navigate('TechSwitchPlan', {
      themeKey: theme.key,
      themeLabel: theme.title,
      selectedTrack: track,     // keep existing params
      selectedRole: role || null,
    });
  };

  // ——— Cosmetic stepper (match NewCityThemesScreen colours/feel) ———
  const Stepper = () => (
    <View style={styles.stepperWrap}>
      {themes.map((t, idx) => (
        <View key={t.key} style={styles.stepperItem}>
          {idx !== 0 && <View style={[styles.connector, styles.connectorLeft]} />}
          {/* use the "active" look from NewCity for every node (no logic change) */}
          <View style={[styles.node, styles.nodeActive]}>
            <Text style={styles.nodeText}>{idx + 1}</Text>
          </View>
          {idx !== themes.length - 1 && <View style={[styles.connector, styles.connectorRight]} />}
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8EFF7', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Title + subtitle centered to match NewCityThemesScreen */}
        <Text style={styles.title}>The Journey Ahead</Text>
        <Text style={styles.subtitle}>
          Curated themes to help you move into tech — with structure and style.
        </Text>

        {/* Only show role/track edit option once the user has completed the task and set a role */}
        {role ? (
          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {track ? `Track: ${track.charAt(0).toUpperCase() + track.slice(1)}` : `Role: ${role}`}
              </Text>
            </View>
            <TouchableOpacity onPress={goEditRole} style={styles.editPill}>
              <Text style={styles.editPillText}>Edit track</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Stepper uses NewCity colours */}
        {themes.length > 0 && <Stepper />}
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingWrap}><ActivityIndicator size="large" color="#7a4a74" /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {themes.map((t, idx) => (
              <TouchableOpacity
                key={t.key}
                style={styles.card}
                onPress={() => openTheme(t)}
                activeOpacity={0.9}
              >
                {/* Badge style matches NewCity (number in a rounded chip) */}
                <View style={[styles.badge, styles.badgeActive]}>
                  <Text style={styles.badgeText}>{idx + 1}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{t.title}</Text>
                  {!!t.description && <Text style={styles.cardDesc}>{t.description}</Text>}
                  <Text style={styles.cardLink}>Open plan →</Text>
                </View>

                <Ionicons name="arrow-forward" size={20} color="#7a4a74" />
              </TouchableOpacity>
            ))}
        </ScrollView>
      )}
    </View>
  );
}

function EmptyState({ onPress }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>No themes yet</Text>
      <Text style={styles.emptyText}>
        Pick a role to see tailored themes for your Tech Switch journey.
      </Text>
      <TouchableOpacity onPress={onPress} style={styles.ctaSecondary}>
        <Text style={styles.ctaSecondaryText}>Pick role</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Layout
  container: { flex: 1, backgroundColor: '#fff' },

  // Header now mirrors NewCity title/subtitle placement (centered)
  header: {
    paddingTop: 40,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },

  // Typography (match NewCity)
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D6A5D2',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 14,
    textAlign: 'center',
  },

  // Role pill / CTA (unchanged logic; slight spacing to fit centered header)
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, gap: 8, justifyContent: 'center' },
  pill: { backgroundColor: '#222', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  cta: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: '#222',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  ctaText: { color: '#fff', fontWeight: '700' },
  editPill: {
    backgroundColor: '#F8EFF7',
    borderColor: '#D6A5D2',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  editPillText: { color: '#7a4a74', fontSize: 12, fontWeight: '700' },

  // Loading & content
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 40 },

  // Banner (palette consistent with NewCity)
  banner: {
    backgroundColor: '#F8EFF7',
    borderWidth: 1,
    borderColor: '#E9D3E7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#7a4a74' },
  bannerText: { marginTop: 6, fontSize: 13, color: '#6b5d53', lineHeight: 18 },

  // Cards (styled like New City)
  card: {
    backgroundColor: '#F8F6F8',
    borderWidth: 1,
    borderColor: '#E9D3E7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  cardDesc: { marginTop: 6, fontSize: 13, color: '#666', lineHeight: 19 },
  cardLink: { marginTop: 10, fontSize: 13, fontWeight: '700', color: '#7a4a74' },

  // Number badge (match NewCity badgeActive styling)
  badge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  badgeActive: { backgroundColor: '#F8EFF7', borderColor: '#D6A5D2' },
  badgeLocked: { backgroundColor: '#F2F2F2', borderColor: '#DDD' },
  badgeDone: { backgroundColor: '#D6A5D2', borderColor: '#B877B1' },
  badgeText: { color: '#7a4a74', fontWeight: '800' },
  badgeTextDone: { color: '#fff' },

  // Stepper (match NewCity colours)
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  stepperItem: { flex: 1, alignItems: 'center', position: 'relative' },
  node: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  // use NewCity's "active" visual for every node
  nodeActive: { backgroundColor: '#F8EFF7', borderColor: '#D6A5D2' },
  nodeText: { fontWeight: '800', color: '#7a4a74' },
  connector: { position: 'absolute', top: '50%', height: 2, backgroundColor: '#E9D3E7' },
  connectorLeft: { left: 0, right: '50%', marginRight: 18 },
  connectorRight: { left: '50%', right: 0, marginLeft: 18 },

  // Empty state
  empty: { alignItems: 'center', marginTop: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  emptyText: { marginTop: 6, fontSize: 13, color: '#666', textAlign: 'center', paddingHorizontal: 20 },
  ctaSecondary: {
    marginTop: 12,
    backgroundColor: '#222',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  ctaSecondaryText: { color: '#fff', fontWeight: '700' },
});