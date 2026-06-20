"use client";

import { ChangeEvent, useState } from "react";
import { PlayCircle, Upload, X } from "lucide-react";
import { isImageUrl } from "@/lib/media";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

type Bucket = "dream-videos" | "story-videos" | "avatars";
const MAX_MEDIA_FILES = 7;

export function MultiMediaUpload({
  bucket,
  values,
  onChange
}: {
  bucket: Bucket;
  values: string[];
  onChange: (urls: string[]) => void;
}) {
  const supabase = createClient();
  const { t } = useI18n();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const remainingSlots = MAX_MEDIA_FILES - values.length;
    if (remainingSlots <= 0) {
      setError(t.common.mediaLimit);
      event.target.value = "";
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setError(t.common.mediaLimit);
    } else {
      setError("");
    }

    setUploading(true);
    const uploaded: string[] = [];

    for (const file of filesToUpload) {
      const extension = file.name.split(".").pop() ?? "mp4";
      const path = `${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false
      });

      if (uploadError) {
        setError(uploadError.message);
        break;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }

    if (uploaded.length) onChange([...values, ...uploaded]);
    setUploading(false);
    event.target.value = "";
  }

  function remove(index: number) {
    onChange(values.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="space-y-3">
      <div className="rounded-3xl bg-white p-2 shadow-sm shadow-black/5 ring-1 ring-black/5">
        {values.length ? (
          <div className="grid grid-cols-2 gap-2">
            {values.map((url, index) => (
              <div key={`${url}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                {isImageUrl(url) ? (
                  <img className="h-full w-full object-cover" src={url} alt="" />
                ) : (
                  <>
                    <video className="h-full w-full object-cover" src={url} muted playsInline preload="metadata" />
                    <div className="absolute inset-0 grid place-items-center bg-black/10">
                      <PlayCircle className="h-8 w-8 text-white" />
                    </div>
                  </>
                )}
                <button
                  type="button"
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white backdrop-blur"
                  onClick={() => remove(index)}
                  aria-label="Remove media"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-primary/10 via-white to-secondary/10 text-muted-foreground">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white shadow-lg shadow-black/5">
              <Upload className="h-6 w-6 text-primary" />
            </span>
            <span className="text-sm font-semibold">{uploading ? t.common.uploading : t.common.uploadVideo}</span>
            <input className="sr-only" type="file" multiple accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime" onChange={handleFiles} disabled={uploading} />
          </label>
        )}
        {values.length < MAX_MEDIA_FILES ? (
          <label className="mt-2 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border text-sm font-semibold text-foreground">
            <Upload className="h-4 w-4" />
            {uploading ? t.common.uploading : t.common.uploadVideo}
            <input className="sr-only" type="file" multiple accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime" onChange={handleFiles} disabled={uploading} />
          </label>
        ) : null}
      </div>
      <p className="px-1 text-xs text-muted-foreground">
        {values.length}/{MAX_MEDIA_FILES}
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
