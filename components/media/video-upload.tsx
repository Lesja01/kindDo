"use client";

import { ChangeEvent, useState } from "react";
import { PlayCircle, Upload, X } from "lucide-react";
import { isVideoUrl } from "@/lib/media";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

type Bucket = "dream-videos" | "story-videos" | "avatars";
const mediaAccept = "image/*,video/*";

export function VideoUpload({
  bucket,
  value,
  onChange
}: {
  bucket: Bucket;
  value: string;
  onChange: (url: string) => void;
}) {
  const supabase = createClient();
  const { t } = useI18n();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    const extension = file.name.split(".").pop() ?? "mp4";
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm shadow-black/5 ring-1 ring-black/5">
        <div className="relative aspect-[4/3] bg-muted">
          {value ? (
            <>
              {isVideoUrl(value) ? (
                <>
                  <video className="h-full w-full object-cover" src={value} controls playsInline />
                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md">
                      <PlayCircle className="h-8 w-8 fill-white/20" />
                    </span>
                  </div>
                </>
              ) : (
                <img className="h-full w-full object-cover" src={value} alt="" />
              )}
              <button
                type="button"
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white backdrop-blur"
                onClick={() => onChange("")}
                aria-label="Remove video"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/10 via-white to-secondary/10 text-muted-foreground">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-white shadow-lg shadow-black/5">
                <Upload className="h-6 w-6 text-primary" />
              </span>
              <span className="text-sm font-semibold">{uploading ? t.common.uploading : t.common.uploadVideo}</span>
              <input className="sr-only" type="file" accept={mediaAccept} onChange={handleFile} />
            </label>
          )}
        </div>
        <label className="flex h-11 cursor-pointer items-center justify-center gap-2 border-t text-sm font-semibold text-foreground">
          <Upload className="h-4 w-4" />
          {uploading ? t.common.uploading : t.common.uploadVideo}
          <input className="sr-only" type="file" accept={mediaAccept} onChange={handleFile} disabled={uploading} />
        </label>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
