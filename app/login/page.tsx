import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { LoginCopy } from "@/components/auth/login-copy";

export default function LoginPage() {
  return (
    <section className="flex min-h-dvh flex-col justify-center px-4 py-10">
      <div className="app-surface space-y-8 rounded-3xl p-5">
        <LoginCopy />
        <Suspense>
          <AuthForm />
        </Suspense>
        <div className="flex justify-center gap-4 text-xs font-bold text-muted-foreground">
          <Link href="/privacy">Конфиденциальность</Link>
          <Link href="/terms">Правила</Link>
          <Link href="/safety">Безопасность</Link>
        </div>
      </div>
    </section>
  );
}
