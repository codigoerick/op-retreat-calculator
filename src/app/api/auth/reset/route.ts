import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ResetBody = {
  email?: unknown;
};

export async function POST(request: Request) {
  let body: ResetBody | null = null;
  try {
    body = (await request.json()) as ResetBody;
  } catch {
    return NextResponse.json(
      { error: "Solicitud inválida." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!email) {
    return NextResponse.json(
      { error: "Ingresa tu correo." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const supabase = await createClient();
    const origin = new URL(request.url).origin;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/login/update-password`,
    });

    if (error) {
      console.error("Password reset error:", error.message);
    }

    // Always return success to avoid revealing whether an account exists.
    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
