"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScreenHeader({ title }: { title: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-30 bg-background/95 px-4 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 truncate text-xl font-bold tracking-normal">{title}</div>
        <Button asChild size="icon" variant="ghost" className="rounded-full" aria-label="Search">
          <Link href="/search">
            <Search className="h-5 w-5" />
          </Link>
        </Button>
        <Button asChild size="icon" variant="ghost" className="rounded-full" aria-label="Notifications">
          <Link href="/notifications">
            <Bell className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
