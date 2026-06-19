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
      <Avatar className="h-20 w-20 ring-4 ring-white">
        <AvatarImage src={value || undefined} alt={name} />
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-foreground shadow-sm shadow-black/5">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Camera className="h-4 w-4 text-primary" />}
          {uploading ? t.common.uploading : t.profile.uploadAvatar}
          <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} disabled={uploading} />
        </label>
        {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
