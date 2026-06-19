import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AuthConfirmClient } from "@/app/auth/confirm/confirm-client";

export default function AuthConfirmPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <Suspense>
        <AuthConfirmClient />
      </Suspense>
      <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
        <p className="mt-3 text-sm font-semibold text-muted-foreground">Подтверждаем вход...</p>
      </div>
    </main>
  );
}
