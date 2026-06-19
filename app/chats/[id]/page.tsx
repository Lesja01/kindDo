import { notFound } from "next/navigation";
import { ChatRoom } from "@/components/chats/chat-room";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/database";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const supabase = await createClient();
  const { data: chat } = await supabase
    .from("chats")
    .select("id,user_1,user_2,dream:dreams(id,title,status,helper_id,author_id),task:dream_tasks(id,text,status,helper_id,completed,author_id),userOne:users!chats_user_1_fkey(*),userTwo:users!chats_user_2_fkey(*)")
    .eq("id", id)
    .single();

  if (!chat || (chat.user_1 !== user.id && chat.user_2 !== user.id)) notFound();

  const userOne = Array.isArray(chat.userOne) ? chat.userOne[0] : chat.userOne;
  const userTwo = Array.isArray(chat.userTwo) ? chat.userTwo[0] : chat.userTwo;
  const dream = Array.isArray(chat.dream) ? chat.dream[0] : chat.dream;
  const task = Array.isArray(chat.task) ? chat.task[0] : chat.task;
  const otherUser = (chat.user_1 === user.id ? userTwo : userOne) as Profile | null;
  const isAuthor = chat.user_1 === user.id;
  const canSelectHelper = Boolean(
    isAuthor &&
      otherUser &&
      (task ? !task.completed && task.status === "OPEN" && !task.helper_id : dream?.status === "OPEN" && !dream?.helper_id)
  );
  const helperSelected = Boolean(task ? task.helper_id === otherUser?.id : dream?.helper_id === otherUser?.id);

  return (
    <ChatRoom
      chatId={id}
      userId={user.id}
      otherUser={otherUser}
      dreamTitle={task?.text ?? dream?.title ?? null}
      canSelectHelper={canSelectHelper}
      helperSelected={helperSelected}
    />
  );
}
