import React from "react";
import { ExternalLink } from "lucide-react";
import type { ProjectSearchResult } from "@/services/api/project.service";

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
    <div className="bg-white rounded-lg border border-[#E6E6E6] p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 flex-1">
          {project.title}
        </h3>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {project.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {project.description}
        </p>
      )}

      <div className="flex items-center gap-4 mb-3 text-sm text-gray-700">
        <span className="font-semibold">
          {formatBudget(project.budget, project.currency)}
        </span>
        {project.timeline && (
          <span className="text-gray-500">{project.timeline}</span>
        )}
        {project.paymentType && (
          <span className="text-gray-500 capitalize">{project.paymentType}</span>
        )}
      </div>

      {displaySkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {displaySkills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
            >
              {skill}
            </span>
          ))}
          {remainingSkills > 0 && (
            <span className="px-2 py-0.5 text-gray-500 text-xs">
              +{remainingSkills} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-[#E6E6E6]">
        <span>
          {new Date(project.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <span className="flex items-center gap-1">
          {project.projectType && (
            <span className="capitalize">{project.projectType.replace(/([A-Z])/g, " $1").trim()}</span>
          )}
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;
