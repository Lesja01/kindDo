import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const targetTypes = new Set(["dream", "story", "profile"]);

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const targetType = String(body.target_type ?? "");
  const targetId = String(body.target_id ?? "");
  const reason = String(body.reason ?? "").trim();
  const details = String(body.details ?? "").trim();

  if (!targetTypes.has(targetType)) return NextResponse.json({ error: "Invalid report target" }, { status: 400 });
  if (!targetId || !reason) return NextResponse.json({ error: "Report reason is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("reports")
    .upsert(
      {
        reporter_id: user.id,
        target_type: targetType,
        target_id: targetId,
        reason,
        details: details || null,
        status: "open"
      },
      { onConflict: "reporter_id,target_type,target_id" }
    )
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
