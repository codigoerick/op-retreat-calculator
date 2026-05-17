import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';


export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      return NextResponse.json({ error: 'Servidor no configurado' }, { status: 500 });
    }

    if (
      username?.toLowerCase() !== adminUsername.toLowerCase() ||
      password !== adminPassword
    ) {
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

    // CREATE A SECURE OBFUSCATED TOKEN
    // We combine the password with a salt and encode it. 
    // Since the attacker doesn't know the password, they cannot forge this token.
    const sessionToken = Buffer.from(`${adminPassword}-opretreat-secure-token`).toString('base64');

    const cookieStore = await cookies();
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
