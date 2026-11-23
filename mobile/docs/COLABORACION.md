# Equipo y repositorio verificados

Repositorio del equipo: https://github.com/m4c4c0/comerciales-mely
Rama móvil: etapa3/avance1-movil-20261018

Consulta autenticada del repositorio colaborador: 18 de octubre de 2026 (Guatemala).

| Cuenta | Acceso |
| --- | --- |
| m4c4c0 | Administrador |
| Ferhboot | Escritura |
| Stevenhzw | Escritura |
| floripeto | Escritura |
| wilfredo409 | Escritura |

Ramas encontradas en el repositorio colaborador: fernando_dev, jorge_dev, main, raul_dev, rivera_dev, wilfredo_dev y wilfredo409. Los nombres y carnets de la portada se tomaron del README del repositorio del equipo, que sustituye el borrador local anterior.

## Repositorio final: comprobación del 22 de noviembre

La API autenticada de GitHub confirmó que `wilfredo409/comerciales-mely-web` tenía únicamente a su propietario como colaborador y las ramas `main` y `etapa3/avance1-movil-20261018`. Con autorización de Wilfredo se enviaron invitaciones de escritura a `m4c4c0`, `Ferhboot`, `Stevenhzw` y `floripeto`; GitHub respondió HTTP 201 en los cuatro casos. Una invitación enviada no equivale a una aceptación.

Cada integrante debe aceptar su invitación, crear/usar su propia rama y dejar commits auténticos de sus aportes. No se crearon ramas ni commits atribuidos a otros integrantes. El repositorio del equipo conserva las contribuciones previas, pero eso no demuestra participación equivalente en el repositorio final.

No se atribuye código móvil a cuentas de otros integrantes. Cada persona debe revisar su módulo, realizar sus cambios y commits reales, y explicar sus decisiones durante la defensa.

Para la integración final se adaptó `mobile/src/services/database.js` desde `mobile/src/services/database.js` del repositorio colaborador, commit `ed18d69` (autoría original del repositorio del equipo `m4c4c0/comerciales-mely`). La adaptación reemplaza la persistencia SQLite por Firebase Authentication y Firestore; las reglas se reescribieron y se mantienen en este repositorio para aplicar permisos por rol y validar cambios de stock. La autoría de esa implementación de referencia no se atribuye a Wilfredo.

Referencia web adicional proporcionada por Wilfredo: https://github.com/wilfredo409/comerciales-mely-web . La compilación y su registro inicial se ejecutaron allí antes de identificar el repositorio compartido.

## Integración de la entrega final en ambos repositorios

Con autorización de Wilfredo se incorporó la entrega final de `wilfredo409/comerciales-mely-web` en `m4c4c0/comerciales-mely`, desde el commit original `ed18d69a0bd791b912569efcf35b77f1f4b84353`. El commit de integración conserva como padres ambos historiales; no se alteran los nombres de autores ni las contribuciones anteriores. La web previa permanece además en `docs/historial/etapa-anterior-web-ed18d69.zip`. El árbol activo contiene la web Next.js/Firebase y la aplicación móvil final con sus dos APK.

Las ramas anteriores del equipo se conservan. Integrar su historial no demuestra por sí solo que cada persona haya completado su parte final o preparado su defensa. Cada integrante debe verificar sus aportes auténticos y el acceso a los repositorios.
