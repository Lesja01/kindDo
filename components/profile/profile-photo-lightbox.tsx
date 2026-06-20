"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { ProfilePhoto } from "@/types/database";

export function ProfilePhotoLightbox({ photos }: { photos: ProfilePhoto[] }) {
  const [active, setActive] = useState<ProfilePhoto | null>(null);

  return (
    <>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <button key={photo.id} type="button" className="aspect-square overflow-hidden rounded-2xl bg-background" onClick={() => setActive(photo)}>
            <img src={photo.url} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {active ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4" onClick={() => setActive(null)}>
          <button type="button" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur" aria-label="Закрыть">
            <X className="h-5 w-5" />
          </button>
          <img src={active.url} alt="" className="max-h-[82dvh] max-w-full rounded-3xl object-contain shadow-2xl" />
        </div>
      ) : null}
    </>
  );
}
