"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

export function AuthForm() {
  const supabase = createClient();
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  async function signInWithGoogle() {
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    await supabase.auth.signOut();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          prompt: "select_account"
        }
      }
    });
  }

  return (
    <div className="space-y-5">
      <Button className="h-12 w-full rounded-2xl bg-white/80" size="lg" variant="outline" onClick={signInWithGoogle}>
        {t.auth.google}
      </Button>
    </div>
  );
}
