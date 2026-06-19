"use client";

import { useI18n } from "@/lib/i18n";

export function ReputationLabel({ value }: { value: number }) {
  const { t } = useI18n();
  return (
    <p className="text-sm text-muted-foreground">
      {t.common.reputation} {value}
    </p>
  );
}

export function PublicProfileButtonLabel() {
  const { t } = useI18n();
  return <>{t.profile.viewPublic}</>;
}

export function ProfileAboutLabel() {
  const { t } = useI18n();
  return <>{t.profile.about}</>;
}

export function StatLabel({ type }: { type: "dreams" | "helped" | "stories" }) {
  const { t } = useI18n();
  const labels = {
    dreams: t.common.dreams,
    helped: t.common.helped,
    stories: t.nav.stories
  };

  return <>{labels[type]}</>;
}
