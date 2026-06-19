"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Eye, EyeOff, Grid3X3, List, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { VideoUpload } from "@/components/media/video-upload";
import { VideoThumbnail } from "@/components/media/video-thumbnail";
import { useI18n } from "@/lib/i18n";
import { cn, timeAgo } from "@/lib/utils";
import { Dream, DreamStatus, DreamTask } from "@/types/database";

type MyDreamItem = Pick<Dream, "id" | "title" | "description" | "video_url" | "category" | "status" | "visibility" | "created_at"> & {
  tasks?: DreamTask[];
};
type DreamTab = "active" | "completed";
type VisibilityFilter = "all" | "public" | "private";

export function MyDreamsPage({ published, hidden }: { published: MyDreamItem[]; hidden: MyDreamItem[] }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<DreamTab>("active");
  const [view, setView] = useState<"list" | "grid">("list");
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");
  const [tasksByDream, setTasksByDream] = useState<Record<string, DreamTask[]>>(() =>
    Object.fromEntries([...published, ...hidden].map((dream) => [dream.id, dream.tasks ?? []]))
  );

  const dreams = useMemo(
    () => [...published, ...hidden].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [published, hidden]
  );
  const activeDreams = dreams.filter((dream) => dream.status !== "COMPLETED");
  const completedDreams = dreams.filter((dream) => dream.status === "COMPLETED");
  const tabDreams = tab === "active" ? activeDreams : completedDreams;
  const visibleDreams = visibility === "all" ? tabDreams : tabDreams.filter((dream) => dream.visibility === visibility);

  return (
    <section className="min-h-dvh px-4 py-4">
      <div className="grid grid-cols-[40px_1fr_40px] items-center">
        <Button asChild size="icon" variant="ghost" className="rounded-full">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-center text-base font-bold tracking-normal">{t.profile.allMyDreams}</h1>
        <Button size="icon" variant="ghost" className="rounded-full">
          <Search className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 rounded-3xl bg-white p-2 shadow-sm shadow-black/5">
        <DreamStat value={dreams.length} label={t.common.dreams} />
        <DreamStat value={published.length} label={t.profile.publishedShort} />
        <DreamStat value={hidden.length} label={t.profile.hiddenShort} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="grid h-11 flex-1 grid-cols-2 rounded-2xl bg-white p-1 shadow-sm shadow-black/5">
          <TabButton active={tab === "active"} onClick={() => setTab("active")}>
            {t.profile.activeDreams}
          </TabButton>
          <TabButton active={tab === "completed"} onClick={() => setTab("completed")}>
            {t.profile.completedDreams}
          </TabButton>
        </div>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-muted-foreground shadow-sm shadow-black/5"
          aria-label={view === "list" ? t.profile.gridView : t.profile.listView}
          onClick={() => setView((current) => (current === "list" ? "grid" : "list"))}
        >
          {view === "list" ? <Grid3X3 className="h-5 w-5" /> : <List className="h-5 w-5" />}
        </button>
      </div>

      <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto">
        <FilterChip active={visibility === "all"} onClick={() => setVisibility("all")}>
          {t.common.all}
        </FilterChip>
        <FilterChip active={visibility === "public"} onClick={() => setVisibility("public")}>
          <Eye className="h-3.5 w-3.5" />
          {t.profile.publishedShort}
        </FilterChip>
        <FilterChip active={visibility === "private"} onClick={() => setVisibility("private")}>
          <EyeOff className="h-3.5 w-3.5" />
          {t.profile.hiddenShort}
        </FilterChip>
      </div>

      <div className="mt-4">
        {visibleDreams.length ? (
          <div className={view === "grid" ? "grid grid-cols-3 gap-2" : "space-y-3"}>
            {visibleDreams.map((dream) =>
              view === "grid" ? (
                <DreamGridCard key={dream.id} dream={dream} taskCount={tasksByDream[dream.id]?.length ?? 0} />
              ) : (
                <DreamListCard
                  key={dream.id}
                  dream={dream}
                  tasks={tasksByDream[dream.id] ?? []}
                  onTasksChange={(tasks) => setTasksByDream((current) => ({ ...current, [dream.id]: tasks }))}
                />
              )
            )}
          </div>
        ) : (
          <EmptyState
            title={tab === "active" ? t.profile.noPublishedDreams : t.profile.noMyDreams}
            description={t.profile.emptyDescription}
            action={{ label: t.dreams.post, href: "/create" }}
          />
        )}
      </div>

      <Button asChild size="icon" className="fixed bottom-24 right-[max(1rem,calc((100vw-480px)/2+1rem))] h-14 w-14 rounded-full shadow-xl shadow-primary/25">
        <Link href="/create" aria-label={t.dreams.post}>
          <Plus className="h-6 w-6" />
        </Link>
      </Button>
    </section>
  );
}

function DreamStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-background px-2 py-3 text-center">
      <p className="text-lg font-extrabold leading-none">{value}</p>
      <p className="mt-1 truncate text-[11px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={cn("rounded-xl text-sm font-bold transition-colors", active ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground")}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-bold shadow-sm shadow-black/5 transition-colors",
        active ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function DreamListCard({
  dream,
  tasks,
  onTasksChange
}: {
  dream: MyDreamItem;
  tasks: DreamTask[];
  onTasksChange: (tasks: DreamTask[]) => void;
}) {
  const { t } = useI18n();

  return (
    <article className="rounded-3xl bg-white p-2 shadow-sm shadow-black/5">
      <Link href={`/dreams/${dream.id}`} className="flex gap-3 transition-transform active:scale-[0.99]">
        <VideoThumbnail className="h-32 w-36 shrink-0 rounded-2xl" src={dream.video_url} />
        <div className="min-w-0 flex-1 py-1 pr-1">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 text-base font-extrabold leading-5">{dream.title}</p>
            <VisibilityBadge visibility={dream.visibility} compact />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <StatusPill status={dream.status} />
            <span className="truncate text-xs text-muted-foreground">{timeAgo(dream.created_at)}</span>
          </div>
          <p className="mt-2 line-clamp-1 text-xs font-medium text-muted-foreground">
            {t.categories[dream.category as keyof typeof t.categories] ?? dream.category}
          </p>
        </div>
      </Link>
      <DreamTasks dreamId={dream.id} tasks={tasks} onChange={onTasksChange} />
    </article>
  );
}

