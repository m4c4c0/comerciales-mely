# Compilación Android — 22 de noviembre de 2026

## APK x86_64 generada

- Expo SDK 58, React Native 0.88.0, Gradle 9.4.1 y JDK 17.
- Android SDK Build Tools 37.0.0, NDK 27.1.12297006 y Ninja 1.13.2 oficial, preparado dentro de la copia de compilación.
- Compilación local en una ruta ASCII; `GRADLE_USER_HOME` también sin acentos.
- `:app:assembleDebug -PreactNativeArchitectures=x86_64`, con caché de proyecto fuera de `android/`, `--build-cache` y todos los pasos nativos habilitados.
- Resultado: `BUILD SUCCESSFUL in 25m 14s`, 369 tareas (44 ejecutadas y 325 al día).
- La variante final no omitió tareas de compilación. Un intento anterior de reutilizar bibliotecas mediante exclusión de tareas se descartó porque Gradle rechazó sus proveedores de recursos.
- APK: 88.53 MiB; contiene `assets/index.android.bundle` y bibliotecas `lib/x86_64/`.
- Firma verificada con `apksigner verify`; certificado de depuración SHA-1 `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`.
- Archivo y SHA-256: [directorio de APK](../android/README.md).

## Problema corregido

Ninja 1.10.2 del SDK seguía siendo utilizado por la app, aunque las dependencias recibían una versión nueva. Eso causaba errores con rutas de más de 260 caracteres y regeneraciones de `build.ninja`. El plugin ahora configura Ninja 1.13.2 tanto en la app como en las dependencias. Los 73 objetos C++ de la app y los 67 de Expo Modules Core x86_64 compilaron y la APK se empaquetó correctamente. El script verifica versión y huella SHA-256 de la distribución oficial.

La variante Debug incluye el bundle mediante un config plugin. El historial Gradle se guarda fuera del directorio nativo para conservarlo cuando Expo regenera Android. Los cambios permanecen en plugins y scripts; los proyectos nativos generados no se versionan.

## Ejecución pendiente

Android 14 Google APIs y Android Emulator 37.3.10 están instalados. El primer intento no pudo crear la partición de datos porque necesitaba 7,372.8 MB libres. Después de liberar espacio en D se detectó una instalación incompleta de la imagen: `system.img` tenía 3,088,055,440 bytes y faltaban `vendor.img` y `userdata.img`.

Se descargó nuevamente `x86_64-34_r14.zip` desde el repositorio oficial de Google y se verificó su SHA-1 contra el manifiesto: `e0f6c9a0691aa27bd597d0deb1bcfdc943ac8ca7`. La extracción completa restauró `system.img` (4,306,501,632 bytes), `vendor.img` (103,809,024 bytes), `userdata.img` y los archivos de configuración. El perfil aislado `Mely_API34_ASCII`, con datos en D, logró conectarse por ADB como `device`, informó API 34 y montó `/data` con 5.4 GB disponibles. La aceptación de la app requiere que finalice la inicialización del gestor de paquetes.

La exportación final Android/iOS, posterior a la corrección de `normalizeAuthUser`, terminó con código 0 usando `expo export --platform android --platform ios --max-workers 1`. Generó los bundles Hermes `index-efde6b6c1a02b899558d689b6d0f18b7.hbc` (Android) e `index-a37ec8244303f8bcda2d593b16ba3f2a.hbc` (iOS), de 5.1 MB cada uno. Estos bundles no son instaladores iOS.

## Instalación y arranque de la actividad

Android terminó el primer arranque (`sys.boot_completed=1`). `adb install --no-streaming -r` transfirió 92,835,573 bytes y terminó con `Success`; se abrió `com.anonymous.comercialesmelymovil/.MainActivity` y el proceso de la app quedó activo. No había servidor escuchando en el puerto Metro 8081 ni redirecciones ADB hacia Metro. Los registros consultados de `AndroidRuntime` y `ReactNativeJS` no mostraron errores propios de la app.

La interfaz quedó inicialmente bloqueada por avisos ANR de **Process system** y **System UI**, con presión de memoria y E/S del emulador. Se redujo la resolución del perfil de pruebas y se reinició conservando datos, usando la GPU anfitriona. No se presenta ese arranque de proceso como aceptación funcional de pantallas ni prueba de Google.

La compilación, firma, bundle e instalación verificados **no equivalen** a una prueba de pantallas, persistencia nativa ni Google Sign-In. Estos recorridos se registrarán después de ejecutarlos. Las pruebas reales del adaptador móvil contra Firebase y la lectura web del resultado están en [PRUEBAS-FIREBASE-20261122.md](PRUEBAS-FIREBASE-20261122.md).
