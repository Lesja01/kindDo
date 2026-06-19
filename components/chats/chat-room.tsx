"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, MoreHorizontal, Send } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaViewer } from "@/components/media/media-viewer";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { cn, initials, timeAgo } from "@/lib/utils";
import { Message, Profile } from "@/types/database";

export function ChatRoom({
  chatId,
  userId,
  otherUser,
  dreamTitle,
  canSelectHelper,
  helperSelected
}: {
  chatId: string;
  userId: string;
  otherUser: Profile | null;
  dreamTitle: string | null;
  canSelectHelper: boolean;
  helperSelected: boolean;
}) {
  const supabase = createClient();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [selectingHelper, setSelectingHelper] = useState(false);
  const [selectError, setSelectError] = useState("");
  const [selected, setSelected] = useState(helperSelected);
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = useQuery({
    queryKey: ["messages", chatId],
    queryFn: async () => {
      const response = await fetch(`/api/chats/${chatId}/messages`);
      if (!response.ok) throw new Error(t.chats.loadError);
      return response.json() as Promise<Message[]>;
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
        () => queryClient.invalidateQueries({ queryKey: ["messages", chatId] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, queryClient, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.data?.length]);

  useEffect(() => {
    if (!messages.data) return;

    fetch(`/api/chats/${chatId}/read`, { method: "POST" }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["chats", "unread"] });
    });
  }, [chatId, messages.data, messages.data?.length, queryClient]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText("");
    const response = await fetch(`/api/chats/${chatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: body })
    });

    if (!response.ok) {
      setText(body);
      return;
    }

    const message = (await response.json()) as Message;
    queryClient.setQueryData<Message[]>(["messages", chatId], (current = []) => {
      if (current.some((item) => item.id === message.id)) return current;
      return [...current, message];
    });
    queryClient.invalidateQueries({ queryKey: ["chats", "unread"] });
  }

  async function selectHelper() {
    setSelectingHelper(true);
    setSelectError("");
    const response = await fetch(`/api/chats/${chatId}/select-helper`, { method: "POST" });
    setSelectingHelper(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setSelectError(payload?.error ?? t.dreams.unavailable);
      return;
    }

    setSelected(true);
    queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
    queryClient.invalidateQueries({ queryKey: ["chats", "unread"] });
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="sticky top-0 z-20 grid grid-cols-[40px_1fr_40px] items-center gap-2 bg-background/95 px-4 py-3 backdrop-blur">
        <Button asChild size="icon" variant="ghost" className="rounded-full">
          <Link href="/chats">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex min-w-0 items-center justify-center gap-3">
          {otherUser ? (
            <Link href={`/profile/${otherUser.id}`} className="shrink-0 rounded-full transition-transform active:scale-95" aria-label={otherUser.name}>
              <Avatar className="h-10 w-10 ring-2 ring-white">
                <AvatarImage src={otherUser.avatar ?? undefined} alt={otherUser.name} />
                <AvatarFallback>{initials(otherUser.name)}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-10 w-10 ring-2 ring-white">
              <AvatarFallback>{initials(null)}</AvatarFallback>
            </Avatar>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold">{otherUser?.name ?? t.chats.dreamChat}</h1>
            <p className="truncate text-xs text-muted-foreground">{t.chats.online}</p>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="rounded-full">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
        <div className="flex justify-center">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">{t.chats.today}</span>
        </div>
        {dreamTitle ? <p className="mx-auto max-w-[86%] text-center text-xs text-muted-foreground">{dreamTitle}</p> : null}
        {canSelectHelper && !selected ? (
          <div className="rounded-3xl bg-white p-3 shadow-sm shadow-black/5">
            <Button type="button" className="h-11 w-full rounded-2xl" onClick={selectHelper} disabled={selectingHelper}>
              {selectingHelper ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {t.dreams.chooseHelper}
            </Button>
            {selectError ? <p className="mt-2 text-center text-xs text-destructive">{selectError}</p> : null}
          </div>
        ) : null}
        {selected ? (
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t.dreams.helperSelected}
            </span>
          </div>
        ) : null}
        {messages.data?.map((message) => {
          const mine = message.sender_id === userId;
          const sender = message.sender_id === otherUser?.id ? otherUser : message.sender;
          const storyId = message.kind === "system" && message.text.startsWith("GRATITUDE_STORY:")
            ? message.text.replace("GRATITUDE_STORY:", "")
            : null;
          const taskThanks = parseTaskThanks(message.text);

          if (message.kind === "system" && message.text === "HELPER_SELECTED") {
            return (
              <div key={message.id} className="flex justify-center">
                <div className="max-w-[86%] rounded-2xl bg-success/10 px-4 py-2 text-center text-sm font-semibold text-success">
                  {t.dreams.helperSelectedMessage}
                  <span className="mt-1 block text-[11px] font-normal opacity-75">{timeAgo(message.created_at)}</span>
                </div>
              </div>
            );
          }

          if (storyId) {
            return (
              <div key={message.id} className="flex justify-center">
                <Link
                  href={`/stories/${storyId}`}
                  className="max-w-[86%] rounded-2xl border bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground shadow-sm"
                >
                  {t.chats.storyPublished}
                  <span className="mt-1 block text-[11px] font-normal opacity-75">{timeAgo(message.created_at)}</span>
                </Link>
              </div>
            );
          }

          if (message.kind === "system" && taskThanks) {
            return (
              <div key={message.id} className="flex justify-center">
                <div className="max-w-[86%] overflow-hidden rounded-3xl bg-white p-3 text-center shadow-sm shadow-black/5">
                  {taskThanks.media_url ? (
                    <div className="mb-3 aspect-[4/3] overflow-hidden rounded-2xl bg-black">
                      <MediaViewer src={taskThanks.media_url} className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                  {taskThanks.text ? <p className="text-sm font-semibold leading-6">{taskThanks.text}</p> : null}
                  <span className="mt-1 block text-[11px] text-muted-foreground">{timeAgo(message.created_at)}</span>
                </div>
              </div>
            );
          }

          return (
            <div key={message.id} className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
              {!mine ? (
                <Avatar className="h-8 w-8 ring-2 ring-white">
                  <AvatarImage src={sender?.avatar ?? undefined} alt={sender?.name ?? ""} />
                  <AvatarFallback className="text-[11px]">{initials(sender?.name)}</AvatarFallback>
                </Avatar>
              ) : null}
              <div className={cn("max-w-[76%] space-y-1", mine && "items-end")}>
                <p className={cn("px-1 text-[11px] font-medium text-muted-foreground", mine && "text-right")}>
                  {mine ? t.common.you : sender?.name ?? t.common.dreamer}
                </p>
                <div
                  className={cn(
                    "rounded-3xl px-4 py-2.5 text-sm shadow-sm",
                    mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-white"
                  )}
                >
                  <p className="leading-6">{message.text}</p>
                  <p className={cn("mt-1 text-[11px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {timeAgo(message.created_at)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="sticky bottom-20 mx-3 mb-2 flex gap-2 rounded-full bg-white/95 p-2 shadow-xl shadow-black/10 backdrop-blur">
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={t.chats.write}
          className="h-11 rounded-full border-0 bg-muted/70 px-4 focus-visible:ring-1"
        />
        <Button size="icon" className="h-11 w-11 rounded-full" aria-label={t.chats.send}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function parseTaskThanks(value: string) {
  if (!value.startsWith("TASK_THANKS:")) return null;

  try {
    return JSON.parse(value.replace("TASK_THANKS:", "")) as { text?: string; media_url?: string };
  } catch {
    return null;
  }
}
