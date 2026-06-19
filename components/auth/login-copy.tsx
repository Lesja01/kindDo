"use client";

import { KindDoLogo } from "@/components/brand/kinddo-logo";
import { useI18n } from "@/lib/i18n";

export function LoginCopy() {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <KindDoLogo showTagline />
      <h1 className="text-3xl font-bold tracking-normal">{t.auth.headline}</h1>
      <p className="text-muted-foreground">{t.auth.intro}</p>
    </div>
  );
}
