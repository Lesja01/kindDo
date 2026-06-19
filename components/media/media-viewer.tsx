import { isImageUrl } from "@/lib/media";

export function MediaViewer({ src, className }: { src: string; className?: string }) {
  if (isImageUrl(src)) {
    return <img className={className} src={src} alt="" />;
  }

  return <video className={className} src={src} controls playsInline />;
}
