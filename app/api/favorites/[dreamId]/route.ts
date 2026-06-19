import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ dreamId: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ favorited: false });

  const { dreamId } = await params;
  const { data } = await supabase
    .from("favorites")
    .select("dream_id")
    .eq("user_id", user.id)
    .eq("dream_id", dreamId)
    .maybeSingle();

  return NextResponse.json({ favorited: Boolean(data) });
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ dreamId: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dreamId } = await params;
  const { error } = await supabase.from("favorites").upsert({ user_id: user.id, dream_id: dreamId }, { onConflict: "user_id,dream_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ favorited: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ dreamId: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dreamId } = await params;
  const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("dream_id", dreamId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ favorited: false });
}
