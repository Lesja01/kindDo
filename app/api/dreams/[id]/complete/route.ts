import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id } = await params;
  const { data, error } = await supabase.rpc("complete_dream_with_story", {
    target_dream_id: id,
    gratitude_video_url: body.video_url,
    gratitude_text: body.text
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: chat } = data?.helper_id
    ? await supabase.from("chats").select("id").eq("dream_id", id).eq("user_2", data.helper_id).limit(1).maybeSingle()
    : { data: null };

  if (chat && data?.id) {
    await supabase.from("messages").insert({
      chat_id: chat.id,
      sender_id: null,
      kind: "system",
      text: `GRATITUDE_STORY:${data.id}`
    });

    await supabase
      .from("chat_reads")
      .upsert({ chat_id: chat.id, user_id: user.id, last_read_at: new Date().toISOString() }, { onConflict: "chat_id,user_id" });
  }

  return NextResponse.json(data);
}
