import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/talent-configs?mode=low  → returns all configs for that mode
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode');

  let query = supabase.from('talent_configs').select('mode, level, config').order('level');
  if (mode) query = query.eq('mode', mode);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/talent-configs  body: { mode, level, config }  → upsert
export async function POST(request: Request) {
  const body = await request.json();
  const { mode, level, config } = body;

  if (!mode || !level || !config) {
    return NextResponse.json({ error: 'Missing fields: mode, level, config' }, { status: 400 });
  }

  const { error } = await supabase
    .from('talent_configs')
    .upsert({ mode, level, config, updated_at: new Date().toISOString() }, { onConflict: 'mode,level' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE /api/talent-configs?mode=low&level=20
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode');
  const level = searchParams.get('level');

  const { error } = await supabase
    .from('talent_configs')
    .delete()
    .eq('mode', mode!)
    .eq('level', parseInt(level!));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
