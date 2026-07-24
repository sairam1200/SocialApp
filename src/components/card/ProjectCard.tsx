import React from "react";
import { ExternalLink } from "lucide-react";
import type { ProjectSearchResult } from "@/services/api/project.service";
import Link from "next/link";
import { Wallet } from "lucide-react";
interface ProjectCardProps {
  project: ProjectSearchResult;
}

const statusColors: Record<string, string> = {
  open: "bg-green-100 text-green-800",
  funded: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  paused: "bg-orange-100 text-orange-800",
  draft: "bg-gray-100 text-gray-500",
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
  const statusColor = statusColors[project.status] ?? "bg-gray-100 text-gray-800";
  const statusLabel = statusLabels[project.status] ?? project.status;
  const displaySkills = project.skills?.slice(0, 5) ?? [];
  const remainingSkills = (project.skills?.length ?? 0) - 5;

  return (
    <Link
      href={`https://jobs.gaddr.com/projects/${project.id}`} // <-- Replace with your actual route
      className="group block"
    >
      <div
        className="
    h-full
    rounded-2xl
    border border-[#ECE8FF]
    bg-white
    p-5
    flex flex-col
    transition-all
    duration-200
    hover:-translate-y-1
    hover:border-[#7C3AED]
    shadow-lg hover:shadow-2xl
  "
      ><div className="flex-1">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="flex-1 text-[17px] font-semibold leading-6 text-[#1F1F1F] line-clamp-2 group-hover:text-[#7C3AED] transition-colors">
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
            <p className="mt-3 text-sm leading-6 text-[#6B7280] line-clamp-2">
              {project.description}
            </p>
          )}

          <div className="mt-4 flex items-center gap-3 overflow-hidden text-sm">

            <span className="text-base font-bold text-[#7C3AED]">
              {formatBudget(project.budget, project.currency)}
            </span>

            {project.timeline && (
              <span className="text-[#667085]">
                {project.timeline}
              </span>
            )}

            {project.paymentType && (
              <div className="flex items-center gap-1.5 text-[#667085]">
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
                bg-[#F4F3FF]
                px-3
                py-1
                text-xs
                font-medium
                text-[#6D28D9]
            "
                >
                  {skill}
                </span>
              ))}

              {remainingSkills > 0 && (
                <span className="rounded-full bg-[#F8F9FC] px-3 py-1 text-xs text-[#667085]">
                  +{remainingSkills}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-[#F0F0F0] pt-4">

          <span className="text-xs text-[#98A2B3]">
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
                bg-[#EEF4FF]
                px-3
                py-1
                text-xs
                font-medium
                capitalize
                text-[#3538CD]
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
