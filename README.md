# Comerciales Mely — Sistema de Gestión Multiplataforma
# Etapa 2: Aplicación Web con React + Next.js y API REST

# Universidad Don Bosco (UDB Virtual) — El Salvador  
# Asignatura: Diseño y Programación de Software Multiplataforma (DPS941) — Ciclo II 2026  
# Docente: Alexander Alberto Siguenza Campos  
# Equipo de Trabajo: R.E.F.E.S  

Integrantes del Equipo:

| Integrante                      | Carnet   | Rama en GitHub    | Módulo Asignado                                   |
| Edwin Wilfredo Cerón Contreras  | CC060761 | `wilfredo_dev`    | Dashboard general, métricas y resumen gerencial   |
| Jorge Steven Moreno Hernández   | MH222714 | `jorge_dev`       | CRUD de Inventario y control de permisos de precios |
| Raúl Adalberto Mulato Vasquez   | MV222715 | `raul_dev`        | Gestión de usuarios y API REST de personal        |
| Fernando Raúl López Torres      | LT172001 | `fernando_dev`    | Menú dinámico, layout y navegación por roles      |
| Edwin Vladimir Rivera Cubias    | RC232947 | `rivera_dev`      | Movimientos de inventario y trazabilidad          |

Repositorio en GitHub: https://github.com/m4c4c0/comerciales-mely
Despliegue en Vercel:  https://comerciales-mely.vercel.app

Descripción de la Actividad (Etapa 2):

En esta etapa se desarrolló la versión web del sistema para Comerciales Mely utilizando **React + Next.js**, implementando la lógica de negocio central y una **API REST** conectada a **Cloud Firestore**. 

Este primer avance funcional cumple los requerimientos definidos en la **Etapa 1 (Análisis y Planificación)** y establece la arquitectura base que se integrará con **React Native** en la Etapa 3.


Arquitectura y Separación de Capas:

El sistema implementa una arquitectura desacoplada en 3 capas de responsabilidad:

1. **Capa de Presentación (UI):**
   * Construida con **React 19** y **Next.js 16 (App Router)**.
   * Interfaz moderna, responsiva y adaptable a dispositivos móviles y de escritorio con **Tailwind CSS v4**.
   * Componentes reutilizables: `AppLayout`, `Sidebar`, `ProtectedRoute` y modales interactivos.

2. **Capa de Lógica de Negocio:**
   * Gestión de estado global de sesión mediante **Context API** (`AuthContext`).
   * Validación de reglas de negocio: impedimento de stock negativo, verificación de existencias antes de salidas, y restricción de modificación de precios según rol.
   * Manejo centralizado de errores, estados de carga (`loading`) y notificaciones dinámicas (`toast`).

3. **Capa de Datos:**
   * **API REST interna** desarrollada mediante Next.js Route Handlers (`/api/*`).
   * Persistencia y operaciones NoSQL en tiempo real con **Google Cloud Firestore**.

Requerimientos Técnicos Implementados

**Framework Web:** React 19 + Next.js 16 (App Router, Turbopack, TypeScript).
**Separación de Capas:** UI independiente de la lógica y del acceso a datos (Context API + Servicios REST).
**Integración con API REST:** Backend propio con endpoints tipados y respuestas JSON estandarizadas.
**Diseño Responsivo:** Tailwind CSS optimizado para pantallas móviles, tablets y monitores de escritorio.
**Seguridad y Rutas Protegidas:** Componente `ProtectedRoute` que verifica el token de sesión y valida los roles permitidos por ruta.
**Control de Versiones:** Repositorio en GitHub con estrategia de ramas individuales (`*_dev`) y colaboradores asignados.
**Despliegue Continuo:** Configurado para despliegue en la plataforma **Vercel**.


# REQUERIMIENTOS FUNCIONALES:

