import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { data: chat } = await supabase.from("chats").select("id,user_1,user_2").eq("id", id).single();

  if (!chat || (chat.user_1 !== user.id && chat.user_2 !== user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("chat_reads")
    .upsert({ chat_id: id, user_id: user.id, last_read_at: new Date().toISOString() }, { onConflict: "chat_id,user_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
