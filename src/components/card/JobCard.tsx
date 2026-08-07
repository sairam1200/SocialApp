import React from "react";
import { MapPin, Clock, Briefcase, DollarSign } from "lucide-react";
import type { JobSearchResult } from "@/services/api/job.service";
import Link from "next/link";

interface JobCardProps {
  job: JobSearchResult;
}

const jobTypeLabels: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  freelance: "Freelance",
  hourly: "Hourly",
  "project-based": "Project",
  "task-based": "Task",
  internship: "Internship",
  volunteer: "Volunteer",
  unknown: "Not specified",
};

const statusColors: Record<string, string> = {
  published: "bg-primary/15 text-primary",
  draft: "bg-muted text-muted-foreground",
  closed: "bg-destructive/15 text-destructive",
  archived: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  published: "Open",
  draft: "Draft",
  closed: "Closed",
  archived: "Archived",
};

const locationTypeLabels: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

function formatSalary(
  min: number | null,
  max: number | null,
  currency: string
): string | null {
  if (min == null && max == null) return null;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  if (min != null) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const statusColor = statusColors[job.status] ?? "bg-muted text-muted-foreground";
  const statusLabel = statusLabels[job.status] ?? job.status;
  const displaySkills = job.skills?.slice(0, 5) ?? [];
  const remainingSkills = (job.skills?.length ?? 0) - 5;
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency);
  const locationLabel = job.locationType
    ? locationTypeLabels[job.locationType] ?? job.locationType
    : null;

  return (
    <Link
      href={job.url}
      className="group block h-full"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="h-full rounded-2xl border border-border bg-card px-5 pb-10 pt-5 text-card-foreground shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-2xl">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="flex-1 line-clamp-2 text-[17px] font-semibold leading-6 text-card-foreground transition-colors group-hover:text-primary">
              {job.title}
            </h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>

          {job.description && (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {job.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            {salary && (
              <span className="flex items-center gap-1.5 font-bold text-primary">
                <DollarSign size={15} />
                {salary}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Briefcase size={15} />
              {jobTypeLabels[job.jobType] ?? job.jobType}
            </span>
            {job.location && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin size={15} />
                {locationLabel
                  ? `${job.location} · ${locationLabel}`
                  : job.location}
              </span>
            )}
            {job.sourceType && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock size={15} />
                {job.sourceType}
              </span>
            )}
          </div>

          {displaySkills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {displaySkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
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
            {new Date(job.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {job.jobType && (
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium capitalize text-accent-foreground">
              {jobTypeLabels[job.jobType] ?? job.jobType}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
