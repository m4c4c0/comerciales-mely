const { withAppBuildGradle } = require('@expo/config-plugins');

// A debug APK also includes its JS/assets, so the academic demo can run offline
// from Metro. React Native still uses Metro when a development server is present.
module.exports = function withBundledDebug(config) {
  return withAppBuildGradle(config, (mod) => {
    const marker = '// Comerciales Mely: bundle JavaScript in debug APKs';
    if (!mod.modResults.contents.includes(marker)) {
      mod.modResults.contents += `
${marker}
react {
    debuggableVariants = []
}
`;
    }
    return mod;
  });
};
