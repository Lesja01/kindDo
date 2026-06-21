import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const page = Number(request.nextUrl.searchParams.get("page") ?? "0");
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "8");
  const mentioned = request.nextUrl.searchParams.get("mentioned") === "me";
  const from = page * limit;
  const to = from + limit - 1;

  let storyIds: string[] | null = null;
  let currentUserId: string | null = null;
  if (mentioned) {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json([]);
    currentUserId = user.id;

    const { data: mentions, error: mentionsError } = await supabase.from("story_mentions").select("story_id").eq("user_id", user.id);
    if (mentionsError) return NextResponse.json({ error: mentionsError.message }, { status: 500 });

    storyIds = (mentions ?? []).map((mention) => mention.story_id);
  }

  let query = supabase
    .from("stories")
    .select("*, author:users!stories_author_id_fkey(*), helper:users!stories_helper_id_fkey(*), dream:dreams(*), mentions:story_mentions(*)")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (mentioned && currentUserId) {
    const mentionedFilter = storyIds?.length ? `id.in.(${storyIds.join(",")}),helper_id.eq.${currentUserId}` : `helper_id.eq.${currentUserId}`;
    query = query.or(mentionedFilter);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
