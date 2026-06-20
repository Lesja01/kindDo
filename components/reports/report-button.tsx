"use client";

import { FormEvent, useState } from "react";
import { Flag, Loader2, MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ReportTarget = "dream" | "story" | "profile";

const reasons = ["unsafe", "spam", "fraud", "harassment", "other"] as const;

export function ReportButton({ targetType, targetId, light = false }: { targetType: ReportTarget; targetId: string; light?: boolean }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<(typeof reasons)[number]>("unsafe");
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_type: targetType, target_id: targetId, reason, details })
    });
    const payload = await response.json().catch(() => null);
    setSaving(false);

    if (!response.ok) {
      setMessage(response.status === 401 ? t.reports.signInRequired : payload?.error ?? t.reports.error);
      return;
    }

    setDone(true);
    setMessage(t.reports.sent);
  }

  return (
    <>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={cn("rounded-full", light && "bg-black/25 text-white backdrop-blur hover:bg-black/35 hover:text-white")}
        aria-label={t.reports.report}
        onClick={() => setOpen(true)}
      >
        <MoreHorizontal className="h-5 w-5" />
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-3 py-4" onClick={() => setOpen(false)}>
          <form className="w-full max-w-[448px] rounded-3xl bg-white p-4 shadow-2xl shadow-black/20" onSubmit={submit} onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-destructive/10 text-destructive">
                <Flag className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-extrabold tracking-normal">{t.reports.title}</h2>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">{t.reports.description}</p>
              </div>
              <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-muted text-muted-foreground" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {reasons.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={cn(
                    "h-9 rounded-full px-3 text-xs font-bold transition-colors",
                    reason === item ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
                  )}
                  onClick={() => setReason(item)}
                >
                  {t.reports.reasons[item]}
                </button>
              ))}
            </div>

            <Textarea
              className="mt-3 min-h-24 rounded-2xl border-0 bg-background ring-1 ring-border/70"
              placeholder={t.reports.detailsPlaceholder}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
            />

            {message ? <p className={cn("mt-3 text-sm font-medium", done ? "text-success" : "text-destructive")}>{message}</p> : null}

            <Button className="mt-4 h-12 w-full rounded-2xl shadow-xl shadow-primary/20" disabled={saving || done}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
              {done ? t.reports.sent : t.reports.submit}
            </Button>
          </form>
        </div>
      ) : null}
    </>
  );
}
