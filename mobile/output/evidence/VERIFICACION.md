# Verificación de la entrega móvil

## Compilación comprobada

APK: `output/android/Comerciales-Mely-etapa3.apk` (68 238 420 bytes).
SHA-256: `f54a25199b44f2e9595154d755b4617244f0434dead11ab4216c748d32f08ac1`.

Generado en Ubuntu con Node 24, JDK 25, Expo SDK 58, Gradle y ABI arm64-v8a + x86_64. La firma APK v2 se comprobó con apksigner 37.0.0 en Windows. Es firma académica de demostración; no una publicación en Play Store.

Registro original de compilación: https://github.com/wilfredo409/comerciales-mely-web/actions/runs/39195110302
Commit del código de la app compilada: bedfb933640fc29f26aa38167458acfa8e4153a0.

El paso de compilación y la subida del APK terminaron correctamente. El primer recorrido de dispositivo se interrumpió después del acceso; el estado global de esa ejecución es fallido por la prueba de navegación, no por la compilación. Se conserva la distinción entre construir y verificar funcionalidad.

## Instalación en teléfono Android

Copiar el APK al teléfono y abrirlo; autorizar la instalación desde la aplicación usada para abrirlo cuando Android lo solicite. Alternativa USB con depuración activada:

```powershell
adb devices
adb install -r C:\proy\mely\output\android\Comerciales-Mely-etapa3.apk
```

La app funciona sin Metro y sus datos locales no requieren internet. Admin: `admin` / `admin123`; Empleado: `empleado` / `empleado123`; Cajero: `facturador` / `factura123`. Seleccionar el perfil que corresponde a la cuenta.

## Verificación de código

`npm ci`, 11 pruebas de dominio, `npm run lint` y `npm run typecheck` terminaron correctamente en el runner de compilación. Las exportaciones Android e iOS están en `output/bundles`; se generó metadata para ambas plataformas. El proyecto es JavaScript: typecheck comprueba sintaxis sin cobertura completa de tipos.

## Límites de la evidencia

La compilación local en Windows se detuvo por espacio limitado, rutas largas de Ninja y bloqueo de archivos generados; el APK entregado se obtuvo del runner Linux. No se modificaron las ramas previas del equipo. La app se incorpora en una rama independiente.

iOS queda preparado mediante bundle, identificador, permisos y perfiles EAS; no existe IPA ni prueba en iPhone. Firebase remoto y sincronización web/móvil quedan pendientes del siguiente avance. La grabación automatizada es apoyo técnico y no sustituye el video explicado por los integrantes.
