import Link from "next/link";
import type React from "react";
import { redirect } from "next/navigation";
import { ExternalLink, Instagram, MapPin, Music2, Send } from "lucide-react";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfilePhotoGallery } from "@/components/profile/profile-photo-gallery";
import { ProfileHeaderAvatarUpload } from "@/components/profile/profile-header-avatar-upload";
import { FeedbackForm } from "@/components/profile/feedback-form";
import { LanguageSwitcher } from "@/components/profile/language-switcher";
import { SignOutButton } from "@/components/profile/sign-out-button";
import { ThemeSwitcher } from "@/components/profile/theme-switcher";
import { Button } from "@/components/ui/button";
import { ProfileAboutLabel, PublicProfileButtonLabel, ReputationLabel, StatLabel } from "@/components/profile/profile-copy";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SocialLink } from "@/types/database";

export default async function MyProfilePage() {
  const user = await requireUser();
  const supabase = await createClient();
  let { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();

  if (!profile) {
    const { data: createdProfile } = await supabase
      .from("users")
      .insert({
        id: user.id,
        name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Dreamer",
        avatar: user.user_metadata?.avatar_url ?? null
      })
      .select("*")
      .single();
    profile = createdProfile;
  }

  const { data: links } = await supabase.from("social_links").select("*").eq("user_id", user.id);
  const { data: photos } = await supabase.from("profile_photos").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

  if (!profile) redirect("/login");

  const [{ count: dreamsCreated }, { count: dreamsHelped }, { count: gratitudeStories }] = await Promise.all([
    supabase.from("dreams").select("id", { count: "exact", head: true }).eq("author_id", user.id),
    supabase.from("dreams").select("id", { count: "exact", head: true }).eq("helper_id", user.id),
    supabase.from("stories").select("id", { count: "exact", head: true }).eq("author_id", user.id)
  ]);

  return (
    <section className="min-h-dvh space-y-5 px-4 py-4">
      <div className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-white shadow-[0_16px_40px_rgba(31,41,55,0.08)]">
        <div className="relative h-44 bg-[linear-gradient(135deg,hsl(var(--primary))_0%,#FFD8CF_44%,hsl(var(--secondary))_100%)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_20%,rgba(255,255,255,0.55),transparent_28%),radial-gradient(circle_at_86%_20%,rgba(255,255,255,0.35),transparent_24%)]" />
          <Button asChild size="icon" variant="ghost" className="absolute right-3 top-3 rounded-full bg-white/65 backdrop-blur">
            <Link href={`/profile/${user.id}`}>
              <ExternalLink className="h-5 w-5" />
            </Link>
          </Button>
          <ProfileHeaderAvatarUpload userId={user.id} name={profile.name} initialAvatar={profile.avatar} />
        </div>
        <div className="space-y-5 px-4 pb-4 pt-14 text-center">
          <div>
            <h1 className="truncate text-2xl font-extrabold tracking-normal">{profile.name}</h1>
            <ReputationLabel value={profile.reputation_score} />
            {(profile.age || profile.location) ? (
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                <MapPin className="mr-1 inline h-4 w-4 align-[-3px] text-primary" />
                {[profile.age, profile.location].filter(Boolean).join(" · ")}
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-background/80 p-2">
            <Stat href={`/profile/${user.id}/activity?type=dreams`} label={<StatLabel type="dreams" />} value={dreamsCreated ?? 0} />
            <Stat href={`/profile/${user.id}/activity?type=helped`} label={<StatLabel type="helped" />} value={dreamsHelped ?? 0} />
            <Stat href={`/profile/${user.id}/activity?type=stories`} label={<StatLabel type="stories" />} value={gratitudeStories ?? 0} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button asChild variant="outline" className="h-11 rounded-2xl bg-white shadow-sm shadow-black/5">
          <Link href={`/profile/${user.id}`}>
            <PublicProfileButtonLabel />
          </Link>
        </Button>
        <SignOutButton />
      </div>

      {profile.bio ? (
        <ProfileInfoCard title={<ProfileAboutLabel />}>
          {profile.bio}
        </ProfileInfoCard>
      ) : null}
      <SocialLinksCard links={links ?? []} />

      <ThemeSwitcher />
      <LanguageSwitcher />
      <ProfileForm profile={profile} links={links ?? []} />
      <ProfilePhotoGallery userId={user.id} initialPhotos={photos ?? []} />
      <FeedbackForm />
    </section>
  );
}

function Stat({ label, value, href }: { label: React.ReactNode; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-lg border-0 bg-white p-3 text-center shadow-sm shadow-black/5 transition-transform active:scale-[0.98]">
      <p className="text-xl font-extrabold">{value}</p>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
    </Link>
  );
}

function ProfileInfoCard({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.75rem] border border-white/80 bg-white p-4 shadow-sm shadow-black/5">
      <h2 className="text-sm font-bold uppercase text-muted-foreground">{title}</h2>
      <p className="mt-3 leading-7 text-muted-foreground">{children}</p>
    </section>
  );
}

function SocialLinksCard({ links }: { links: SocialLink[] }) {
  if (!links.length) return null;

  return (
    <section className="grid grid-cols-3 gap-2">
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
            <span className="w-full truncate capitalize">{link.platform}</span>
          </a>
        );
      })}
    </section>
  );
}
