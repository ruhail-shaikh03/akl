import { NextRequest, NextResponse } from "next/server";
import { requireSession, UnauthorizedError } from "@/lib/auth/guards";
import { checkUploadLimit } from "@/lib/ratelimit/limiters";
import { InvalidImageError, uploadImage, type UploadFolder } from "@/lib/blob/upload";

const ALLOWED_FOLDERS: UploadFolder[] = ["gallery", "letters", "bucket-list"];

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }

  const { success } = await checkUploadLimit(session.sub);
  if (!success) {
    return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  const folderRaw = formData?.get("folder");
  const folder: UploadFolder =
    typeof folderRaw === "string" && ALLOWED_FOLDERS.includes(folderRaw as UploadFolder)
      ? (folderRaw as UploadFolder)
      : "gallery";

  try {
    const { url, pathname } = await uploadImage(file, folder);
    return NextResponse.json({ blobUrl: url, blobPathname: pathname });
  } catch (err) {
    if (err instanceof InvalidImageError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[upload] failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
