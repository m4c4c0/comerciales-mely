# Comerciales Mely

Sistema académico multiplataforma para inventario, movimientos de bodega, facturación y reportes. Proyecto de DPS941, Universidad Don Bosco, Ciclo II-2026, equipo R.E.F.E.S.

> **Estado de entrega:** la web compila y la app Android cuenta con pruebas funcionales del avance móvil. La sincronización Firebase/Firestore entre web y móvil, autenticación social en ambas plataformas y despliegue propio en Vercel aún requieren configuración e integración. No se presentan como funciones terminadas. La matriz completa está en [`mobile/docs/CRITERIOS.md`](mobile/docs/CRITERIOS.md).

## Aplicaciones

| Plataforma | Código | Tecnología | Persistencia actual |
| --- | --- | --- | --- |
| Web | raíz (`pages/`, `components/`, `services/`) | React 18, Next.js 14, API REST de Next.js | En memoria; los datos de demostración se reinician al reiniciar el servidor |
| Android/iOS | [`mobile/`](mobile/) | React Native, Expo Router y JavaScript | SQLite local en cada dispositivo |

Ambas aplicaciones implementan inventario, entradas/salidas, ventas con IVA del 13 %, control de existencias y reportes. La base web y la base móvil actual son independientes; todavía no comparten datos.

## Requisitos

- Node.js 20 o superior y npm.
- Para Android: Android Studio, Android SDK/NDK y JDK compatibles con Expo SDK 58. Para los pasos comprobados en este equipo, ver [`mobile/README.md`](mobile/README.md).
- Para Vercel/Firebase: proyectos y credenciales propios configurados en las consolas respectivas. Nunca se deben subir secretos al repositorio.

## Ejecutar la web

```powershell
npm ci
Copy-Item .env.example .env.local
# Reemplaza JWT_SECRET por un secreto aleatorio local antes de iniciar sesión.
npm run dev
```

Abre `http://localhost:3000`. Para compilar y servir la versión de producción:

```powershell
npm run build
npm run start
```

La web incluye acceso, registro con rol limitado, dashboard, CRUD de inventario, movimientos, facturación, usuarios y reportes. La API comprueba roles y valida entradas. Los datos seed y las sesiones en memoria son únicamente para demostración; no son persistentes ni sirven como backend compartido de producción.

## Ejecutar la app móvil

```powershell
cd mobile
npm ci
npm run start
```

Para construir el APK de Android en un entorno preparado:

```powershell
npm run build:android
```

La guía móvil explica las cuentas locales de demostración, permisos por rol, exportación de comprobantes, compilación iOS y evidencia de Android. Consulta [`mobile/README.md`](mobile/README.md), [`mobile/ENTREGA.md`](mobile/ENTREGA.md) y [`mobile/output/evidence/VERIFICACION.md`](mobile/output/evidence/VERIFICACION.md).

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

| Criterio | Evidencia actual | Pendiente para declararlo completo |
| --- | --- | --- |
| Web React + Next.js | Código en la raíz; `npm run build` | Desplegar esta copia en un proyecto Vercel propio y documentar la URL confirmada |
| App móvil React Native | Código y pruebas de Android en `mobile/` | Confirmar la integración Firebase de esta rama y validar el backend remoto |
| Correo y red social en ambas | La web usa usuario/contraseña local; móvil usa SQLite local | Firebase Authentication y proveedor social habilitados, configurados y probados en web y móvil |
| Módulos principales/secundarios | Inventario, bodega, ventas, reportes, usuarios y alertas | Validar los flujos integrados en ambas plataformas |
| Firestore compartido | Aún no conectado en esta rama | Una base común, reglas seguras y pruebas de lectura/escritura cruzada |
| UX/UI alineada con Figma | Pantallas y referencias publicadas arriba | Revisión comparativa final de la versión web y móvil |
| Licencia Creative Commons | [`LICENCIA-CONTENIDO.md`](LICENCIA-CONTENIDO.md) describe la licencia del material del proyecto | Ver alcance de licencias existentes antes de redistribuir código de terceros |
| Colaboración | Ramas y miembros documentados en [`mobile/docs/COLABORACION.md`](mobile/docs/COLABORACION.md) | Cada integrante debe mantener sus propios commits reales; no se inventan contribuciones |
| Originalidad | Se conserva la identidad y el historial del equipo | Las adaptaciones de otro repositorio deben conservar atribución y licencia de origen |

El repositorio de referencia del compañero se consultó como fuente de trabajo del equipo. Sus reglas Firestore encontradas permitían cambios demasiado amplios a cualquier usuario autenticado; por ello no se copiaron ni se presenta ese proyecto o su despliegue como propios. Consulta el historial y las atribuciones del equipo antes de integrar código adicional.

## Seguridad y configuración

- `.env.local` está excluido por `.gitignore`. No publiques claves privadas, archivos de servicio ni contraseñas.
- En producción web, `JWT_SECRET` debe definirse como variable de entorno secreta. Sin ella la autenticación falla de forma explícita.
- La configuración actual no incluye Firebase en esta rama. No reutilices credenciales pertenecientes a otro proyecto sin autorización de sus administradores.
- La base web en memoria se reinicia con el servidor y no ofrece persistencia entre instancias serverless.

## Licencia

El aviso de Creative Commons de este proyecto delimita el material original y sus excepciones en [`LICENCIA-CONTENIDO.md`](LICENCIA-CONTENIDO.md). La aplicación móvil conserva su archivo [`mobile/LICENSE`](mobile/LICENSE); las licencias y atribuciones de dependencias y aportes de terceros prevalecen para esos componentes.

## Historial y colaboración

Repositorio de entrega: [wilfredo409/comerciales-mely-web](https://github.com/wilfredo409/comerciales-mely-web). La rama de trabajo final es `main`. Los integrantes, ramas de trabajo e información sobre el historial se mantienen en [`mobile/docs/COLABORACION.md`](mobile/docs/COLABORACION.md). Todos los cambios que se entreguen deben permanecer documentados y dentro de este repositorio.
