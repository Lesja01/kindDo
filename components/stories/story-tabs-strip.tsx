"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export function StoryTabsStrip({ mentioned = false }: { mentioned?: boolean }) {
  const { t } = useI18n();

  return (
    <div className="mx-4 mb-4 space-y-2">
      <div className="grid grid-cols-2 rounded-3xl bg-white/80 p-1 shadow-sm shadow-black/5">
        <Link href="/" className="rounded-2xl px-4 py-3 text-center text-sm font-semibold text-muted-foreground transition-colors hover:bg-background">
          {t.stories.dreamsTab}
        </Link>
        <Link
          href="/stories"
          className={mentioned ? "rounded-2xl px-4 py-3 text-center text-sm font-semibold text-muted-foreground transition-colors hover:bg-background" : "rounded-2xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20"}
        >
          {t.stories.storiesTab}
        </Link>
      </div>
      <Link
        href="/stories?mentioned=me"
        className={mentioned ? "block rounded-3xl bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground shadow-sm shadow-primary/20" : "block rounded-3xl bg-white/80 px-4 py-3 text-center text-sm font-bold text-muted-foreground shadow-sm shadow-black/5"}
      >
        {t.stories.mentionedTab}
      </Link>
    </div>
  );
}
