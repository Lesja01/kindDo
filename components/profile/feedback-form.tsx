"use client";

import { FormEvent, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";

export function FeedbackForm() {
  const { t } = useI18n();
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = message.trim();
    if (!value) return;

    setSending(true);
    setStatus("");
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: value, contact })
    });
    setSending(false);

    if (!response.ok) {
      setStatus(t.profile.feedbackError);
      return;
    }

    setMessage("");
    setContact("");
    setStatus(t.profile.feedbackSent);
  }

  return (
    <form className="space-y-3 rounded-3xl bg-white p-4 shadow-sm shadow-black/5" onSubmit={submit}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-secondary/15 text-secondary">
          <MessageCircle className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-extrabold tracking-normal">{t.profile.feedbackTitle}</h2>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">{t.profile.feedbackIntro}</p>
        </div>
      </div>
      <Textarea
        className="min-h-24 rounded-2xl border-0 bg-background ring-1 ring-border/70"
        value={message}
        placeholder={t.profile.feedbackPlaceholder}
        onChange={(event) => setMessage(event.target.value)}
        required
      />
      <Input
        className="h-10 rounded-2xl border-0 bg-background ring-1 ring-border/70"
        value={contact}
        placeholder={t.profile.feedbackContact}
        onChange={(event) => setContact(event.target.value)}
      />
      {status ? <p className="rounded-2xl bg-background px-3 py-2 text-sm text-muted-foreground">{status}</p> : null}
      <Button className="h-11 w-full rounded-2xl shadow-lg shadow-primary/15" disabled={sending}>
        <Send className="h-4 w-4" />
        {sending ? t.common.sending : t.profile.sendFeedback}
      </Button>
    </form>
  );
}
