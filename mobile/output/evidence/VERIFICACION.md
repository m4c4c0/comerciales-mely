# Verificación de la entrega revisada 1.0.1

Fecha: 19 de octubre de 2026. Alcance: Android y preparación iOS.

## APK publicado

Archivo: output/android/Comerciales-Mely-etapa3.apk.
Versión: 1.0.1, versionCode 2. Tamaño: 67 999 511 bytes.
SHA-256: 6792082993bca31cae82b40b59f1644d109fae1f4c7f16e7fffd398177411442.
Paquete: com.anonymous.comercialesmelymovil. ABI: arm64-v8a y x86_64.
Android mínimo API 24; compile SDK 37, target SDK 36.
Firma APK v2 comprobada con apksigner 37.0.0. Certificado SHA-256: fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c. Coincide con el APK anterior, por lo que permite actualizar sin desinstalar. Es firma académica de demostración.

## Compilación y pruebas

Ejecución exitosa: https://github.com/wilfredo409/comerciales-mely-web/actions/runs/39256275087
Commit compilado: caf1fb7896cfb1bda28c84bbdd93e7f3acc657c5.
Gradle: BUILD SUCCESSFUL in 15m 59s. Node 24, Java 25 y dependencias del lockfile.

Once pruebas del dominio, lint y revisión del proyecto pasaron. También se repitieron localmente npm test, npm run lint, npm run typecheck y npm run export:mobile para Android e iOS. El proyecto está escrito en JavaScript; typecheck no implica cobertura completa de tipos.

El mismo APK fue instalado en un emulador Android 14. ANDROID_SMOKE_OK.txt y android-smoke.json acreditan once comprobaciones reales: inicio autónomo, formulario vacío, acceso, catálogo, ficha, entrada de bodega, venta y descuento de existencias, reportes, persistencia, permisos y cierre de sesión. El registro adicional completó creación de empleado, reingreso y cierre; consultar REGISTRO_OK.txt y registro.json.

Las figuras 1 a 12 corresponden a esa ejecución. La figura 11 muestra la cuenta creada y la figura 12 muestra Alertas de stock. Se retiró la captura repetida del perfil.

## Video de etapa 3

Grabación completa exitosa: https://github.com/wilfredo409/comerciales-mely-web/actions/runs/39259351843
Commit de automatización: 2a592f42ab1e1512d57dc9c16f348283f5e6008d.

DEMO_OK.txt y tiempos.json se conservan en output/demo. El recorrido incluye el icono instalado, login vacío y con contraseña incorrecta, acceso válido, catálogo y ficha, entrada, venta, reporte, persistencia, perfiles, registro vacío y con confirmación diferente, registro válido, reingreso, alertas y cierre. Las figuras 13 a 15 proceden de esta ejecución independiente del mismo APK. La captura 00 documenta el icono real en el launcher.

El video se entrega sin audio, subtítulos ni explicaciones superpuestas. El primer tramo es un visor del registro real de compilación con las esperas resumidas; el resto son clips reales del dispositivo concatenados. No es una grabación de una compilación local en Windows. El guion de voz está separado y debe grabarlo el equipo, como solicitó el usuario. La comprobación técnica del montaje final está en VIDEO_FINAL.json.

## iOS y avances posteriores

Se prepararon identificador com.refes.comercialesmely, icono Mely, permisos, versión 1.0.1/build 2, código compartido y perfiles EAS. La exportación JavaScript/Hermes iOS terminó correctamente. No se generó un IPA ni se realizaron pruebas nativas en iPhone. El manual distingue Mac/Xcode, build para simulador y distribución interna con firma Apple.

SQLite conserva datos por instalación. Firebase Authentication, Google, Firestore y sincronización con la web pertenecen al siguiente avance. La participación de los integrantes y la narración posterior deben ser reales.

## Seguimiento documental del equipo

El 19 de octubre de 2026 se verificó la sesión wilfredo409 y los accesos de los cinco integrantes. Desde esa cuenta se publicó la invitación de trabajo https://github.com/m4c4c0/comerciales-mely/issues/9, asignada a Ferhboot, Stevenhzw, m4c4c0 y floripeto. El informe incluye permisos y seguimiento; los aportes de los compañeros quedan pendientes de evidencia real.
