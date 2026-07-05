// screens/SplashScreen.js
// Shown while fonts load and session is being checked.

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { colors, spacing, radii } from './theme';

const { width: W, height: H } = Dimensions.get('window');

// iPad detection — used to scale decorative elements and type
const IS_IPAD = Platform.OS === 'ios' && Platform.isPad;

// Scale factor: iPad gets larger arcs, text, and spacing
const SCALE = IS_IPAD ? 1.45 : 1;

const s = (n) => Math.round(n * SCALE);

// System serif fallback used when PlayfairDisplay hasn't loaded yet
const SERIF_FALLBACK = Platform.select({ ios: 'Georgia', android: 'serif' });

export default function SplashScreen() {
  // ── Animations ────────────────────────────────────────────────────────────
  const titleOpacity   = useRef(new Animated.Value(0)).current;
  const titleY         = useRef(new Animated.Value(16)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const dividerOpacity = useRef(new Animated.Value(0)).current;
  const dot1Opacity    = useRef(new Animated.Value(0.25)).current;
  const dot2Opacity    = useRef(new Animated.Value(0.25)).current;
  const dot3Opacity    = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(dividerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing loading dots
    const pulseDot = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.25,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

    pulseDot(dot1Opacity, 0).start();
    pulseDot(dot2Opacity, 200).start();
    pulseDot(dot3Opacity, 400).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={styles.background}>

        {/* Decorative concentric arcs */}
        <View style={[styles.arc, styles.arc1]} />
        <View style={[styles.arc, styles.arc2]} />
        <View style={[styles.arc, styles.arc3]} />

        {/* Soft rose glow behind text */}
        <View style={styles.roseGlow} />

        {/* Decorative corner dots */}
        <View style={[styles.cornerDot, styles.cd1]} />
        <View style={[styles.cornerDot, styles.cd2]} />
        <View style={[styles.cornerDot, styles.cd3]} />

        {/* ── Brand name ── */}
        <Animated.Text
          style={[
            styles.brandName,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleY }],
            },
          ]}
        >
          The Reinvention Edit
        </Animated.Text>

        {/* ── Tagline ── */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          your glow-up starts here
        </Animated.Text>

        {/* ── Divider + loading dots ── */}
        <Animated.View style={[styles.dividerRow, { opacity: dividerOpacity }]}>
          <View style={styles.dividerLine} />
          <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
          <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
          <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
          <View style={styles.dividerLine} />
        </Animated.View>

      </View>
    </View>
  );
}

const ROSE_BORDER  = 'rgba(122,53,53,0.18)';
const ROSE_BORDER2 = 'rgba(122,53,53,0.12)';
const ROSE_BORDER3 = 'rgba(122,53,53,0.10)';
const ROSE_GLOW    = 'rgba(122,53,53,0.12)';
const ROSE_LINE    = 'rgba(122,53,53,0.40)';
const CREAM        = '#faf7f2';
const DUSTY_MUTED  = 'rgba(200,148,142,0.65)';
const DOT_COLOR    = '#c8948e';
const CORNER_DOT   = 'rgba(122,53,53,0.50)';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // ── Decorative arcs ───────────────────────────────────────────────────────
  arc: {
    position: 'absolute',
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  arc1: {
    width:  s(560),
    height: s(560),
    borderColor: ROSE_BORDER,
    top:   -s(200),
    right: -s(200),
  },
  arc2: {
    width:  s(360),
    height: s(360),
    borderColor: ROSE_BORDER2,
    top:   -s(110),
    right: -s(110),
  },
  arc3: {
    width:  s(340),
    height: s(340),
    borderColor: ROSE_BORDER3,
    bottom: -s(120),
    left:   -s(120),
  },

  // ── Soft glow ─────────────────────────────────────────────────────────────
  roseGlow: {
    position: 'absolute',
    width:  s(220),
    height: s(220),
    borderRadius: radii.pill,
    backgroundColor: ROSE_GLOW,
  },

  // ── Corner decoration ─────────────────────────────────────────────────────
  cornerDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: radii.dot,
    backgroundColor: CORNER_DOT,
  },
  cd1: { bottom: s(80),  left: s(36) },
  cd2: { top: s(100),    right: s(40) },
  cd3: { bottom: s(150), right: s(30) },

  // ── Brand name ────────────────────────────────────────────────────────────
  brandName: {
    fontFamily: SERIF_FALLBACK,
    fontSize: s(30),
    fontWeight: '400',
    color: CREAM,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: s(12),
    paddingHorizontal: s(spacing.xxl),
  },

  // ── Tagline ───────────────────────────────────────────────────────────────
  tagline: {
    fontFamily: SERIF_FALLBACK,
    fontStyle: 'italic',
    fontSize: s(11),
    color: DUSTY_MUTED,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: s(spacing.xxxl + 8),
  },

  // ── Divider + dots ────────────────────────────────────────────────────────
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
  },
  dividerLine: {
    width: s(34),
    height: 1,
    backgroundColor: ROSE_LINE,
    marginHorizontal: s(4),
  },
  dot: {
    width: s(5),
    height: s(5),
    borderRadius: radii.dot,
    backgroundColor: DOT_COLOR,
  },
});