### 1. Módulo de Autenticación y Control de Acceso
* **Registro de Usuarios (`/register`):** Creación de cuentas con validación de correo existente, nombre y contraseña cifrada/limpia.
* **Inicio de Sesión (`/login`):** Validación contra la colección de usuarios en Firestore con entrega de token de sesión.
* **Acceso Rápido Demo:** Botones de prueba para evaluación docente inmediata por rol (`Admin`, `Empleado`, `Facturador`).
* **Rutas Protegidas:** Bloqueo automático ante accesos no autenticados o con rol insuficiente.

### 2. Módulo de Gestión Principal (CRUD Inventario en `/inventario`)
* **Creación:** Registro de productos con código único, nombre, categoría, precio y stock inicial.
* **Lectura:** Catálogo en tabla y vista de tarjetas con búsqueda en tiempo real por texto y filtros por categoría/nivel de stock.
* **Actualización:** Edición de datos y stock.
* **Eliminación:** Borrado de productos del catálogo (exclusivo para Administrador).

### 3. Módulo de Procesamiento y Lógica Central (Movimientos en `/movimientos`)
* **Trazabilidad Total:** Registro estructurado de cada operación indicando producto, tipo de movimiento, cantidad, fecha y usuario responsable.
* **Reglas de Negocio:**
  * No se admiten cantidades negativas o iguales a cero.
  * No se permiten salidas que superen las existencias actuales.
  * Actualización automática del stock físico al registrar entradas o salidas.

### 4. Dashboard Gerencial (`/dashboard`)
* Resumen visual de indicadores clave (KPIs): productos registrados, stock crítico (menor a 5 unidades), valor monetario del inventario y total de unidades físicas.
* Gráfico de distribución de stock por categorías.
* Historial de los últimos movimientos realizados para auditoría rápida.

### 5. Actualización Dinámica de Datos
* Respuestas asíncronas inmediatas: las altas, bajas y cambios de stock se reflejan instantáneamente en la interfaz sin necesidad de recargar la página.



# ROLES Y PERMISOS PARA LOS USUARIOS DEL SISTEMA:

| Módulo / Acción       | Administrador | Empleado  | Facturador |
| Acceso al Dashboard   | ✅            | ✅       | ✅         |
| Consultar catálogo    | ✅            | ✅       | ✅         |
| Modificar stock       | ✅            | ✅       | ❌         |
| Fijar/editar precios  | ✅            | ❌       | ❌         |
| Registrar entradas    | ✅            | ✅       | ❌         |
| Registrar salidas     | ✅            | ✅       | ❌         |
| Gestión de Usuarios   | ✅            | ❌       | ❌         |



# ENDPOINT API REST:

| Método | Endpoint | Descripción |
| `POST` | `/api/auth/login` | Autentica usuario y genera token de sesión |
| `POST` | `/api/auth/register` | Registra nuevos usuarios en el sistema |
| `GET` | `/api/products` | Obtiene el catálogo completo de productos |
| `POST` | `/api/products` | Crea un nuevo producto y genera su movimiento inicial |
| `PUT` | `/api/products` | Actualiza información o existencias de un producto |
| `DELETE` | `/api/products` | Elimina un producto del catálogo (Admin) |
| `GET` | `/api/movements` | Lista el historial completo de movimientos |
| `POST` | `/api/movements` | Registra entrada o salida ajustando existencias |
| `GET` | `/api/dashboard` | Retorna métricas, totales y KPIs calculados |
| `GET` | `/api/users` | Lista los usuarios del sistema sin contraseñas (Admin) |
| `POST` | `/api/users` | Registra usuarios y asigna roles desde el panel (Admin) |



# PASOS Y INSTALACION PARA EJECUCION LOCAL:

# 1. Clonar repositorio y cambiar a tu rama
git clone https://github.com/m4c4c0/comerciales-mely.git
cd comerciales-mely
git checkout raul_dev

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto con las credenciales de Firebase:
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

# 4. Iniciar servidor de desarrollo
npm run dev
Abre el navegador: http://localhost:3000