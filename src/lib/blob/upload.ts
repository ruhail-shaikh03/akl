import "server-only";
import { put, del } from "@vercel/blob";

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"] as const;
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2MB hard cap (client targets ~1.5MB before this)

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

/**
 * Sniffs the actual image type from magic bytes rather than trusting the
 * client-supplied Content-Type/extension.
 */
export function sniffImageMime(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";

  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";

  const isRiff = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
  const isWebp = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  if (isRiff && isWebp) return "image/webp";

  // HEIC/HEIF: ISO base media file format box "ftyp" at offset 4, brand at offset 8
  if (bytes.length >= 12 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    if (["heic", "heix", "hevc", "hevx", "mif1", "msf1"].includes(brand)) {
      return brand === "mif1" || brand === "msf1" ? "image/heif" : "image/heic";
    }
  }

  return null;
}

export class InvalidImageError extends Error {}

export async function uploadGalleryImage(
  file: File,
): Promise<{ url: string; pathname: string }> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new InvalidImageError(`File is too large (max ${MAX_UPLOAD_BYTES / 1024 / 1024}MB)`);
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const sniffed = sniffImageMime(buffer);
  if (!sniffed || !ALLOWED_IMAGE_MIME_TYPES.includes(sniffed as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    throw new InvalidImageError("Unsupported or unrecognized image file");
  }

  const ext = EXTENSION_BY_MIME[sniffed] ?? "bin";
  const pathname = `gallery/${crypto.randomUUID()}.${ext}`;

  const blob = await put(pathname, Buffer.from(buffer), {
    access: "public",
    contentType: sniffed,
    addRandomSuffix: true,
  });

  return { url: blob.url, pathname: blob.pathname };
}

export async function deleteBlobByPathname(pathname: string): Promise<void> {
  try {
    await del(pathname);
  } catch (err) {
    console.warn(`[blob] failed to delete ${pathname}:`, err);
  }
}
