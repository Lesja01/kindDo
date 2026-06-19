import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, HeartHandshake, PlayCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MediaViewer } from "@/components/media/media-viewer";
import { ReportButton } from "@/components/reports/report-button";
import { DreamerFallback } from "@/components/dreams/dream-detail-copy";
import { StoryDreamTitleFallback, StoryHelperLine, ViewOriginalDreamLabel } from "@/components/stories/story-detail-copy";
import { isImageUrl } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";
import { initials, timeAgo } from "@/lib/utils";

export default async function StoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: story } = await supabase
    .from("stories")
    .select("*, author:users!stories_author_id_fkey(*), helper:users!stories_helper_id_fkey(*), dream:dreams(*)")
    .eq("id", id)
    .single();

  if (!story) notFound();
  const isImage = isImageUrl(story.video_url);

  return (
    <article className="min-h-dvh">
      <section className="relative min-h-[68dvh] overflow-hidden bg-black text-white">
        <MediaViewer className="absolute inset-0 h-full w-full object-cover" src={story.video_url} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/45" />

        <div className="absolute inset-x-0 top-0 z-10 grid grid-cols-[40px_1fr_40px] items-center p-4">
          <Button asChild size="icon" variant="ghost" className="rounded-full bg-black/25 text-white backdrop-blur hover:bg-black/35 hover:text-white">
            <Link href="/stories">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <p className="text-center text-sm font-bold">{story.dream?.category ?? ""}</p>
          <ReportButton targetType="story" targetId={story.id} light />
        </div>

        {!isImage ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md">
              <PlayCircle className="h-9 w-9 fill-white/20" />
            </span>
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 space-y-4 p-5 pb-8">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 ring-2 ring-white/30">
              <AvatarImage src={story.author?.avatar ?? undefined} alt={story.author?.name ?? ""} />
              <AvatarFallback>{initials(story.author?.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-semibold">{story.author?.name ?? <DreamerFallback />}</p>
              <p className="text-sm text-white/65">
                <StoryHelperLine helperName={story.helper?.name} createdAt={timeAgo(story.created_at)} />
              </p>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-normal">{story.dream?.title ?? <StoryDreamTitleFallback />}</h1>
        </div>
      </section>

      <div className="-mt-6 relative z-10 space-y-4 rounded-t-[2rem] bg-background px-4 py-5">
        <div className="rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 ring-2 ring-background">
              <AvatarImage src={story.author?.avatar ?? undefined} alt={story.author?.name ?? ""} />
              <AvatarFallback>{initials(story.author?.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{story.author?.name ?? <DreamerFallback />}</p>
              <p className="truncate text-sm text-muted-foreground">
                <StoryHelperLine helperName={story.helper?.name} createdAt={timeAgo(story.created_at)} />
              </p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-success/10 text-success">
              <HeartHandshake className="h-5 w-5" />
            </span>
          </div>
          {story.text ? <p className="mt-4 leading-7 text-muted-foreground">{story.text}</p> : null}
        </div>

        <Button asChild className="h-12 w-full rounded-2xl bg-white shadow-lg shadow-black/5" variant="outline">
          <Link href={`/dreams/${story.dream_id}`}>
            <ViewOriginalDreamLabel />
          </Link>
        </Button>
      </div>
    </article>
  );
}
