import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { errorResponse, json } from "@/lib/http";
import { ApiError } from "@/lib/auth";
import { nanoid } from "nanoid";
import { processImageForUpload } from "@/lib/image-process";

const INPUT_MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ApiError("Aucun fichier", 400);
    if (file.size === 0) throw new ApiError("Fichier vide", 400);
    if (file.size > INPUT_MAX_BYTES) {
      throw new ApiError("Image trop lourde (max 10 Mo à l’envoi)", 413);
    }
    if (!ALLOWED.has(file.type) && !file.type.startsWith("image/")) {
      throw new ApiError("Format non supporté (JPEG, PNG, WebP)", 415);
    }

    const raw = Buffer.from(await file.arrayBuffer());
    let processed: Buffer;
    try {
      processed = await processImageForUpload(raw);
    } catch {
      throw new ApiError("Impossible de traiter cette image", 422);
    }

    const filename = `${nanoid(16)}.jpg`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`items/${filename}`, processed, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: "image/jpeg",
      });
      return json({ url: blob.url, size: processed.length });
    }

    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(join(uploadsDir, filename), processed);
    return json({ url: `/uploads/${filename}`, size: processed.length });
  } catch (err) {
    return errorResponse(err);
  }
}

export const runtime = "nodejs";
