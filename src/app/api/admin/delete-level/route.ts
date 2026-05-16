import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const { mode, level } = await req.json();

    if (!mode || !level) {
      return NextResponse.json({ error: "Mode and Level are required" }, { status: 400 });
    }

    // Fetch existing
    const { data: presetData, error: fetchError } = await supabase
      .from('talent_presets')
      .select('config_data')
      .eq('mode', mode)
      .single();

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

    const newConfigData = presetData.config_data || {};
    
    if (newConfigData[level]) {
        delete newConfigData[level];
    } else {
        return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from('talent_presets')
      .update({ config_data: newConfigData })
      .eq('mode', mode);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    return NextResponse.json({ success: true, message: `Nivel ${level} eliminado correctamente` });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
