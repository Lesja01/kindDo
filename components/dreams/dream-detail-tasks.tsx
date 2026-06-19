"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Check, Plus, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskHelpButton } from "@/components/dreams/task-help-button";
import { useI18n } from "@/lib/i18n";
import { cn, initials } from "@/lib/utils";
import { DreamTask, Profile } from "@/types/database";

export type TaskCandidate = {
  id: string;
  task_id: string | null;
  candidate: Profile | null;
};

export function DreamDetailTasks({
  dreamId,
  initialTasks,
  candidates,
  isAuthor,
  userId
}: {
  dreamId: string;
  initialTasks: DreamTask[];
  candidates: TaskCandidate[];
  isAuthor: boolean;
  userId: string | null;
}) {
  const { t } = useI18n();
  const [tasks, setTasks] = useState(initialTasks);
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
    setTasks((current) => [...current, task]);
  }

  async function toggleTask(task: DreamTask) {
    setError("");
    const completed = !task.completed;
    const nextStatus = completed ? "COMPLETED" : task.helper_id ? "TAKEN" : "OPEN";
    const previous = tasks;
    setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, completed, status: nextStatus } : item)));

    const response = await fetch(`/api/dreams/${dreamId}/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? t.dreams.taskSaveError);
      setTasks(previous);
    }
  }

  async function deleteTask(task: DreamTask) {
    setError("");
    const previous = tasks;
    setTasks((current) => current.filter((item) => item.id !== task.id));

    const response = await fetch(`/api/dreams/${dreamId}/tasks/${task.id}`, { method: "DELETE" });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? t.dreams.taskSaveError);
      setTasks(previous);
    }
  }

  return (
    <div className="mt-4 rounded-2xl bg-background p-2">
      <div className="space-y-2">
        {tasks.map((task) => {
          const helper = Array.isArray(task.helper) ? task.helper[0] : task.helper;
          const canHelp = !isAuthor && userId && task.status === "OPEN" && !task.helper_id;
          const taskCandidates = candidates.filter((candidate) => candidate.task_id === task.id && candidate.candidate);

          return (
            <div key={task.id} className="rounded-xl bg-white p-2">
              <div className="flex items-start gap-2">
                {isAuthor ? (
                  <button
                    type="button"
                    className={cn(
                      "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors",
                      task.completed ? "border-success bg-success text-success-foreground" : "border-muted-foreground/30 bg-background"
                    )}
                    onClick={() => toggleTask(task)}
                    aria-label={t.dreams.markDone}
                  >
                    {task.completed ? <Check className="h-4 w-4" /> : null}
                  </button>
                ) : (
                  <span className={task.completed ? "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-success text-success-foreground" : "mt-0.5 h-6 w-6 shrink-0 rounded-full border border-muted-foreground/30"} />
                )}
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-semibold leading-5", task.completed && "text-muted-foreground line-through")}>{task.text}</p>
                  {helper ? <p className="mt-1 text-xs font-semibold text-primary">{helper.name}</p> : null}
                  {task.completed && !task.helper_id ? <p className="mt-1 text-xs font-semibold text-success">{t.dreams.taskCompletedByAuthor}</p> : null}
                </div>
                {isAuthor ? (
                  <button
                    type="button"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => deleteTask(task)}
                    aria-label={t.dreams.deleteTask}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
                {canHelp ? <TaskHelpButton dreamId={dreamId} taskId={task.id} /> : null}
              </div>

              {isAuthor && taskCandidates.length ? (
                <div className="mt-2 flex items-center gap-2 pl-8">
                  <span className="text-[11px] font-bold text-muted-foreground">{t.dreams.responded}</span>
                  <div className="flex -space-x-2">
                    {taskCandidates.slice(0, 5).map((item) => (
                      <Link key={item.id} href={`/chats/${item.id}`} className="rounded-full ring-2 ring-white">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={item.candidate?.avatar ?? undefined} alt={item.candidate?.name ?? ""} />
                          <AvatarFallback className="text-[10px]">{initials(item.candidate?.name)}</AvatarFallback>
                        </Avatar>
                      </Link>
                    ))}
                  </div>
                  {taskCandidates.length > 5 ? <span className="text-[11px] font-bold text-muted-foreground">+{taskCandidates.length - 5}</span> : null}
                </div>
              ) : null}
            </div>
          );
        })}

        {!tasks.length ? <p className="px-1 py-2 text-xs text-muted-foreground">{t.dreams.noTasks}</p> : null}
      </div>

      {isAuthor ? (
        <form className="mt-2 flex gap-2" onSubmit={addTask}>
          <input
            className="h-10 min-w-0 flex-1 rounded-xl border-0 bg-white px-3 text-xs outline-none ring-1 ring-border/70"
            value={text}
            placeholder={t.dreams.taskPlaceholder}
            onChange={(event) => setText(event.target.value)}
          />
          <button type="submit" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground" aria-label={t.dreams.addChecklistItem}>
            <Plus className="h-4 w-4" />
          </button>
        </form>
      ) : null}

      {error ? <p className="mt-2 px-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
