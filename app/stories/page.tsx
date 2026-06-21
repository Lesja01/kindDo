import { createClient } from "@/lib/supabase/server";
import { ScreenHeader } from "@/components/layout/screen-header";
import { StoryCard } from "@/components/stories/story-card";
import { EmptyStories, StoriesTitle } from "@/components/stories/stories-copy";
import { StoryTabsStrip } from "@/components/stories/story-tabs-strip";
import { getUser } from "@/lib/auth";

export default async function StoriesPage({ searchParams }: { searchParams: Promise<{ mentioned?: string }> }) {
  const params = await searchParams;
  const mentioned = params.mentioned === "me";
  const supabase = await createClient();
  const user = mentioned ? await getUser() : null;
  let storyIds: string[] | null = null;

  if (mentioned) {
    if (!user) {
      storyIds = [];
    } else {
      const { data: mentions } = await supabase.from("story_mentions").select("story_id").eq("user_id", user.id);
      storyIds = (mentions ?? []).map((mention) => mention.story_id);
    }
  }

  let query = supabase
    .from("stories")
    .select("*, author:users!stories_author_id_fkey(*), helper:users!stories_helper_id_fkey(*), dream:dreams(*), mentions:story_mentions(*)")
    .order("created_at", { ascending: false })
    .limit(20);

  if (mentioned && user) {
    const mentionedFilter = storyIds?.length ? `id.in.(${storyIds.join(",")}),helper_id.eq.${user.id}` : `helper_id.eq.${user.id}`;
    query = query.or(mentionedFilter);
  } else if (storyIds) {
    query = query.in("id", ["00000000-0000-0000-0000-000000000000"]);
  }

  const { data: stories } = await query;

  return (
    <section className="min-h-dvh">
      <ScreenHeader title={<StoriesTitle />} />
      <StoryTabsStrip mentioned={mentioned} />
      {stories?.map((story) => <StoryCard key={story.id} story={story} />)}
      {!stories?.length ? <EmptyStories /> : null}
    </section>
  );
}
