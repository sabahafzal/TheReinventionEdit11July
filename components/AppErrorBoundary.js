// components/AppErrorBoundary.js
//
// Wraps the app (see App.js — it now sits directly around AppInner, above
// everything that could throw, including useFonts()). If anything crashes
// during render, this catches it, logs it two independent ways (Sentry +
// a standalone local log — see lib/errorLog.js), and shows a fallback
// screen instead of a blank white box.
//
// IMPORTANT: the fallback UI below is deliberately built from ONLY raw
// react-native primitives (View, Text, StyleSheet) with inline values —
// no theme.js, no custom fonts, no other app code. If it imported anything
// from the app itself and THAT import was the thing that crashed, this
// fallback would throw too, and a boundary can't catch its own render
// failure — the app would still go blank, just one level deeper. Keeping
// this component dependency-free is what guarantees it can never
// double-fault.
//
// The fallback also prints the actual error message on screen. This is
// intentional and temporary while we're chasing an intermittent native
// crash — screenshot it and it tells you immediately what broke, no Xcode
// or dashboard required. Safe to strip out once builds are stable again.

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { logError } from '../lib/errorLog';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, componentStack: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Logs to BOTH Sentry and the standalone local log (see lib/errorLog.js
    // for why both exist — Sentry's own native layer is not guaranteed to
    // be unaffected by the exact class of bug we're chasing).
    logError('[AppErrorBoundary] Render error caught', error, {
      componentStack: info?.componentStack,
    });
    this.setState({ componentStack: info?.componentStack || null });
  }

  render() {
    if (this.state.hasError) {
      const message = this.state.error?.message || String(this.state.error);
      const isNativeModuleIssue =
        /native module/i.test(message) || /ExpoFontLoader|ExponentConstants/i.test(message);

      return (
        <View style={styles.root}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              Please close and reopen the app. If this keeps happening,
              screenshot this screen.
            </Text>

            {isNativeModuleIssue && (
              <Text style={styles.hint}>
                (Native module missing — this build's binary is likely
                missing a native rebuild, not a JS-only issue.)
              </Text>
            )}

            <View style={styles.divider} />

            <Text style={styles.debugLabel}>Error</Text>
            <Text style={styles.debugText} selectable>{message}</Text>

            {!!this.state.componentStack && (
              <>
                <Text style={styles.debugLabel}>Component stack</Text>
                <Text style={styles.debugText} selectable>
                  {this.state.componentStack}
                </Text>
              </>
            )}
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 12,
  },
  hint: {
    fontSize: 13,
    color: '#8a5a00',
    textAlign: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  debugLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888888',
    marginTop: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  debugText: {
    fontSize: 12,
    color: '#333333',
    fontFamily: 'Courier',
  },
});