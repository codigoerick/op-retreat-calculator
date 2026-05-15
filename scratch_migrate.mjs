import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase keys in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log("Starting migration...");
  
  const lowConfig = JSON.parse(fs.readFileSync('./src/data/talents_config.json', 'utf8'));
  const fullConfig = JSON.parse(fs.readFileSync('./src/data/talents_config_full.json', 'utf8'));
  
  // Insert Low Config
  let { error: err1 } = await supabase.from('talent_presets').upsert(
    { mode: 'low', config_data: lowConfig },
    { onConflict: 'mode' }
  );
  if (err1) console.error("Error inserting low config:", err1);
  else console.log("Low config migrated successfully.");

  // Insert Full Config
  let { error: err2 } = await supabase.from('talent_presets').upsert(
    { mode: 'full', config_data: fullConfig },
    { onConflict: 'mode' }
  );
  if (err2) console.error("Error inserting full config:", err2);
  else console.log("Full config migrated successfully.");
  
  console.log("Migration complete.");
}

migrate();