function DreamGridCard({ dream, taskCount }: { dream: MyDreamItem; taskCount: number }) {
  return (
    <Link href={`/dreams/${dream.id}`} className="group block">
      <article className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-black shadow-sm shadow-black/5">
        <VideoThumbnail className="h-full w-full" src={dream.video_url} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <div className="absolute left-2 top-2">
          <VisibilityBadge visibility={dream.visibility} compact />
        </div>
        <div className="absolute inset-x-2 bottom-2 space-y-1">
          <StatusPill status={dream.status} compact />
          {taskCount ? <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-foreground">{taskCount}</span> : null}
          <p className="line-clamp-2 text-xs font-bold leading-4 text-white">{dream.title}</p>
        </div>
      </article>
    </Link>
  );
}

function DreamTasks({ dreamId, tasks, onChange }: { dreamId: string; tasks: DreamTask[]; onChange: (tasks: DreamTask[]) => void }) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  async function addTask(event: FormEvent) {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;
    setText("");
    setError("");

    const response = await fetch(`/api/dreams/${dreamId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: value })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? t.dreams.taskSaveError);
      setText(value);
      return;
    }

    const task = (await response.json()) as DreamTask;
    onChange([...tasks, task]);
  }

  async function toggleTask(task: DreamTask) {
    setError("");
    const completed = !task.completed;
    const nextStatus = completed ? "COMPLETED" : task.helper_id ? "TAKEN" : "OPEN";
    onChange(tasks.map((item) => (item.id === task.id ? { ...item, completed, status: nextStatus } : item)));
    const response = await fetch(`/api/dreams/${dreamId}/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? t.dreams.taskSaveError);
      onChange(tasks);
    }
  }

  async function deleteTask(task: DreamTask) {
    setError("");
    onChange(tasks.filter((item) => item.id !== task.id));
    const response = await fetch(`/api/dreams/${dreamId}/tasks/${task.id}`, { method: "DELETE" });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? t.dreams.taskSaveError);
      onChange(tasks);
    }
  }

  return (
    <div className="mt-3 rounded-2xl bg-background p-2">
      <p className="px-1 text-xs font-bold uppercase text-muted-foreground">{t.dreams.tasks}</p>
      <div className="mt-2 space-y-1.5">
        {tasks.length ? (
          tasks.map((task) => (
            <div key={task.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-white px-2 py-2">
              <button
                type="button"
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                  task.completed ? "border-success bg-success text-success-foreground" : "border-muted-foreground/30 bg-background"
                )}
                onClick={() => toggleTask(task)}
                aria-label={t.dreams.completeTaskYourself}
                title={t.dreams.completeTaskYourself}
              >
                {task.completed ? <Check className="h-3.5 w-3.5" /> : null}
              </button>
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-xs font-medium", task.completed && "text-muted-foreground line-through")}>{task.text}</p>
                {task.helper ? (
                  <p className="truncate text-[11px] font-semibold text-primary">
                    {t.dreams.taskTakenBy} {(Array.isArray(task.helper) ? task.helper[0]?.name : task.helper.name) ?? t.common.helper}
                  </p>
                ) : null}
                {task.completed && !task.helper_id ? <p className="truncate text-[11px] font-semibold text-success">{t.dreams.taskCompletedByAuthor}</p> : null}
              </div>
              {task.status === "TAKEN" && !task.completed ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{t.statuses.TAKEN}</span> : null}
              <button
                type="button"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                onClick={() => deleteTask(task)}
                aria-label={t.dreams.deleteTask}
                title={t.dreams.deleteTask}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {task.completed && task.helper_id ? <TaskThanks dreamId={dreamId} taskId={task.id} /> : null}
            </div>
          ))
        ) : (
          <p className="px-1 py-1 text-xs text-muted-foreground">{t.dreams.noTasks}</p>
        )}
      </div>
      <form className="mt-2 flex gap-2" onSubmit={addTask}>
        <input
          className="h-9 min-w-0 flex-1 rounded-xl border-0 bg-white px-3 text-xs outline-none ring-1 ring-border/70"
          value={text}
          placeholder={t.dreams.taskPlaceholder}
          onChange={(event) => setText(event.target.value)}
        />
        <button type="submit" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" />
        </button>
      </form>
      {error ? <p className="mt-2 px-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function TaskThanks({ dreamId, taskId }: { dreamId: string; taskId: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim() && !mediaUrl) return;

    setSending(true);
    setMessage("");
    const response = await fetch(`/api/dreams/${dreamId}/tasks/${taskId}/thanks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, media_url: mediaUrl })
    });
    setSending(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setMessage(payload?.error ?? t.dreams.taskSaveError);
      return;
    }

    setText("");
    setMediaUrl("");
    setOpen(false);
    setMessage(t.dreams.thanksSent);
  }

  return (
    <div className="basis-full">
      <button type="button" className="mt-1 rounded-full bg-success/10 px-3 py-1 text-[11px] font-bold text-success" onClick={() => setOpen((value) => !value)}>
        {t.dreams.sendThanks}
      </button>
      {open ? (
        <form className="mt-2 space-y-2 rounded-2xl bg-background p-2" onSubmit={submit}>
          <input
            className="h-9 w-full rounded-xl border-0 bg-white px-3 text-xs outline-none ring-1 ring-border/70"
            value={text}
            placeholder={t.dreams.thanksPlaceholder}
            onChange={(event) => setText(event.target.value)}
          />
          <VideoUpload bucket="story-videos" value={mediaUrl} onChange={setMediaUrl} />
          <Button className="h-9 w-full rounded-xl text-xs" disabled={sending}>
            {sending ? t.stories.publishing : t.dreams.sendThanks}
          </Button>
        </form>
      ) : null}
      {message ? <p className="mt-1 px-1 text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}

function StatusPill({ status, compact = false }: { status: DreamStatus; compact?: boolean }) {
  const { t } = useI18n();
  const completed = status === "COMPLETED";

  return (
    <Badge
      className={cn(
        "rounded-full border-0 font-bold",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        completed ? "bg-success/15 text-success" : "bg-primary/10 text-primary"
      )}
    >
      {t.statuses[status]}
    </Badge>
  );
}

function VisibilityBadge({ visibility, compact = false }: { visibility: Dream["visibility"]; compact?: boolean }) {
  const { t } = useI18n();
  const isPublic = visibility === "public";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full bg-background/90 font-bold text-muted-foreground",
        compact ? "px-1.5 py-1 text-[10px]" : "px-2 py-1 text-[10px]"
      )}
    >
      {isPublic ? <Eye className="h-3 w-3 text-success" /> : <EyeOff className="h-3 w-3 text-muted-foreground" />}
      {compact ? null : isPublic ? t.profile.publishedShort : t.profile.hiddenShort}
    </span>
  );
}
