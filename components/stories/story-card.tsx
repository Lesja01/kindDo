"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { VideoThumbnail } from "@/components/media/video-thumbnail";
import { useI18n } from "@/lib/i18n";
import { Story } from "@/types/database";
import { initials, timeAgo } from "@/lib/utils";

export function StoryCard({ story }: { story: Story }) {
  const { locale, t } = useI18n();

  return (
    <article className="mx-3 my-4 overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_45px_rgba(31,41,55,0.12)] ring-1 ring-white/80">
      <div className="relative aspect-[3/4] overflow-hidden bg-black">
        <VideoThumbnail src={story.video_url} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/18 to-black/28" />

        <div className="absolute inset-x-0 top-0 flex items-center gap-3 p-4 text-white">
          <Avatar className="h-10 w-10 ring-2 ring-white/45">
            <AvatarImage src={story.author?.avatar ?? undefined} alt={story.author?.name ?? ""} />
            <AvatarFallback>{initials(story.author?.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-white">{story.author?.name ?? t.common.dreamer}</p>
            <p className="truncate text-xs font-medium text-white/72">
              {t.common.with} {story.helper?.name ?? t.common.helper} · {timeAgo(story.created_at, locale)}
            </p>
          </div>
          <Badge className="h-7 rounded-full border border-white/20 bg-success/85 px-2.5 text-[11px] font-bold text-success-foreground backdrop-blur-xl">{t.stories.fulfilledBadge}</Badge>
        </div>

        <div className="absolute inset-x-0 bottom-0 space-y-3 p-4 text-white">
          <span className="inline-flex rounded-full bg-white/18 px-3 py-1 text-xs font-bold text-white backdrop-blur-xl">
            {t.stories.thanksTo} {story.helper?.name ?? t.common.helper}
          </span>
          <div className="space-y-2">
            <Link href={`/stories/${story.id}`} className="block">
              <h2 className="line-clamp-2 text-[1.72rem] font-black leading-[1.03] tracking-normal text-white drop-shadow-sm">{story.dream?.title ?? t.stories.dreamCameTrue}</h2>
            </Link>
            {story.text ? <p className="line-clamp-2 text-[13px] font-semibold leading-5 text-white/78">{story.text}</p> : null}
          </div>
          <Button asChild size="lg" className="h-12 w-full rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/35">
            <Link href={`/stories/${story.id}`}>
              <Sparkles className="h-5 w-5" />
              {t.stories.watch}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
