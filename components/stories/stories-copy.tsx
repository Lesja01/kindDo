"use client";

import { useI18n } from "@/lib/i18n";
import { EmptyState } from "@/components/ui/empty-state";

export function StoriesTitle() {
  const { t } = useI18n();
  return <h1 className="text-2xl font-bold tracking-normal">{t.stories.title}</h1>;
}

export function EmptyStories() {
  const { t } = useI18n();
  return <EmptyState title={t.stories.noStories} description={t.stories.createIntro} />;
}
