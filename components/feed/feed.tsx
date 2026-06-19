"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Bookmark, Filter, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KindDoLogo } from "@/components/brand/kinddo-logo";
import { DreamCard } from "@/components/dreams/dream-card";
import { StoryCard } from "@/components/stories/story-card";
import { ScreenHeader } from "@/components/layout/screen-header";
import { useI18n } from "@/lib/i18n";
import { searchAreas } from "@/lib/locations";
import { cn } from "@/lib/utils";
import { Dream, Story } from "@/types/database";

const PAGE_SIZE = 5;
const categories = ["Family", "Health", "Learning", "Home", "Work", "Travel", "Creativity", "Sport", "Kids", "Community"];
const CUSTOM_AREA = "__custom__";

async function fetchPage<T>(url: string, page: number, filters?: FeedFilters): Promise<T[]> {
  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (filters?.categories.length) params.set("categories", filters.categories.join(","));
  if (filters?.location) params.set("location", filters.location);
  if (filters?.ageFrom) params.set("ageFrom", filters.ageFrom);
  if (filters?.ageTo) params.set("ageTo", filters.ageTo);
  if (filters?.favoritesOnly) params.set("favorites", "1");

  const response = await fetch(`${url}?${params.toString()}`);
  if (!response.ok) throw new Error("Unable to load feed");
  return response.json();
}

type FeedFilters = {
  categories: string[];
  location: string;
  areaPreset: string;
  ageFrom: string;
  ageTo: string;
  favoritesOnly: boolean;
};

