import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

type StoryMentionInput = {
  user_id: string | null;
  name: string;
};

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id } = await params;
  const mentions: StoryMentionInput[] = Array.isArray(body.mentions)
    ? body.mentions
        .map((mention: unknown) => {
          if (!mention || typeof mention !== "object") return null;
          const value = mention as { user_id?: unknown; name?: unknown };
          const name = typeof value.name === "string" ? value.name.trim() : "";
          const userId = typeof value.user_id === "string" && value.user_id ? value.user_id : null;
          return name ? { user_id: userId, name } : null;
        })
        .filter((mention: StoryMentionInput | null): mention is StoryMentionInput => Boolean(mention))
    : [];
  const { data, error } = await supabase.rpc("complete_dream_with_story", {
    target_dream_id: id,
    gratitude_video_url: body.video_url,
    gratitude_text: body.text
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (data?.id && mentions.length) {
    await supabase.from("story_mentions").insert(
      mentions.map((mention) => ({
        story_id: data.id,
        user_id: mention.user_id,
        name: mention.name
      }))
    );
  }

  const mentionedUserIds = Array.from(new Set(mentions.map((mention: StoryMentionInput) => mention.user_id).filter((userId: string | null): userId is string => Boolean(userId))));
  const notifyUserIds = mentionedUserIds.length ? mentionedUserIds : data?.helper_id ? [data.helper_id] : [];
  const { data: chats } = notifyUserIds.length
    ? await supabase.from("chats").select("id,user_2").eq("dream_id", id).in("user_2", notifyUserIds)
    : { data: [] };

  if (chats?.length && data?.id) {
    await supabase.from("messages").insert({
      chat_id: chats[0].id,
      sender_id: null,
      kind: "system",
      text: `GRATITUDE_STORY:${data.id}`
    });

    await Promise.all(
      chats.slice(1).map((chat) =>
        supabase.from("messages").insert({
          chat_id: chat.id,
          sender_id: null,
          kind: "system",
          text: `GRATITUDE_STORY:${data.id}`
        })
      )
    );

    await supabase.from("chat_reads").upsert(
      chats.map((chat) => ({ chat_id: chat.id, user_id: user.id, last_read_at: new Date().toISOString() })),
      { onConflict: "chat_id,user_id" }
    );
  }

  return NextResponse.json(data);
}
