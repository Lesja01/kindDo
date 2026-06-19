import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const page = Number(request.nextUrl.searchParams.get("page") ?? "0");
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "8");
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from("stories")
    .select("*, author:users!stories_author_id_fkey(*), helper:users!stories_helper_id_fkey(*), dream:dreams(*)")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
