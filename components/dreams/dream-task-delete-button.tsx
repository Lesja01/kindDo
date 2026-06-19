"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function DreamTaskDeleteButton({ dreamId, taskId }: { dreamId: string; taskId: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function deleteTask() {
    setLoading(true);
    setError("");

    const response = await fetch(`/api/dreams/${dreamId}/tasks/${taskId}`, { method: "DELETE" });
    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? t.dreams.taskSaveError);
      return;
    }

    router.refresh();
  }

  return (
    <span className="relative shrink-0">
      <button
        type="button"
        className="grid h-8 w-8 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        onClick={deleteTask}
        disabled={loading}
        aria-label={t.dreams.deleteTask}
        title={t.dreams.deleteTask}
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {error ? <span className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-destructive px-2 py-1 text-[10px] font-semibold text-destructive-foreground shadow-sm">{error}</span> : null}
    </span>
  );
}
