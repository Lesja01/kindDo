"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Locale, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const locales: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "ru", label: "RU" }
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="glass-panel fixed right-3 top-3 z-50 flex items-center gap-1 rounded-full p-1">
      <Languages className="ml-1 h-4 w-4 text-muted-foreground" aria-hidden />
      {locales.map((item) => (
        <Button
          key={item.value}
          type="button"
          size="sm"
          variant="ghost"
          className={cn("h-8 px-2 text-xs", locale === item.value && "bg-primary text-primary-foreground hover:bg-primary/90")}
          onClick={() => setLocale(item.value)}
          aria-pressed={locale === item.value}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
