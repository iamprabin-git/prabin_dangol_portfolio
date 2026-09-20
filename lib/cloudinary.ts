import { v2 as cloudinary } from "cloudinary";

function trimEnv(value: string | undefined) {
  return (value || "").trim().replace(/^['"]|['"]$/g, "");
}

export function hasCloudinary() {
  if (trimEnv(process.env.CLOUDINARY_URL).startsWith("cloudinary://")) return true;
  return Boolean(
    trimEnv(process.env.CLOUDINARY_CLOUD_NAME) &&
      trimEnv(process.env.CLOUDINARY_API_KEY) &&
      trimEnv(process.env.CLOUDINARY_API_SECRET),
  );
}

function configure() {
  if (!hasCloudinary()) {
    throw new Error(
      "Set CLOUDINARY_URL (or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET) so images can upload.",
    );
  }

  const url = trimEnv(process.env.CLOUDINARY_URL);
  if (url.startsWith("cloudinary://")) {
    process.env.CLOUDINARY_URL = url;
    cloudinary.config({ secure: true });
    return;
  }

  cloudinary.config({
    cloud_name: trimEnv(process.env.CLOUDINARY_CLOUD_NAME),
    api_key: trimEnv(process.env.CLOUDINARY_API_KEY),
    api_secret: trimEnv(process.env.CLOUDINARY_API_SECRET),
    secure: true,
  });
}

export function isCloudinaryUrl(url: string) {
  try {
    const host = new URL(url).hostname;
    return host === "res.cloudinary.com" || host.endsWith(".cloudinary.com");
  } catch {
    return false;
  }
}

function optimizedDeliveryUrl(secureUrl: string) {
  if (!secureUrl.includes("/image/upload/") || secureUrl.includes("/f_auto/")) return secureUrl;
  return secureUrl.replace("/image/upload/", "/image/upload/f_auto/q_auto/");
}

function isTransformSegment(segment: string) {
  return (
    segment.includes(",") ||
    /^(f_|q_|c_|w_|h_|g_|e_|fl_|dpr_|t_|b_|a_|r_|o_|bo_|ar_)/.test(segment)
  );
}

export function cloudinaryPublicId(url: string) {
  if (!isCloudinaryUrl(url)) return "";
  try {
    const { pathname } = new URL(url);
    const marker = "/image/upload/";
    const index = pathname.indexOf(marker);
    if (index === -1) return "";
    const parts = pathname.slice(index + marker.length).split("/").filter(Boolean);
    let start = 0;
    while (start < parts.length && isTransformSegment(parts[start])) start += 1;
    if (start < parts.length && /^v\d+$/.test(parts[start])) start += 1;
    const idWithExt = parts.slice(start).join("/");
    return decodeURIComponent(idWithExt.replace(/\.[a-z0-9]+$/i, ""));
  } catch {
    return "";
  }
}

export async function uploadImageFile(file: File) {
  configure();
  const bytes = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<{ secure_url?: string; public_id?: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "portfolio",
        resource_type: "image",
        unique_filename: true,
        overwrite: false,
      },
      (error, uploaded) => {
        if (error || !uploaded) {
          reject(error instanceof Error ? error : new Error("Cloudinary upload failed."));
          return;
        }
        resolve(uploaded);
      },
    );
    stream.end(bytes);
  });

  if (!result.secure_url) throw new Error("Cloudinary did not return an image URL.");
  return optimizedDeliveryUrl(result.secure_url);
}

export async function uploadImagePath(filePath: string, publicId: string) {
  configure();
  const result = await cloudinary.uploader.upload(filePath, {
    public_id: publicId,
    overwrite: true,
    invalidate: true,
    resource_type: "image",
  });
  if (!result.secure_url) throw new Error("Cloudinary did not return an image URL.");
  return optimizedDeliveryUrl(result.secure_url);
}

export async function destroyCloudinaryImage(url: string) {
  const publicId = cloudinaryPublicId(url);
  if (!publicId || !hasCloudinary()) return;
  configure();
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch {
    // Missing or already-deleted assets should not block CMS saves.
  }
}
