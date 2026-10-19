# Verificación final de Android y preparación iOS

Preparación de entrega: 19 de octubre de 2026.

## APK de entrega

Archivo: `output/android/Comerciales-Mely-etapa3.apk`.
Tamaño: 68 238 512 bytes.
SHA-256: `2c1718a3a1d0f1b27e79e00c6a460b421b831a4dc20bd42a493cda769fd10d2d`.
ABI: arm64-v8a para teléfonos y x86_64 para emuladores. Incluye JavaScript/Hermes y recursos locales; no depende de Metro.

Firma APK v2 verificada con apksigner 37.0.0. Es firma de demostración académica, no una publicación en Play Store.

## Resultado reproducible

Ejecución completa exitosa: https://github.com/wilfredo409/comerciales-mely-web/actions/runs/39199889132
Código de la app compilada: `2006c87faeb6a19014046cd4a14086536e081758`.

Node 24, JDK 25, npm ci, 11 pruebas del dominio, lint y comprobación sintáctica terminaron correctamente. El proyecto está escrito en JavaScript: typecheck no representa cobertura completa de tipos.

El APK fue instalado y ejecutado en Android 14. `ANDROID_SMOKE_OK.txt` y `android-smoke.json` documentan once comprobaciones reales: inicio autónomo, formulario vacío, login, catálogo, ficha con imagen, entrada de bodega, venta transaccional, reportes, persistencia, permisos de empleado/cajero y cierre de sesión. Algunas comprobaciones agrupan más de una acción; la numeración y tiempos exactos están en el JSON.

Se corrigieron dos diferencias de Expo Router 58 detectadas al probar: href nulo redirige las rutas ocultas y las protecciones requieren destinos explícitos para la transición de sesión. Las rutas secundarias ocultan solo su botón; Stack.Protected usa redirectTo.

La compilación local Windows también terminó con BUILD SUCCESSFUL (ARM64). El script prepara Ninja 1.13.2 verificado por SHA-256 dentro del proyecto para admitir rutas largas. No reemplaza el Ninja del SDK. El APK principal entregado es el universal del recorrido completo anterior.

## Instalación

Copiar y abrir el APK en Android, autorizando la aplicación instaladora cuando el sistema lo solicite. Por USB, con depuración activada:

```powershell
adb devices
adb install -r C:\proy\mely\output\android\Comerciales-Mely-etapa3.apk
```

Admin: `admin` / `admin123`; Empleado: `empleado` / `empleado123`; Cajero: `facturador` / `factura123`. Seleccionar el perfil correspondiente. Son cuentas locales de prueba.

## iOS y evidencia audiovisual

La exportación final Android/iOS terminó correctamente y está en output/bundles. iOS tiene identificador, permisos y perfiles EAS preparados; no existe IPA ni prueba en iPhone. Ver docs/IOS_PREPARACION.md.

El video técnico automático dura unos tres minutos y muestra el núcleo del recorrido; el registro completo dura unos cuatro minutos. No tiene explicación hablada del equipo ni cubre en video todos los perfiles. Las capturas y el JSON completan su evidencia técnica. El equipo debe grabar su explicación siguiendo docs/GUION_VIDEO.md para satisfacer la entrega audiovisual de la materia.

SQLite conserva datos por dispositivo. Firebase Authentication, Google, Firestore y sincronización con la web son requisitos de los siguientes avances y no están acreditados por este APK.


## Registro de cuentas

Prueba adicional exitosa sobre el mismo APK final en Android 14: https://github.com/wilfredo409/comerciales-mely-web/actions/runs/39215756238 . Se verificaron creación de empleado con contraseña confirmada, acceso automático, reingreso posterior y cierre. Evidencias: 10-registro.png, 11-registro-creado.png, 12-registro-reingreso.png, registro.json y REGISTRO_OK.txt.

El emulador local de Windows sufrió bloqueos de System UI durante pruebas de arranque. No se usaron esas capturas como evidencia de funcionamiento. La evidencia de registro y del recorrido completo procede de las ejecuciones exitosas de Android 14 en GitHub Actions. La compilación Windows sí terminó correctamente.
