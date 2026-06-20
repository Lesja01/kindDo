"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VideoThumbnail } from "@/components/media/video-thumbnail";
import { useI18n } from "@/lib/i18n";
import { initials } from "@/lib/utils";

type SearchResult = {
  dreams: Array<{ id: string; title: string; video_url: string; category: string; media?: Array<{ url: string; position: number }> }>;
  stories: Array<{ id: string; text: string | null; video_url: string; dream?: { title?: string } | null }>;
  users: Array<{ id: string; name: string; avatar: string | null; bio: string | null; location: string | null }>;
};

export function SearchPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const results = useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json() as Promise<SearchResult>;
    },
    enabled: query.trim().length >= 2
  });

  const data = results.data;

  return (
    <section className="min-h-dvh px-4 py-4">
      <div className="grid grid-cols-[40px_1fr] items-center gap-2">
        <Button asChild size="icon" variant="ghost" className="rounded-full">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="h-10 rounded-2xl border-0 bg-white pl-9 shadow-sm shadow-black/5 ring-1 ring-border/60" value={query} placeholder={t.common.searchPlaceholder} onChange={(event) => setQuery(event.target.value)} autoFocus />
        </div>
      </div>

      {query.trim().length < 2 ? <p className="mt-8 text-center text-sm text-muted-foreground">{t.common.searchEmpty}</p> : null}

      {data?.users.length ? (
        <section className="mt-5">
          <h2 className="mb-2 px-1 text-sm font-extrabold">{t.nav.profile}</h2>
          <div className="space-y-2">
            {data.users.map((user) => (
              <Link key={user.id} href={`/profile/${user.id}`} className="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-sm shadow-black/5">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-bold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.location || user.bio || t.common.dreamer}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {data?.dreams.length ? (
        <section className="mt-5">
          <h2 className="mb-2 px-1 text-sm font-extrabold">{t.common.dreams}</h2>
          <div className="grid grid-cols-3 gap-2">
            {data.dreams.map((dream) => (
              <SearchDreamTile key={dream.id} dream={dream} />
            ))}
          </div>
        </section>
      ) : null}

      {data?.stories.length ? (
        <section className="mt-5">
          <h2 className="mb-2 px-1 text-sm font-extrabold">{t.nav.stories}</h2>
          <div className="grid grid-cols-3 gap-2">
            {data.stories.map((story) => (
              <Link key={story.id} href={`/stories/${story.id}`} className="relative aspect-square overflow-hidden rounded-2xl bg-black">
                <VideoThumbnail src={story.video_url} className="h-full w-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <p className="absolute inset-x-2 bottom-2 line-clamp-2 text-[11px] font-bold leading-4 text-white">{story.dream?.title || story.text}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

function SearchDreamTile({ dream }: { dream: SearchResult["dreams"][number] }) {
  const primaryMedia = dream.media?.sort((a, b) => a.position - b.position)[0]?.url ?? dream.video_url;

  return (
    <Link href={`/dreams/${dream.id}`} className="relative aspect-square overflow-hidden rounded-2xl bg-black">
      <VideoThumbnail src={primaryMedia} className="h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <p className="absolute inset-x-2 bottom-2 line-clamp-2 text-[11px] font-bold leading-4 text-white">{dream.title}</p>
    </Link>
  );
}
