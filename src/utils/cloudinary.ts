// src/utils/cloudinary.ts
const UPLOAD_URL = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;

interface CloudinaryOptions {
  width?: number;
  height?: number;
  crop?: 'limit' | 'fill';
  format?: 'auto' | 'jpg';
}

export function isCloudinary(src: unknown): src is string {
  return typeof src === 'string' && UPLOAD_URL.test(src);
}

// Asks Cloudinary for a resized, compressed version of an upload URL.
// 'limit' only ever scales down; 'fill' crops to exactly width x height.
// Non-Cloudinary sources are returned unchanged.
export function cloudinary(
  src: string,
  { width, height, crop = 'limit', format = 'auto' }: CloudinaryOptions = {}
): string {
  const match = isCloudinary(src) ? src.match(UPLOAD_URL) : null;
  if (!match) return src;

  const transforms = [
    `f_${format}`,
    'q_auto',
    `c_${crop}`,
    width && `w_${width}`,
    height && `h_${height}`,
  ]
    .filter(Boolean)
    .join(',');

  return `${match[1]}${transforms}/${match[2]}`;
}
