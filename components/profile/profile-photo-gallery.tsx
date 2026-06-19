"use client";

import { ChangeEvent, useState } from "react";
import { Camera, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { ProfilePhoto } from "@/types/database";

export function ProfilePhotoGallery({ userId, initialPhotos }: { userId: string; initialPhotos: ProfilePhoto[] }) {
  const supabase = createClient();
  const { t } = useI18n();
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setUploading(true);
    setError("");

    const uploaded: ProfilePhoto[] = [];
    for (const file of files) {
      const extension = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
        cacheControl: "3600",
        upsert: false
      });

      if (uploadError) {
        setError(uploadError.message);
        break;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const { data: row, error: insertError } = await supabase
        .from("profile_photos")
        .insert({ user_id: userId, url: data.publicUrl })
        .select("*")
        .single();

      if (insertError) {
        setError(insertError.message);
        break;
      }

      uploaded.push(row as ProfilePhoto);
    }

    if (uploaded.length) setPhotos((current) => [...uploaded, ...current]);
    setUploading(false);
    event.target.value = "";
  }

  async function remove(photo: ProfilePhoto) {
    setPhotos((current) => current.filter((item) => item.id !== photo.id));
    const { error: deleteError } = await supabase.from("profile_photos").delete().eq("id", photo.id).eq("user_id", userId);
    if (deleteError) {
      setError(deleteError.message);
      setPhotos((current) => [photo, ...current]);
    }
  }

  return (
    <section className="space-y-3 rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-extrabold tracking-normal">{t.profile.photos}</h3>
        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-2xl bg-primary px-3 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {uploading ? t.common.uploading : t.profile.uploadPhotos}
          <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={upload} disabled={uploading} />
        </label>
      </div>

      {photos.length ? (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-2xl bg-background">
              <img src={photo.url} alt="" className="h-full w-full object-cover" />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-white/85 text-destructive shadow-sm backdrop-blur"
                aria-label={t.profile.deletePhoto}
                onClick={() => remove(photo)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-3xl bg-background p-3 text-sm text-muted-foreground">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-primary">
            <Camera className="h-5 w-5" />
          </span>
          <p>{t.profile.uploadAvatarHint}</p>
        </div>
      )}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </section>
  );
}
