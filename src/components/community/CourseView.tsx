"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Award, Check, Circle, Clock } from "lucide-react";
import { cn } from "@/utils/cn.util";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/services/apiClient.service";
import type { Lesson } from "@/types/community.type";
import { useCourse } from "@/hooks/useCommunity";

/**
 * A course, its lessons and its quiz.
 *
 * Quizzes are graded server-side — the answer key is withheld until the
 * learner completes the course, so `correctIndex` arrives as `-1` and this
 * component never has anything to leak. That is what makes the certification
 * worth putting on a profile.
 */
export function CourseView({
	slug,
	isAuthenticated = false,
}: {
	slug: string;
	isAuthenticated?: boolean;
}) {
	const t = useTranslations("community");
	const { data, isLoading, refetch } = useCourse(slug);
	const [answers, setAnswers] = useState<Record<string, number[]>>({});
	const [busy, setBusy] = useState(false);

	if (isLoading) {
		return (
			<div className="mx-auto max-w-[760px] py-8" aria-busy="true">
				<div className="h-10 w-2/3 animate-pulse rounded bg-muted" />
				<div className="mt-6 space-y-3">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="h-16 animate-pulse rounded-xl bg-muted/50" />
					))}
				</div>
			</div>
		);
	}

	if (!data?.course) {
		return (
			<div className="mx-auto max-w-[640px] rounded-2xl border border-border p-10 text-center">
				<h1 className="text-lg font-semibold">{t("profileNotFound")}</h1>
				<Link
					href="/community/learn"
					className="mt-3 inline-block text-sm text-primary hover:underline"
				>
					{t("learnTitle")}
				</Link>
			</div>
		);
	}

	const { course, lessons, enrollment } = data;
	const completed = new Set(enrollment?.completedLessonIds ?? []);

	const enroll = async () => {
		setBusy(true);
		try {
			await apiClient.Community.enroll(course.slug);
			await refetch();
		} catch {
			toast.error(t("postFailed"));
		} finally {
			setBusy(false);
		}
	};

	const complete = async (lessonId: string) => {
		try {
			await apiClient.Community.completeLesson(course.id, lessonId);
			await refetch();
		} catch {
			toast.error(t("postFailed"));
		}
	};

	const submitQuiz = async (lesson: Lesson) => {
		const given = answers[lesson.id];
		if (!given || given.length !== (lesson.questions?.length ?? 0)) return;
		setBusy(true);
		try {
			const result = await apiClient.Community.submitQuiz(course.id, lesson.id, {
				answers: given,
			});
			if (result.passed) {
				toast.success(t("quizPassed", { score: result.score }));
				if (result.certification) {
					toast.success(t("certificationEarned", { title: result.certification.title }));
				}
			} else {
				toast.error(t("quizFailed", { score: result.score }));
			}
			await refetch();
		} catch {
			toast.error(t("postFailed"));
		} finally {
			setBusy(false);
		}
	};

	return (
		<article className="mx-auto w-full max-w-[760px] py-8">
			<header>
				<p className="text-xs uppercase tracking-wide text-muted-foreground">
					{course.level} · {t("minutes", { count: course.estimatedMinutes })}
				</p>
				<h1 className="mt-1 text-3xl font-bold">{course.title}</h1>
				{course.summary && (
					<p className="mt-2 text-muted-foreground">{course.summary}</p>
				)}

				{course.certificationTitle && (
					<p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium">
						<Award className="size-3.5 text-primary" aria-hidden />
						{course.certificationTitle}
					</p>
				)}

				{enrollment ? (
					<div className="mt-5">
						<div
							className="h-2 overflow-hidden rounded-full bg-muted"
							role="progressbar"
							aria-valuenow={enrollment.progressPercent}
							aria-valuemin={0}
							aria-valuemax={100}
						>
							<div
								className="h-full rounded-full bg-primary transition-[width] duration-500"
								style={{ width: `${enrollment.progressPercent}%` }}
							/>
						</div>
						<p className="mt-1.5 text-xs text-muted-foreground">
							{enrollment.progressPercent}% ·{" "}
							{t("lessons", { count: lessons.length })}
						</p>
					</div>
				) : (
					<Button
						className="mt-5"
						label={isAuthenticated ? t("startCourse") : t("startCourse")}
						loading={busy}
						onClick={() => {
							if (!isAuthenticated) {
								window.location.href = "/login";
								return;
							}
							void enroll();
						}}
					/>
				)}
			</header>

			{course.description && (
				<p className="mt-6 whitespace-pre-wrap leading-relaxed">
					{course.description}
				</p>
			)}

			<ol className="mt-8 space-y-3">
				{lessons.map((lesson, index) => {
					const done = completed.has(lesson.id);
					return (
						<li
							key={lesson.id}
							className={cn(
								"rounded-2xl border p-4 transition-colors",
								done ? "border-primary/40 bg-primary/5" : "border-border",
							)}
						>
							<div className="flex items-start gap-3">
								<span
									className={cn(
										"mt-0.5 shrink-0",
										done ? "text-primary" : "text-muted-foreground",
									)}
									aria-hidden
								>
									{done ? <Check className="size-5" /> : <Circle className="size-5" />}
								</span>

								<div className="min-w-0 flex-1">
									<h2 className="font-semibold">
										{index + 1}. {lesson.title}
									</h2>
									<p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
										<Clock className="size-3" aria-hidden />
										{t("minutes", { count: lesson.estimatedMinutes })}
									</p>

									{lesson.body && (
										<div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
											{lesson.body}
										</div>
									)}

									{lesson.kind === "quiz" && lesson.questions && enrollment && (
										<div className="mt-4 space-y-4">
											{lesson.questions.map((question, questionIndex) => (
												<fieldset key={questionIndex}>
													<legend className="text-sm font-medium">
														{question.prompt}
													</legend>
													<div className="mt-2 space-y-1.5">
														{question.options.map((option, optionIndex) => (
															<label
																key={optionIndex}
																className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
															>
																<input
																	type="radio"
																	name={`${lesson.id}-${questionIndex}`}
																	checked={
																		answers[lesson.id]?.[questionIndex] === optionIndex
																	}
																	onChange={() =>
																		setAnswers((current) => {
																			const next = [
																				...(current[lesson.id] ??
																					new Array(lesson.questions!.length).fill(-1)),
																			];
																			next[questionIndex] = optionIndex;
																			return { ...current, [lesson.id]: next };
																		})
																	}
																	className="accent-[var(--primary)]"
																/>
																{option}
															</label>
														))}
													</div>
													{/*
													  The explanation only exists once the answer key is
													  released, which is after passing.
													*/}
													{question.explanation && (
														<p className="mt-1.5 text-xs text-muted-foreground">
															{question.explanation}
														</p>
													)}
												</fieldset>
											))}

											<Button
												size="sm"
												label={t("submitAnswers")}
												loading={busy}
												onClick={() => void submitQuiz(lesson)}
											/>
										</div>
									)}

									{lesson.kind !== "quiz" && enrollment && !done && (
										<Button
											className="mt-3"
											size="sm"
											variant="secondary"
											label={t("completed")}
											onClick={() => void complete(lesson.id)}
										/>
									)}
								</div>
							</div>
						</li>
					);
				})}
			</ol>
		</article>
	);
}
