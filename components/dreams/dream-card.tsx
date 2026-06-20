"use client";

import Link from "next/link";
import { HeartHandshake, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VideoThumbnail } from "@/components/media/video-thumbnail";
import { FavoriteButton } from "@/components/dreams/favorite-button";
import { useI18n } from "@/lib/i18n";
import { Dream } from "@/types/database";
import { initials, timeAgo } from "@/lib/utils";

export function DreamCard({ dream, viewerId }: { dream: Dream; viewerId?: string | null }) {
  const { locale, t } = useI18n();
  const authorDetails = [dream.author?.age, dream.author?.location].filter(Boolean).join(" · ");
  const mine = Boolean(viewerId && viewerId === dream.author_id);
  const primaryMedia = dream.media?.sort((a, b) => a.position - b.position)[0]?.url ?? dream.video_url;

  return (
    <article className="mx-3 my-3 overflow-hidden rounded-3xl bg-white shadow-lg shadow-black/5">
      <div className="flex items-center gap-3 p-3 pb-2">
        <Link href={`/profile/${dream.author_id}`} className="shrink-0 rounded-full transition-transform active:scale-95" aria-label={dream.author?.name ?? t.common.dreamer}>
          <Avatar className="h-10 w-10 ring-2 ring-background">
            <AvatarImage src={dream.author?.avatar ?? undefined} alt={dream.author?.name ?? ""} />
            <AvatarFallback>{initials(dream.author?.name)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/profile/${dream.author_id}`} className="block truncate text-sm font-bold text-foreground">
            {dream.author?.name ?? t.common.dreamer}
          </Link>
          <div className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            {authorDetails ? (
              <>
                <span className="flex min-w-0 items-center">
                  <MapPin className="mr-1 h-3 w-3 shrink-0" />
                  <span className="truncate">{authorDetails}</span>
                </span>
                <span className="shrink-0">· {timeAgo(dream.created_at, locale)}</span>
              </>
            ) : (
              <span>{timeAgo(dream.created_at, locale)}</span>
            )}
          </div>
        </div>
        <Badge className="rounded-full bg-muted text-muted-foreground">
          {t.categories[dream.category as keyof typeof t.categories] ?? dream.category}
        </Badge>
      </div>

      <Link href={`/dreams/${dream.id}`} className="relative mx-3 block aspect-[4/3] overflow-hidden rounded-3xl bg-black">
        <VideoThumbnail src={primaryMedia} className="h-full w-full" />
        {(dream.media?.length ?? 0) > 1 ? (
          <span className="absolute right-3 top-3 rounded-full bg-black/45 px-2 py-1 text-xs font-bold text-white backdrop-blur">{dream.media?.length}</span>
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </Link>

      <div className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-2 text-xl font-bold tracking-normal">{dream.title}</h2>
          </div>
          <FavoriteButton dreamId={dream.id} viewerId={viewerId} />
        </div>
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{dream.description}</p>
        <Button asChild size="lg" className="h-12 w-full rounded-2xl shadow-lg shadow-primary/20">
          <Link href={`/dreams/${dream.id}`}>
            <HeartHandshake className="h-5 w-5" />
            {mine ? t.dreams.myDream : t.dreams.iWillHelp}
          </Link>
        </Button>
      </div>
    </article>
  );
}
