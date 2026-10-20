# Entrega móvil de Comerciales Mely

## Instalar en Android

Abrir `output/android/Comerciales-Mely-etapa3.apk` desde el teléfono. Permitir la instalación desde la aplicación usada para abrir el archivo cuando Android lo solicite. No hace falta ejecutar Expo ni mantener una computadora encendida.

| Perfil seleccionado | Usuario | Contraseña de prueba |
| --- | --- | --- |
| Admin | admin | admin123 |
| Empleado | empleado | empleado123 |
| Cajero | facturador | factura123 |

Los datos se guardan en cada dispositivo. Son cuentas de demostración.

## Archivos para entregar

- APK 1.0.1 con icono Mely, fuentes, informe, manual y video: https://github.com/m4c4c0/comerciales-mely/releases/tag/etapa3-avance1-android-v1.0.1
- Código del equipo: https://github.com/m4c4c0/comerciales-mely/tree/etapa3/avance1-movil-20261018/mobile
- Informe local: output/pdf/Informe_Etapa3_Avance1_Comerciales_Mely.pdf
- Manual paso a paso: output/pdf/Manual_Android_iOS_Comerciales_Mely.pdf
- Guion para grabar la voz: docs/GUION_NARRACION_VIDEO.md
- Resultados reales y capturas: output/evidence/VERIFICACION.md
- Criterios y alcance: docs/CRITERIOS.md
- Invitación y seguimiento de commits del equipo: https://github.com/m4c4c0/comerciales-mely/issues/9

## Estado

La compilación universal y las once comprobaciones del recorrido completo pasaron en Android 14. Se exportaron los bundles finales Android e iOS y se prepararon perfiles EAS, permisos e instrucciones para iOS; no se generó un IPA.

La entrega está organizada para el Foro 1 de la etapa 3. El video final es Comerciales-Mely-Android-con-voz.mp4 (8:25): muestra el registro real de compilación y las pruebas del APK, incorpora la narración real del autor y no añade textos superpuestos. La carpeta output/entrega-final-foro1 reúne las copias definitivas.

La ruta solicita PDF, enlace GitHub del proyecto React Native y enlace de video accesible. Adjunta el informe actualizado; pega el enlace específico a mobile y publica el MP4 narrado en un servicio de video con acceso para el docente. El manual, APK y ZIP de fuentes son complementarios. Consulta LEEME_ENTREGA.txt en la carpeta final para el texto de envío.

Corte del 20 de octubre de 2026: floripeto publicó el commit e3ab59b y el PR 10, todavía abierto. Ferhboot, Stevenhzw y m4c4c0 continúan pendientes de nuevos aportes móviles. El APK 1.0.1 conserva la versión probada; el PR no se integra desde esta actualización documental.

Para los avances posteriores quedan Firebase Authentication, Google, Firestore y sincronización con la web, según la matriz de criterios. Los commits y explicaciones deben corresponder a la participación real.
