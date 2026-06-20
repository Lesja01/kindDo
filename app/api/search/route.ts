import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const query = (request.nextUrl.searchParams.get("q") ?? "").trim();

  if (query.length < 2) {
    return NextResponse.json({ dreams: [], stories: [], users: [] });
  }

  const pattern = `%${query}%`;
  const [dreams, stories, users] = await Promise.all([
    supabase
      .from("dreams")
      .select("id,title,description,video_url,category,created_at,media:dream_media(*),author:users!dreams_author_id_fkey(name,avatar)")
      .eq("visibility", "public")
      .or(`title.ilike.${pattern},description.ilike.${pattern},category.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(18),
    supabase
      .from("stories")
      .select("id,text,video_url,created_at,author:users!stories_author_id_fkey(name,avatar),dream:dreams(title)")
      .or(`text.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("users")
      .select("id,name,avatar,bio,location")
      .or(`name.ilike.${pattern},bio.ilike.${pattern},location.ilike.${pattern}`)
      .limit(12)
  ]);

  const error = dreams.error ?? stories.error ?? users.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    dreams: dreams.data ?? [],
    stories: stories.data ?? [],
    users: users.data ?? []
  });
}
