"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { Dream, DreamStatus } from "@/types/database";
import { timeAgo } from "@/lib/utils";

type DreamListItem = Pick<Dream, "id" | "title" | "category" | "status" | "created_at">;

export function ProfileDreamSections({
  createdDreams,
  helpedDreams
}: {
  createdDreams: DreamListItem[];
  helpedDreams: DreamListItem[];
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <DreamSection title={t.profile.myDreams} empty={t.profile.noMyDreams} dreams={createdDreams} />
      <DreamSection title={t.profile.helping} empty={t.profile.noHelping} dreams={helpedDreams} />
    </div>
  );
}

function DreamSection({ title, empty, dreams }: { title: string; empty: string; dreams: DreamListItem[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold tracking-normal">{title}</h2>
      {dreams.length ? (
        <div className="space-y-2">
          {dreams.map((dream) => (
            <DreamRow key={dream.id} dream={dream} />
          ))}
        </div>
      ) : (
        <Card className="app-surface rounded-2xl p-4 text-sm text-muted-foreground">{empty}</Card>
      )}
    </section>
  );
}

function DreamRow({ dream }: { dream: DreamListItem }) {
  const { locale, t } = useI18n();

  return (
    <Link href={`/dreams/${dream.id}`}>
      <Card className="app-surface flex items-center justify-between gap-3 rounded-2xl p-4">
        <div className="min-w-0">
          <p className="truncate font-semibold">{dream.title}</p>
          <p className="text-sm text-muted-foreground">
            {t.categories[dream.category as keyof typeof t.categories] ?? dream.category} · {timeAgo(dream.created_at, locale)}
          </p>
        </div>
        <Badge className="rounded-full bg-primary/10 text-primary">{t.statuses[dream.status as DreamStatus]}</Badge>
      </Card>
    </Link>
  );
}
