import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const ids: string[] = Array.isArray(body.ids) ? body.ids.filter((id: unknown): id is string => typeof id === "string") : [];
  if (!ids.length) return NextResponse.json({ error: "No dreams" }, { status: 400 });

  const updates = ids.map((id: string, index: number) =>
    supabase
      .from("dreams")
      .update({ display_order: ids.length - index })
      .eq("id", id)
      .eq("author_id", user.id)
  );
  const results = await Promise.all(updates);
  const error = results.find((result) => result.error)?.error;

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