export function Feed({ viewerId }: { viewerId: string | null }) {
  const { t } = useI18n();
  const [filters, setFilters] = useState<FeedFilters>({ categories: [], location: "", areaPreset: "", ageFrom: "", ageTo: "", favoritesOnly: false });
  const dreams = useInfiniteQuery({
    queryKey: ["dreams", filters],
    queryFn: ({ pageParam }) => fetchPage<Dream>("/api/dreams", pageParam, filters),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => (lastPage.length === PAGE_SIZE ? pages.length : undefined)
  });

  const stories = useInfiniteQuery({
    queryKey: ["stories"],
    queryFn: ({ pageParam }) => fetchPage<Story>("/api/stories", pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => (lastPage.length === PAGE_SIZE ? pages.length : undefined)
  });

  return (
    <Tabs defaultValue="dreams" className="min-h-dvh">
      <ScreenHeader
        title={
          <Link href="/about" className="inline-flex rounded-2xl transition-transform active:scale-[0.98]" aria-label="KindDo">
            <KindDoLogo size="sm" />
          </Link>
        }
      />
      <div className="sticky top-[68px] z-20 bg-background/95 px-4 pt-1 backdrop-blur">
        <TabsList className="grid h-12 w-full grid-cols-2 border-b border-border/70 bg-transparent">
          <TabsTrigger
            value="dreams"
            className="relative h-12 rounded-none bg-transparent pb-3 pt-2 text-sm font-bold text-muted-foreground shadow-none transition-colors after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:rounded-full after:bg-transparent data-[state=active]:text-primary data-[state=active]:after:bg-primary"
          >
            {t.common.worldDreams}
          </TabsTrigger>
          <TabsTrigger
            value="stories"
            className="relative h-12 rounded-none bg-transparent pb-3 pt-2 text-sm font-bold text-muted-foreground shadow-none transition-colors after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:rounded-full after:bg-transparent data-[state=active]:text-primary data-[state=active]:after:bg-primary"
          >
            {t.nav.stories}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="dreams" className="m-0">
        <DreamFilters filters={filters} onChange={setFilters} />
        {dreams.data?.pages.flat().map((dream) => <DreamCard key={dream.id} dream={dream} viewerId={viewerId} />)}
        <LoadMore isLoading={dreams.isFetchingNextPage} hasNext={dreams.hasNextPage} onClick={() => dreams.fetchNextPage()} />
      </TabsContent>

      <TabsContent value="stories" className="m-0">
        {stories.data?.pages.flat().map((story) => <StoryCard key={story.id} story={story} />)}
        <LoadMore isLoading={stories.isFetchingNextPage} hasNext={stories.hasNextPage} onClick={() => stories.fetchNextPage()} />
      </TabsContent>
    </Tabs>
  );
}

function DreamFilters({ filters, onChange }: { filters: FeedFilters; onChange: (filters: FeedFilters) => void }) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const selectedArea = searchAreas.find((area) => area.value === filters.areaPreset);
  const activeFilters = [
    ...filters.categories.map((category) => t.categories[category as keyof typeof t.categories] ?? category),
    selectedArea ? (locale === "ru" ? selectedArea.labelRu : selectedArea.labelEn) : filters.location,
    filters.ageFrom ? `${t.common.ageFrom}: ${filters.ageFrom}` : "",
    filters.ageTo ? `${t.common.ageTo}: ${filters.ageTo}` : "",
    filters.favoritesOnly ? t.common.favorites : ""
  ].filter(Boolean);

  function update(next: Partial<FeedFilters>) {
    onChange({ ...filters, ...next });
  }

  function reset() {
    onChange({ categories: [], location: "", areaPreset: "", ageFrom: "", ageTo: "", favoritesOnly: false });
  }

  function toggleCategory(category: string) {
    const nextCategories = filters.categories.includes(category)
      ? filters.categories.filter((item) => item !== category)
      : [...filters.categories, category];
    update({ categories: nextCategories });
  }

  return (
    <div className="relative mx-3 mb-1 mt-3">
      <div className="flex min-h-9 items-center gap-2">
        <button
          type="button"
          className={cn(
            "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-bold shadow-sm shadow-black/5 transition-colors",
            open || activeFilters.length ? "bg-primary text-primary-foreground" : "bg-white text-foreground"
          )}
          onClick={() => setOpen((value) => !value)}
        >
          <Filter className="h-3.5 w-3.5" />
          {t.common.filters}
          {activeFilters.length ? <span className="ml-0.5">{activeFilters.length}</span> : null}
        </button>

        <button
          type="button"
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-full shadow-sm shadow-black/5 transition-colors",
            filters.favoritesOnly ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground"
          )}
          aria-label={t.common.favorites}
          onClick={() => update({ favoritesOnly: !filters.favoritesOnly })}
        >
          <Bookmark className={cn("h-4 w-4", filters.favoritesOnly && "fill-current")} />
        </button>

        <div className="scrollbar-none flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
          {activeFilters.length ? (
            activeFilters.map((filter) => (
              <span key={filter} className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm shadow-black/5">
                {filter}
              </span>
            ))
          ) : (
            <span className="rounded-full bg-white/70 px-3 py-2 text-xs font-medium text-muted-foreground">{t.common.allCategories}</span>
          )}
        </div>

        {activeFilters.length ? (
          <button
            type="button"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-muted-foreground shadow-sm shadow-black/5"
            aria-label={t.common.reset}
            onClick={reset}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="absolute inset-x-0 top-11 z-30 space-y-4 rounded-3xl bg-white p-3 shadow-2xl shadow-black/15 ring-1 ring-black/5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-bold">{t.common.filters}</p>
            <div className="flex items-center gap-1">
              {activeFilters.length ? (
                <Button className="h-7 rounded-full px-2 text-xs" variant="ghost" onClick={reset}>
                  {t.common.reset}
                </Button>
              ) : null}
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-full bg-background text-muted-foreground"
                aria-label={t.common.close}
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <FilterGroup title={t.common.allCategories}>
            <FilterPill active={!filters.categories.length} onClick={() => update({ categories: [] })}>
              {t.common.all}
            </FilterPill>
            {categories.map((category) => (
              <FilterPill key={category} active={filters.categories.includes(category)} onClick={() => toggleCategory(category)}>
                {t.categories[category as keyof typeof t.categories]}
              </FilterPill>
            ))}
          </FilterGroup>

          <FilterGroup title={t.common.searchArea}>
            <FilterPill active={!filters.areaPreset} onClick={() => update({ areaPreset: "", location: "" })}>
              {t.common.all}
            </FilterPill>
            {searchAreas.map((area) => (
              <FilterPill key={area.value} active={filters.areaPreset === area.value} onClick={() => update({ areaPreset: area.value, location: area.value })}>
                {locale === "ru" ? area.labelRu : area.labelEn}
              </FilterPill>
            ))}
            <FilterPill active={filters.areaPreset === CUSTOM_AREA} onClick={() => update({ areaPreset: CUSTOM_AREA, location: "" })}>
              {t.common.customArea}
            </FilterPill>
          </FilterGroup>

          <div className="grid grid-cols-2 gap-2">
            {filters.areaPreset === CUSTOM_AREA ? (
              <Input
                className="col-span-2 h-10 rounded-2xl border-0 bg-background px-3 text-xs ring-1 ring-border/60 placeholder:text-muted-foreground/70"
                value={filters.location}
                placeholder={t.common.customAreaPlaceholder}
                onChange={(event) => update({ location: event.target.value })}
              />
            ) : null}
            <Input
              className="h-10 rounded-2xl border-0 bg-background px-3 text-xs ring-1 ring-border/60 placeholder:text-muted-foreground/70"
              type="number"
              min={13}
              max={120}
              value={filters.ageFrom}
              placeholder={t.common.ageFrom}
              onChange={(event) => update({ ageFrom: event.target.value })}
            />
            <Input
              className="h-10 rounded-2xl border-0 bg-background px-3 text-xs ring-1 ring-border/60 placeholder:text-muted-foreground/70"
              type="number"
              min={13}
              max={120}
              value={filters.ageTo}
              placeholder={t.common.ageTo}
              onChange={(event) => update({ ageTo: event.target.value })}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="px-1 text-[11px] font-extrabold uppercase text-muted-foreground">{title}</p>
      <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">{children}</div>
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        "h-9 shrink-0 rounded-full px-3 text-xs font-bold shadow-sm shadow-black/5 transition-colors",
        active ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function LoadMore({ isLoading, hasNext, onClick }: { isLoading: boolean; hasNext: boolean; onClick: () => void }) {
  const { t } = useI18n();

  if (!hasNext) return <p className="px-5 py-8 text-center text-sm text-muted-foreground">{t.common.caughtUp}</p>;
  return (
    <div className="px-5 py-6">
      <Button className="w-full" variant="outline" onClick={onClick} disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {t.common.loadMore}
      </Button>
    </div>
  );
}
