import { createClient } from "@/lib/supabase/server";
import { ScreenHeader } from "@/components/layout/screen-header";
import { StoryCard } from "@/components/stories/story-card";
import { EmptyStories, StoriesTitle } from "@/components/stories/stories-copy";
import { StoryTabsStrip } from "@/components/stories/story-tabs-strip";

export default async function StoriesPage() {
  const supabase = await createClient();
  const { data: stories } = await supabase
    .from("stories")
    .select("*, author:users!stories_author_id_fkey(*), helper:users!stories_helper_id_fkey(*), dream:dreams(*)")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <section className="min-h-dvh">
      <ScreenHeader title={<StoriesTitle />} />
      <StoryTabsStrip />
      {stories?.map((story) => <StoryCard key={story.id} story={story} />)}
      {!stories?.length ? <EmptyStories /> : null}
    </section>
  );
}
