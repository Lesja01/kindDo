import { cn } from "@/lib/utils";

export function KindDoLogo({
  className,
  showTagline = false,
  size = "default"
}: {
  className?: string;
  showTagline?: boolean;
  size?: "default" | "sm";
}) {
  return (
    <div className={cn("flex items-center", size === "sm" ? "gap-2" : "gap-3", className)}>
      <KindDoMark className={cn("shrink-0", size === "sm" ? "h-9 w-9" : "h-12 w-12")} />
      <div className="min-w-0">
        <p className={cn("font-extrabold leading-none tracking-normal text-foreground", size === "sm" ? "text-2xl" : "text-3xl")}>
          Kind<span className="text-primary">Do</span>
        </p>
        {showTagline ? <p className="mt-2 text-sm font-medium text-muted-foreground">Dreams become stories.</p> : null}
      </div>
    </div>
  );
}

export function KindDoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-label="KindDo">
      <rect width="64" height="64" rx="18" fill="#050607" />
      <path d="M46.4 7.8 49.8 15l7.8 1.1-5.6 5.5 1.3 7.7-6.9-3.7-6.9 3.7 1.3-7.7-5.6-5.5L43 15l3.4-7.2Z" fill="#FF7A59" />
      <path d="M24.9 39.4c4.7-7.8 10.8-13.6 18.2-17.2" fill="none" stroke="#FF7A59" strokeLinecap="round" strokeWidth="3.6" />
      <path d="M32.8 31.8c2.8-1.6 5.7-3.1 8.8-4.5" fill="none" stroke="#FFB29F" strokeLinecap="round" strokeWidth="2.2" opacity=".95" />
      <circle cx="24.4" cy="31" r="5.4" fill="#4ECDC4" />
      <path d="M18.4 55.5 24 38.2c.4-1.2 2-1.6 3-.8l7.2 5.5c.4.3.7.7.9 1.2l3.2 11.4H18.4Z" fill="#4ECDC4" />
      <path d="M28.9 39.5c4.4-2.5 8-5.8 10.7-10" fill="none" stroke="#4ECDC4" strokeLinecap="round" strokeWidth="4.4" />
      <path d="M22.3 39.8c-3.6 2.6-6.3 6.1-8.2 10.7" fill="none" stroke="#4ECDC4" strokeLinecap="round" strokeWidth="4.2" />
      <path d="M24.2 55.5v-6.2M32.3 55.5l-1.6-6" fill="none" stroke="#B6FFF8" strokeLinecap="round" strokeWidth="2.6" opacity=".9" />
      <circle cx="17" cy="15.5" r="1.3" fill="#FFFFFF" opacity=".85" />
      <circle cx="22.8" cy="11.7" r=".85" fill="#FFFFFF" opacity=".6" />
      <circle cx="53" cy="36.8" r=".95" fill="#FFFFFF" opacity=".55" />
    </svg>
  );
}
