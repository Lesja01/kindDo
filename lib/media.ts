const imagePattern = /\.(png|jpe?g|webp|gif|avif)(\?|#|$)/i;

export function isImageUrl(url: string | null | undefined) {
  return Boolean(url && imagePattern.test(url));
}
