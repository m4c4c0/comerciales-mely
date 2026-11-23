import { z } from "zod";

export const registroSchema = z.object({
  nombre: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres."),
  email: z.string().trim().email("Ingresa un correo electrónico válido."),
  usuario: z
    .string()
    .trim()
    .min(3, "El usuario debe tener al menos 3 caracteres.")
    .regex(/^[a-zA-Z0-9._-]+$/, "El usuario solo puede contener letras, números, puntos y guiones."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  rol: z.enum(["administrador", "empleado", "facturador"], {
    errorMap: () => ({ message: "Selecciona un rol válido." }),
  }),
});

// Registro público (pantalla /registro): por seguridad, un visitante solo
// puede autoasignarse el rol de empleado o facturador. El rol de
// administrador únicamente puede crearse desde el módulo de Usuarios por un
// administrador ya autenticado (ver pages/api/usuarios/index.js).
export const registroPublicoSchema = registroSchema.extend({
  rol: z.enum(["empleado", "facturador"], {
    errorMap: () => ({ message: "El registro público solo permite el rol Empleado o Facturador." }),
  }),
});

export const loginSchema = z.object({
  usuario: z.string().trim().min(1, "Ingresa tu usuario."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

export const productoSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre del producto es muy corto."),
  categoria: z.string().trim().min(2, "La categoría es obligatoria."),
  precio: z.coerce.number().positive("El precio debe ser mayor a 0."),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo."),
  stockMinimo: z.coerce.number().int().min(0, "El stock mínimo no puede ser negativo."),
  imagenUrl: z.string().optional().or(z.literal("")),
});

export const movimientoSchema = z.object({
  productoId: z.string().min(1, "Selecciona un producto."),
  tipo: z.enum(["entrada", "salida"], { errorMap: () => ({ message: "Tipo de movimiento inválido." }) }),
  cantidad: z.coerce.number().int().positive("La cantidad debe ser un entero mayor a 0."),
  nota: z.string().optional().or(z.literal("")),
});

export const facturaSchema = z.object({
  items: z
    .array(
      z.object({
        productoId: z.string().min(1),
        cantidad: z.coerce.number().int().positive("La cantidad debe ser mayor a 0."),
      })
    )
    .min(1, "Agrega al menos un producto a la factura."),
});

export function zodErrorToMessage(error) {
  return error.errors?.[0]?.message || "Datos inválidos.";
}
