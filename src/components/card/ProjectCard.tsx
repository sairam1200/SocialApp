import React from "react";
import { ExternalLink } from "lucide-react";
import type { ProjectSearchResult } from "@/services/api/project.service";
import Link from "next/link";
import { Wallet } from "lucide-react";
interface ProjectCardProps {
  project: ProjectSearchResult;
}

const statusColors: Record<string, string> = {
  open: "bg-primary/15 text-primary",
  funded: "bg-accent text-accent-foreground",
  in_progress: "bg-secondary text-secondary-foreground",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/15 text-destructive",
  paused: "bg-secondary text-secondary-foreground",
  draft: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  funded: "Funded",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  paused: "Paused",
  draft: "Draft",
};

function formatBudget(budget: string | null, currency: string): string {
  if (!budget) return "Negotiable";
  const num = parseFloat(budget);
  if (isNaN(num)) return budget;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const statusColor = statusColors[project.status] ?? "bg-muted text-muted-foreground";
  const statusLabel = statusLabels[project.status] ?? project.status;
  const displaySkills = project.skills?.slice(0, 5) ?? [];
  const remainingSkills = (project.skills?.length ?? 0) - 5;

  return (
    <Link
      href={`https://jobs.gaddr.com/projects/${project.id}`} // <-- Replace with your actual route
      className="group block h-full"
    >
      <div
        className="
    h-full
    rounded-2xl
    border border-border
    bg-card text-card-foreground
    px-5 pb-10 pt-5
    flex flex-col
    transition-all
    duration-200
    hover:-translate-y-1
    hover:border-primary
    shadow-lg hover:shadow-2xl
  "
      ><div className="flex-1">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="flex-1 line-clamp-2 text-[17px] font-semibold leading-6 text-card-foreground transition-colors group-hover:text-primary">
              {project.title}
            </h3>
            <span
              className={`
        rounded-full
        px-3
        py-1
        text-xs
        font-semibold
        shadow-sm
        ${statusColor}
    `}
            >
              {statusLabel}
            </span>
          </div>

          {project.description && (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {project.description}
            </p>
          )}

          <div className="mt-4 flex items-center gap-3 overflow-hidden text-sm">

            <span className="text-base font-bold text-primary">
              {formatBudget(project.budget, project.currency)}
            </span>

            {project.timeline && (
              <span className="text-muted-foreground">
                {project.timeline}
              </span>
            )}

            {project.paymentType && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Wallet size={15} />
                <span>{project.paymentType}</span>
              </div>
            )}

          </div>

          {displaySkills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {displaySkills.map(skill => (
                <span
                  key={skill}
                  className="
                rounded-full
                bg-primary/10
                px-3
                py-1
                text-xs
                font-medium
                text-primary
            "
                >
                  {skill}
                </span>
              ))}

              {remainingSkills > 0 && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  +{remainingSkills}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">

          <span className="text-xs text-muted-foreground">
            {new Date(project.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>

          {project.projectType && (
            <span
              className="
                rounded-full
                bg-accent
                px-3
                py-1
                text-xs
                font-medium
                capitalize
                text-accent-foreground
            "
            >
              {project.projectType.replace(/([A-Z])/g, " $1").trim()}
            </span>
          )}

        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
