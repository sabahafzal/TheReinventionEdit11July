// plugins/withDumpModulesProvider.js
//
// DIAGNOSTIC-ONLY config plugin. Adds an Xcode "Run Script" build phase that
// prints the full contents of the generated ExpoModulesProvider.swift file
// straight into the Xcode build log during the archive step.
//
// Why: the build log already proves ExpoFont is compiled and linked as a pod,
// and that ExpoModulesProvider.swift itself compiles successfully — but we
// have no way to see whether ExpoFontLoader is actually *listed* inside that
// file's generated registration code, which is what the JS bridge reads at
// runtime. This phase makes that content visible in the same log file we
// already know how to retrieve, without needing a Mac.
//
// Remove this plugin once the root cause is confirmed — it's not meant to
// stay in the project long-term, it's purely to get visibility into one
// specific file for one specific build.
const { withXcodeProject } = require('@expo/config-plugins');

const withDumpModulesProvider = (config) => {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;

    // Avoid `find -exec ... \;` — backslash-escaped semicolons have proven
    // fragile when passed through Xcode's project-file string encoding
    // (the backslash gets silently dropped). A plain multi-line script with
    // a variable avoids that class of escaping bug entirely.
    const shellScript =
      'echo "=== DIAGNOSTIC: searching for ExpoModulesProvider.swift ==="\n' +
      'FOUND_FILE=$(find "${PODS_ROOT}/Target Support Files" -iname "ExpoModulesProvider.swift" | head -n 1)\n' +
      'echo "=== DIAGNOSTIC: found path: $FOUND_FILE ==="\n' +
      'if [ -n "$FOUND_FILE" ]; then\n' +
      '  cat "$FOUND_FILE"\n' +
      'else\n' +
      '  echo "=== DIAGNOSTIC: no file found matching that name ==="\n' +
      'fi\n' +
      'echo "=== DIAGNOSTIC: end of ExpoModulesProvider.swift dump ==="\n';

    xcodeProject.addBuildPhase(
      [],
      'PBXShellScriptBuildPhase',
      'Dump ExpoModulesProvider (diagnostic)',
      null,
      {
        shellPath: '/bin/sh',
        shellScript,
      }
    );

    return config;
  });
};

module.exports = withDumpModulesProvider;
