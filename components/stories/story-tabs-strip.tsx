"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export function StoryTabsStrip() {
  const { t } = useI18n();

  return (
    <div className="mx-4 mb-4 grid grid-cols-2 rounded-3xl bg-white/80 p-1 shadow-sm shadow-black/5">
      <Link
        href="/"
        className="rounded-2xl px-4 py-3 text-center text-sm font-semibold text-muted-foreground transition-colors hover:bg-background"
      >
        {t.stories.dreamsTab}
      </Link>
      <span className="rounded-2xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20">
        {t.stories.storiesTab}
      </span>
    </div>
  );
}
