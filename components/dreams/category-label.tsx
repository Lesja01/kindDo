"use client";

import { useI18n } from "@/lib/i18n";

export function CategoryLabel({ category }: { category: string }) {
  const { t } = useI18n();
  return <>{t.categories[category as keyof typeof t.categories] ?? category}</>;
}
