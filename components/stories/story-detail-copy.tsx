"use client";

import { useI18n } from "@/lib/i18n";

export function StoryDreamTitleFallback() {
  const { t } = useI18n();
  return <>{t.stories.dreamCameTrue}</>;
}

export function StoryHelperLine({ helperName, createdAt }: { helperName?: string | null; createdAt: string }) {
  const { t } = useI18n();
  return (
    <>
      {t.common.helpedBy} {helperName ?? t.common.helper} · {createdAt}
    </>
  );
}

export function ViewOriginalDreamLabel() {
  const { t } = useI18n();
  return <>{t.stories.viewOriginal}</>;
}
