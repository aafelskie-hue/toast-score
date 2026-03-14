import { readFileSync } from "fs";
import { resolve } from "path";
import sharp from "sharp";

// Load .env.local since this runs outside Next.js
const envPath = resolve(__dirname, "../.env.local");
for (const line of readFileSync(envPath, "utf-8").split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

import { getSupabaseServer } from "../src/lib/supabase-server";

async function main() {
  const supabase = getSupabaseServer();

  const { data: files, error: listError } = await supabase.storage
    .from("toast-images")
    .list("toasts");

  if (listError) {
    console.error("Failed to list files:", listError);
    process.exit(1);
  }

  if (!files || files.length === 0) {
    console.log("No files found in toasts/");
    return;
  }

  console.log(`Found ${files.length} files to process`);

  let processed = 0;
  let errors = 0;

  for (const file of files) {
    const path = `toasts/${file.name}`;
    try {
      const { data: blob, error: downloadError } = await supabase.storage
        .from("toast-images")
        .download(path);

      if (downloadError || !blob) {
        console.error(`  SKIP ${path}: download failed`, downloadError);
        errors++;
        continue;
      }

      const buffer = Buffer.from(await blob.arrayBuffer());
      const ext = file.name.split(".").pop()?.toLowerCase();
      const isPng = ext === "png";

      const cleanBuffer = isPng
        ? await sharp(buffer)
            .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
            .png()
            .toBuffer()
        : await sharp(buffer)
            .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();

      const { error: updateError } = await supabase.storage
        .from("toast-images")
        .update(path, cleanBuffer, {
          contentType: isPng ? "image/png" : "image/jpeg",
          upsert: true,
        });

      if (updateError) {
        console.error(`  FAIL ${path}:`, updateError);
        errors++;
        continue;
      }

      processed++;
      console.log(`  OK ${path} (${buffer.length} -> ${cleanBuffer.length} bytes)`);
    } catch (err) {
      console.error(`  ERROR ${path}:`, err);
      errors++;
    }
  }

  console.log(`\nDone. Processed: ${processed}, Errors: ${errors}`);
}

main();
