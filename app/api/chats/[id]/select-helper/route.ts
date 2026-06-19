import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { data, error } = await supabase.rpc("select_chat_helper", { target_chat_id: id });

  if (error) return NextResponse.json({ error: error.message }, { status: 409 });

  await supabase.from("messages").insert({
    chat_id: id,
    sender_id: null,
    kind: "system",
    text: "HELPER_SELECTED"
  });

  return NextResponse.json(data);
}
