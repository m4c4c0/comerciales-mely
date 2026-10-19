const { withAppBuildGradle } = require('@expo/config-plugins');

// Preserve the short CMake object paths needed by Windows/Ninja.
module.exports = function withShortCmakePaths(config) {
  return withAppBuildGradle(config, (mod) => {
    const marker = '// Comerciales Mely: short CMake paths';
    if (!mod.modResults.contents.includes(marker)) {
      mod.modResults.contents += `
${marker}
android {
    defaultConfig {
        externalNativeBuild {
            cmake {
                arguments "-DCMAKE_OBJECT_PATH_MAX=200"
            }
        }
    }
}
`;
    }
    return mod;
  });
};
