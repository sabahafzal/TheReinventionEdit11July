// components/CoachMarkOverlay.js
//
// First-visit coach mark: shows a series of tip cards the FIRST time the user
// visits a screen. After the user taps through all steps (or taps "Skip"),
// the overlay is permanently dismissed via AsyncStorage.
//
// Usage:
//   import CoachMarkOverlay from '../components/CoachMarkOverlay';
//   import { useHintSeen } from '../hooks/useHintSeen';
//
//   const { seen, loaded, markSeen } = useHintSeen('homeScreen.coach');
//
//   <CoachMarkOverlay
//     id="homeScreen.coach"
//     visible={loaded && !seen}
//     onDone={markSeen}
//     steps={[
//       {
//         title: 'Your personalised journey',
//         body:  'Your themes are chosen for you based on your quiz answers. They form a curated path, not a menu to pick from.',
//       },
//       {
//         title: 'Tap a theme to start',
//         body:  'Open any theme to see your tasks for that stage. Work through them in order for the best results.',
//       },
//     ]}
//   />
//
// Props:
//   id      – must match the id passed to useHintSeen()
//   visible – boolean, drive from `loaded && !seen`
//   onDone  – called when the user finishes or skips; call markSeen() here
//   steps   – array of { title, body, emoji? }

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../screens/theme';

const { width: SCREEN_W } = Dimensions.get('window');

export default function CoachMarkOverlay({ visible, onDone, steps = [] }) {
  const [stepIndex, setStepIndex] = useState(0);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  // Reset to step 0 whenever the overlay (re-)appears
  useEffect(() => {
    if (visible) {
      setStepIndex(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(24);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      ]).start();
    }
  }, [visible]);

  // Animate card out then advance step
  const animateNext = useCallback((afterAnim) => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -16, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      afterAnim();
      slideAnim.setValue(24);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      ]).start();
    });
  }, [fadeAnim, slideAnim]);

  const handleNext = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      animateNext(() => setStepIndex((i) => i + 1));
    } else {
      onDone?.();
    }
  }, [stepIndex, steps.length, animateNext, onDone]);

  const handleSkip = useCallback(() => {
    onDone?.();
  }, [onDone]);

  if (!visible || steps.length === 0) return null;

  const step       = steps[stepIndex];
  const isLast     = stepIndex === steps.length - 1;
  const totalSteps = steps.length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleSkip}
    >
      <View style={styles.scrim}>
        <Animated.View
          style={[
            styles.card,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Step dots */}
          {totalSteps > 1 && (
            <View style={styles.dots}>
              {steps.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === stepIndex && styles.dotActive]}
                />
              ))}
            </View>
          )}

          {/* Optional emoji */}
          {step.emoji ? (
            <Text style={styles.emoji}>{step.emoji}</Text>
          ) : (
            <View style={styles.pip} />
          )}

          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.body}>{step.body}</Text>

          {/* Actions */}
          <View style={styles.actions}>
            {!isLast && (
              <TouchableOpacity onPress={handleSkip} activeOpacity={0.6}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.nextBtn, isLast && styles.nextBtnFull]}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextBtnText}>
                {isLast ? 'Let\'s go' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xxl,
    paddingBottom: 48,
  },
  card: {
    backgroundColor: colors.warmWhite,
    borderRadius: radii.xxl,
    padding: spacing.xxl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    ...shadows.modal,
  },

  // ── Step dots ────────────────────────────────────────────────────────────────
  dots: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.fawn,
  },
  dotActive: {
    backgroundColor: colors.dustyRose,
    width: 18,
  },

  // ── Decorations ──────────────────────────────────────────────────────────────
  pip: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.dustyRose,
    marginBottom: spacing.lg,
    opacity: 0.7,
  },
  emoji: {
    fontSize: 30,
    marginBottom: spacing.md,
  },

  // ── Content ──────────────────────────────────────────────────────────────────
  title: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 20,
    color: colors.ink,
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.bodyMuted,
    marginBottom: spacing.xl,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.md,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.8,
    color: colors.caption,
    textTransform: 'uppercase',
  },
  nextBtn: {
    backgroundColor: colors.deepRose,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  nextBtnFull: {
    flex: 1,
  },
  nextBtnText: {
    ...typography.buttonPrimary,
  },
});