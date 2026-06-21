import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DreamCard } from "@/components/dreams/dream-card";
import { StoryCard } from "@/components/stories/story-card";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Dream, Story } from "@/types/database";

type ActivityType = "dreams" | "helped" | "stories";

export default async function ProfileActivityPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { id } = await params;
  const { type: rawType } = await searchParams;
  const type: ActivityType = rawType === "helped" || rawType === "stories" ? rawType : "dreams";
  const supabase = await createClient();
  const viewer = await getUser();
  const { data: profile } = await supabase.from("users").select("id,name").eq("id", id).single();

  if (!profile) notFound();

  const title =
    type === "dreams"
      ? `${profile.name}: мечты`
      : type === "helped"
        ? `${profile.name}: помощь`
        : `${profile.name}: истории`;

  const dreamsQuery =
    type === "dreams"
      ? supabase
          .from("dreams")
          .select("*, author:users!dreams_author_id_fkey(*), media:dream_media(*), responders:chats(id,candidate:users!chats_user_2_fkey(id,name,avatar))")
          .eq("author_id", id)
          .order("created_at", { ascending: false })
          .limit(30)
      : type === "helped"
        ? supabase
            .from("dreams")
            .select("*, author:users!dreams_author_id_fkey(*), media:dream_media(*), responders:chats(id,candidate:users!chats_user_2_fkey(id,name,avatar))")
            .eq("helper_id", id)
            .order("created_at", { ascending: false })
            .limit(30)
        : null;

  const { data: dreams } = dreamsQuery ? await dreamsQuery : { data: [] as Dream[] };
  const { data: stories } =
    type === "stories"
      ? await supabase
          .from("stories")
          .select("*, author:users!stories_author_id_fkey(*), helper:users!stories_helper_id_fkey(*), dream:dreams(*)")
          .eq("author_id", id)
          .order("created_at", { ascending: false })
          .limit(30)
      : { data: [] as Story[] };

  return (
    <section className="min-h-dvh">
      <div className="sticky top-0 z-30 grid grid-cols-[40px_1fr_40px] items-center bg-background/85 px-4 py-3 backdrop-blur-xl">
        <Button asChild size="icon" variant="ghost" className="rounded-full">
          <Link href={`/profile/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="truncate text-center text-base font-black tracking-normal">{title}</h1>
        <span />
      </div>

      {type === "stories"
        ? stories?.map((story) => <StoryCard key={story.id} story={story} />)
        : dreams?.map((dream) => <DreamCard key={dream.id} dream={dream} viewerId={viewer?.id ?? null} />)}

      {type === "stories" && !stories?.length ? <EmptyActivity /> : null}
      {type !== "stories" && !dreams?.length ? <EmptyActivity /> : null}
    </section>
  );
}

function EmptyActivity() {
  return <p className="px-6 py-12 text-center text-sm font-medium text-muted-foreground">Здесь пока пусто.</p>;
}
