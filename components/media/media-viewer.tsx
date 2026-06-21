import { isVideoUrl } from "@/lib/media";

export function MediaViewer({ src, className }: { src: string; className?: string }) {
  if (isVideoUrl(src)) {
    return <video className={className} src={src} controls autoPlay muted loop playsInline />;
  }

  return <img className={className} src={src} alt="" />;
}
