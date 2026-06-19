import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, taskId } = await params;
  const body = await request.json();
  const text = String(body.text ?? "").trim();
  const mediaUrl = String(body.media_url ?? "").trim();

  if (!text && !mediaUrl) return NextResponse.json({ error: "Message or media is required" }, { status: 400 });

  const { data: dream } = await supabase.from("dreams").select("author_id").eq("id", id).single();
  if (!dream || dream.author_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: chat } = await supabase.from("chats").select("id").eq("task_id", taskId).maybeSingle();
  if (!chat) return NextResponse.json({ error: "Task chat not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("messages")
    .insert({
      chat_id: chat.id,
      sender_id: null,
      kind: "system",
      text: `TASK_THANKS:${JSON.stringify({ text, media_url: mediaUrl })}`
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
