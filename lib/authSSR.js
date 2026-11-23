import { getSessionFromReq } from "./auth";
import { findUserById } from "./db";

/**
 * Protege una página vía getServerSideProps. Devuelve { redirect } si no hay
 * sesión válida o si el rol no está permitido, o { props: { usuario } } con
 * el usuario autenticado cuando el acceso es válido.
 *
 * Uso en una página:
 *   export async function getServerSideProps(ctx) {
 *     return requireAuthSSR(ctx, ["administrador", "empleado"]);
 *   }
 */
export function requireAuthSSR(context, rolesPermitidos = null) {
  const session = getSessionFromReq(context.req);
  if (!session) {
    return {
      redirect: {
        destination: `/login?next=${encodeURIComponent(context.resolvedUrl || "/")}`,
        permanent: false,
      },
    };
  }

  const usuario = findUserById(session.id);
  if (!usuario) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return { redirect: { destination: "/403", permanent: false } };
  }

  return {
    props: {
      usuario: { id: usuario.id, usuario: usuario.usuario, rol: usuario.rol, nombre: usuario.nombre },
    },
  };
}
