import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // Debug logs for Vercel (only visible in Vercel Logs panel)
    console.log("Login attempt for:", username);
    if (!process.env.ADMIN_PASSWORD) console.warn("WARNING: ADMIN_PASSWORD is not defined in env!");
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) console.error("CRITICAL: Supabase URL missing!");

    // 1. Fallback for Master Admin (Player810)
    const masterPassword = process.env.ADMIN_PASSWORD;
    if (username === "Player810" && password === masterPassword) {
      console.log("Master login success for Player810");
      return NextResponse.json({ success: true, user: "Player810 (Master)" });
    }

    // 2. Normal check in Supabase admin_users table
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !data) {
      console.log("DB Login failed for:", username, error?.message);
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: data.username });
  } catch (error: any) {
    console.error("Login API Crash:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
