import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const requestedNext = url.searchParams.get("next");

  const next =
    requestedNext === "/control-panel"
      ? requestedNext
      : "/login/update-password";

  try {
    const supabase = await createClient();

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(next, url.origin));
      }
    } else if (tokenHash && type === "recovery") {
      // Works when the recovery email is opened on a different device/browser.
      const { error } = await supabase.auth.verifyOtp({
        type: "recovery",
        token_hash: tokenHash,
      });
      if (!error) {
        return NextResponse.redirect(new URL(next, url.origin));
      }
    }
  } catch (error) {
    console.error("Auth callback error:", error);
  }

  return NextResponse.redirect(new URL("/login?error=recovery", url.origin));
}
