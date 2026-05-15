import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = file.name.toLowerCase();
    const mode = filename.includes("full") ? "full" : filename.includes("low") ? "low" : null;
    const match = filename.match(/\d+/);
    const level = match ? match[0] : null;

    if (!mode || !level) {
      return NextResponse.json({ error: "Filename must contain 'full' or 'low' and a level number" }, { status: 400 });
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const image = sharp(inputBuffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error("Could not read image metadata");
    }

    // Split image into 23 rows
    const rowHeight = Math.floor(metadata.height / 23);
    const rowPromises = [];

    for (let i = 0; i < 23; i++) {
      rowPromises.push(
        image
          .clone()
          .extract({
            left: 0,
            top: i * rowHeight,
            width: metadata.width,
            height: i === 22 ? metadata.height - i * rowHeight : rowHeight,
          })
          .toBuffer()
      );
    }

    const rowBuffers = await Promise.all(rowPromises);
    const inlineDataItems = rowBuffers.map((buf) => ({
      inlineData: {
        data: buf.toString("base64"),
        mimeType: "image/jpeg",
      },
    }));

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `I am sending 23 images. Each image represents ONE ROW of a talent tree, ordered from TOP to BOTTOM.
    
    For each image, count the points (tiny yellow diamonds) for each node in that row.
    - Images 1 to 22: These have 3 nodes (Left, Center, Right). 
    - Image 23: This has only 1 node (Center).
    
    POINT COUNTING RULES:
    - Look at the very bottom border of each node box.
    - 5 points = Full line of yellow diamonds.
    - 1 point = Only ONE diamond on the left, rest of border is empty.
    - 0 points = Node is gray/dark or has a padlock.
    
    Return a JSON array containing exactly 23 arrays.
    Example: [[5,0,5], [3,0,0], ..., [5]]
    
    Return ONLY the raw JSON.`;

    const result = await model.generateContent([prompt, ...inlineDataItems as any]);
    const responseText = result.response.text().trim();

    let configObject: any = {};
    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedArray = JSON.parse(cleanJson);

      if (!Array.isArray(parsedArray) || parsedArray.length !== 23) {
        throw new Error("Invalid array length from AI");
      }

      const rows = [];
      for (let i = 21; i >= 0; i--) {
        rows.push([i * 3 + 1, i * 3 + 2, i * 3 + 3]);
      }
      rows.push([0]);

      for (let rowIndex = 0; rowIndex < 23; rowIndex++) {
        const rowIds = rows[rowIndex];
        const rowPoints = parsedArray[rowIndex];
        for (let colIndex = 0; colIndex < rowIds.length; colIndex++) {
          const id = rowIds[colIndex];
          const points = rowPoints[colIndex] || 0;
          if (points > 0) {
            configObject[id.toString()] = [points];
          }
        }
      }
    } catch (e) {
      return NextResponse.json({ error: "AI Parsing failed", raw: responseText }, { status: 500 });
    }

    const { data: presetData, error: fetchError } = await supabase
      .from('talent_presets')
      .select('config_data')
      .eq('mode', mode)
      .single();

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

    const newConfigData = presetData.config_data || {};
    newConfigData[level] = configObject;

    const { error: updateError } = await supabase
      .from('talent_presets')
      .update({ config_data: newConfigData })
      .eq('mode', mode);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    return NextResponse.json({ success: true, mode, level, data: configObject });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
