"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Award, Clock, GraduationCap } from "lucide-react";
import { cn } from "@/utils/cn.util";
import { useCourses } from "@/hooks/useCommunity";
import { formatMinor } from "./PostCard";

/**
 * The learning catalogue.
 *
 * Guides, articles and courses are the same thing at different lengths, so
 * they share this list — the only difference a reader sees is the lesson count
 * and the estimated time.
 */
export function LearnCatalogue() {
	const t = useTranslations("community");
	const { data: courses, isLoading } = useCourses();

	return (
		<div className="mx-auto w-full max-w-[900px] py-6">
			<header>
				<h1 className="flex items-center gap-2 text-2xl font-bold">
					<GraduationCap className="size-6 text-primary" aria-hidden />
					{t("learnTitle")}
				</h1>
				<p className="mt-1 max-w-[60ch] text-sm text-muted-foreground">
					{t("learnSubtitle")}
				</p>
			</header>

			{isLoading && (
				<ul className="mt-6 grid gap-4 sm:grid-cols-2">
					{Array.from({ length: 4 }).map((_, i) => (
						<li key={i} className="h-44 animate-pulse rounded-2xl bg-muted/50" />
					))}
				</ul>
			)}

			{!isLoading && (courses?.length ?? 0) === 0 && (
				<p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
					{t("noResults")}
				</p>
			)}

			<ul className="mt-6 grid gap-4 sm:grid-cols-2">
				{(courses ?? []).map((course) => (
					<li key={course.id}>
						<Link
							href={`/community/learn/${course.slug}`}
							className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border transition-colors hover:border-primary"
						>
							{course.coverUrl ? (
								<span className="relative block aspect-[16/9] bg-muted">
									<Image
										src={course.coverUrl}
										alt=""
										fill
										sizes="(max-width: 640px) 100vw, 440px"
										className="object-cover"
									/>
								</span>
							) : (
								<span
									aria-hidden
									className="block aspect-[16/9] bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-to)] opacity-90"
								/>
							)}

							<span className="flex flex-1 flex-col p-4">
								<span className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
									<span
										className={cn(
											"rounded-full px-2 py-0.5",
											course.level === "beginner" && "bg-secondary/60",
											course.level === "intermediate" && "bg-primary/10 text-primary",
											course.level === "advanced" && "bg-primary/20 text-primary",
										)}
									>
										{course.level}
									</span>
									<span className="inline-flex items-center gap-1">
										<Clock className="size-3" aria-hidden />
										{t("minutes", { count: course.estimatedMinutes })}
									</span>
								</span>

								<span className="mt-2 block font-semibold">{course.title}</span>
								{course.summary && (
									<span className="mt-1 block line-clamp-2 text-sm text-muted-foreground">
										{course.summary}
									</span>
								)}

								<span className="mt-auto flex items-center justify-between pt-3 text-xs">
									{course.certificationTitle ? (
										<span className="inline-flex items-center gap-1 text-primary">
											<Award className="size-3.5" aria-hidden />
											{t("earnsCertification")}
										</span>
									) : (
										<span />
									)}
									<span className="font-medium">
										{course.priceMinor
											? formatMinor(course.priceMinor, course.currency)
											: t("free")}
									</span>
								</span>
							</span>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
