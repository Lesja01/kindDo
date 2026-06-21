"use client";

import { useRef, useState } from "react";
import { isVideoUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

export function VideoThumbnail({ src, className }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const thumbnailSrc = src.includes("#t=") ? src : `${src}#t=0.1`;

  if (!isVideoUrl(src)) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <img className="h-full w-full object-cover" src={src} alt="" />
      </div>
    );
  }

  function showFirstFrame() {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (video.currentTime < 0.05) {
        video.currentTime = 0.1;
      }
    } catch {
      // Some remote video providers do not allow seeking before metadata is ready.
    }
    setLoaded(true);
  }

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <video
        ref={videoRef}
        className={cn("h-full w-full object-cover transition-opacity duration-200", loaded ? "opacity-100" : "opacity-0")}
        src={thumbnailSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={showFirstFrame}
        onCanPlay={showFirstFrame}
      />
      {!loaded ? <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/60" /> : null}
    </div>
  );
}
