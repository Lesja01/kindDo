import type React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Instagram, MapPin, Music2, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProfileAboutLabel, StatLabel } from "@/components/profile/profile-copy";
import { ProfilePhotoLightbox } from "@/components/profile/profile-photo-lightbox";
import { ReportButton } from "@/components/reports/report-button";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/utils";

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("users").select("*").eq("id", id).single();
  if (!profile) notFound();

  const [{ count: dreamsCreated }, { count: dreamsHelped }, { count: gratitudeStories }, { data: links }, { data: photos }] = await Promise.all([
    supabase.from("dreams").select("id", { count: "exact", head: true }).eq("author_id", id),
    supabase.from("dreams").select("id", { count: "exact", head: true }).eq("helper_id", id),
    supabase.from("stories").select("id", { count: "exact", head: true }).eq("author_id", id),
    supabase.from("social_links").select("*").eq("user_id", id),
    supabase.from("profile_photos").select("*").eq("user_id", id).order("created_at", { ascending: false })
  ]);

  return (
    <section className="min-h-dvh space-y-5 px-4 py-4">
      <div className="grid grid-cols-[40px_1fr_40px] items-center">
        <Button asChild size="icon" variant="ghost" className="rounded-full">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-center text-base font-bold tracking-normal">{profile.name}</h1>
        <ReportButton targetType="profile" targetId={profile.id} />
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-black/5">
        <div className="relative h-44 bg-[linear-gradient(135deg,#FF7A59_0%,#FFD2C5_42%,#4ECDC4_100%)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_20%,rgba(255,255,255,0.55),transparent_28%),radial-gradient(circle_at_86%_20%,rgba(255,255,255,0.35),transparent_24%)]" />
          <Avatar className="absolute -bottom-12 left-1/2 h-28 w-28 -translate-x-1/2 border-4 border-white shadow-xl">
            <AvatarImage src={profile.avatar ?? undefined} alt={profile.name} />
            <AvatarFallback className="text-2xl">{initials(profile.name)}</AvatarFallback>
          </Avatar>
        </div>
        <div className="space-y-5 px-4 pb-4 pt-14 text-center">
          <div>
            <h2 className="truncate text-2xl font-extrabold tracking-normal">{profile.name}</h2>
            {(profile.age || profile.location) ? (
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                <MapPin className="mr-1 inline h-4 w-4 align-[-3px] text-primary" />
                {[profile.age, profile.location].filter(Boolean).join(" · ")}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-background p-2">
            <Stat href={`/profile/${id}/activity?type=dreams`} label={<StatLabel type="dreams" />} value={dreamsCreated ?? 0} />
            <Stat href={`/profile/${id}/activity?type=helped`} label={<StatLabel type="helped" />} value={dreamsHelped ?? 0} />
            <Stat href={`/profile/${id}/activity?type=stories`} label={<StatLabel type="stories" />} value={gratitudeStories ?? 0} />
          </div>
        </div>
      </div>

      {profile.bio ? (
        <section className="rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
          <h2 className="text-sm font-bold uppercase text-muted-foreground">
            <ProfileAboutLabel />
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">{profile.bio}</p>
        </section>
      ) : null}

      {photos?.length ? (
        <section className="rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
          <h2 className="text-sm font-bold uppercase text-muted-foreground">Фото</h2>
          <ProfilePhotoLightbox photos={photos} />
        </section>
      ) : null}

      {links?.length ? (
        <div className="grid grid-cols-3 gap-2">
          {links.map((link) => {
            const Icon = link.platform === "instagram" ? Instagram : link.platform === "tiktok" ? Music2 : Send;

            return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
                className="flex min-w-0 flex-col items-center gap-2 rounded-3xl bg-white p-3 text-center text-xs font-bold shadow-sm shadow-black/5"
          >
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex max-w-full items-center gap-1 truncate capitalize">
                  {link.platform}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </span>
          </a>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function Stat({ label, value, href }: { label: React.ReactNode; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-lg border-0 bg-white p-3 text-center shadow-none transition-transform active:scale-[0.98]">
      <p className="text-xl font-extrabold">{value}</p>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
    </Link>
  );
}
