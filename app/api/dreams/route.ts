import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const locationAliases: Record<string, string[]> = {
  "Беларусь": ["Беларус", "Минск", "Брест", "Витебск", "Гомель", "Гродно", "Могилев", "Могилёв"],
  "Минская область": ["Минская область", "Минск", "Борисов", "Солигорск", "Молодечно", "Жодино"],
  "Брестская область": ["Брестская область", "Брест", "Барановичи", "Пинск", "Кобрин"],
  "Витебская область": ["Витебская область", "Витебск", "Орша", "Полоцк", "Новополоцк"],
  "Гомельская область": ["Гомельская область", "Гомель", "Мозырь", "Жлобин", "Речица"],
  "Гродненская область": ["Гродненская область", "Гродно", "Лида", "Слоним", "Волковыск"],
  "Могилевская область": ["Могилевская область", "Могилёвская область", "Могилев", "Могилёв", "Бобруйск"]
};

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const page = Number(request.nextUrl.searchParams.get("page") ?? "0");
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "8");
  const categories = (request.nextUrl.searchParams.get("categories") ?? "")
    .split(",")
    .map((category) => category.trim())
    .filter(Boolean);
  const location = request.nextUrl.searchParams.get("location");
  const ageFrom = request.nextUrl.searchParams.get("ageFrom");
  const ageTo = request.nextUrl.searchParams.get("ageTo");
  const from = page * limit;
  const to = from + limit - 1;

  let authorIds: string[] | null = null;

  if (location || ageFrom || ageTo) {
    let usersQuery = supabase.from("users").select("id");

    if (location) {
      const terms = locationAliases[location] ?? [location];
      usersQuery = usersQuery.or(terms.map((term) => `location.ilike.%${term}%`).join(","));
    }
    if (ageFrom) usersQuery = usersQuery.gte("age", Number(ageFrom));
    if (ageTo) usersQuery = usersQuery.lte("age", Number(ageTo));

    const { data: users, error: usersError } = await usersQuery;
    if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 });

    authorIds = (users ?? []).map((user) => user.id);
    if (!authorIds.length) return NextResponse.json([]);
  }

  let dreamsQuery = supabase
    .from("dreams")
    .select("*, author:users!dreams_author_id_fkey(*)")
    .in("status", ["OPEN", "TAKEN"])
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (categories.length) dreamsQuery = dreamsQuery.in("category", categories);
  if (authorIds) dreamsQuery = dreamsQuery.in("author_id", authorIds);

  const { data, error } = await dreamsQuery.range(from, to);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { data, error } = await supabase
    .from("dreams")
    .insert({
      author_id: user.id,
      title: body.title,
      description: body.description,
      category: body.category,
      video_url: body.video_url,
      visibility: body.visibility === "private" ? "private" : "public"
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
