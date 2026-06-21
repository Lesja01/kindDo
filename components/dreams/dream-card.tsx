"use client";

import Link from "next/link";
import { HeartHandshake, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VideoThumbnail } from "@/components/media/video-thumbnail";
import { FavoriteButton } from "@/components/dreams/favorite-button";
import { ShareDreamButton } from "@/components/dreams/share-dream-button";
import { useI18n } from "@/lib/i18n";
import { Dream, Profile } from "@/types/database";
import { initials, timeAgo } from "@/lib/utils";

export function DreamCard({ dream, viewerId }: { dream: Dream; viewerId?: string | null }) {
  const { locale, t } = useI18n();
  const authorDetails = [dream.author?.age, dream.author?.location].filter(Boolean).join(" · ");
  const mine = Boolean(viewerId && viewerId === dream.author_id);
  const primaryMedia = dream.media?.sort((a, b) => a.position - b.position)[0]?.url ?? dream.video_url;
  const responders = (dream.responders ?? [])
    .map((item) => (Array.isArray(item.candidate) ? item.candidate[0] : item.candidate))
    .filter((item): item is Pick<Profile, "id" | "name" | "avatar"> => Boolean(item))
    .slice(0, 3);

  return (
    <article className="mx-3 my-4 overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_45px_rgba(31,41,55,0.12)] ring-1 ring-white/80">
      <div className="relative aspect-[3/4] overflow-hidden bg-black">
        <VideoThumbnail src={primaryMedia} className="h-full w-full" />
        {(dream.media?.length ?? 0) > 1 ? (
          <span className="absolute right-4 top-4 rounded-full bg-black/40 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-xl">{dream.media?.length}</span>
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/18 to-black/28" />

        <div className="absolute inset-x-0 top-0 flex items-center gap-3 p-4 text-white">
          <Link href={`/profile/${dream.author_id}`} className="shrink-0 rounded-full transition-transform active:scale-95" aria-label={dream.author?.name ?? t.common.dreamer}>
            <Avatar className="h-10 w-10 ring-2 ring-white/45">
              <AvatarImage src={dream.author?.avatar ?? undefined} alt={dream.author?.name ?? ""} />
              <AvatarFallback>{initials(dream.author?.name)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <Link href={`/profile/${dream.author_id}`} className="block truncate text-sm font-extrabold text-white">
              {dream.author?.name ?? t.common.dreamer}
            </Link>
            <div className="flex min-w-0 items-center gap-1 text-xs font-medium text-white/72">
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
          <Badge className="h-7 rounded-full border border-white/20 bg-white/18 px-3 text-[11px] font-bold text-white backdrop-blur-xl">
            {t.categories[dream.category as keyof typeof t.categories] ?? dream.category}
          </Badge>
        </div>

        <div className="absolute right-4 top-20 z-10 flex flex-col items-center gap-3">
          <div className="rounded-full bg-white/16 text-white shadow-xl shadow-black/15 backdrop-blur-xl [&_button]:text-white [&_button]:hover:bg-white/15">
            <FavoriteButton dreamId={dream.id} viewerId={viewerId} />
          </div>
          {responders.length ? (
            <div className="flex flex-col items-center rounded-full bg-white/16 px-1.5 py-2 text-white shadow-xl shadow-black/15 backdrop-blur-xl">
              <div className="flex flex-col -space-y-2">
                {responders.map((responder) => (
                  <Avatar key={responder.id} className="h-8 w-8 border-2 border-white/75">
                    <AvatarImage src={responder.avatar ?? undefined} alt={responder.name} />
                    <AvatarFallback className="text-[10px]">{initials(responder.name)}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="mt-1 text-[10px] font-extrabold">{dream.responders?.length}</span>
            </div>
          ) : null}
          <ShareDreamButton dreamId={dream.id} title={dream.title} />
        </div>

        <div className="absolute inset-x-0 bottom-0 space-y-3 p-4 pr-20 text-white">
          <div className="space-y-2">
            <Link href={`/dreams/${dream.id}`} className="block">
              <h2 className="line-clamp-2 text-[1.72rem] font-black leading-[1.03] tracking-normal text-white drop-shadow-sm">{dream.title}</h2>
            </Link>
            <p className="line-clamp-2 text-[13px] font-semibold leading-5 text-white/78">{dream.description}</p>
          </div>
          <div>
            <Button asChild size="lg" className="h-12 rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/35">
              <Link href={`/dreams/${dream.id}`}>
                <HeartHandshake className="h-5 w-5" />
                {mine ? t.dreams.myDream : t.dreams.iWillHelp}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
