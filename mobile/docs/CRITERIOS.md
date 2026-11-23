# Matriz de evaluación y alcance real

Fuente principal: ruta de aprendizaje DPS941 CII-2026. El archivo de unidades 1 a 3 cubre Foro 1; la ruta completa localizada en la misma carpeta también describe Foro 2 y la entrega final.

## Foro 1 - 18 de octubre de 2026 (15 %)

| Criterio | Implementación/evidencia | Estado |
| --- | --- | --- |
| Pantallas React Native | Login, registro, catálogo, ficha, movimientos, alertas, perfil, resumen, ventas y reportes | Verificado en Android 14; ver registro y capturas |
| Login/registro funcional | Firebase Authentication con correo, perfil Firestore, recuperación y Google | Adaptador móvil probado con correo contra Firebase remoto; falta Google nativo y aceptación de pantallas Android |
| Módulo principal y navegación | Expo Router; cuatro pestañas del prototipo y rutas secundarias | Implementado |
| Coherencia con Figma | Nodos originales verificados, tokens e imágenes locales | Referencia aplicada; originales y capturas reales disponibles |
| Formularios validados | Zod, cantidades enteras, stock, precio mínimo, confirmación de contraseña | Implementado; 12 pruebas de dominio, incluida normalización de roles compartidos |
| Investigación React Native/Figma en APA 7 | Fuente Markdown e informe PDF con referencias y análisis propio | PDF generado y revisado visualmente |
| Repositorio GitHub con proyecto móvil | Carpeta mobile en rama etapa3/avance1-movil-20261018 del repositorio del equipo | Publicado en rama de entrega |
| Video demostrativo <=15 min | Guion y video técnico automático disponibles | Falta explicación grabada del equipo y publicación de su enlace |

## Complejidad transversal

UI/lógica/datos separados; Context API; más de cinco pantallas; tres roles; imágenes locales/cámara; gráfica; inventario, movimientos y ventas relacionados. El código anterior de Foro 1 se comprobó localmente en Android; ese resultado no se atribuye a la versión actual de Firebase sin repetir el flujo.

## Foro 2 - 8 de noviembre de 2026 (15 %)

La integración final incorpora Firebase Authentication (correo y Google) y Firestore. Código móvil adaptado con atribución desde el repositorio del equipo; el adaptador web usa las mismas colecciones. Las reglas de `firestore.rules` están publicadas en el proyecto propio `comerciales-mely-final`, con región `us-central1`. La web pasó acceso Google y recorridos de inventario/venta/reportes con datos remotos; el adaptador móvil pasó correo, roles, venta transaccional, recarga y cierre de sesión contra ese mismo Firebase. La aceptación nativa se documenta por separado para distinguirla de las pruebas de datos.

## Entrega final - 22 de noviembre de 2026 (20 % + 10 % defensa)

| Criterio | Evidencia en el repositorio y servicios | Estado |
| --- | --- | --- |
| Integración web + móvil | Web y móvil apuntan a `comerciales-mely-final`; reglas publicadas y transacciones para venta/inventario | El adaptador móvil vendió una unidad (23 → 22) y la web leyó 22. Falta completar el recorrido de pantallas Android |
| Funcionalidad | Inventario, movimientos, facturación, alertas, usuarios y reportes | Web Administrador y adaptador móvil Facturador probados remotamente; 16 pruebas de reglas y 12 de dominio aprobadas |
| UX/UI | Mockups Figma publicados en README; pantallas web y móvil implementadas | Revisar la versión móvil actual en dispositivo con datos reales |
| Código/documentación | Guías de instalación, arquitectura, variables, reglas Firebase y matriz de evaluación | Web desplegada; pruebas reproducibles y evidencia Firebase del 22/11. Compilación Android con Ninja 1.13.2 en verificación |
| Colaboración | Historial de `main` y atribuciones documentados; repositorio final consultado con la API de GitHub | Se enviaron invitaciones de escritura a las cuatro cuentas del equipo con autorización del propietario. Deben aceptarlas y realizar aportes auténticos en sus ramas; la defensa corresponde al equipo |
| Publicación | Repositorio público `wilfredo409/comerciales-mely-web`; despliegue Vercel listo en [comerciales-mely-web.vercel.app](https://comerciales-mely-web.vercel.app) | Verificación manual final del flujo de negocio y cuentas |

La exportación JavaScript de Expo no es una APK/IPA instalable. Se detectó que parte del proyecto seguía usando Ninja 1.10.2 del SDK, aunque las dependencias recibían una versión nueva. El plugin ahora selecciona Ninja 1.13.2 para ambos niveles; el script verifica la versión y la huella oficial. La compilación e instalación Android están en verificación. El adaptador de datos móvil sí pasó acceso por correo, rol, venta atómica, recarga y cierre de sesión contra Firebase remoto; la web confirmó el stock resultante. Google Sign-In nativo y la interfaz Android requieren completar las pruebas con una APK instalada. iOS requiere firma/perfil y dispositivo Apple para probar en iPhone.

## Compilaciones y dispositivos

Las capturas y el APK de Foro 1 corresponden a la versión SQLite anterior; no verifican por sí mismos el backend Firebase actual. Los bundles deben regenerarse después de los cambios. Para Android, la SHA-1 de depuración está registrada; la firma de producción requiere registrar también su huella. Para iOS se necesita Expo/EAS y, para instalar en iPhone, firma Apple y dispositivo autorizado. Consultar `output/evidence/VERIFICACION.md` sin confundir exportación JS con IPA.

La API de GitHub confirmó que el repositorio final tenía únicamente a Wilfredo como colaborador y las ramas `main` y `etapa3/avance1-movil-20261018`. Se enviaron las cuatro invitaciones autorizadas (HTTP 201). La aceptación y los commits individuales siguen siendo acciones de cada integrante. No se crearon ramas ni commits atribuidos a otros integrantes; ver [COLABORACION.md](COLABORACION.md).
