"use client";

import { ChangeEvent, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/utils";

export function AvatarUpload({ value, name, onChange }: { value: string; name: string; onChange: (url: string) => void }) {
  const supabase = createClient();
  const { t } = useI18n();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    const extension = file.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="flex items-center gap-4 rounded-3xl bg-background p-3">
      <label className="group relative cursor-pointer rounded-full">
        <Avatar className="h-24 w-24 ring-4 ring-white">
          <AvatarImage src={value || undefined} alt={name} />
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
        <span className="absolute inset-x-0 bottom-0 mx-auto grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </span>
        <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} disabled={uploading} />
      </label>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{uploading ? t.common.uploading : t.profile.uploadAvatar}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{t.profile.uploadAvatarHint}</p>
        {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
