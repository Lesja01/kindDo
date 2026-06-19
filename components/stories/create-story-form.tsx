"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Instagram, Music2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VideoUpload } from "@/components/media/video-upload";
import { useI18n } from "@/lib/i18n";

export function CreateStoryForm({ dreamId, dreamTitle, helperName }: { dreamId: string; dreamTitle: string; helperName: string | null }) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [mention, setMention] = useState(helperName ?? "");
  const [storyId, setStoryId] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const storyUrl = storyId && typeof window !== "undefined" ? `${window.location.origin}/stories/${storyId}` : "";
  const shareText = [text || t.stories.dreamCameTrue, mention ? `${t.stories.thanksTo} ${mention}` : "", dreamTitle, storyUrl]
    .filter(Boolean)
    .join("\n");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!videoUrl) {
      setError(t.stories.uploadRequired);
      return;
    }

    setLoading(true);
    const response = await fetch(`/api/dreams/${dreamId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video_url: videoUrl, text })
    });
    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? t.stories.createError);
      return;
    }

    setStoryId(payload.id);
  }

  async function copyShareText() {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <form className="space-y-4 rounded-3xl bg-white p-4 shadow-sm shadow-black/5" onSubmit={submit}>
      <div className="space-y-1 px-1">
        <h2 className="text-lg font-extrabold tracking-normal">{t.stories.create}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{t.stories.createIntro}</p>
      </div>
      <VideoUpload bucket="story-videos" value={videoUrl} onChange={setVideoUrl} />
      <div className="space-y-2">
        <Label htmlFor="story-text">{t.common.message}</Label>
        <Textarea
          id="story-text"
          className="min-h-24 rounded-2xl border-0 bg-background ring-1 ring-border/70"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </div>

      <div className="space-y-3 rounded-2xl bg-background p-3">
        <div>
          <p className="text-sm font-extrabold">{t.stories.shareTitle}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{t.stories.shareIntro}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="story-mention">{t.stories.mentionPerson}</Label>
          <Input
            id="story-mention"
            className="h-10 rounded-2xl border-0 bg-white ring-1 ring-border/70"
            value={mention}
            placeholder={helperName ?? "@username"}
            onChange={(event) => setMention(event.target.value)}
          />
        </div>

        {storyId ? (
          <div className="space-y-3">
            <div className="rounded-2xl bg-white p-3 text-xs leading-5 text-muted-foreground ring-1 ring-border/70">
              <p className="mb-1 font-bold text-foreground">{t.stories.shareText}</p>
              <p className="whitespace-pre-line">{shareText}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" className="h-10 rounded-2xl bg-white" onClick={copyShareText}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? t.stories.copied : t.stories.copyShareText}
              </Button>
              <Button asChild type="button" variant="outline" className="h-10 rounded-2xl bg-white">
                <Link href={`/stories/${storyId}`}>
                  <ExternalLink className="h-4 w-4" />
                  {t.stories.openStory}
                </Link>
              </Button>
              <Button asChild type="button" className="h-10 rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <a href={`https://t.me/share/url?url=${encodeURIComponent(storyUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer">
                  <Send className="h-4 w-4" />
                  {t.stories.shareTelegram}
                </a>
              </Button>
              <Button asChild type="button" variant="outline" className="h-10 rounded-2xl bg-white">
                <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" onClick={copyShareText}>
                  <Instagram className="h-4 w-4" />
                  {t.stories.openInstagram}
                </a>
              </Button>
              <Button asChild type="button" variant="outline" className="col-span-2 h-10 rounded-2xl bg-white">
                <a href="https://www.tiktok.com/upload" target="_blank" rel="noreferrer" onClick={copyShareText}>
                  <Music2 className="h-4 w-4" />
                  {t.stories.openTikTok}
                </a>
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button className="h-12 w-full rounded-2xl shadow-xl shadow-primary/20" disabled={loading || Boolean(storyId)}>
        <Sparkles className="h-4 w-4" />
        {loading ? t.stories.publishing : t.stories.publish}
      </Button>
    </form>
  );
}
