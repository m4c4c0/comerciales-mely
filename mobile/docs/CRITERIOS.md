# Matriz de evaluación de la entrega final

Fuente: RUTA_DE_APRENDIZAJE_DPS941_CII_2026 y criterios proporcionados por el docente. Entrega 20 % + defensa 10 %. Esta matriz distingue implementación, comprobación real y acciones del equipo; no asigna una calificación al proyecto.

| Criterio | Implementación y evidencia | Estado verificable |
|---|---|---|
| Integración web + móvil | Next.js/React y React Native comparten `comerciales-mely`, Authentication, perfiles, colecciones y transacciones | Adaptador móvil: entrada 20 → 25 y venta 25 → 24. Interfaz web: venta 24 → 23; producción lee 23. Aceptación nativa final en curso |
| Funcionalidad | Inventario, movimientos, alertas, ventas, IVA 13 %, reportes, perfiles y usuarios con permisos | Correo, roles, falta de stock, ventas y persistencia probados contra Firebase original; 18 pruebas de reglas y 12 de dominio aprobadas |
| UX/UI | Mockups de Figma de Etapa 1 publicados en README; identidad, navegación, formularios y estados compartidos | Pantallas web verificadas; capturas móviles históricas separadas de la aceptación de la APK final |
| Código y documentación | Separación de UI, dominio y datos; instrucciones, arquitectura, fuentes, reglas, licencia y evidencias dentro del repositorio | Compilación web y APK Release ARM64/x86_64 correctas; ambas firmas y el Firebase incrustado verificados |
| Colaboración y repositorio | Historial original, autorías, ramas reales e integración final en ambos repositorios | Wilfredo tiene escritura en el repositorio del equipo. Cuatro invitaciones enviadas al suyo; la aceptación, aportes individuales y defensa corresponden a cada integrante |

## Requisitos específicos

| Requisito | Ubicación / alcance |
|---|---|
| Web React + Next.js en Vercel | [Aplicación publicada](https://comerciales-mely-web.vercel.app), código en la raíz |
| React Native con Firebase | `mobile/src`, [APK ARM64/x86_64](../output/android/README.md) |
| Correo y redes sociales | Correo en ambas implementaciones y adaptador móvil probado; Google web probado con el Firebase original. Google nativo requiere prueba con cuenta en Android |
| Persistencia compartida | `productos`, `movimientos`, `facturas`, `usuarios`; transacciones de stock y venta |
| Módulos principales y secundarios | Inventario, ficha, movimientos, alertas, dashboard, facturación, reportes, cuenta y usuarios según rol |
| Mockups en README | Imágenes locales `docs/diseno/figma-*.png` y README raíz |
| Creative Commons | [LICENCIA-CONTENIDO.md](../../LICENCIA-CONTENIDO.md), con excepciones y licencias de terceros |
| Ramas y colaboradores | [COLABORACION.md](COLABORACION.md); no se fabrican aportes ni autores |
| Originalidad | Identidad del equipo, historial preservado y procedencia del adaptador atribuida |
| Todo dentro de GitHub | Código, mockups, guías, APK, capturas e informes dentro del repositorio. Vercel es el servicio de despliegue exigido |

## Evidencias

El [registro del Firebase original](../output/evidence/PRUEBAS-FIREBASE-ORIGINAL-20261122.md) es la referencia de la integración final. Conserva el catálogo y las dos facturas previas del equipo. Las pruebas nuevas modifican un producto exclusivo QA. Las capturas 40–45 verifican reglas, ventas, stock, reportes, dominio y Google web originales.

Los informes anteriores de Foro 1, SQLite y del Firebase temporal se conservan como historial; sus resultados no se atribuyen a la APK final. El informe de investigación, sus referencias APA y los mockups siguen disponibles en `docs/`.

## Pendientes que no deben confundirse con implementación

- Completar y registrar los recorridos de pantallas Android y Google nativo con las APK originales.
- Aceptar invitaciones pendientes y comprobar una rama/commits reales de cada integrante; no basta con aparecer en una lista.
- Preparar la defensa y presentación de cada integrante.
- iOS: el código es multiplataforma; no se afirma disponer de IPA firmada ni de pruebas en iPhone sin equipo y credenciales Apple.
