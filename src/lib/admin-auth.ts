import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/admin";

/**
 * Checks the Supabase session cookie from a route handler or server action.
 * API routes that write data must call this before touching the database.
 */
export async function isAdminRequest(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return false;
    return isAdminUser(user);
  } catch {
    return false;
  }
}
