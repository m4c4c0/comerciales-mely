# Guía de entrega final

## Configuración y despliegue

1. Firebase está configurado según [FIREBASE.md](FIREBASE.md): Authentication, Firestore y reglas del repositorio están activos en `comerciales-mely-final`.
2. La rama `main` está vinculada a Vercel y publicada en [comerciales-mely-web.vercel.app](https://comerciales-mely-web.vercel.app). Las seis variables web están configuradas para producción y el dominio está autorizado en Firebase.
3. El paquete Android, el cliente OAuth Web y la SHA-1 de depuración de este equipo están registrados. Falta compilar una APK nueva con `npm run build:android` y probar Google Sign-In nativo en Android.
4. Falta una prueba de aceptación con cuentas reales de cada rol y una operación de inventario/venta en ambas plataformas que confirme la sincronización.

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
