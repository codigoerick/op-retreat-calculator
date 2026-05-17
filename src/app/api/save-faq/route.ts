import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src/data/faq.json');
    const fileData = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(fileData));
  } catch (error) {
    return NextResponse.json({ faqs: [] });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminPassword = process.env.ADMIN_PASSWORD || '';
    const expectedToken = Buffer.from(`${adminPassword}-opretreat-secure-token`).toString('base64');
    const cookieValue = cookieStore.get('admin_session')?.value;

    if (!cookieValue || cookieValue !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { faqs } = await request.json();

    if (!Array.isArray(faqs)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'src/data/faq.json');
    await fs.writeFile(filePath, JSON.stringify({ faqs }, null, 2), 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save FAQ error:', error);
    return NextResponse.json({ error: 'Failed to save FAQ' }, { status: 500 });
  }
}
