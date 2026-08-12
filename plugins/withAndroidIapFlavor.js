const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * react-native-iap ships two Android product flavors (amazon / play) and
 * does not provide its own Expo config plugin to resolve the ambiguity.
 * Without this, `gradlew :app:bundleRelease` fails with:
 *   "Could not resolve project :react-native-iap ... cannot choose between
 *    amazonReleaseRuntimeElements / playReleaseRuntimeElements"
 *
 * This plugin injects `missingDimensionStrategy 'store', 'play'` into
 * android/app/build.gradle's defaultConfig block on every prebuild,
 * so the fix survives EAS Build's continuous native generation.
 */
module.exports = function withAndroidIapFlavor(config) {
  return withAppBuildGradle(config, (config) => {
    const marker = "missingDimensionStrategy 'store', 'play'";

    if (config.modResults.contents.includes(marker)) {
      // Already present, nothing to do.
      return config;
    }

    const defaultConfigRegex = /defaultConfig\s*{/;

    if (!defaultConfigRegex.test(config.modResults.contents)) {
      throw new Error(
        'withAndroidIapFlavor: could not find `defaultConfig {` block in android/app/build.gradle'
      );
    }

    config.modResults.contents = config.modResults.contents.replace(
      defaultConfigRegex,
      (match) => `${match}\n        ${marker}`
    );

    return config;
  });
};
