import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { errorResponse, json } from "@/lib/http";
import { ApiError } from "@/lib/auth";
import { nanoid } from "nanoid";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ApiError("Aucun fichier", 400);
    if (file.size === 0) throw new ApiError("Fichier vide", 400);
    if (file.size > MAX_BYTES) throw new ApiError("Image trop lourde (max 5 Mo)", 413);
    if (!ALLOWED.has(file.type)) throw new ApiError("Format non supporté (JPEG, PNG, WebP)", 415);

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `${nanoid(16)}.${ext}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`items/${filename}`, file, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return json({ url: blob.url });
    }

    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(join(uploadsDir, filename), buffer);
    return json({ url: `/uploads/${filename}` });
  } catch (err) {
    return errorResponse(err);
  }
}

export const runtime = "nodejs";
