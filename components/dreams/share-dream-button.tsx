"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Instagram, Loader2, Search, Send, Share2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { initials } from "@/lib/utils";

type UserResult = {
  id: string;
  name: string;
  avatar: string | null;
  location: string | null;
};

export function ShareDreamButton({ dreamId, title }: { dreamId: string; title: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sendingTo, setSendingTo] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [sendStatus, setSendStatus] = useState("");
  const [comment, setComment] = useState("");
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/dreams/${dreamId}` : "";
  const shareText = useMemo(() => `${t.stories.shareDream}: ${title}\n${shareUrl}`, [shareUrl, t.stories.shareDream, title]);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setUsers([]);
      return;
    }

    const controller = new AbortController();
    setLoadingUsers(true);
    fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((payload) => setUsers(payload.users ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false));

    return () => controller.abort();
  }, [open, query]);

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function sendToUser(userId: string) {
    setSendingTo(userId);
    setSendStatus("");
    const response = await fetch(`/api/dreams/${dreamId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient_id: userId, message: comment.trim() || title })
    });
    setSendingTo("");

    if (response.ok) {
      setSentTo(userId);
      setSendStatus(t.stories.dreamSent);
      window.setTimeout(() => setSentTo(""), 1600);
      return;
    }

    const payload = await response.json().catch(() => null);
    setSendStatus(payload?.error ?? t.stories.dreamSendError);
  }

  return (
    <>
      <button
        type="button"
        className="grid h-10 w-10 place-items-center rounded-full bg-white/16 text-white shadow-xl shadow-black/15 backdrop-blur-xl transition-colors hover:bg-white/25"
        onClick={() => setOpen(true)}
        aria-label={t.stories.shareDream}
        title={t.stories.shareDream}
      >
        <Share2 className="h-4 w-4" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 px-3 pb-24 pt-5" onClick={() => setOpen(false)}>
          <div className="max-h-[calc(100dvh-8rem)] w-full max-w-[452px] overflow-y-auto rounded-[2rem] bg-white p-4 shadow-2xl shadow-black/25" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Share2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-black tracking-normal">{t.stories.shareDream}</h2>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">{title}</p>
              </div>
              <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-background text-muted-foreground" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button asChild className="h-11 rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer">
                  <Send className="h-4 w-4" />
                  Telegram
                </a>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-2xl bg-white">
                <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer">
                  <Send className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-2xl bg-white" onClick={copyLink}>
                <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </a>
              </Button>
              <Button type="button" variant="outline" className="h-11 rounded-2xl bg-white" onClick={copyLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? t.stories.copied : t.stories.copyLink}
              </Button>
            </div>

            <div className="mt-4 rounded-3xl bg-background p-3">
              <p className="text-sm font-black">{t.stories.sendToKindDoUser}</p>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input className="h-10 rounded-2xl border-0 bg-white pl-9 ring-1 ring-border/60" value={query} placeholder={t.common.searchPlaceholder} onChange={(event) => setQuery(event.target.value)} />
              </div>
              <Textarea
                className="mt-2 min-h-16 rounded-2xl border-0 bg-white text-sm ring-1 ring-border/60"
                value={comment}
                placeholder={t.stories.shareCommentPlaceholder}
                onChange={(event) => setComment(event.target.value)}
                maxLength={240}
              />
              <div className="mt-3 space-y-2">
                {loadingUsers ? <p className="text-xs text-muted-foreground">{t.common.loading}</p> : null}
                {sendStatus ? <p className="rounded-2xl bg-white px-3 py-2 text-xs font-bold text-muted-foreground shadow-sm shadow-black/5">{sendStatus}</p> : null}
                {users.slice(0, 5).map((user) => (
                  <button key={user.id} type="button" className="flex w-full items-center gap-3 rounded-2xl bg-white p-2 text-left shadow-sm shadow-black/5" onClick={() => sendToUser(user.id)}>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                      <AvatarFallback>{initials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{user.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{user.location ?? t.common.dreamer}</span>
                    </span>
                    {sendingTo === user.id ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : sentTo === user.id ? <Check className="h-4 w-4 text-success" /> : <Send className="h-4 w-4 text-muted-foreground" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
