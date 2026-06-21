import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ count: 0 });

  const { data: read } = await supabase.from("notification_reads").select("last_read_at").eq("user_id", user.id).maybeSingle();
  const since = read?.last_read_at ?? new Date(0).toISOString();

  const [{ count: sharesCount }, { count: storiesCount }, { count: mentionsCount }] = await Promise.all([
    supabase.from("dream_shares").select("id", { count: "exact", head: true }).eq("recipient_id", user.id).gt("created_at", since),
    supabase.from("stories").select("id", { count: "exact", head: true }).eq("helper_id", user.id).gt("created_at", since),
    supabase.from("story_mentions").select("id", { count: "exact", head: true }).eq("user_id", user.id).gt("created_at", since)
  ]);

  return NextResponse.json({ count: (sharesCount ?? 0) + (storiesCount ?? 0) + (mentionsCount ?? 0) });
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ ok: true });

  const { error } = await supabase
    .from("notification_reads")
    .upsert({ user_id: user.id, last_read_at: new Date().toISOString() }, { onConflict: "user_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
