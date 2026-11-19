# Guía de entrega final

## Configuración y despliegue

1. Configura Firebase con las instrucciones de [FIREBASE.md](FIREBASE.md), habilita Email/Password y Google, y publica las reglas de `../firestore.rules`.
2. Configura las seis variables `NEXT_PUBLIC_FIREBASE_*` en Vercel y despliega la rama `main`. Agrega el dominio Vercel a los dominios autorizados de Firebase Authentication.
3. Para Android, crea `.env` desde `.env.example`, define `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, registra el paquete Android y su SHA-1 en Firebase y compila una APK nueva con `npm run build:android`.
4. Prueba una cuenta con cada rol y una operación de inventario/venta en web y móvil; confirma que el cambio se refleja en ambas plataformas.

No hay credenciales de demostración compartidas. Usa cuentas de Firebase autorizadas para el equipo. El primer administrador debe asignarse desde Firebase Console como se describe en la guía.

## Verificación local

Desde `mobile/`:

```powershell
npm ci
npm test
npm run lint
npm run typecheck
npm run export:mobile
npm run build:android
```

La exportación JavaScript no equivale a una APK ni prueba Google Sign-In nativo. Las capturas y archivos de `output/evidence` y `output/android` se conservan de la etapa anterior y no verifican la integración Firebase actual. Consulta la matriz en [docs/CRITERIOS.md](docs/CRITERIOS.md) para los límites de verificación externa y de iOS.

La entrega en GitHub está en [wilfredo409/comerciales-mely-web](https://github.com/wilfredo409/comerciales-mely-web). El video y la defensa oral del equipo deben grabarse y prepararse con [docs/GUION_VIDEO.md](docs/GUION_VIDEO.md); cada integrante explica sus aportes reales.
