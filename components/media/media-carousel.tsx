"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MediaViewer } from "@/components/media/media-viewer";

export function MediaCarousel({ urls }: { urls: string[] }) {
  const [index, setIndex] = useState(0);
  const current = urls[index] ?? urls[0];
  const hasMany = urls.length > 1;

  if (!current) return null;

  function move(delta: number) {
    setIndex((value) => (value + delta + urls.length) % urls.length);
  }

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-black shadow-xl shadow-black/10">
      <MediaViewer className="h-full w-full object-cover" src={current} />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
      {hasMany ? (
        <>
          <button type="button" className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur" onClick={() => move(-1)} aria-label="Previous">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur" onClick={() => move(1)} aria-label="Next">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {urls.map((url, itemIndex) => (
              <button
                key={`${url}-${itemIndex}`}
                type="button"
                className={itemIndex === index ? "h-1.5 w-5 rounded-full bg-white" : "h-1.5 w-1.5 rounded-full bg-white/55"}
                onClick={() => setIndex(itemIndex)}
                aria-label={`Media ${itemIndex + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
