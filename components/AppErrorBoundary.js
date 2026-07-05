// components/AppErrorBoundary.js
//
// Wraps the entire navigator tree. If any screen crashes during render,
// this catches it, logs the full error to the console, and shows the
// SplashScreen instead of a blank white box.
//
// Safe to ship permanently — it's invisible to users when nothing goes wrong.
// To diagnose a blank screen in a production build, connect the device to
// Xcode and read the console output (Window → Devices and Simulators →
// select device → open logs). The error and component stack will appear there.

import React from 'react';
import SplashScreen from '../screens/SplashScreen';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // These lines appear in Xcode's device console log and in
    // any crash reporting tool (Sentry, Bugsnag, etc.) if you add one later.
    console.error('[AppErrorBoundary] Render error:', error?.message || error);
    console.error('[AppErrorBoundary] Component stack:', info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // Shows your branded splash instead of a blank white screen.
      // The error itself is already logged above.
      return <SplashScreen />;
    }
    return this.props.children;
  }
}