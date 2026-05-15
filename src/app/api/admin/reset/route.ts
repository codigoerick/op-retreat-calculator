import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    // We don't truncate because we want to preserve the rows, just empty the JSON
    const { error: err1 } = await supabase.from('talent_presets').update({ config_data: {} }).eq('mode', 'low');
    const { error: err2 } = await supabase.from('talent_presets').update({ config_data: {} }).eq('mode', 'full');

    if (err1 || err2) throw new Error(err1?.message || err2?.message);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
