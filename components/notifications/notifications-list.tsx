"use client";

import Link from "next/link";
import { HeartHandshake, MessageCircle, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useI18n } from "@/lib/i18n";
import { cn, timeAgo } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  kind: "message" | "story" | "help" | "dream";
  actorName: string | null;
  dreamTitle: string | null;
  text: string | null;
  createdAt: string;
  href: string;
};

const iconByKind = {
  message: MessageCircle,
  story: Sparkles,
  help: HeartHandshake,
  dream: HeartHandshake
};

const toneByKind = {
  message: "bg-secondary/15 text-secondary",
  story: "bg-primary/15 text-primary",
  help: "bg-success/15 text-success",
  dream: "bg-primary/15 text-primary"
};

export function NotificationsList({ items }: { items: NotificationItem[] }) {
  const { locale, t } = useI18n();

  if (!items.length) {
    return <EmptyState title={t.common.noNotifications} description={t.common.noNotificationsDescription} />;
  }

  return (
    <div className="space-y-2 px-4 pb-6">
      {items.map((item) => {
        const Icon = iconByKind[item.kind];
        const title =
          item.kind === "message"
            ? `${t.common.newMessageFrom} ${item.actorName ?? t.common.dreamer}`
            : item.kind === "story"
              ? t.common.storyReady
              : item.kind === "dream"
                ? `${item.actorName ?? t.common.dreamer} ${t.dreams.sharedDream}`
              : t.common.helped;
        const subtitle =
          item.kind === "message"
            ? (item.text ?? item.dreamTitle ?? t.common.message)
            : item.kind === "dream"
              ? (item.text ?? item.dreamTitle ?? t.common.dreams)
            : `${t.common.storyReadyFrom} ${item.actorName ?? t.common.dreamer}${item.dreamTitle ? `: ${item.dreamTitle}` : ""}`;

        return (
          <Link
            key={`${item.kind}-${item.id}`}
            href={item.href}
            className="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-sm shadow-black/5 transition-transform active:scale-[0.99]"
          >
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-2xl", toneByKind[item.kind])}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-foreground">{title}</span>
              <span className="mt-1 block truncate text-xs leading-5 text-muted-foreground">{subtitle}</span>
            </span>
            <span className="self-start whitespace-nowrap pt-1 text-[11px] font-medium text-muted-foreground">{timeAgo(item.createdAt, locale)}</span>
          </Link>
        );
      })}
    </div>
  );
}
