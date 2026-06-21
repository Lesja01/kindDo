"use client";

import { Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { AppTheme, useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const themes: Array<{
  id: AppTheme;
  swatches: string[];
}> = [
  { id: "kinddo", swatches: ["#FF7A59", "#4ECDC4", "#2ECC71"] },
  { id: "ocean", swatches: ["#2FAFB7", "#9B7CF6", "#2ECC71"] }
];

export function ThemeSwitcher() {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();

  return (
    <section className="rounded-3xl bg-white p-3 shadow-sm shadow-black/5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-sm font-extrabold tracking-normal">{t.profile.themeTitle}</h2>
        <p className="text-xs text-muted-foreground">{t.profile.themeIntro}</p>
      </div>
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-background p-1">
        {themes.map((item) => {
          const active = theme === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={cn(
                "rounded-xl border px-2 py-2 text-left transition-transform active:scale-[0.98]",
                active ? "border-primary bg-white shadow-sm shadow-primary/10" : "border-transparent text-muted-foreground"
              )}
              onClick={() => setTheme(item.id)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold">{t.profile.themes[item.id]}</span>
                {active ? (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                ) : null}
              </div>
              <div className="mt-2 flex gap-1">
                {item.swatches.map((color) => (
                  <span key={color} className="h-3 flex-1 rounded-full" style={{ backgroundColor: color }} />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
