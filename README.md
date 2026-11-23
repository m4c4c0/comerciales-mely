# Comerciales Mely

Sistema académico multiplataforma para inventario, movimientos de bodega, facturación y reportes. Proyecto de DPS941, Universidad Don Bosco, Ciclo II-2026, equipo R.E.F.E.S.

> **Estado de integración (22 de noviembre de 2026):** la web está desplegada en [comerciales-mely-web.vercel.app](https://comerciales-mely-web.vercel.app). Web y móvil comparten Firebase `comerciales-mely-final`; Authentication tiene correo/contraseña y Google habilitados, Firestore está en `us-central1` y las reglas de [`firestore.rules`](firestore.rules) están publicadas. Pasaron la compilación web, 16 pruebas de reglas y 12 pruebas de dominio móvil. El adaptador móvil se probó contra Firebase remoto: acceso por correo, roles, venta transaccional, recarga y cierre de sesión; la web confirmó el stock resultante. La exportación final JavaScript Android/iOS pasó y la [APK Android x86_64](mobile/output/android/README.md) compiló con firma y bundle verificados; la instalación y Google Sign-In nativo siguen en verificación. Ver [evidencias actuales](mobile/output/evidence/PRUEBAS-FIREBASE-20261122.md), [Firebase](mobile/FIREBASE.md) y la [matriz de criterios](mobile/docs/CRITERIOS.md).

## Aplicaciones

| Plataforma | Código | Tecnología | Persistencia actual |
| --- | --- | --- | --- |
| Web | raíz (`pages/`, `components/`, `services/`) | React 18, Next.js 14 y Firebase Web SDK | Cloud Firestore compartido; [despliegue Vercel](https://comerciales-mely-web.vercel.app) |
| Android/iOS | [`mobile/`](mobile/) | React Native, Expo Router y Firebase SDK | Cloud Firestore compartido; Firebase Authentication mantiene la sesión |

Ambas aplicaciones implementan inventario, entradas/salidas, ventas con IVA del 13 %, control de existencias y reportes. Los cambios de productos, movimientos y facturas se escriben en las colecciones compartidas `productos`, `movimientos` y `facturas`; las cuentas y roles están en `usuarios/{uid}`. Las operaciones de stock se escriben junto con su movimiento en una transacción.

## Requisitos

- Node.js 20 o superior para la web; Node.js >=22.13 para Expo móvil y npm. Las pruebas de esta entrega se realizaron con Node 24.
- Para Android: Android Studio, Android SDK/NDK y JDK compatibles con Expo SDK 58. Para los pasos comprobados en este equipo, ver [`mobile/README.md`](mobile/README.md).
- Variables de tu proyecto Firebase en `.env.local` y `mobile/.env`; las plantillas están en `.env.example` y `mobile/.env.example`. No subas los archivos locales.

## Ejecutar la web

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Abre `http://localhost:3000`. Para compilar y servir la versión de producción:

```powershell
npm run build
npm run start
```

La web incluye acceso por correo, registro con rol limitado, inicio social con Google, dashboard, inventario, movimientos, facturación, usuarios y reportes. Authentication y Firestore comprueban la sesión y las reglas de rol en el servidor de Firebase. Las antiguas rutas API permanecen cerradas por middleware.

## Ejecutar la app móvil

```powershell
cd mobile
npm ci
Copy-Item .env.example .env
npm run start
```

Para construir el APK de Android en un entorno preparado:

```powershell
npm run build:android
```

La guía móvil explica Authentication, Google Sign-In, Firestore, permisos por rol, exportación de comprobantes y compilación nativa. Consulta [`mobile/README.md`](mobile/README.md), [`mobile/FIREBASE.md`](mobile/FIREBASE.md) y [`mobile/ENTREGA.md`](mobile/ENTREGA.md).

## Mockups de la Etapa 1

Diseños de referencia conservados dentro del repositorio. La app móvil mantiene colores, tipografía y estructura de las pantallas base.

### Inicio de sesión

![Mockup Figma: inicio de sesión](mobile/docs/diseno/figma-login.png)

### Inventario

![Mockup Figma: inventario](mobile/docs/diseno/figma-inventario.png)

### Producto

![Mockup Figma: ficha de producto](mobile/docs/diseno/figma-producto.png)

### Movimiento de inventario

![Mockup Figma: movimiento](mobile/docs/diseno/figma-movimiento.png)

### Alertas

![Mockup Figma: alertas](mobile/docs/diseno/figma-alertas.png)

Archivo de Figma informado por el equipo: `11GPTpTj3RrHusfOA9qqOr`. Nodos y notas de diseño: [documentación móvil](mobile/README.md#diseño-verificado).

## Evaluación final

| Criterio | Evidencia y estado |
| --- | --- |
| Web React + Next.js | Aplicación publicada en [Vercel](https://comerciales-mely-web.vercel.app), vinculada a `main` |
| App móvil React Native | Código Expo, 12 pruebas de dominio, exportación final Android/iOS y APK x86_64 compilada/firmada; adaptador Firebase probado remotamente. Instalación y aceptación Android en verificación |
| Correo y red social en ambas | Sesión Google web comprobada; acceso móvil por correo probado desde su adaptador de datos. Google Sign-In nativo Android pendiente de prueba |
| Módulos principales/secundarios | Inventario, bodega, ventas y reportes probados en web como Administrador; permisos del Facturador probados contra Firebase. Falta completar la aceptación de pantallas Android y cada rol |
| Firestore compartido | Venta del adaptador móvil: stock 23 → 22; la web lee 22. Venta y descuento atómicos; 16 pruebas de reglas y escrituras remotas QA documentadas |
| UX/UI alineada con Figma | Mockups de la Etapa 1 publicados arriba y guía visual conservada en el repositorio |
| Licencia Creative Commons | [`LICENCIA-CONTENIDO.md`](LICENCIA-CONTENIDO.md) describe la licencia del material del proyecto |
| Colaboración | Ramas y atribuciones documentadas en [`mobile/docs/COLABORACION.md`](mobile/docs/COLABORACION.md); cuatro invitaciones de escritura enviadas. Cada integrante debe aceptar y aportar sus commits auténticos |
| Originalidad | Se conserva la identidad e historial del equipo y se atribuye el código reutilizado del repositorio colaborador |

El repositorio de referencia del compañero se consultó como fuente de trabajo del equipo. Sus reglas Firestore encontradas permitían cambios demasiado amplios a cualquier usuario autenticado; por ello no se copiaron ni se presenta ese proyecto o su despliegue como propios. Consulta el historial y las atribuciones del equipo antes de integrar código adicional.

## Pruebas reproducibles

Desde la raíz, `npm run test:rules` inicia un emulador Firestore con el proyecto de demostración `demo-mely-rules` y ejecuta los 16 casos de permisos y ventas atómicas. Requiere Java 21 o superior; no modifica el Firebase remoto. Desde `mobile/`, ejecuta `npm test`, `npm run lint` y `npm run typecheck`. La prueba remota opcional del adaptador móvil y sus datos QA están descritos en [el registro del 22 de noviembre](mobile/output/evidence/PRUEBAS-FIREBASE-20261122.md).

## Seguridad y configuración

- `.env.local` y `mobile/.env` están excluidos por `.gitignore`. La configuración Firebase de cliente identifica el proyecto y no reemplaza reglas de seguridad; no publiques claves privadas ni contraseñas.
- El primer administrador debe crearse como usuario normal y luego asignarse a `Administrador` en Firebase Console. El cliente nunca permite autoasignarse ese rol.
- Las altas web con correo y contraseña y las cuentas Google nuevas empiezan como `Empleado`; el alta móvil permite `Empleado` o `Facturador`.
- Vercel ya tiene las seis variables `NEXT_PUBLIC_FIREBASE_*` para producción. La configuración apunta a `comerciales-mely-final`; el dominio `comerciales-mely-web.vercel.app` está autorizado en Firebase Authentication.
- El proyecto tiene registrada la app Android `com.anonymous.comercialesmelymovil` y la huella SHA-1 de depuración de este equipo. El ID OAuth Web está guardado solo en `mobile/.env`; para compilar en otra máquina registra allí el SHA-1 de la clave que se vaya a usar.
- El proyecto Firebase está en el plan Spark. Cuotas y límites del plan aplican; no se activó facturación ni respaldos programados de pago.

## Licencia

El aviso de Creative Commons de este proyecto delimita el material original y sus excepciones en [`LICENCIA-CONTENIDO.md`](LICENCIA-CONTENIDO.md). La aplicación móvil conserva su archivo [`mobile/LICENSE`](mobile/LICENSE); las licencias y atribuciones de dependencias y aportes de terceros prevalecen para esos componentes.

## Historial y colaboración

Repositorio de entrega: [wilfredo409/comerciales-mely-web](https://github.com/wilfredo409/comerciales-mely-web). La rama de trabajo final es `main`. Los integrantes, ramas de trabajo e información sobre el historial se mantienen en [`mobile/docs/COLABORACION.md`](mobile/docs/COLABORACION.md). Todos los cambios que se entreguen deben permanecer documentados y dentro de este repositorio.
