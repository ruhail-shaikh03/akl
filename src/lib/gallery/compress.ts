import imageCompression from "browser-image-compression";

/** Compresses/resizes a photo client-side before upload: target <=1.5MB, longest edge <=2048px. */
export async function compressPhoto(file: File): Promise<File> {
  // HEIC/HEIF isn't reliably decodable by canvas-based compression in most browsers; upload as-is.
  if (/heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)) {
    return file;
  }
  try {
    return await imageCompression(file, {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 2048,
      useWebWorker: true,
      initialQuality: 0.85,
    });
  } catch {
    return file;
  }
}
