/**
 * Safely extract an image URL from various possible backend fields.
 * Supports: image, image_url, thumbnail_url, imageUrl, thumbnailUrl, image_path, imagePath, thumb, thumbnail
 */
export function getImageUrl(obj?: any): string | null {
  if (!obj || typeof obj !== "object") return null;
  const candidates: Array<unknown> = [
    obj.image,
    obj.image_url,
    obj.thumbnail_url,
    obj.imageUrl,
    obj.thumbnailUrl,
    obj.image_path,
    obj.imagePath,
    obj.thumb,
    obj.thumbnail,
  ];
  const url = candidates.find((v) => typeof v === "string" && v.length > 0);
  return (url as string) || null;
}
