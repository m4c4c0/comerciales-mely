# Matriz de evaluación y alcance real

Fuente principal: ruta de aprendizaje DPS941 CII-2026. El archivo de unidades 1 a 3 cubre Foro 1; la ruta completa localizada en la misma carpeta también describe Foro 2 y la entrega final.

## Foro 1 - 18 de octubre de 2026 (15 %)

| Criterio | Implementación/evidencia | Estado |
| --- | --- | --- |
| Pantallas React Native | Login, registro, catálogo, ficha, movimientos, alertas, perfil, resumen, ventas y reportes | Verificado en Android 14; ver registro y capturas |
| Login/registro funcional | bcrypt, Zod, SQLite, SecureStore, perfil validado y rutas protegidas | Verificado en Android 14; ver registro y capturas |
| Módulo principal y navegación | Expo Router; cuatro pestañas del prototipo y rutas secundarias | Implementado |
| Coherencia con Figma | Nodos originales verificados, tokens e imágenes locales | Referencia aplicada; originales y capturas reales disponibles |
| Formularios validados | Zod, cantidades enteras, stock, precio mínimo, confirmación de contraseña | Implementado; 11 pruebas de dominio y validación UI |
| Investigación React Native/Figma en APA 7 | Fuente Markdown e informe PDF con referencias y análisis propio | PDF generado y revisado visualmente |
| Repositorio GitHub con proyecto móvil | Carpeta mobile en rama etapa3/avance1-movil-20261018 del repositorio del equipo | Publicado en rama de entrega |
| Video demostrativo <=15 min | Video de compilación y pruebas reales sin audio, y guion de narración separado | Video base listo; voz posterior a cargo del equipo, según solicitud |

## Complejidad transversal

UI/lógica/datos separados; Context API; más de cinco pantallas; tres roles; imágenes locales/cámara; gráfica; inventario, movimientos y ventas relacionados. Los permisos se revisan fuera de la UI. Esta base opera localmente y no acredita sincronización remota.

## Foro 2 - 8 de noviembre de 2026 (15 %)

Pendientes: proyecto Firebase seleccionado, Authentication por correo y Google, Firestore asociado al usuario, reglas seguras, sincronización y pruebas remotas. También requiere PDF específico y video. No está cumplido por SQLite ni por el login local.

## Entrega final - 22 de noviembre de 2026 (20 % + 10 % defensa)

Pendientes: Firebase compartido por web y móvil, autenticación remota en ambas, validación de despliegue web, build firmado y pruebas en iPhone, publicación de mockups y licencia Creative Commons conforme a la ruta, colaboración real de los integrantes y defensa. No se cambia la licencia existente automáticamente.

## Compilaciones y dispositivos

El APK y los bundles se consideran listos únicamente si existen y los comandos terminan correctamente. Para iOS se necesita Expo/EAS y, para instalar en iPhone, firma Apple y dispositivo autorizado. Consultar output/evidence/VERIFICACION.md para resultados, sin confundir una exportación JS con un IPA.

Equipo y accesos verificados en docs/COLABORACION.md. No se crearon ramas atribuidas a otros integrantes.

Invitación de trabajo enviada desde wilfredo409 el 19 de octubre de 2026: https://github.com/m4c4c0/comerciales-mely/issues/9 . Los cuatro compañeros ya tienen acceso; sus aportes móviles se comprobarán mediante commits/PR y resultados de pruebas. La invitación y los permisos verificados se incorporaron al informe.
