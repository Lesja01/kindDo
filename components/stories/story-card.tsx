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
    <article className="mx-3 my-3 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white shadow-[0_12px_34px_rgba(31,41,55,0.07)]">
      <div className="flex items-center gap-3 px-3 pb-2 pt-3">
        <Avatar className="h-9 w-9 ring-2 ring-background">
          <AvatarImage src={story.author?.avatar ?? undefined} alt={story.author?.name ?? ""} />
          <AvatarFallback>{initials(story.author?.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">{story.author?.name ?? t.common.dreamer}</p>
          <p className="truncate text-xs text-muted-foreground">
            {t.common.with} {story.helper?.name ?? t.common.helper} · {timeAgo(story.created_at, locale)}
          </p>
        </div>
        <Badge className="h-7 rounded-full border-0 bg-success/10 px-2.5 text-[11px] font-bold text-success">{t.stories.fulfilledBadge}</Badge>
      </div>

      <Link href={`/stories/${story.id}`} className="relative mx-3 block aspect-[4/3] overflow-hidden rounded-[1.35rem] bg-black">
        <VideoThumbnail src={story.video_url} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-full bg-success px-3 py-1 text-xs font-bold text-success-foreground">
          {t.stories.thanksTo} {story.helper?.name ?? t.common.helper}
        </span>
      </Link>
      <div className="space-y-3 px-4 pb-4 pt-3">
        <div className="space-y-2">
          <h2 className="line-clamp-2 text-lg font-extrabold leading-snug tracking-normal">{story.dream?.title ?? t.stories.dreamCameTrue}</h2>
          {story.text ? <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{story.text}</p> : null}
        </div>
        <Button asChild size="lg" className="h-11 w-full rounded-2xl shadow-lg shadow-primary/20">
          <Link href={`/stories/${story.id}`}>
            <Sparkles className="h-5 w-5" />
            {t.stories.watch}
          </Link>
        </Button>
      </div>
    </article>
  );
}
