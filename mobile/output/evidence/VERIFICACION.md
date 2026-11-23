# Registro de verificación de la entrega final

Fecha de revisión del código: 19 de noviembre de 2026.

## Versión Firebase actual

| Verificación | Resultado | Alcance |
| --- | --- | --- |
| Pruebas de lógica de negocio | 11/11 pasan | Dominio: ventas, centavos, existencias, roles, archivo y reportes. |
| Lint web | Pasa sin advertencias | Next.js ESLint. |
| Lint móvil | Pasa | Expo ESLint. |
| Typecheck móvil | Pasa | Revisión sintáctica; el proyecto está escrito en JavaScript, no equivale a tipado completo. |
| Build web | Ejecutado | Omitió optimizar la fuente remota por falta de acceso a Google Fonts; el build pudo continuar. |
| Exportación JS Android/iOS | Ejecutada | Genera bundles; no es APK/IPA ni prueba OAuth nativo. |
| Build APK Android | No completado | El entorno no pudo descargar Ninja desde GitHub por la restricción de red. No se debe usar el APK antiguo como evidencia de Firebase. |
| Despliegue web/reglas Firestore | Pendiente de autorización de sesión | Se necesita completar inicio de sesión Vercel/Firebase en la PC, publicar reglas y validar los dominios. |
| Prueba real web-móvil | Pendiente | Requiere reglas publicadas, APK Firebase reciente, cuentas reales y confirmar sincronización del mismo documento. |
| iPhone | Pendiente | Necesita macOS/EAS, firma Apple y un dispositivo o simulador. |

## Evidencias históricas

Las capturas, resultados JSON, automatizaciones Android y archivos APK restantes en `output/evidence` y `output/android` corresponden a un prototipo anterior que usaba SQLite y cuentas locales de demostración. Se conservan como registro de etapas previas. No demuestran compilación, autenticación, permisos ni sincronización de la integración Firebase que se entrega en `main`.

## Reproducción local

Desde la carpeta `mobile/`:

```powershell
npm ci
npm test
npm run lint
npm run typecheck
npm run export:mobile
npm run build:android
```
