"use client";

import Link from "next/link";
import { PlayCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { VideoThumbnail } from "@/components/media/video-thumbnail";
import { useI18n } from "@/lib/i18n";
import { isImageUrl } from "@/lib/media";
import { Story } from "@/types/database";
import { initials, timeAgo } from "@/lib/utils";

export function StoryCard({ story }: { story: Story }) {
  const { t } = useI18n();
  const isImage = isImageUrl(story.video_url);

  return (
    <article className="mx-3 my-3 overflow-hidden rounded-3xl bg-white shadow-lg shadow-black/5">
      <div className="flex items-center gap-3 p-3 pb-2">
        <Avatar className="h-10 w-10 ring-2 ring-background">
          <AvatarImage src={story.author?.avatar ?? undefined} alt={story.author?.name ?? ""} />
          <AvatarFallback>{initials(story.author?.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">{story.author?.name ?? t.common.dreamer}</p>
          <p className="truncate text-xs text-muted-foreground">
            {t.common.with} {story.helper?.name ?? t.common.helper} · {timeAgo(story.created_at)}
          </p>
        </div>
        <Badge className="rounded-full border-0 bg-success/10 text-success">{t.stories.fulfilledBadge}</Badge>
      </div>

      <Link href={`/stories/${story.id}`} className="relative mx-3 block aspect-[4/3] overflow-hidden rounded-3xl bg-black">
        <VideoThumbnail src={story.video_url} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {!isImage ? (
          <div className="absolute inset-0 grid place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md">
              <PlayCircle className="h-9 w-9 fill-white/20" />
            </span>
          </div>
        ) : null}
        <span className="absolute bottom-3 left-3 rounded-full bg-success px-3 py-1 text-xs font-bold text-success-foreground">
          {t.stories.thanksTo} {story.helper?.name ?? t.common.helper}
        </span>
      </Link>
      <div className="space-y-3 p-4">
        <div className="space-y-2">
          <h2 className="line-clamp-2 text-xl font-bold tracking-normal">{story.dream?.title ?? t.stories.dreamCameTrue}</h2>
          {story.text ? <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{story.text}</p> : null}
        </div>
        <Button asChild size="lg" className="h-12 w-full rounded-2xl shadow-lg shadow-primary/20">
          <Link href={`/stories/${story.id}`}>
            <Sparkles className="h-5 w-5" />
            {t.stories.watch}
          </Link>
        </Button>
      </div>
    </article>
  );
}
