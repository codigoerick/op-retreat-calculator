import { cookies } from 'next/headers';

const ADMIN_COOKIE_NAME = 'admin_session';

/**
 * Checks the signed-in admin cookie used by the login route and proxy.
 * API routes that write data must call this before touching Supabase.
 */
export async function isAdminRequest(): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  if (!adminPassword) return false;

  const expectedToken = Buffer.from(
    `${adminPassword}-opretreat-secure-token`
  ).toString('base64');
  const cookieStore = await cookies();

  return cookieStore.get(ADMIN_COOKIE_NAME)?.value === expectedToken;
}
