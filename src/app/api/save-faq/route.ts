import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { isAdminRequest } from '@/lib/admin-auth';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src/data/faq.json');
    const fileData = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(fileData));
  } catch {
    return NextResponse.json({ faqs: [] });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminRequest())) {
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
