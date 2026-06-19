"use client";

import Link from "next/link";
import { HeartHandshake, MapPin, PlayCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VideoThumbnail } from "@/components/media/video-thumbnail";
import { FavoriteButton } from "@/components/dreams/favorite-button";
import { useI18n } from "@/lib/i18n";
import { isImageUrl } from "@/lib/media";
import { Dream } from "@/types/database";
import { initials, timeAgo } from "@/lib/utils";

export function DreamCard({ dream, viewerId }: { dream: Dream; viewerId?: string | null }) {
  const { locale, t } = useI18n();
  const authorDetails = [dream.author?.age, dream.author?.location].filter(Boolean).join(" · ");
  const mine = Boolean(viewerId && viewerId === dream.author_id);
  const isImage = isImageUrl(dream.video_url);

  return (
    <article className="mx-3 my-3 overflow-hidden rounded-3xl bg-white shadow-lg shadow-black/5">
      <div className="flex items-center gap-3 p-3 pb-2">
        <Avatar className="h-10 w-10 ring-2 ring-background">
          <AvatarImage src={dream.author?.avatar ?? undefined} alt={dream.author?.name ?? ""} />
          <AvatarFallback>{initials(dream.author?.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">{dream.author?.name ?? t.common.dreamer}</p>
          <p className="truncate text-xs text-muted-foreground">
            {authorDetails ? (
              <>
                <MapPin className="mr-1 inline h-3 w-3 align-[-2px]" />
                {authorDetails} · {timeAgo(dream.created_at, locale)}
              </>
            ) : (
              timeAgo(dream.created_at, locale)
            )}
          </p>
        </div>
        <Badge className="rounded-full bg-muted text-muted-foreground">
          {t.categories[dream.category as keyof typeof t.categories] ?? dream.category}
        </Badge>
      </div>

      <Link href={`/dreams/${dream.id}`} className="relative mx-3 block aspect-[4/3] overflow-hidden rounded-3xl bg-black">
        <VideoThumbnail src={dream.video_url} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {!isImage ? (
          <div className="absolute inset-0 grid place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md">
              <PlayCircle className="h-9 w-9 fill-white/20" />
            </span>
          </div>
        ) : null}
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
