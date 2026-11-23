# Guía de entrega final

## Aplicaciones y backend

- Web React + Next.js publicada en [Vercel](https://comerciales-mely-web.vercel.app), desde `main` de `wilfredo409/comerciales-mely-web`.
- React Native + Expo Router en `mobile/`, con APK Release [ARM64 para teléfono y x86_64 para emulador](output/android/README.md).
- Ambas usan el Firebase original **`comerciales-mely`**, Firestore `nam5`, Authentication por correo y Google, perfiles por rol y las mismas colecciones. [Configuración](FIREBASE.md).
- El dominio Vercel fue autorizado por el propietario. Se comprobó Google web y la lectura del catálogo original. No falta otro cambio de dominios para esta URL.
- El código y los archivos de la entrega se sincronizan con [el repositorio de la fase anterior](https://github.com/m4c4c0/comerciales-mely). Se conservan ambos historiales y el [archivo de la web previa](../docs/historial/README.md).

## Evidencia y límites

El [registro del Firebase original](output/evidence/PRUEBAS-FIREBASE-ORIGINAL-20261122.md) contiene las pruebas de correo, roles, movimientos, ventas y persistencia del adaptador móvil; pruebas de la web local y publicada; acceso Google web; reglas publicadas y conservación de los datos anteriores. Las APK incluyen el bundle y tienen firma verificada. La aceptación de pantallas Android se documenta en ese registro al ejecutarla; no se confunde una prueba de adaptador con una prueba de dispositivo.

Pruebas locales: 18 casos de Firestore (incluyen perfiles concurrentes), 12 de dominio móvil, 3 de calendario local y comprobación de configuración compartida. La web compila con Next.js. El flujo de GitHub compila ambas ABI y comprueba el formulario en Android 14 sin escribir datos remotos.

No se publican contraseñas de prueba ni respaldos con perfiles. Cada usuario entra con una cuenta autorizada. Los roles Administrador existentes se preservan; no hay autoasignación de privilegios. Las evidencias anteriores de `comerciales-mely-final` y SQLite son históricas.

## Comandos

Desde la raíz:

```powershell
npm ci
npm run dev
npm run build
npm run test:rules
npm run test:calendar
npm run test:config
```

Desde `mobile/`:

```powershell
npm ci
Copy-Item .env.example .env
npm test
npm run lint
npm run typecheck
npm run start
```

La compilación nativa y la exportación se explican en [README.md](README.md). Para iPhone se necesitan firma y dispositivo Apple; una exportación JavaScript no equivale a una IPA probada.

## Acciones del equipo

Consultar la [matriz de evaluación](docs/CRITERIOS.md) y [colaboración](docs/COLABORACION.md). Cada integrante debe conservar su rama y commits auténticos, aceptar las invitaciones pendientes y preparar la defensa. El [guion](docs/GUION_VIDEO.md) es una ayuda para la presentación; no sustituye la participación oral de los integrantes.
