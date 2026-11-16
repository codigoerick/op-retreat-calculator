import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/admin";

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.json(
      { error: "Supabase no está configurado en el servidor." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  let body: LoginBody | null = null;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      { error: "Solicitud inválida." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Ingresa tu correo y contraseña." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const message = error.message.toLowerCase();

      if (message.includes("email not confirmed")) {
        return NextResponse.json(
          { error: "Debes confirmar tu correo antes de ingresar." },
          { status: 403, headers: { "Cache-Control": "no-store" } }
        );
      }

      if (error.status === 429) {
        return NextResponse.json(
          { error: "Demasiados intentos. Espera un momento e inténtalo de nuevo." },
          { status: 429, headers: { "Cache-Control": "no-store" } }
        );
      }

      return NextResponse.json(
        { error: "Correo o contraseña incorrectos." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!isAdminUser(data.user)) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Esta cuenta no tiene permisos de administrador." },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "No se pudo iniciar sesión. Inténtalo de nuevo." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
