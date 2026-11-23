import { NextResponse } from "next/server";

// The web client now talks to Firebase directly. Retain the earlier REST
// handlers in the history but reject requests so the in-memory demo backend
// cannot be used by a deployed instance.
export function middleware() {
  return NextResponse.json(
    { error: "Esta API local fue retirada; usa el cliente autenticado de Firebase." },
    { status: 410 },
  );
}

export const config = { matcher: "/api/:path*" };
