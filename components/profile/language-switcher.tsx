"use client";

import { Check } from "lucide-react";
import { Locale, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const languages: Array<{ id: Locale; label: string }> = [
  { id: "ru", label: "Русский" },
  { id: "en", label: "English" }
];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <section className="rounded-3xl bg-white p-3 shadow-sm shadow-black/5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-sm font-extrabold tracking-normal">{t.profile.languageTitle}</h2>
        <p className="text-xs text-muted-foreground">{t.profile.languageIntro}</p>
      </div>
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-background p-1">
        {languages.map((item) => {
          const active = locale === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={cn(
                "flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors",
                active ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-white"
              )}
              onClick={() => setLocale(item.id)}
            >
              {active ? <Check className="h-4 w-4" /> : null}
              {item.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
