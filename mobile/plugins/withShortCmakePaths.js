const { withAppBuildGradle } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Android SDK CMake 3.22 includes Ninja without Windows long-path support.
// Use a project-local official Ninja; do not replace the SDK installation.
module.exports = function withShortCmakePaths(config) {
  if (process.platform !== 'win32') return config;
  return withAppBuildGradle(config, (mod) => {
    const ninja = path.join(mod.modRequest.projectRoot, 'tools/native/ninja.exe').replace(/\\/g, '/');
    const marker = '// Comerciales Mely: Windows Ninja with long-path support';
    if (fs.existsSync(ninja) && !mod.modResults.contents.includes(marker)) {
      mod.modResults.contents += `
${marker}
android {
    defaultConfig {
        externalNativeBuild {
            cmake {
                arguments "-DCMAKE_MAKE_PROGRAM=${ninja}"
            }
        }
    }
}
`;
    }
    return mod;
  });
};
