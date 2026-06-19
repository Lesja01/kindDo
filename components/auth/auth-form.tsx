"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

export function AuthForm() {
  const supabase = createClient();
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const redirectTo = `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true }
    });

    setLoading(false);
    setMessage(error ? error.message : t.auth.checkInbox);
  }

  async function signInWithGoogle() {
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo }
    });
  }

  return (
    <div className="space-y-5">
      <Button className="h-12 w-full rounded-2xl bg-white/80" size="lg" variant="outline" onClick={signInWithGoogle}>
        {t.auth.google}
      </Button>

      <form className="space-y-3" onSubmit={signInWithEmail}>
        <Label htmlFor="email">{t.common.email}</Label>
        <Input id="email" className="rounded-xl bg-white/80" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Button className="h-12 w-full rounded-2xl shadow-lg shadow-primary/15" size="lg" type="submit" disabled={loading}>
          <Mail className="h-4 w-4" />
          {loading ? t.auth.sending : t.auth.sendLink}
        </Button>
      </form>

      {message ? <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
