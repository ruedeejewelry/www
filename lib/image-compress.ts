"use client";

/**
 * Shrink and crop a photo in the browser before it is uploaded.
 *
 * Phone photos are 5–10 MB each. Uploading them raw is slow enough at the shop
 * counter that staff stop using the system, and it wastes storage — so this
 * runs on every file (CLAUDE-storefront.md §9, "การจัดการรูป").
 *
 * Output is capped near the 250 KB budget for a large product image (§7).
 */

export type CompressOptions = {
  /** Longest edge of the output, in pixels. */
  maxEdge?: number;
  /** width / height. 1 for the square product grid, 4/3 for article covers. */
  aspect?: number;
  /** 0–1 crop position along the axis that gets trimmed. 0.5 is centred. */
  offset?: number;
  /** Bytes. The encoder steps quality down until it fits. */
  targetBytes?: number;
};

export type CompressedImage = {
  blob: Blob;
  width: number;
  height: number;
  previewUrl: string;
};

const DEFAULTS: Required<CompressOptions> = {
  maxEdge: 1600,
  aspect: 1,
  offset: 0.5,
  targetBytes: 250 * 1024,
};

async function loadBitmap(file: File): Promise<ImageBitmap> {
  // createImageBitmap applies EXIF orientation, so portrait phone shots do not
  // come out sideways.
  return createImageBitmap(file, { imageOrientation: "from-image" });
}

function encode(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function compressImage(
  file: File,
  options: CompressOptions = {},
): Promise<CompressedImage> {
  const { maxEdge, aspect, offset, targetBytes } = { ...DEFAULTS, ...options };
  const bitmap = await loadBitmap(file);

  // Largest rectangle of the requested aspect that fits inside the source.
  const sourceAspect = bitmap.width / bitmap.height;
  let cropW = bitmap.width;
  let cropH = bitmap.height;
  if (sourceAspect > aspect) cropW = bitmap.height * aspect;
  else cropH = bitmap.width / aspect;

  const clamped = Math.min(1, Math.max(0, offset));
  const cropX = (bitmap.width - cropW) * clamped;
  const cropY = (bitmap.height - cropH) * clamped;

  const scale = Math.min(1, maxEdge / Math.max(cropW, cropH));
  const outW = Math.round(cropW * scale);
  const outH = Math.round(cropH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context unavailable");
  ctx.drawImage(bitmap, cropX, cropY, cropW, cropH, 0, 0, outW, outH);
  bitmap.close();

  // WebP where the browser has it, JPEG otherwise.
  const type = canvas.toDataURL("image/webp").startsWith("data:image/webp")
    ? "image/webp"
    : "image/jpeg";

  let blob: Blob | null = null;
  for (const quality of [0.82, 0.72, 0.62, 0.5]) {
    blob = await encode(canvas, type, quality);
    if (blob && blob.size <= targetBytes) break;
  }
  if (!blob) throw new Error("image encoding failed");

  return {
    blob,
    width: outW,
    height: outH,
    previewUrl: URL.createObjectURL(blob),
  };
}
