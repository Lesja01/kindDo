import { ScreenHeader } from "@/components/layout/screen-header";
import { MarkNotificationsRead } from "@/components/notifications/mark-notifications-read";
import { NotificationsTitle } from "@/components/notifications/notifications-copy";
import { NotificationsList, type NotificationItem } from "@/components/notifications/notifications-list";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function one<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

function isNotification(item: NotificationItem | null | undefined): item is NotificationItem {
  return Boolean(item);
}

export default async function NotificationsPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: chats } = await supabase
    .from("chats")
    .select("id,created_at,user_1,user_2,dream:dreams(title),userOne:users!chats_user_1_fkey(name),userTwo:users!chats_user_2_fkey(name)")
    .or(`user_1.eq.${user.id},user_2.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(20);

  const messageNotifications = await Promise.all(
    (chats ?? []).map(async (chat): Promise<NotificationItem | null> => {
      const { data: read } = await supabase
        .from("chat_reads")
        .select("last_read_at")
        .eq("chat_id", chat.id)
        .eq("user_id", user.id)
        .maybeSingle();

      let query = supabase
        .from("messages")
        .select("id,text,kind,created_at,sender_id,sender:users(name)")
        .eq("chat_id", chat.id)
        .or(`sender_id.is.null,sender_id.neq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(1);

      if (read?.last_read_at) {
        query = query.gt("created_at", read.last_read_at);
      }

      const { data: message } = await query.maybeSingle();

      if (!message) {
        return null;
      }

      const otherUser = chat.user_1 === user.id ? chat.userTwo : chat.userOne;
      const sender = one(message.sender);
      const companion = one(otherUser);
      const dream = one(chat.dream);

      return {
        id: message.id,
        kind: "message",
        actorName: sender?.name ?? companion?.name ?? null,
        dreamTitle: dream?.title ?? null,
        text: message.text,
        createdAt: message.created_at,
        href: `/chats/${chat.id}`
      } satisfies NotificationItem;
    })
  );

  const { data: stories } = await supabase
    .from("stories")
    .select("id,created_at,author:users!stories_author_id_fkey(name),dream:dreams(title)")
    .eq("helper_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const storyNotifications: NotificationItem[] = (stories ?? []).map((story) => ({
    id: story.id,
    kind: "story",
    actorName: one(story.author)?.name ?? null,
    dreamTitle: one(story.dream)?.title ?? null,
    text: null,
    createdAt: story.created_at,
    href: `/stories/${story.id}`
  }));

  const { data: dreamShares } = await supabase
    .from("dream_shares")
    .select("id,created_at,message,sender:users!dream_shares_sender_id_fkey(name),dream:dreams(id,title)")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const shareNotifications: NotificationItem[] = (dreamShares ?? []).map((share) => {
    const sender = one(share.sender);
    const dream = one(share.dream);
    return {
      id: share.id,
      kind: "dream",
      actorName: sender?.name ?? null,
      dreamTitle: dream?.title ?? null,
      text: share.message,
      createdAt: share.created_at,
      href: `/dreams/${dream?.id ?? ""}`
    };
  });

  const notifications = [...messageNotifications.filter(isNotification), ...storyNotifications, ...shareNotifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <section className="min-h-dvh">
      <MarkNotificationsRead />
      <ScreenHeader title={<NotificationsTitle />} />
      <NotificationsList items={notifications} />
    </section>
  );
}
