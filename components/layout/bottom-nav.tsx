"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { HeartHandshake, Home, MessageCircle, PlusCircle, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", labelKey: "home", icon: Home },
  { href: "/create", labelKey: "create", icon: PlusCircle },
  { href: "/my-dreams", labelKey: "myDreams", icon: HeartHandshake },
  { href: "/chats", labelKey: "chats", icon: MessageCircle },
  { href: "/profile", labelKey: "profile", icon: User }
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const supabase = createClient();
  const session = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      return user;
    }
  });
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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/80 bg-white/95 px-0 pb-0 pt-1 shadow-[0_-18px_40px_rgba(31,41,55,0.12)] backdrop-blur-xl">
      <div className="mx-auto grid h-[4.35rem] max-w-[480px] grid-cols-5 rounded-t-[1.75rem] bg-white/95 px-1 pb-2 pt-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isProfileItem = item.href === "/profile";
          const href = isProfileItem && !session.data ? "/login" : item.href;
          const label = isProfileItem && !session.data ? t.nav.register : t.nav[item.labelKey];
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 rounded-2xl text-[10px] font-bold text-muted-foreground transition-colors",
                active && "text-primary"
              )}
            >
              <span
                className={cn(
                  "relative grid h-8 w-10 place-items-center rounded-full transition-colors",
                  active && "bg-primary text-primary-foreground shadow-lg shadow-primary/25",
                  item.href === "/my-dreams" && !active && "bg-secondary/10 text-secondary"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "fill-white/10")} aria-hidden />
                {item.href === "/chats" && unreadCount > 0 ? (
                  <span className="absolute right-1 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold leading-none text-destructive-foreground ring-2 ring-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
