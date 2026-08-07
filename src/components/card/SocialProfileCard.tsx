import { ExternalLink, Users } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { platformDisplayName, renderPlatformIcon } from "@/lib/card-helpers";

interface SocialProfileCardProps {
  name: string;
  handle?: string;
  avatar?: string;
  platform: string;
  followers?: number | null;
  description?: string | null;
  url?: string;
}

export default function SocialProfileCard({ name, handle, avatar, platform, followers, description, url }: SocialProfileCardProps) {
  const content = (
    <div className="flex h-[340px] flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <UserAvatar src={avatar ?? null} alt={name} size="lg" />
        <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {renderPlatformIcon(platform, "size-4")} {platformDisplayName(platform)}
        </span>
      </div>
      <div className="mt-4 min-w-0">
        <h3 className="truncate font-semibold text-foreground">{name}</h3>
        {handle && <p className="truncate text-sm text-muted-foreground">@{handle.replace(/^@/, "")}</p>}
      </div>
      {description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{description}</p>}
      <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><Users className="size-4" />{followers?.toLocaleString() ?? ""}</span>
        {url && <ExternalLink className="size-4" aria-label={`Open ${name}`} />}
      </div>
    </div>
  );

  return url ? <a href={url} target="_blank" rel="noopener noreferrer" className="block h-full">{content}</a> : content;
}
