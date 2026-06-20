"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ChatsTitle, DreamChatFallback, EmptyChats, LastMessageSnippet, UnreadLabel } from "@/components/chats/chats-copy";
import { useI18n } from "@/lib/i18n";
import { initials, timeAgo } from "@/lib/utils";
import { Profile } from "@/types/database";

type ChatListItem = {
  id: string;
  created_at: string;
  otherUser: Profile | null;
  lastMessage: { text: string | null; kind: "user" | "system"; created_at: string } | null;
  unreadCount: number;
  dream?: { title?: string | null } | null;
  task?: { text?: string | null } | null;
};

export function ChatsList({ chats }: { chats: ChatListItem[] }) {
  const { locale, t } = useI18n();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredChats = useMemo(() => {
    if (!normalizedQuery) return chats;

    return chats.filter((chat) => {
      const haystack = [chat.otherUser?.name, chat.lastMessage?.text, chat.task?.text, chat.dream?.title].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [chats, normalizedQuery]);

  return (
    <section className="min-h-dvh px-4 py-4">
      <div className="grid grid-cols-[40px_1fr_40px] items-center">
        <span />
        <ChatsTitle />
        <span />
      </div>
      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-11 rounded-2xl border-0 bg-white pl-9 shadow-sm shadow-black/5 ring-1 ring-border/60"
          value={query}
          placeholder={t.common.search}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="mt-4 space-y-2">
        {filteredChats.map((chat) => (
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
                  <p className="shrink-0 text-xs text-muted-foreground">{timeAgo(chat.lastMessage?.created_at ?? chat.created_at, locale)}</p>
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
        {!filteredChats.length ? <EmptyChats /> : null}
      </div>
    </section>
  );
}
