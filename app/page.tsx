import { Feed } from "@/components/feed/feed";
import { getUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getUser();
  return <Feed viewerId={user?.id ?? null} />;
}
