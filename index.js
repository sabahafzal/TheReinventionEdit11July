import * as Sentry from '@sentry/react-native';

// This MUST run before App.js (and its full import tree — AuthStack ->
// lib/supabase.ts, etc.) is evaluated. A plain `import App from './App'`
// would NOT guarantee this, because Babel hoists all static `import`
// statements above other top-level code in a file, regardless of source
// order — so even putting this above `import App from './App'` wouldn't
// have worked. Using require() instead is what actually guarantees
// ordering, since require() is a normal runtime function call, not hoisted.
Sentry.init({
  dsn: 'https://beab71e11cd91a740626271fa86cc054@o4511717414862848.ingest.de.sentry.io/4511717419057232',
  debug: false,
  tracesSampleRate: 1.0,
  enableNative: true,
});
Sentry.captureMessage('[Checkpoint 0] index.js — true entry point, Sentry initialized first');

const { registerRootComponent } = require('expo');
const App = require('./App').default;

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);