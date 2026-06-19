import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, MessageCircle, PlayCircle, UserRound } from "lucide-react";
import { HelpButton } from "@/components/dreams/help-button";
import { DreamDetailTasks, TaskCandidate } from "@/components/dreams/dream-detail-tasks";
import { MediaViewer } from "@/components/media/media-viewer";
import {
  CategoryLabel,
  DreamAboutLabel,
  DreamHelperLabel,
  DreamNoHelperLabel,
  DreamPublishedLabel,
  DreamStatusHeadingLabel,
  DreamerFallback,
  OpenChatLabel,
  SignInToHelpLabel,
  StatusLabel
} from "@/components/dreams/dream-detail-copy";
import { CreateStoryForm } from "@/components/stories/create-story-form";
import { ReportButton } from "@/components/reports/report-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth";
import { isImageUrl } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";
import { initials, timeAgo } from "@/lib/utils";
import { Profile } from "@/types/database";

export default async function DreamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getUser();

  const { data: dream } = await supabase
    .from("dreams")
    .select("*, author:users!dreams_author_id_fkey(*), helper:users!dreams_helper_id_fkey(*)")
    .eq("id", id)
    .single();

  if (!dream) notFound();

  const [{ data: chats }, { data: tasks }] = await Promise.all([
    supabase.from("chats").select("id,task_id,user_2,candidate:users!chats_user_2_fkey(*)").eq("dream_id", id).limit(50),
    supabase.from("dream_tasks").select("*, helper:users!dream_tasks_helper_id_fkey(*)").eq("dream_id", id).order("created_at", { ascending: true })
  ]);
  const chat = (chats ?? []).find((item) => !item.task_id) ?? (chats ?? [])[0] ?? null;
  const isAuthor = user?.id === dream.author_id;
  const isHelper = user?.id === dream.helper_id;
  const hasTasks = Boolean(tasks?.length);
  const isImage = isImageUrl(dream.video_url);
  const candidates: TaskCandidate[] = (chats ?? []).map((item) => {
    const candidate = Array.isArray(item.candidate) ? item.candidate[0] : item.candidate;
    return { id: item.id, task_id: item.task_id, candidate: (candidate as Profile | null) ?? null };
  });

  return (
    <article className="min-h-dvh px-4 py-4">
      <div className="grid grid-cols-[40px_1fr_40px] items-center">
        <Button asChild size="icon" variant="ghost" className="rounded-full">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-center text-base font-bold tracking-normal">
          <DreamAboutLabel />
        </h1>
        <ReportButton targetType="dream" targetId={dream.id} />
      </div>

      <div className="mt-4 space-y-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-black shadow-xl shadow-black/10">
          <MediaViewer className="h-full w-full object-cover" src={dream.video_url} />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
          {!isImage ? (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md">
                <PlayCircle className="h-9 w-9 fill-white/20" />
              </span>
            </div>
          ) : null}
          <Badge className="absolute bottom-3 left-3 rounded-full border-0 bg-white/90 text-primary">
            <CategoryLabel category={dream.category} />
          </Badge>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${dream.author_id}`} className="shrink-0 rounded-full transition-transform active:scale-95" aria-label={dream.author?.name ?? "Profile"}>
              <Avatar className="h-11 w-11 ring-2 ring-background">
                <AvatarImage src={dream.author?.avatar ?? undefined} alt={dream.author?.name ?? ""} />
                <AvatarFallback>{initials(dream.author?.name)}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{dream.author?.name ?? <DreamerFallback />}</p>
              <p className="truncate text-sm text-muted-foreground">
                {dream.author?.location ? (
                  <>
                    <MapPin className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />
                    {dream.author.location}
                    {dream.author.age ? ` · ${dream.author.age}` : ""}
                  </>
                ) : (
                  timeAgo(dream.created_at)
                )}
              </p>
            </div>
            <Badge className="rounded-full border-0 bg-primary/10 text-primary">
              <StatusLabel status={dream.status} />
            </Badge>
          </div>
          <h2 className="mt-4 text-2xl font-extrabold leading-tight tracking-normal">{dream.title}</h2>
          <DreamMetaGrid helperName={dream.helper?.name ?? null} createdAt={dream.created_at} status={dream.status} />
        </div>

        <section className="rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
          <h3 className="text-sm font-bold uppercase text-muted-foreground">
            <DreamAboutLabel />
          </h3>
          <p className="mt-3 leading-7 text-muted-foreground">{dream.description}</p>
          {hasTasks || isAuthor ? (
            <DreamDetailTasks dreamId={dream.id} initialTasks={tasks ?? []} candidates={candidates} isAuthor={isAuthor} userId={user?.id ?? null} />
          ) : null}
          {!hasTasks && user && dream.status === "OPEN" && !isAuthor ? (
            <div className="mt-4">
              <HelpButton dreamId={dream.id} />
            </div>
          ) : null}
        </section>

        {dream.helper ? (
          <section className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
            <Link href={`/profile/${dream.helper.id}`} className="shrink-0 rounded-full transition-transform active:scale-95" aria-label={dream.helper.name}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={dream.helper.avatar ?? undefined} alt={dream.helper.name} />
                <AvatarFallback>{initials(dream.helper.name)}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase text-muted-foreground">
                <DreamHelperLabel />
              </p>
              <p className="truncate font-bold">{dream.helper.name}</p>
            </div>
            <UserRound className="h-5 w-5 text-primary" />
          </section>
        ) : null}

        <div className="sticky bottom-24 z-10 space-y-2 pt-1">
          {!user && dream.status === "OPEN" ? (
            <Button asChild size="lg" className="h-12 w-full rounded-2xl shadow-xl shadow-primary/20">
              <Link href={`/login?next=/dreams/${dream.id}`}>
                <SignInToHelpLabel />
              </Link>
            </Button>
          ) : null}
          {chat && (isAuthor || isHelper) ? (
            <Button asChild size="lg" variant="outline" className="h-12 w-full rounded-2xl bg-white shadow-lg shadow-black/5">
              <Link href={`/chats/${chat.id}`}>
                <MessageCircle className="h-5 w-5" />
                <OpenChatLabel />
              </Link>
            </Button>
          ) : null}
        </div>
        {isAuthor && dream.status === "TAKEN" ? <CreateStoryForm dreamId={dream.id} dreamTitle={dream.title} helperName={dream.helper?.name ?? null} /> : null}
      </div>
    </article>
  );
}

function DreamMetaGrid({ helperName, createdAt, status }: { helperName: string | null; createdAt: string; status: "OPEN" | "TAKEN" | "COMPLETED" }) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-background p-2 text-center">
      <div className="rounded-xl bg-white px-2 py-3">
        <CalendarDays className="mx-auto mb-1 h-4 w-4 text-primary" />
        <p className="text-[11px] text-muted-foreground">
          <DreamPublishedLabel />
        </p>
        <p className="mt-1 text-sm font-bold">{timeAgo(createdAt)}</p>
      </div>
      <div className="rounded-xl bg-white px-2 py-3">
        <UserRound className="mx-auto mb-1 h-4 w-4 text-secondary" />
        <p className="text-[11px] text-muted-foreground">
          <DreamHelperLabel />
        </p>
        <p className="mt-1 truncate text-sm font-bold">{helperName ?? <DreamNoHelperLabel />}</p>
      </div>
      <div className="rounded-xl bg-white px-2 py-3">
        <PlayCircle className="mx-auto mb-1 h-4 w-4 text-success" />
        <p className="text-[11px] text-muted-foreground">
          <DreamStatusHeadingLabel />
        </p>
        <p className="mt-1 text-sm font-bold text-primary">
          <StatusLabel status={status} />
        </p>
      </div>
    </div>
  );
}
