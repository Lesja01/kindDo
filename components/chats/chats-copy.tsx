"use client";

import { useI18n } from "@/lib/i18n";
import { EmptyState } from "@/components/ui/empty-state";

export function ChatsTitle() {
  const { t } = useI18n();
  return <h1 className="text-center text-base font-bold tracking-normal">{t.chats.title}</h1>;
}

export function EmptyChats() {
  const { t } = useI18n();
  return <EmptyState title={t.chats.emptyTitle} description={t.chats.emptyDescription} />;
}

export function DreamChatFallback() {
  const { t } = useI18n();
  return <>{t.chats.dreamChat}</>;
}

export function UnreadLabel() {
  const { t } = useI18n();
  return <>{t.chats.unread}</>;
}

export function LastMessageSnippet({ text, kind }: { text?: string | null; kind?: "user" | "system" | null }) {
  const { t } = useI18n();

  if (!text) return <>{t.chats.noMessages}</>;
  if (kind === "system" && text.startsWith("GRATITUDE_STORY:")) return <>{t.chats.storyPublished}</>;
  if (kind === "system" && text === "HELPER_SELECTED") return <>{t.dreams.helperSelectedMessage}</>;
  return <>{text}</>;
}
