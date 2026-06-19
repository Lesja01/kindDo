"use client";

import { ChangeEvent, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/utils";

export function ProfileHeaderAvatarUpload({ userId, name, initialAvatar }: { userId: string; name: string; initialAvatar: string | null }) {
  const supabase = createClient();
  const [avatar, setAvatar] = useState(initialAvatar ?? "");
  const [uploading, setUploading] = useState(false);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const extension = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });

    if (!uploadError) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: updateError } = await supabase.from("users").update({ avatar: data.publicUrl }).eq("id", userId);
      if (!updateError) setAvatar(data.publicUrl);
    }

    setUploading(false);
    event.target.value = "";
  }

  return (
    <label className="absolute -bottom-12 left-1/2 block h-28 w-28 -translate-x-1/2 cursor-pointer rounded-full">
      <Avatar className="h-28 w-28 border-4 border-white shadow-xl">
        <AvatarImage src={avatar || undefined} alt={name} />
        <AvatarFallback className="text-2xl">{initials(name)}</AvatarFallback>
      </Avatar>
      <span className="absolute bottom-1 right-1 grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </span>
      <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} disabled={uploading} />
    </label>
  );
}
