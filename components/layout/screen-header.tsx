"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScreenHeader({ title }: { title: React.ReactNode }) {
  const unread = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: async () => {
      const response = await fetch("/api/notifications/unread");
      if (!response.ok) return { count: 0 };
      return response.json() as Promise<{ count: number }>;
    },
    refetchInterval: 30_000
  });
  const unreadCount = unread.data?.count ?? 0;

  return (
    <div className="sticky top-0 z-30 bg-background/80 px-4 py-3 backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 truncate text-lg font-extrabold tracking-normal">{title}</div>
        <Button asChild size="icon" variant="ghost" className="h-9 w-9 rounded-full border border-white/80 bg-white/70 shadow-sm shadow-black/5 backdrop-blur-xl" aria-label="Search">
          <Link href="/search">
            <Search className="h-[18px] w-[18px]" />
          </Link>
        </Button>
        <Button asChild size="icon" variant="ghost" className="relative h-9 w-9 rounded-full border border-white/80 bg-white/70 shadow-sm shadow-black/5 backdrop-blur-xl" aria-label="Notifications">
          <Link href="/notifications">
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </Link>
        </Button>
      </div>
    </div>
  );
}
