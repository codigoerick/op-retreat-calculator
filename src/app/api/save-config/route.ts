import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { isAdminRequest } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    if (!(await isAdminRequest())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, data } = await request.json();

    
    let filePath = '';
    
    switch (type) {
      case 'diff':
        filePath = path.join(process.cwd(), 'src/data/diff_sequences.json');
        break;
      case 'low':
        filePath = path.join(process.cwd(), 'src/data/talents_config.json');
        break;
      case 'full':
        filePath = path.join(process.cwd(), 'src/data/talents_config_full.json');
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
  }
}
