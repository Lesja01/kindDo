import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, taskId } = await params;
  const body = await request.json();
  const { data: dream } = await supabase.from("dreams").select("author_id").eq("id", id).single();
  if (!dream || dream.author_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: currentTask } = await supabase.from("dream_tasks").select("helper_id").eq("id", taskId).eq("dream_id", id).single();
  const completed = Boolean(body.completed);

  const { data, error } = await supabase
    .from("dream_tasks")
    .update({ completed, status: completed ? "COMPLETED" : currentTask?.helper_id ? "TAKEN" : "OPEN" })
    .eq("id", taskId)
    .eq("dream_id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, taskId } = await params;
  const { data: dream } = await supabase.from("dreams").select("author_id").eq("id", id).single();
  if (!dream || dream.author_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await supabase.from("dream_tasks").delete().eq("id", taskId).eq("dream_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
