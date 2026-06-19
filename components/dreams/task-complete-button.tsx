"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function TaskCompleteButton({ dreamId, taskId }: { dreamId: string; taskId: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function completeTask() {
    setLoading(true);
    setError("");

    const response = await fetch(`/api/dreams/${dreamId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true })
    });
    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? t.dreams.taskSaveError);
      return;
    }

    router.refresh();
  }

  return (
    <span className="flex shrink-0 flex-col items-end gap-1">
      <Button className="h-8 rounded-full px-3 text-xs font-bold" size="sm" onClick={completeTask} disabled={loading}>
        <Check className="h-4 w-4" />
        {t.dreams.completeTaskYourself}
      </Button>
      {error ? <span className="max-w-36 text-right text-[10px] font-semibold text-destructive">{error}</span> : null}
    </span>
  );
}
