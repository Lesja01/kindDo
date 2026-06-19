"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { useI18n } from "@/lib/i18n";

export function NotificationsEmpty() {
  const { t } = useI18n();
  return <EmptyState title={t.common.noNotifications} description={t.common.noNotificationsDescription} />;
}

export function NotificationsTitle() {
  const { t } = useI18n();
  return <>{t.common.notifications}</>;
}
