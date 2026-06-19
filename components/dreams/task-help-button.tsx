"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeartHandshake, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function TaskHelpButton({ dreamId, taskId }: { dreamId: string; taskId: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function help() {
    setLoading(true);
    setError("");
    const response = await fetch(`/api/dreams/${dreamId}/tasks/${taskId}/help`, { method: "POST" });
    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? t.dreams.unavailable);
      return;
    }

    router.push(`/chats/${payload.id}`);
  }

  return (
    <div className="space-y-1">
      <Button type="button" size="sm" className="h-9 rounded-xl px-3 text-xs" onClick={help} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <HeartHandshake className="h-4 w-4" />}
        {t.dreams.requestHelp}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
