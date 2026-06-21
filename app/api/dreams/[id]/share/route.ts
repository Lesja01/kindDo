import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const recipientId = typeof body.recipient_id === "string" ? body.recipient_id : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 240) : null;

  if (!recipientId || recipientId === user.id) {
    return NextResponse.json({ error: "Recipient is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("dream_shares")
    .insert({ dream_id: id, sender_id: user.id, recipient_id: recipientId, message })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
