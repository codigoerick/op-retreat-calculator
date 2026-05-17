import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Credenciales requeridas' }, { status: 400 });
    }

    let email = identifier;

    // If the identifier has no @, treat it as a username and look up the email
    if (!identifier.includes('@')) {
      const adminClient = createAdminClient();
      const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();

      if (listError) {
        console.error('Admin lookup error:', listError);
        return NextResponse.json({ error: 'Error al buscar usuario' }, { status: 500 });
      }

      // Match against user_metadata.username or user_metadata.name
      const match = users.find((u) => {
        const meta = u.user_metadata || {};
        return (
          meta.username?.toLowerCase() === identifier.toLowerCase() ||
          meta.name?.toLowerCase() === identifier.toLowerCase()
        );
      });

      if (!match || !match.email) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
      }

      email = match.email;
    }

    // Sign in with resolved email
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

