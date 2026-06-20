import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; messageId: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, messageId } = await params;
  const body = await request.json();
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!text) return NextResponse.json({ error: "Message is empty" }, { status: 400 });

  const { data: chat } = await supabase.from("chats").select("id,user_1,user_2").eq("id", id).single();
  if (!chat || (chat.user_1 !== user.id && chat.user_2 !== user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("messages")
    .update({ text, edited_at: new Date().toISOString() })
    .eq("id", messageId)
    .eq("chat_id", id)
    .eq("sender_id", user.id)
    .eq("kind", "user")
    .select("*, sender:users(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
