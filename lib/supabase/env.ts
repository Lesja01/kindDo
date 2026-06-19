export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. Create .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart the dev server."
    );
  }

  const parsedUrl = new URL(url);
  if (parsedUrl.pathname !== "/" || !parsedUrl.hostname.endsWith(".supabase.co")) {
    throw new Error(
      "Invalid NEXT_PUBLIC_SUPABASE_URL. Use only the Supabase Project URL, for example https://your-project-ref.supabase.co. Do not include /auth/v1, /rest/v1, dashboard URLs, or callback URLs."
    );
  }

  return { url, anonKey };
}
