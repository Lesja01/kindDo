const imagePattern = /\.(png|jpe?g|webp|gif|avif|heic|heif)(\?|#|$)/i;
const videoPattern = /\.(mp4|webm|mov|m4v|quicktime)(\?|#|$)/i;

export function isImageUrl(url: string | null | undefined) {
  return Boolean(url && imagePattern.test(url));
}

export function isVideoUrl(url: string | null | undefined) {
  return Boolean(url && videoPattern.test(url));
}
