"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Home, MessageCircle, NotebookTabs, PlusCircle, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", labelKey: "home", icon: Home },
  { href: "/create", labelKey: "create", icon: PlusCircle },
  { href: "/my-dreams", labelKey: "myDreams", icon: NotebookTabs },
  { href: "/chats", labelKey: "chats", icon: MessageCircle },
  { href: "/profile", labelKey: "profile", icon: User }
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const unread = useQuery({
    queryKey: ["chats", "unread"],
    queryFn: async () => {
      const response = await fetch("/api/chats/unread");
      if (!response.ok) return { count: 0 };
      return response.json() as Promise<{ count: number }>;
    },
    refetchInterval: 15_000
  });

  const unreadCount = unread.data?.count ?? 0;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-white/95 px-3 pb-2 pt-1 backdrop-blur">
      <div className="mx-auto grid h-14 max-w-[480px] grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold text-muted-foreground transition-colors",
                active && "text-primary"
              )}
            >
              <span className={cn("relative grid h-7 w-10 place-items-center rounded-full transition-colors", active && "bg-primary/10")}>
                <Icon className="h-5 w-5" aria-hidden />
                {item.href === "/chats" && unreadCount > 0 ? (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </span>
              <span>{t.nav[item.labelKey]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
