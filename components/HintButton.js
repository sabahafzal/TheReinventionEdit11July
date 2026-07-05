 // components/HintButton.js
//
// A small contextual "?" button. Tap it and a tooltip card appears
// explaining what the section/feature does. Tap anywhere to dismiss.
//
// Usage:
//   <HintButton
//     id="homeScreen.streak"
//     title="Your streak"
//     body="Every day you complete at least one task keeps your streak alive. Miss a day and it resets, unless you have a Freeze saved."
//   />
//
// Props:
//   id      – unique string key (used if you ever want to track dismissals, but
//             HintButton always stays visible. Unlike CoachMark it never hides)
//   title   – bold heading inside the tooltip
//   body    – explanation text
//   style   – optional extra style on the outer wrapper (for positioning)
//   light   – set to true when the button sits on a dark background (inverts colours)

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import { colors, typography, spacing, radii, tokens, shadows } from '../screens/theme';

export default function HintButton({ title, body, style, light = false }) {
  const [visible, setVisible] = useState(false);

  const open  = useCallback(() => setVisible(true),  []);
  const close = useCallback(() => setVisible(false), []);

  return (
    <>
      {/* The "?" button itself */}
      <TouchableOpacity
        onPress={open}
        activeOpacity={0.7}
        style={[styles.btn, light ? styles.btnLight : styles.btnDark, style]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel={`Help: ${title}`}
        accessibilityRole="button"
      >
        <Text style={[styles.btnText, light ? styles.btnTextLight : styles.btnTextDark]}>?</Text>
      </TouchableOpacity>

      {/* Tooltip modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={close}
        statusBarTranslucent
      >
        <Pressable style={styles.scrim} onPress={close}>
          {/* Stop propagation so tapping the card itself doesn't close */}
          <Pressable style={styles.card} onPress={() => {}}>
            {/* Decorative pip */}
            <View style={styles.pip} />

            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardBody}>{body}</Text>

            <TouchableOpacity style={styles.closeBtn} onPress={close} activeOpacity={0.75}>
              <Text style={styles.closeBtnText}>Got it</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // ── The "?" button ──────────────────────────────────────────────────────────
  btn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // On dark backgrounds (e.g. HomeScreen hero area)
  btnLight: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  // On white/linen card backgrounds
  btnDark: {
    backgroundColor: colors.roseTint08,
    borderWidth: 1,
    borderColor: colors.roseTint18,
  },
  btnText: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  btnTextLight: {
    color: 'rgba(255,255,255,0.85)',
  },
  btnTextDark: {
    color: colors.deepRose,
  },

  // ── Scrim ────────────────────────────────────────────────────────────────────
  scrim: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },

  // ── Tooltip card ─────────────────────────────────────────────────────────────
  card: {
    width: '100%',
    backgroundColor: colors.warmWhite,
    borderRadius: radii.xxl,
    padding: spacing.xxl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    ...shadows.modal,
  },
  pip: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.dustyRose,
    marginBottom: spacing.lg,
    opacity: 0.7,
  },
  cardTitle: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 18,
    color: colors.ink,
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.bodyMuted,
    marginBottom: spacing.xl,
  },
  closeBtn: {
    backgroundColor: colors.deepRose,
    borderRadius: radii.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  closeBtnText: {
    ...typography.buttonPrimary,
  },
});