import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const text = String(body.text ?? "").trim();

  if (!text) return NextResponse.json({ error: "Task text is required" }, { status: 400 });

  const { data: dream } = await supabase.from("dreams").select("author_id").eq("id", id).single();
  if (!dream || dream.author_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabase
    .from("dream_tasks")
    .insert({ dream_id: id, author_id: user.id, text })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
