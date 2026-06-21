import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const updates: Record<string, string> = {};
  const mediaUrls: string[] | null = Array.isArray(body.media_urls)
    ? body.media_urls.filter((url: unknown): url is string => typeof url === "string" && url.trim().length > 0)
    : null;

  if (typeof body.title === "string") updates.title = body.title.trim();
  if (typeof body.description === "string") updates.description = body.description.trim();
  if (typeof body.category === "string") updates.category = body.category;
  if (body.visibility === "public" || body.visibility === "private") updates.visibility = body.visibility;
  if (mediaUrls) {
    if (mediaUrls.length > 7) return NextResponse.json({ error: "You can upload up to 7 photos or videos." }, { status: 400 });
    if (!mediaUrls.length) return NextResponse.json({ error: "Please upload at least one dream photo or video." }, { status: 400 });
    updates.video_url = mediaUrls[0];
  }

  if ("title" in updates && !updates.title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  if ("description" in updates && !updates.description) return NextResponse.json({ error: "Description is required" }, { status: 400 });
  if (!Object.keys(updates).length) return NextResponse.json({ error: "No changes" }, { status: 400 });

  const { data, error } = await supabase
    .from("dreams")
    .update(updates)
    .eq("id", id)
    .eq("author_id", user.id)
    .select("id,title,description,category,visibility,video_url")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (mediaUrls) {
    const { error: deleteMediaError } = await supabase.from("dream_media").delete().eq("dream_id", id);
    if (deleteMediaError) return NextResponse.json({ error: deleteMediaError.message }, { status: 400 });

    const { error: insertMediaError } = await supabase
      .from("dream_media")
      .insert(mediaUrls.map((url, position) => ({ dream_id: id, url, position })));
    if (insertMediaError) return NextResponse.json({ error: insertMediaError.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { error } = await supabase.from("dreams").delete().eq("id", id).eq("author_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
