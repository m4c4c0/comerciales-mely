# Verificación del Firebase original — 22/11/2026

## Entorno final

- Proyecto del equipo: `comerciales-mely`, número `945325242075`.
- Firestore existente: `(default)`, ubicación `nam5`.
- Aplicaciones ya registradas: web `mely-web` y Android `com.anonymous.comercialesmelymovil`.
- Correo/contraseña y Google habilitados. SHA-1 Android coincide con la firma de las APK de esta entrega.
- Respaldo privado previo: 9 productos, 20 movimientos, 2 facturas y 9 perfiles. No se eliminó ni reemplazó el catálogo del equipo. El respaldo contiene datos de usuarios y no se publica.
- Reglas de `firestore.rules` publicadas a las 21:19 (UTC−6). La consulta anónima a productos devuelve HTTP 403.
- Las evidencias anteriores que mencionan `comerciales-mely-final` corresponden al entorno temporal; no demuestran la aceptación del proyecto original.

## Adaptador móvil contra Firestore real

Se ejecutó `mobile/tests/firebase-live.test.mjs` con destino explícito `comerciales-mely` y credenciales sintéticas privadas:

| Recorrido | Resultado |
|---|---|
| Correo de Empleado y perfil correcto | Aprobado |
| Crear producto exclusivo `QA original web movil 20261122` a $10.00 | 20 unidades y movimiento inicial atómicos |
| Entrada de 5 unidades | Stock 25 |
| Empleado intenta facturar | Rechazado |
| Facturador selecciona Administrador al acceder | Rechazado y sesión cerrada |
| Correo de Facturador con rol correcto | Aprobado |
| Venta por cantidad mayor al stock | Rechazada |
| Venta de una unidad | `MELY-000003`, subtotal $10.00, IVA $1.30, total $11.30; stock 25 → 24 |
| Lectura desde servidor y recarga | Factura y stock persistidos |
| Cierre de sesión y carga posterior | Sesión nula |

Resultado: 1 prueba de aceptación aprobada, 0 fallidas. Ejecuta el adaptador real y las transacciones de producción; únicamente sustituye los enlaces de plataforma para ejecutarlo en Node. Las pruebas de pantallas Android y de la web desplegada se documentan aparte, tras instalar y desplegar la configuración original.

Las cuentas de prueba y contraseñas están fuera del repositorio. Para repetir la prueba se requieren `MELY_QA_ACCOUNT_FILE`, `MELY_QA_EMPLOYEE_FILE` y `MELY_QA_PROJECT_ID=comerciales-mely`; el test solo escribe en su producto QA.

## Seguridad remota adicional

Las peticiones autenticadas como Facturador para modificar el precio del producto QA o cambiar su propio rol a Administrador fueron rechazadas con HTTP 403. No se modificaron esos campos.

## Interfaz web compilada localmente

La compilación Next.js con el Firebase original terminó con código 0. La interfaz de producción local se probó en `127.0.0.1:3011`, sin atribuir este resultado al despliegue Vercel hasta actualizar sus variables:

- Acceso por correo como `QA Original Facturador`; menú limitado a Dashboard, Facturación y Reportes.
- Dashboard lee los 9 productos anteriores más el producto QA y conserva las facturas históricas `MELY-000001` ($0.28) y `MELY-000002` ($38.14).
- Facturación lee el producto QA con 24 unidades. Una venta de una unidad genera `MELY-05089837`: subtotal $10.00, IVA $1.30 y total $11.30; la búsqueda posterior muestra 23 unidades.
- Reportes muestra la factura web nueva y las transacciones del adaptador móvil junto al historial anterior.
- Se detectó que el resumen agrupaba por fechas UTC y podía mostrar el día siguiente durante la noche local. Se corrigió a calendario local y se ejecutaron 3 pruebas, incluidas coincidencia con móvil y cambio de mes. Requiere verificar visualmente el despliegue actualizado.

![Reglas publicadas en comerciales-mely](40-firebase-original-reglas.png)

![Factura web y stock 23 en Firebase original](41-web-original-factura-stock23.png)

![Reportes con facturas y movimientos del equipo conservados](42-web-original-reportes.png)
