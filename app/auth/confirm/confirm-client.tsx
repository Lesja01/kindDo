"use client";

import type { EmailOtpType } from "@supabase/supabase-js";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthConfirmClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/profile";

  useEffect(() => {
    const supabase = createClient();
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const code = searchParams.get("code");

    async function confirm() {
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as EmailOtpType
        });

        if (error) {
          router.replace(`/login?next=${encodeURIComponent(next)}`);
          return;
        }
      } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          router.replace(`/login?next=${encodeURIComponent(next)}`);
          return;
        }
      } else if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            router.replace(`/login?next=${encodeURIComponent(next)}`);
            return;
          }
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace(next);
        router.refresh();
        return;
      }

      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }

    confirm();
  }, [next, router, searchParams]);

  return null;
}
