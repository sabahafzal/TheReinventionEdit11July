import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { roadmapsConfig } from '../config/roadmapsConfig';
import { supabase } from '../lib/supabase';
import PremiumUpsellModal from '../components/PremiumUpsellModal';
import { colors, typography, spacing, radii, shadows, tokens } from './theme';

export default function RoadmapScreen({ navigation }) {
  const [selectedRoadmap, setSelectedRoadmap] = useState('');
  const [isPro, setIsPro] = useState(false);
  const [showPremiumUpsell, setShowPremiumUpsell] = useState(false);

  const fetchSelectedRoadmap = async () => {
    try {
      // Use getSession() — returns null cleanly when the session hasn't been
      // restored yet (cold launch), rather than throwing "Auth session missing!".
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) {
        // No session yet — stay silent and wait for onAuthStateChange to fire.
        const local = await AsyncStorage.getItem('recommendedRoadmap');
        setSelectedRoadmap(local || '');
        setIsPro(false);
        return;
      }

      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('is_pro')
        .eq('id', userId)
        .single();

      if (profileErr && profileErr.code !== 'PGRST116') {
        console.warn('Supabase profile load error:', profileErr);
      }

      setIsPro(!!profileData?.is_pro);

      const { data, error } = await supabase
        .from('user_roadmap')
        .select('recommended_roadmap')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.warn('Supabase load error:', error);
        }
        // Supabase returned nothing — fall back to locally stored quiz result.
        // This covers the race where the tab mounts before the upsert commits,
        // or a transient network failure after the quiz completes.
        const local = await AsyncStorage.getItem('recommendedRoadmap');
        setSelectedRoadmap(local || '');
        return;
      }

      setSelectedRoadmap(data?.recommended_roadmap || '');
    } catch (e) {
      console.warn('Load roadmap failed:', e?.message || e);
      try {
        const local = await AsyncStorage.getItem('recommendedRoadmap');
        setSelectedRoadmap(local || '');
      } catch {
        setSelectedRoadmap('');
      }
    }
  };

  useEffect(() => {
    fetchSelectedRoadmap();

    // Re-fetch when the session arrives (covers the cold-launch race where
    // the tab mounts before Supabase has restored the persisted session).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.id) {
        fetchSelectedRoadmap();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSelectedRoadmap();
    }, [])
  );

  const handlePress = (key) => {
    if (key === selectedRoadmap) {
      navigation.navigate('WeeksOverview', { roadmap: key });
    } else {
      Alert.alert(
        'Locked Roadmap',
        'This roadmap is currently locked. To switch, go to Profile and press the *Change my roadmap or time commitment* button'
      );
    }
  };

  const roadmapEntries = Object.entries(roadmapsConfig).map(([key, config]) => ({
    key,
    ...config,
  }));

  return (
    <View style={styles.background}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
      {/* ── Masthead ── */}
<View style={styles.masthead}>
  <Text style={styles.mastheadEyebrow}>The Reinvention Edit</Text>
  <View style={styles.mastheadRule} />
  <Text style={styles.mastheadTitle}>Roadmaps</Text>
  <Text style={styles.mastheadSub}>
    Choose your reinvention path; one at a time.
  </Text>
  <View style={styles.mastheadBottomRule} />
</View>

        {/* Cards */}
        {roadmapEntries.map((roadmap) => {
          const isLocked = roadmap.key !== selectedRoadmap;
          const isSelected = roadmap.key === selectedRoadmap;

          return (
            <TouchableOpacity
              key={roadmap.key}
              style={[
                styles.card,
                isLocked && styles.cardLocked,
                isSelected && styles.cardActive,
              ]}
              onPress={() => handlePress(roadmap.key)}
              activeOpacity={0.8}
            >
              <View style={styles.cardRow}>
                <Text
                  style={[
                    styles.cardText,
                    isLocked && styles.cardTextLocked,
                    isSelected && styles.cardTextActive,
                  ]}
                >
                  {roadmap.label}
                </Text>

                <View
                  style={[
                    styles.badge,
                    isSelected && styles.badgeActive,
                    isLocked && styles.badgeLocked,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      isSelected && styles.badgeTextActive,
                      isLocked && styles.badgeTextLocked,
                    ]}
                  >
                    {isSelected ? 'Active' : 'Locked'}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.cardSubtext,
                  isLocked && styles.cardSubtextLocked,
                  isSelected && styles.cardSubtextActive,
                ]}
              >
                {isSelected
                  ? roadmap.description || 'Your current path to reinvention'
                  : 'Switch in Profile to unlock'}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Upgrade button */}
        {!isPro && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => setShowPremiumUpsell(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.upgradeButtonText}>✨ Upgrade to Premium</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <PremiumUpsellModal
        visible={showPremiumUpsell}
        onClose={() => setShowPremiumUpsell(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },

  container: {
    paddingHorizontal: spacing.screenPaddingH,
    paddingTop: spacing.screenPaddingTop,
    paddingBottom: spacing.xxxl,
  },

  // ── Masthead ─────────────────────────────────────────────────────────────────
masthead: {
  alignItems: 'center',
  marginBottom: spacing.lg,
  position: 'relative',   // ← add this
},

  mastheadEyebrow: {
    ...typography.eyebrow,
    fontSize: 9,
    letterSpacing: 3.5,
    color: colors.clay,
    marginBottom: spacing.sm,
  },

  mastheadRule: {
    width: 32,
    height: 1.5,
    backgroundColor: colors.deepRose,
    marginBottom: spacing.sm,
  },

  mastheadTitle: {
    fontFamily: 'DancingScript',
    fontSize: 40,
    color: colors.ink,
    lineHeight: 58,
    marginBottom: spacing.xs,
  },

  mastheadSub: {
    fontFamily: 'serif',
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.bodyMuted,
    letterSpacing: 0.3,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },

  // ── Bottom rule ───────────────────────────────────────────────────────────────
  mastheadBottomRule: {
    width: '100%',
    height: 1.5,
    backgroundColor: colors.ink,
    marginTop: spacing.md,
  },

  // ── Cards ────────────────────────────────────────────────────────────────────
  card: {
    ...tokens.infoCard,
    ...shadows.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  cardActive: {
    backgroundColor: colors.deepRose,
    borderColor: colors.deepRose,
  },

  cardLocked: {
    backgroundColor: colors.warmWhite,
    borderColor: colors.subtleBorder,
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },

  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    flex: 1,
  },

  cardTextActive: {
    color: colors.white,
  },

  cardTextLocked: {
    color: colors.champagne,
  },

  cardSubtext: {
    ...typography.body,
    color: colors.bodyMuted,
  },

  cardSubtextActive: {
    color: 'rgba(250,247,242,0.70)',
  },

  cardSubtextLocked: {
    color: colors.fawn,
  },

  // ── Badge ────────────────────────────────────────────────────────────────────
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },

  badgeActive: {
    backgroundColor: 'rgba(250,247,242,0.20)',
  },

  badgeLocked: {
    backgroundColor: colors.subtleBorder,
  },

  badgeText: {
    ...typography.badge,
  },

  badgeTextActive: {
    color: colors.warmWhite,
  },

  badgeTextLocked: {
    color: colors.champagne,
  },

  // ── Upgrade ──────────────────────────────────────────────────────────────────
  upgradeButton: {
    ...tokens.linenCard,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },

  upgradeButtonText: {
    ...typography.actionLabel,
    fontSize: 15,
    color: colors.deepRose,
  },
});