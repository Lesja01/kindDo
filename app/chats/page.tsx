import Link from "next/link";
import { MessageCircle, Search } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChatsTitle, DreamChatFallback, EmptyChats, LastMessageSnippet, UnreadLabel } from "@/components/chats/chats-copy";
import { initials, timeAgo } from "@/lib/utils";

export default async function ChatsPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: chats } = await supabase
    .from("chats")
    .select("*, dream:dreams(*), task:dream_tasks(*), userOne:users!chats_user_1_fkey(*), userTwo:users!chats_user_2_fkey(*)")
    .or(`user_1.eq.${user.id},user_2.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const chatsWithUnread = await Promise.all(
    (chats ?? []).map(async (chat) => {
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

  return (
    <section className="min-h-dvh px-4 py-4">
      <div className="grid grid-cols-[40px_1fr_40px] items-center">
        <span />
        <ChatsTitle />
        <Button size="icon" variant="ghost" className="rounded-full">
          <Search className="h-5 w-5" />
        </Button>
      </div>
      <div className="mt-5 space-y-2">
        {chatsWithUnread.map((chat) => (
          <Link key={chat.id} href={`/chats/${chat.id}`} className="block">
            <article className="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-sm shadow-black/5 transition-transform active:scale-[0.99]">
              <div className="relative">
                <Avatar className="h-14 w-14 ring-2 ring-background">
                  <AvatarImage src={chat.otherUser?.avatar ?? undefined} alt={chat.otherUser?.name ?? ""} />
                  <AvatarFallback>{initials(chat.otherUser?.name)}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-success" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{chat.otherUser?.name ?? <DreamChatFallback />}</p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      <LastMessageSnippet text={chat.lastMessage?.text} kind={chat.lastMessage?.kind} />
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">{timeAgo(chat.lastMessage?.created_at ?? chat.created_at)}</p>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </span>
                  <p className="truncate text-xs font-bold text-primary/85">{chat.task?.text ?? chat.dream?.title ?? <DreamChatFallback />}</p>
                </div>
              </div>
              {chat.unreadCount > 0 ? (
                <span className="grid h-7 min-w-7 shrink-0 place-items-center rounded-full bg-primary px-2 text-xs font-extrabold text-primary-foreground">
                  {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                  <span className="sr-only">
                    <UnreadLabel />
                  </span>
                </span>
              ) : null}
            </article>
          </Link>
        ))}
        {!chatsWithUnread.length ? <EmptyChats /> : null}
      </div>
    </section>
  );
}
