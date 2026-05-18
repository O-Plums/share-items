import sharp from "sharp";

/** Taille max du côté le plus long (px). */
export const IMAGE_MAX_DIMENSION = 512;
/** Poids max du fichier final (octets). */
export const IMAGE_MAX_BYTES = 500 * 1024;

const INPUT_MAX_BYTES = 10 * 1024 * 1024;

/**
 * Redimensionne (max 512×512), convertit en JPEG et compresse jusqu'à ≤ 500 Ko.
 */
export async function processImageForUpload(input: Buffer): Promise<Buffer> {
  if (input.length > INPUT_MAX_BYTES) {
    throw new Error("Image source trop lourde (max 10 Mo avant traitement)");
  }

  let pipeline = sharp(input, { failOn: "none" }).rotate().resize(IMAGE_MAX_DIMENSION, IMAGE_MAX_DIMENSION, {
    fit: "inside",
    withoutEnlargement: true,
  });

  let quality = 85;
  let output = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();

  while (output.length > IMAGE_MAX_BYTES && quality > 35) {
    quality -= 10;
    output = await sharp(output).jpeg({ quality, mozjpeg: true }).toBuffer();
  }

  if (output.length > IMAGE_MAX_BYTES) {
    output = await sharp(output)
      .resize(Math.round(IMAGE_MAX_DIMENSION * 0.85), Math.round(IMAGE_MAX_DIMENSION * 0.85), {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 35, mozjpeg: true })
      .toBuffer();
  }

  return output;
}
