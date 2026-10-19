# Preparación de iOS

Se prepararon el código compartido React Native, los recursos locales, el bundle iOS, el identificador `com.refes.comercialesmely`, compatibilidad de tablet, los mensajes de permisos de cámara/fototeca y perfiles EAS. El usuario decidió realizar Android por ahora.

## Cuando se disponga de la cuenta

Desde la carpeta de la app:

```powershell
npm ci
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build --platform ios --profile ios-simulator
```

El último comando produce una compilación para simulador macOS, sin instalación en un iPhone. Para un dispositivo físico, disponer de membresía Apple Developer, credenciales propias y registro del dispositivo, y ejecutar:

```powershell
npm run build:ios
```

EAS solicitará los datos necesarios. No incluir certificados, contraseñas ni perfiles privados en Git. Alternativamente, en Mac con Xcode ejecutar `npm run ios` y validar el proyecto nativo generado.

## Pruebas pendientes en iPhone

Repetir registro/login, teclado y áreas seguras, pestañas y detalle, fotografía/galería con denegación y concesión de permisos, entrada/salida, venta, exportación y compartición de PDF, persistencia y cierre de sesión. La exportación Hermes/JavaScript ya generada no acredita estas pruebas ni equivale a un IPA.

La base SQLite actual pertenece a cada instalación; Firebase y sincronización web/móvil requieren el trabajo del siguiente avance. No se crearon cuentas ni se contrataron servicios.
