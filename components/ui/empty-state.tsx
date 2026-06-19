import Link from "next/link";
import { Send, Sparkles } from "lucide-react";
import { KindDoMark } from "@/components/brand/kinddo-logo";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}) {
  return (
    <div className="flex min-h-[44dvh] flex-col items-center justify-center px-8 py-10 text-center">
      <div className="relative mb-7 h-28 w-32">
        <div className="absolute bottom-2 left-0 h-7 w-14 rounded-full bg-primary/15" />
        <div className="absolute bottom-7 right-0 h-5 w-10 rounded-full bg-secondary/20" />
        <div className="absolute left-1/2 top-1 grid h-20 w-20 -translate-x-1/2 place-items-center rounded-[2rem] bg-white shadow-xl shadow-black/5">
          <Send className="h-10 w-10 rotate-[-18deg] fill-primary/15 text-primary" />
        </div>
        <Sparkles className="absolute right-8 top-0 h-4 w-4 text-primary" />
        <KindDoMark className="absolute -right-1 bottom-0 h-8 w-8 shadow-sm" />
      </div>
      <h2 className="text-xl font-extrabold tracking-normal">{title}</h2>
      <p className="mt-2 max-w-64 text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? (
        <Button asChild className="mt-6 h-11 rounded-2xl px-6 shadow-lg shadow-primary/20">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}
