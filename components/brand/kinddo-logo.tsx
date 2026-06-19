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
      <defs>
        <linearGradient id="kinddo-mark-gradient" x1="12" x2="52" y1="52" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7A59" />
          <stop offset="1" stopColor="#4ECDC4" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="22" fill="#FFF" />
      <path
        d="M17 39.5c4.7-5.1 9.1-7.6 13.4-7.6h6.1c2.2 0 3.9 1.6 3.9 3.6 0 1.9-1.6 3.5-3.7 3.5h-7.5"
        fill="none"
        stroke="#FF7A59"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
      <path
        d="M28.8 45.6h8.8c3.7 0 7.2-1.6 9.7-4.4l2.4-2.7c1.4-1.6 1.2-4-.4-5.3-1.5-1.2-3.7-1.1-5.1.2l-5.1 4.8"
        fill="none"
        stroke="#4ECDC4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
      <path
        d="M34 23.5c4.7-3.4 8.3-7.2 10.9-11.3m0 0 .8 6.9m-.8-6.9-6.8 1.2"
        fill="none"
        stroke="url(#kinddo-mark-gradient)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4.5"
      />
      <circle cx="30.7" cy="24.9" r="2.7" fill="#2ECC71" />
    </svg>
  );
}
