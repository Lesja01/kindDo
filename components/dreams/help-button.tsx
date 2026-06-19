"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeartHandshake, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function HelpButton({ dreamId, disabled }: { dreamId: string; disabled?: boolean }) {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function help() {
    setLoading(true);
    setError("");
    const response = await fetch(`/api/dreams/${dreamId}/help`, { method: "POST" });
    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? t.dreams.unavailable);
      return;
    }

    router.push(`/chats/${payload.id}`);
  }

  return (
    <div className="space-y-2">
      <Button size="lg" className="h-12 w-full rounded-2xl shadow-xl shadow-primary/20" onClick={help} disabled={disabled || loading}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <HeartHandshake className="h-5 w-5" />}
        {t.dreams.requestHelp}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
