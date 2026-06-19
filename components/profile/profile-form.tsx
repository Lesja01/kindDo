"use client";

import { FormEvent, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { Profile, SocialLink } from "@/types/database";

export function ProfileForm({ profile, links }: { profile: Profile; links: SocialLink[] }) {
  const supabase = createClient();
  const { t } = useI18n();
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [age, setAge] = useState(profile.age?.toString() ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [avatar, setAvatar] = useState(profile.avatar ?? "");
  const [instagram, setInstagram] = useState(links.find((link) => link.platform === "instagram")?.url ?? "");
  const [tiktok, setTiktok] = useState(links.find((link) => link.platform === "tiktok")?.url ?? "");
  const [telegram, setTelegram] = useState(links.find((link) => link.platform === "telegram")?.url ?? "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const parsedAge = age.trim() ? Number(age) : null;
    const { error } = await supabase
      .from("users")
      .update({ name, bio, avatar, age: parsedAge, location: location.trim() || null })
      .eq("id", profile.id);

    const rows = [
      { platform: "instagram", url: instagram },
      { platform: "tiktok", url: tiktok },
      { platform: "telegram", url: telegram }
    ]
      .filter((link) => link.url.trim())
      .map((link) => ({ user_id: profile.id, platform: link.platform, url: link.url.trim() }));

    if (rows.length) {
      await supabase.from("social_links").upsert(rows, { onConflict: "user_id,platform" });
    }

    setSaving(false);
    setMessage(error ? error.message : t.profile.saved);
  }

  return (
    <form className="space-y-3 rounded-3xl bg-white p-4 shadow-sm shadow-black/5" onSubmit={save}>
      <div className="mb-1 flex items-center justify-between gap-3 px-1">
        <h2 className="text-lg font-extrabold tracking-normal">{t.profile.editProfile}</h2>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">{t.profile.name}</Label>
        <Input id="name" className="h-10 rounded-2xl border-0 bg-background ring-1 ring-border/70" value={name} onChange={(event) => setName(event.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="age">{t.profile.age}</Label>
          <Input
            id="age"
            className="h-10 rounded-2xl border-0 bg-background ring-1 ring-border/70"
            type="number"
            min={13}
            max={120}
            value={age}
            onChange={(event) => setAge(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">{t.profile.location}</Label>
          <Input
            id="location"
            className="h-10 rounded-2xl border-0 bg-background ring-1 ring-border/70"
            value={location}
            placeholder={t.profile.locationHint}
            onChange={(event) => setLocation(event.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatar">{t.profile.avatar}</Label>
        <Input id="avatar" className="h-10 rounded-2xl border-0 bg-background ring-1 ring-border/70" value={avatar} onChange={(event) => setAvatar(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">{t.profile.bio}</Label>
        <Textarea id="bio" className="min-h-24 rounded-2xl border-0 bg-background ring-1 ring-border/70" value={bio} onChange={(event) => setBio(event.target.value)} />
      </div>
      <div className="grid gap-3">
        <Input className="h-10 rounded-2xl border-0 bg-background ring-1 ring-border/70" placeholder={t.profile.instagram} value={instagram} onChange={(event) => setInstagram(event.target.value)} />
        <Input className="h-10 rounded-2xl border-0 bg-background ring-1 ring-border/70" placeholder={t.profile.tiktok} value={tiktok} onChange={(event) => setTiktok(event.target.value)} />
        <Input className="h-10 rounded-2xl border-0 bg-background ring-1 ring-border/70" placeholder={t.profile.telegram} value={telegram} onChange={(event) => setTelegram(event.target.value)} />
      </div>
      {message ? <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{message}</p> : null}
      <Button className="h-12 w-full rounded-2xl shadow-xl shadow-primary/20" disabled={saving}>
        <Save className="h-4 w-4" />
        {saving ? t.common.saving : t.profile.save}
      </Button>
    </form>
  );
}
