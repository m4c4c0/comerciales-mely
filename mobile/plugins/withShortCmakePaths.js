const { withAppBuildGradle, withProjectBuildGradle } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Android SDK CMake 3.22 includes Ninja without Windows long-path support.
// Use a project-local official Ninja; do not replace the SDK installation.
module.exports = function withShortCmakePaths(config) {
  if (process.platform !== 'win32') return config;
  config = withAppBuildGradle(config, (mod) => {
    const ninja = path.join(mod.modRequest.projectRoot, 'tools/native/ninja-1.13.2/ninja.exe').replace(/\\/g, '/');
    // Remove the previous app-only block when regenerating an existing project.
    mod.modResults.contents = mod.modResults.contents.replace(
      /\r?\n\/\/ Comerciales Mely: Windows Ninja with long-path support\r?\nandroid \{\r?\n    defaultConfig \{\r?\n        externalNativeBuild \{\r?\n            cmake \{[\s\S]*?\r?\n            \}\r?\n        \}\r?\n    \}\r?\n\}\r?\n?/g,
      '\n'
    );
    // Expo evaluates :app early, before the root's subproject hook is installed.
    if (fs.existsSync(ninja)) {
      mod.modResults.contents += `
// Comerciales Mely: Windows Ninja with long-path support
android {
    defaultConfig {
        externalNativeBuild {
            cmake {
                arguments "-DCMAKE_MAKE_PROGRAM=${ninja}",
                    "-DCMAKE_JOB_POOLS=mely_compile=2;mely_link=1",
                    "-DCMAKE_JOB_POOL_COMPILE=mely_compile",
                    "-DCMAKE_JOB_POOL_LINK=mely_link"
            }
        }
    }
}
`;
    }
    return mod;
  });
  return withProjectBuildGradle(config, (mod) => {
    const ninja = path.join(mod.modRequest.projectRoot, 'tools/native/ninja-1.13.2/ninja.exe').replace(/\\/g, '/');
    const marker = '// Comerciales Mely: Windows Ninja with long-path support';
    if (fs.existsSync(ninja) && !mod.modResults.contents.includes(marker)) {
      mod.modResults.contents += `
${marker}
// Apply to native dependencies too: their Prefab paths can exceed MAX_PATH.
subprojects { nativeProject ->
    def configureMelyNinja = {
        def nativeAndroid = nativeProject.extensions.findByName("android")
        if (nativeAndroid != null) {
            nativeAndroid.defaultConfig {
                externalNativeBuild {
                    cmake {
                        arguments "-DCMAKE_MAKE_PROGRAM=${ninja}"
                    }
                }
            }
        }
    }
    if (nativeProject.state.executed) {
        configureMelyNinja()
    } else {
        nativeProject.afterEvaluate { configureMelyNinja() }
    }
}
`;
    }
    return mod;
  });
};
