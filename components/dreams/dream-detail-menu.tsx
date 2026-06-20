"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportButton } from "@/components/reports/report-button";
import { useI18n } from "@/lib/i18n";

export function DreamDetailMenu({ dreamId, canEdit }: { dreamId: string; canEdit: boolean }) {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  async function deleteDream() {
    if (!window.confirm(t.dreams.deleteDreamConfirm)) return;

    setDeleting(true);
    setError("");
    const response = await fetch(`/api/dreams/${dreamId}`, { method: "DELETE" });
    setDeleting(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? t.dreams.taskSaveError);
      return;
    }

    router.replace("/my-dreams");
    router.refresh();
  }

  if (!canEdit) return <ReportButton targetType="dream" targetId={dreamId} />;

  return (
    <div ref={menuRef} className="relative">
      <Button type="button" size="icon" variant="ghost" className="rounded-full" onClick={() => setOpen((value) => !value)}>
        <MoreHorizontal className="h-5 w-5" />
      </Button>
      {open ? (
        <div className="absolute right-0 top-11 z-30 w-48 overflow-hidden rounded-2xl bg-white p-1 shadow-xl shadow-black/15 ring-1 ring-black/5">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-destructive hover:bg-destructive/10"
            onClick={deleteDream}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {t.dreams.deleteDream}
          </button>
          {error ? <p className="px-3 py-2 text-xs text-destructive">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
