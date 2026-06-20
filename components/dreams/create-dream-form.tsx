"use client";

import { FormEvent, useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiMediaUpload } from "@/components/media/multi-media-upload";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { DreamVisibility } from "@/types/database";

const categories = ["Family", "Health", "Learning", "Home", "Work", "Travel", "Creativity", "Sport", "Kids", "Community"];

export function CreateDreamForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [visibility, setVisibility] = useState<DreamVisibility>("public");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!mediaUrls.length) {
      setError(t.dreams.uploadRequired);
      return;
    }

    setLoading(true);
    const response = await fetch("/api/dreams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, category, video_url: mediaUrls[0], media_urls: mediaUrls, visibility })
    });
    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? t.dreams.createError);
      return;
    }

    router.push(`/dreams/${payload.id}`);
  }

  return (
    <form onSubmit={submit} className="min-h-dvh space-y-4 px-4 py-4">
      <div className="grid grid-cols-[40px_1fr_40px] items-center">
        <Button type="button" size="icon" variant="ghost" className="rounded-full" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-center text-base font-bold tracking-normal">{t.dreams.shareTitle}</h1>
        <div />
      </div>

      <div className="space-y-2">
        <Label className="px-1">{t.common.uploadVideo}</Label>
        <MultiMediaUpload bucket="dream-videos" values={mediaUrls} onChange={setMediaUrls} />
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
        <div className="space-y-2">
          <Label htmlFor="title">{t.dreams.title}</Label>
          <Input
            id="title"
            className="h-10 rounded-2xl border-0 bg-background ring-1 ring-border/70"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={90}
          />
          <p className="mt-1 text-right text-[11px] text-muted-foreground">{title.length}/90</p>
        </div>

        <div className="mt-3 space-y-2">
          <Label htmlFor="description">{t.dreams.description}</Label>
          <Textarea
            id="description"
            className="min-h-24 rounded-2xl border-0 bg-background ring-1 ring-border/70"
            value={description}
            placeholder={t.dreams.descriptionPlaceholder}
            onChange={(event) => setDescription(event.target.value)}
            required
            maxLength={300}
          />
          <p className="mt-1 text-right text-[11px] text-muted-foreground">{description.length}/300</p>
        </div>

        <div className="mt-3 space-y-2">
          <Label htmlFor="category">{t.dreams.category}</Label>
          <div className="relative">
            <select
              id="category"
              className="h-10 w-full appearance-none rounded-2xl border-0 bg-background px-3 pr-10 text-sm font-medium outline-none ring-1 ring-border/70"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {t.categories[item as keyof typeof t.categories]}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <Label>{t.dreams.visibility}</Label>
            <span className="text-right text-xs font-medium text-muted-foreground">
              {visibility === "public" ? t.dreams.publicVisibilityHint : t.dreams.privateVisibilityHint}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-background p-1">
            <VisibilityOption
              active={visibility === "public"}
              icon={<Eye className="h-4 w-4" />}
              title={t.dreams.publicVisibility}
              onClick={() => setVisibility("public")}
            />
            <VisibilityOption
              active={visibility === "private"}
              icon={<EyeOff className="h-4 w-4" />}
              title={t.dreams.privateVisibility}
              onClick={() => setVisibility("private")}
            />
          </div>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="sticky bottom-24 z-10 pt-1">
        <Button size="lg" className="h-12 w-full rounded-2xl shadow-xl shadow-primary/20" disabled={loading}>
          <Sparkles className="h-5 w-5" />
          {loading ? t.dreams.posting : t.dreams.post}
        </Button>
      </div>
    </form>
  );
}

function VisibilityOption({
  active,
  icon,
  title,
  onClick
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors",
        active ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-white"
      )}
      onClick={onClick}
    >
      {icon}
      <span>{title}</span>
    </button>
  );
}
