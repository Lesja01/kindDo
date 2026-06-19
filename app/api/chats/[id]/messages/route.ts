import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  const { data, error } = await supabase
    .from("messages")
    .select("*, sender:users(*)")
    .eq("chat_id", id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const attachmentType = ["image", "contact", "location"].includes(body.attachment_type) ? body.attachment_type : null;

  if (!text && !attachmentType) {
    return NextResponse.json({ error: "Message is empty" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      chat_id: id,
      sender_id: user.id,
      text,
      attachment_type: attachmentType,
      attachment_url: typeof body.attachment_url === "string" ? body.attachment_url : null,
      attachment_payload: body.attachment_payload && typeof body.attachment_payload === "object" ? body.attachment_payload : null
    })
    .select("*, sender:users(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
