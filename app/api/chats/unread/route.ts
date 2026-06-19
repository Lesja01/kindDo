import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ count: 0 });

  const { data: chats, error } = await supabase
    .from("chats")
    .select("id")
    .or(`user_1.eq.${user.id},user_2.eq.${user.id}`);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const counts = await Promise.all(
    (chats ?? []).map(async (chat) => {
      const { data: read } = await supabase
        .from("chat_reads")
        .select("last_read_at")
        .eq("chat_id", chat.id)
        .eq("user_id", user.id)
        .maybeSingle();

      let query = supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("chat_id", chat.id)
        .or(`sender_id.is.null,sender_id.neq.${user.id}`);

      if (read?.last_read_at) {
        query = query.gt("created_at", read.last_read_at);
      }

      const { count } = await query;
      return count ?? 0;
    })
  );

  return NextResponse.json({ count: counts.reduce((total, count) => total + count, 0) });
}
