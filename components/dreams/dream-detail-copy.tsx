"use client";

import { useI18n } from "@/lib/i18n";
import { DreamStatus } from "@/types/database";

export function SignInToHelpLabel() {
  const { t } = useI18n();
  return <>{t.dreams.signInToHelp}</>;
}

export function OpenChatLabel() {
  const { t } = useI18n();
  return <>{t.dreams.openChat}</>;
}

export function DreamerFallback() {
  const { t } = useI18n();
  return <>{t.common.dreamer}</>;
}

export function CategoryLabel({ category }: { category: string }) {
  const { t } = useI18n();
  return <>{t.categories[category as keyof typeof t.categories] ?? category}</>;
}

export function StatusLabel({ status }: { status: DreamStatus }) {
  const { t } = useI18n();
  return <>{t.statuses[status]}</>;
}

export function DreamAboutLabel() {
  const { t } = useI18n();
  return <>{t.dreams.about}</>;
}

export function DreamPublishedLabel() {
  const { t } = useI18n();
  return <>{t.dreams.published}</>;
}

export function DreamHelperLabel() {
  const { t } = useI18n();
  return <>{t.dreams.helperStatus}</>;
}

export function DreamNoHelperLabel() {
  const { t } = useI18n();
  return <>{t.dreams.noHelperYet}</>;
}

export function TaskCompletedByAuthorLabel() {
  const { t } = useI18n();
  return <>{t.dreams.taskCompletedByAuthor}</>;
}

export function DreamStatusHeadingLabel() {
  const { t } = useI18n();
  return <>{t.common.status}</>;
}
