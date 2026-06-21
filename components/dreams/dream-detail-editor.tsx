"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Images, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MultiMediaUpload } from "@/components/media/multi-media-upload";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Dream, DreamVisibility } from "@/types/database";

const categories = ["Family", "Health", "Learning", "Home", "Pets", "Work", "Travel", "Creativity", "Sport", "Kids", "Community"];

export function DreamDetailEditor({
  dreamId,
  initialTitle,
  initialDescription,
  initialCategory,
  initialVisibility,
  initialMediaUrls,
  canEdit
}: {
  dreamId: string;
  initialTitle: string;
  initialDescription: string;
  initialCategory: string;
  initialVisibility: DreamVisibility;
  initialMediaUrls: string[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [category, setCategory] = useState(initialCategory);
  const [visibility, setVisibility] = useState<DreamVisibility>(initialVisibility);
  const [mediaUrls, setMediaUrls] = useState(initialMediaUrls);
  const [editing, setEditing] = useState<"title" | "description" | "category" | "media" | null>(null);
  const [message, setMessage] = useState("");
  const isPublic = visibility === "public";

  async function save(event?: FormEvent) {
    event?.preventDefault();
    setMessage("");
    const response = await fetch(`/api/dreams/${dreamId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, category, visibility })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setMessage(payload?.error ?? t.dreams.taskSaveError);
      return;
    }

    setEditing(null);
    router.refresh();
  }

  async function saveMedia() {
    setMessage("");
    if (!mediaUrls.length) {
      setMessage(t.dreams.uploadRequired);
      return;
    }

    const response = await fetch(`/api/dreams/${dreamId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ media_urls: mediaUrls })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setMessage(payload?.error ?? t.dreams.taskSaveError);
      return;
    }

    setEditing(null);
    router.refresh();
  }

  async function toggleVisibility() {
    const next = visibility === "public" ? "private" : "public";
    setVisibility(next);
    const response = await fetch(`/api/dreams/${dreamId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visibility: next })
    });
    if (!response.ok) setVisibility(visibility);
  }

  return (
    <div className="mt-4 space-y-4">
      {canEdit ? (
        <div className="flex flex-wrap items-center gap-2">
          {editing === "category" ? (
            <form className="flex min-w-0 flex-1 gap-2" onSubmit={save}>
            <select className="h-10 min-w-0 flex-1 rounded-2xl border-0 bg-background px-3 text-sm outline-none ring-1 ring-border/70" value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {t.categories[item as keyof typeof t.categories]}
                </option>
              ))}
            </select>
            <Button className="h-10 rounded-2xl px-3 text-xs">{t.common.saving.replace("...", "")}</Button>
            </form>
          ) : (
            <IconEdit onClick={() => setEditing("category")} />
          )}
          <>
            <button
              type="button"
              className={cn(
                "inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-bold",
                isPublic ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
              )}
              onClick={toggleVisibility}
            >
              {isPublic ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {isPublic ? t.profile.publishedShort : t.profile.hiddenShort}
            </button>
          </>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1 rounded-full bg-background px-3 text-xs font-bold text-muted-foreground"
            onClick={() => setEditing((value) => (value === "media" ? null : "media"))}
          >
            <Images className="h-3.5 w-3.5" />
            {t.dreams.editMedia}
          </button>
        </div>
      ) : null}

      {canEdit && editing === "media" ? (
        <div className="rounded-3xl bg-background p-2">
          <MultiMediaUpload bucket="dream-videos" values={mediaUrls} onChange={setMediaUrls} />
          <Button type="button" className="mt-2 h-11 w-full rounded-2xl" onClick={saveMedia}>
            {t.dreams.saveMedia}
          </Button>
        </div>
      ) : null}

      <EditableField editing={editing === "title"} canEdit={canEdit} onEdit={() => setEditing("title")} onSubmit={save}>
        {editing === "title" ? (
          <input className="h-12 w-full rounded-2xl border-0 bg-background px-3 text-xl font-extrabold outline-none ring-1 ring-border/70" value={title} onChange={(event) => setTitle(event.target.value)} />
        ) : (
          <h2 className="text-2xl font-extrabold leading-tight tracking-normal">{title}</h2>
        )}
      </EditableField>

      <EditableField editing={editing === "description"} canEdit={canEdit} onEdit={() => setEditing("description")} onSubmit={save}>
        {editing === "description" ? (
          <textarea className="min-h-32 w-full rounded-2xl border-0 bg-background px-3 py-2 leading-7 outline-none ring-1 ring-border/70" value={description} onChange={(event) => setDescription(event.target.value)} />
        ) : (
          <p className="leading-7 text-muted-foreground">{description}</p>
        )}
      </EditableField>

      {message ? <p className="text-xs text-destructive">{message}</p> : null}
    </div>
  );
}

function EditableField({
  editing,
  canEdit,
  onEdit,
  onSubmit,
  children
}: {
  editing: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onSubmit: (event?: FormEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <form className="group flex items-start gap-2" onSubmit={onSubmit}>
      <div className="min-w-0 flex-1">{children}</div>
      {canEdit ? (
        editing ? (
          <Button className="mt-1 h-9 rounded-2xl px-3 text-xs">{editing ? "OK" : null}</Button>
        ) : (
          <IconEdit onClick={onEdit} />
        )
      ) : null}
    </form>
  );
}

function IconEdit({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-background text-muted-foreground" onClick={onClick} aria-label="Редактировать">
      <Pencil className="h-4 w-4" />
    </button>
  );
}
