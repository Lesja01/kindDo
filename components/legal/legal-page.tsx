import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { KindDoLogo } from "@/components/brand/kinddo-logo";
import { Button } from "@/components/ui/button";

export function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: { title: string; body: string[] }[] }) {
  return (
    <main className="min-h-dvh px-4 py-4">
      <div className="grid grid-cols-[40px_1fr_40px] items-center">
        <Button asChild size="icon" variant="ghost" className="rounded-full">
          <Link href="/about">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex justify-center">
          <KindDoLogo size="sm" />
        </div>
        <span />
      </div>

      <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow-xl shadow-black/5">
        <div className="bg-[linear-gradient(135deg,#FF7A59_0%,#FFD2C5_52%,#4ECDC4_100%)] p-5 text-white">
          <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-white/20 backdrop-blur">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h1 className="text-3xl font-extrabold leading-tight tracking-normal">{title}</h1>
        </div>
        <p className="p-5 leading-7 text-muted-foreground">{intro}</p>
      </section>

      <div className="mt-4 space-y-3">
        {sections.map((section) => (
          <section key={section.title} className="rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
            <h2 className="text-base font-extrabold tracking-normal">{section.title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
