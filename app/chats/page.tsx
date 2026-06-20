import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ChatsList } from "@/components/chats/chats-list";

export default async function ChatsPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: chats } = await supabase
    .from("chats")
    .select("*, dream:dreams(*), task:dream_tasks(*), userOne:users!chats_user_1_fkey(*), userTwo:users!chats_user_2_fkey(*), hidden:chat_hidden_users!left(user_id)")
    .or(`user_1.eq.${user.id},user_2.eq.${user.id}`)
    .eq("hidden.user_id", user.id)
    .order("created_at", { ascending: false });

  const chatsWithUnread = await Promise.all(
    (chats ?? []).filter((chat) => !chat.hidden?.length).map(async (chat) => {
      const otherUser = chat.user_1 === user.id ? chat.userTwo : chat.userOne;
      const { data: read } = await supabase
        .from("chat_reads")
        .select("last_read_at")
        .eq("chat_id", chat.id)
        .eq("user_id", user.id)
        .maybeSingle();

      const { data: lastMessage } = await supabase
        .from("messages")
        .select("id,text,kind,created_at,sender_id")
        .eq("chat_id", chat.id)
        .order("created_at", { ascending: false })
        .limit(1)
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
      return { ...chat, otherUser, lastMessage, unreadCount: count ?? 0 };
    })
  );

  chatsWithUnread.sort((a, b) => {
    const aTime = new Date(a.lastMessage?.created_at ?? a.created_at).getTime();
    const bTime = new Date(b.lastMessage?.created_at ?? b.created_at).getTime();
    return bTime - aTime;
  });

  return <ChatsList chats={chatsWithUnread} />;
}
