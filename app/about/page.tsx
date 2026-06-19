import Link from "next/link";
import { ArrowLeft, HeartHandshake, Sparkles } from "lucide-react";
import { KindDoLogo } from "@/components/brand/kinddo-logo";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <main className="min-h-dvh px-4 py-4">
      <div className="grid grid-cols-[40px_1fr_40px] items-center">
        <Button asChild size="icon" variant="ghost" className="rounded-full">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex justify-center">
          <KindDoLogo size="sm" />
        </div>
        <span />
      </div>

      <section className="mt-8 overflow-hidden rounded-3xl bg-white shadow-xl shadow-black/5">
        <div className="relative bg-[linear-gradient(135deg,#FF7A59_0%,#FFD2C5_48%,#4ECDC4_100%)] px-5 py-8 text-white">
          <div className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-2xl bg-white/20 backdrop-blur">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <p className="max-w-[13rem] text-3xl font-extrabold leading-tight tracking-normal">Dreams become stories.</p>
        </div>

        <div className="space-y-6 p-5 text-[17px] font-semibold leading-8 text-foreground">
          <p>В мире много социальных сетей.</p>

          <div className="rounded-3xl bg-background p-4">
            <p>Мы создали место не для лайков.</p>
            <p className="text-primary">Мы создали место для действий.</p>
          </div>

          <div className="space-y-3 text-muted-foreground">
            <p>Здесь люди публикуют свои мечты.</p>
            <p>Другие помогают им осуществиться.</p>
          </div>

          <div className="space-y-3">
            <p>Каждая помощь становится историей.</p>
            <p>Каждая история вдохновляет кого-то еще.</p>
          </div>

          <div className="flex items-center gap-3 rounded-3xl bg-primary/10 p-4 text-primary">
            <Sparkles className="h-5 w-5 shrink-0" />
            <p>KindDo.</p>
          </div>
        </div>
      </section>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button asChild className="h-12 rounded-2xl shadow-xl shadow-primary/20">
          <Link href="/create">Создать мечту</Link>
        </Button>
        <Button asChild variant="outline" className="h-12 rounded-2xl bg-white shadow-sm shadow-black/5">
          <Link href="/">Смотреть мечты</Link>
        </Button>
      </div>

      <div className="mt-5 flex justify-center gap-4 text-xs font-bold text-muted-foreground">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/safety">Safety</Link>
      </div>
    </main>
  );
}
