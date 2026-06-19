import { MyDreamsPage } from "@/components/dreams/my-dreams-page";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DreamTask } from "@/types/database";

export default async function MyDreamsRoute() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: dreams } = await supabase
    .from("dreams")
    .select("id,title,description,video_url,category,status,visibility,created_at")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  const dreamIds = (dreams ?? []).map((dream) => dream.id);
  const { data: tasks } = dreamIds.length
    ? await supabase.from("dream_tasks").select("*, helper:users!dream_tasks_helper_id_fkey(*)").in("dream_id", dreamIds).order("created_at", { ascending: true })
    : { data: [] };
  const tasksByDream = new Map<string, DreamTask[]>();

  for (const task of tasks ?? []) {
    const current = tasksByDream.get(task.dream_id) ?? [];
    current.push(task);
    tasksByDream.set(task.dream_id, current);
  }

  const dreamsWithTasks = (dreams ?? []).map((dream) => ({ ...dream, tasks: tasksByDream.get(dream.id) ?? [] }));
  const published = dreamsWithTasks.filter((dream) => dream.visibility === "public");
  const hidden = dreamsWithTasks.filter((dream) => dream.visibility === "private");

  return <MyDreamsPage published={published} hidden={hidden} />;
}
