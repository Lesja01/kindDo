"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScreenHeader({ title }: { title: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-30 bg-background/90 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 truncate text-lg font-extrabold tracking-normal">{title}</div>
        <Button asChild size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-white/70 shadow-sm shadow-black/5" aria-label="Search">
          <Link href="/search">
            <Search className="h-[18px] w-[18px]" />
          </Link>
        </Button>
        <Button asChild size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-white/70 shadow-sm shadow-black/5" aria-label="Notifications">
          <Link href="/notifications">
            <Bell className="h-[18px] w-[18px]" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
