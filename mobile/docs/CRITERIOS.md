# Matriz de evaluación y alcance real

Fuente principal: ruta de aprendizaje DPS941 CII-2026. El archivo de unidades 1 a 3 cubre Foro 1; la ruta completa localizada en la misma carpeta también describe Foro 2 y la entrega final.

## Foro 1 - 18 de octubre de 2026 (15 %)

| Criterio | Implementación/evidencia | Estado |
| --- | --- | --- |
| Pantallas React Native | Login, registro, catálogo, ficha, movimientos, alertas, perfil, resumen, ventas y reportes | Verificado en Android 14; ver registro y capturas |
| Login/registro funcional | Firebase Authentication con correo, perfil Firestore, recuperación y Google | Integrado en código; probar luego de publicar reglas y compilar módulo nativo |
| Módulo principal y navegación | Expo Router; cuatro pestañas del prototipo y rutas secundarias | Implementado |
| Coherencia con Figma | Nodos originales verificados, tokens e imágenes locales | Referencia aplicada; originales y capturas reales disponibles |
| Formularios validados | Zod, cantidades enteras, stock, precio mínimo, confirmación de contraseña | Implementado; 11 pruebas de dominio y validación UI |
| Investigación React Native/Figma en APA 7 | Fuente Markdown e informe PDF con referencias y análisis propio | PDF generado y revisado visualmente |
| Repositorio GitHub con proyecto móvil | Carpeta mobile en rama etapa3/avance1-movil-20261018 del repositorio del equipo | Publicado en rama de entrega |
| Video demostrativo <=15 min | Guion y video técnico automático disponibles | Falta explicación grabada del equipo y publicación de su enlace |

## Complejidad transversal

UI/lógica/datos separados; Context API; más de cinco pantallas; tres roles; imágenes locales/cámara; gráfica; inventario, movimientos y ventas relacionados. El código anterior de Foro 1 se comprobó localmente en Android; ese resultado no se atribuye a la versión actual de Firebase sin repetir el flujo.

## Foro 2 - 8 de noviembre de 2026 (15 %)

La integración final incorpora Firebase Authentication (correo y Google) y Firestore. Código móvil adaptado con atribución desde el repositorio del equipo; el adaptador web usa las mismas colecciones. Las reglas más restrictivas de `firestore.rules` están publicadas en el proyecto propio `comerciales-mely-final`, con región `us-central1`. Los proveedores y la app Android están configurados. Falta probar login y sincronización con cuentas reales en ambas plataformas.

## Entrega final - 22 de noviembre de 2026 (20 % + 10 % defensa)

| Criterio | Evidencia en el repositorio y servicios | Estado |
| --- | --- | --- |
| Integración web + móvil | Web y móvil apuntan a `comerciales-mely-final`; Firestore `us-central1`; reglas publicadas y transacciones para venta/inventario | Falta probar escritura en una plataforma y lectura en la otra con usuarios reales |
| Funcionalidad | Inventario, movimientos, facturación, alertas, usuarios y reportes | Falta repetir los recorridos contra el proyecto remoto con una cuenta por rol |
| UX/UI | Mockups Figma publicados en README; pantallas web y móvil implementadas | Revisar la versión móvil actual en dispositivo con datos reales |
| Código/documentación | Guías de instalación, arquitectura, variables, reglas Firebase y matriz de evaluación | Web desplegada; falta validar nueva APK Android. La exportación JS no la sustituye |
| Colaboración | Ramas, miembros y procedencia documentados; commits visibles en `main` | Defensa oral y video del equipo quedan a cargo de sus integrantes |
| Publicación | Repositorio público `wilfredo409/comerciales-mely-web`; despliegue Vercel listo en [comerciales-mely-web.vercel.app](https://comerciales-mely-web.vercel.app) | Verificación manual final del flujo de negocio y cuentas |

La exportación JavaScript de Expo no es una APK/IPA instalable. Google Sign-In en Android necesita SHA-1 y compilación nativa; iOS requiere firma/perfil y dispositivo Apple para probar en iPhone.

## Compilaciones y dispositivos

Las capturas y el APK de Foro 1 corresponden a la versión SQLite anterior; no verifican por sí mismos el backend Firebase actual. Los bundles deben regenerarse después de los cambios. Para Android, la SHA-1 de depuración está registrada; la firma de producción requiere registrar también su huella. Para iOS se necesita Expo/EAS y, para instalar en iPhone, firma Apple y dispositivo autorizado. Consultar `output/evidence/VERIFICACION.md` sin confundir exportación JS con IPA.

Equipo y accesos verificados en docs/COLABORACION.md. No se crearon ramas atribuidas a otros integrantes.
