# Admin login (Supabase Auth)

The control panel uses Supabase Auth with email + password. The old
`ADMIN_USERNAME` / `ADMIN_PASSWORD` variables are no longer used.

## 1. Create the admin user

1. Open the Supabase Dashboard for this project.
2. Go to **Authentication → Users → Add user**.
3. Create the admin with the email you want to use and a strong password.
4. Confirm the user if the dashboard offers that option.

Do not put that password in `.env.local`, Vercel, or any source file.

## 2. Grant admin access

Choose one of these options:

### Option A (recommended): Supabase `app_metadata`

Set the user's **App Metadata** to:

```json
{
  "role": "admin"
}
```

Only project administrators can edit `app_metadata`. The app never uses
`user_metadata` for authorization because users can edit that themselves.

If the dashboard does not expose App Metadata, run this in the Supabase SQL
Editor (replace the email):

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
where email = 'admin@example.com';
```

### Option B: server-side email allowlist

Add a comma-separated list of admin emails to both `.env.local` and Vercel:

```env
ADMIN_EMAILS=admin@example.com
```

This variable is not a secret, but it must **not** use the `NEXT_PUBLIC_`
prefix. The app checks it on the server only.

`app_metadata` takes priority. You can use both during a migration.

## 3. Configure Supabase Auth URLs

In **Authentication → URL Configuration**:

- **Site URL:** `https://op-retreat-calculator.vercel.app`
- **Redirect URLs:**
  - `https://op-retreat-calculator.vercel.app/auth/callback`
  - `http://localhost:3001/auth/callback`
  - Add the preview deployment URL you use for testing.

The login flow uses `/auth/callback` for password recovery.

## 4. Configure email delivery

Password reset emails use Supabase Auth. The default email service is intended
for testing and has strict limits. For production, configure a custom SMTP
provider under **Authentication → SMTP Settings**.

The default reset-password template works with the `/auth/callback` route.
For cross-device recovery, you can replace the reset-password email link with:

```html
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/login/update-password">
  Restablecer contraseña
</a>
```

The callback route supports both the PKCE `code` flow and the `token_hash`
flow.

## 5. Environment cleanup

After the new login works:

1. Remove `ADMIN_USERNAME` and `ADMIN_PASSWORD` from Vercel
   (**Settings → Environment Variables**) for Production, Preview, and
   Development.
2. Remove them from `.env.local`.
3. Keep `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Add `ADMIN_EMAILS` only if you chose Option B.

## 6. Optional hardening

- In **Authentication → Providers → Email**, disable public sign-ups while
  registration is not offered. Dashboard-created users still work.
- Enable Supabase Auth rate limits (enabled by default).
- Use a unique, long password for the admin account.

## 7. Verify

1. Open `/login`.
2. Sign in with the Supabase admin email and password.
3. Confirm the panel opens.
4. Sign out and confirm `/control-panel` redirects to `/login`.
5. Open `/login/reset`, request a link, and complete the password change.
6. Confirm an authenticated non-admin account cannot open `/control-panel`.
