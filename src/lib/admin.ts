import type { User } from "@supabase/supabase-js";

const ADMIN_ROLE = "admin";

/**
 * Admin access is granted by Supabase app_metadata, which only project
 * administrators can edit. ADMIN_EMAILS is an optional bootstrap allowlist
 * for environments where the role has not been assigned yet.
 *
 * Never use user_metadata for authorization: users can edit it themselves.
 */
export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;

  if (user.app_metadata?.role === ADMIN_ROLE) {
    return true;
  }

  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return Boolean(
    user.email && allowlist.includes(user.email.toLowerCase())
  );
}
