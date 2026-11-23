# Guía de entrega final

## Configuración y despliegue

1. Firebase está configurado según [FIREBASE.md](FIREBASE.md): Authentication, Firestore y reglas del repositorio están activos en `comerciales-mely-final`.
2. La rama `main` está vinculada a Vercel y publicada en [comerciales-mely-web.vercel.app](https://comerciales-mely-web.vercel.app). Las seis variables web están configuradas para producción y el dominio está autorizado en Firebase.
3. El paquete Android, el cliente OAuth Web y la SHA-1 de depuración de este equipo están registrados. El script prepara Ninja 1.13.2 y el plugin lo aplica a la app y a las dependencias; conserva la caché de Gradle fuera del proyecto nativo generado. La APK x86_64 compiló correctamente, con firma y bundle verificados; está en [output/android/](output/android/README.md). La instalación y Google Sign-In nativo siguen en verificación. La exportación final Android/iOS también terminó correctamente.
4. Se probaron inventario, entrada, venta y reportes desde la web con Administrador; 16 casos de reglas con emulador; venta remota como Facturador y el flujo de correo/venta/recarga del adaptador móvil contra Firebase remoto. La web confirmó stock 22 tras la escritura móvil. Falta completar las pantallas Android y el acceso nativo Google. Ver [registro y límites de las pruebas](output/evidence/PRUEBAS-FIREBASE-20261122.md).

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

La exportación JavaScript no equivale a una APK ni prueba Google Sign-In nativo. Las capturas 30 a 33 y el registro `PRUEBAS-FIREBASE-20261122.md` verifican los recorridos Firebase descritos. El APK y las capturas de Foro 1 se conservan como historial de la versión SQLite anterior. Consulta la matriz en [docs/CRITERIOS.md](docs/CRITERIOS.md) para los límites de verificación externa y de iOS.

La entrega en GitHub está en [wilfredo409/comerciales-mely-web](https://github.com/wilfredo409/comerciales-mely-web). El video y la defensa oral del equipo deben grabarse y prepararse con [docs/GUION_VIDEO.md](docs/GUION_VIDEO.md); cada integrante explica sus aportes reales.
