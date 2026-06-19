"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export function FavoriteButton({ dreamId, viewerId }: { dreamId: string; viewerId?: string | null }) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!viewerId) return;

    fetch(`/api/favorites/${dreamId}`)
      .then((response) => response.json())
      .then((payload) => setFavorited(Boolean(payload.favorited)))
      .catch(() => setFavorited(false));
  }, [dreamId, viewerId]);

  async function toggle() {
    if (!viewerId) {
      router.push(`/login?next=/dreams/${dreamId}`);
      return;
    }

    setLoading(true);
    const next = !favorited;
    setFavorited(next);
    const response = await fetch(`/api/favorites/${dreamId}`, { method: next ? "POST" : "DELETE" });
    setLoading(false);

    if (!response.ok) setFavorited(!next);
  }

  return (
    <button
      type="button"
      className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors", favorited ? "bg-primary/10 text-primary" : "text-muted-foreground")}
      onClick={toggle}
      disabled={loading}
      aria-label="Favorite"
    >
      <Bookmark className={cn("h-5 w-5", favorited && "fill-current")} />
    </button>
  );
}
