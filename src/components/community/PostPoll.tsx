"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn.util";
import type { Poll } from "@/types/community.type";

export interface PostPollProps {
	poll: Poll;
	onVote?: (optionId: string) => void;
	className?: string;
}

/**
 * A poll.
 *
 * Results are hidden until the reader votes or the poll closes — showing them
 * first anchors the answer, and a poll whose result you can see before
 * answering is a survey of who agreed with the leader.
 */
export function PostPoll({ poll, onVote, className }: PostPollProps) {
	const t = useTranslations("community");
	const hasVoted = Boolean(poll.viewerOptionId);
	const showResults = hasVoted || poll.isClosed;

	return (
		<div className={cn("space-y-2", className)} data-testid="post-poll">
			<ul className="space-y-2">
				{poll.options.map((option) => {
					const isChoice = poll.viewerOptionId === option.id;
					const percent = Math.round(option.share * 100);

					return (
						<li key={option.id}>
							<button
								type="button"
								disabled={showResults}
								onClick={() => onVote?.(option.id)}
								aria-pressed={isChoice}
								className={cn(
									"relative w-full overflow-hidden rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
									showResults
										? "cursor-default border-border"
										: "border-border hover:border-primary hover:bg-primary/5",
									isChoice && "border-primary",
								)}
							>
								{showResults && (
									<span
										aria-hidden
										className={cn(
											"absolute inset-y-0 left-0 transition-[width] duration-500",
											isChoice ? "bg-primary/20" : "bg-muted",
										)}
										style={{ width: `${percent}%` }}
									/>
								)}
								<span className="relative flex items-center justify-between gap-3">
									<span className="flex min-w-0 items-center gap-1.5">
										{isChoice && (
											<Check className="size-4 shrink-0 text-primary" aria-hidden />
										)}
										<span className="truncate">{option.label}</span>
									</span>
									{showResults && (
										<span className="shrink-0 tabular-nums font-medium">
											{percent}%
										</span>
									)}
								</span>
							</button>
						</li>
					);
				})}
			</ul>

			<p className="text-xs text-muted-foreground">
				{t("pollVotes", { count: poll.totalVotes })}
				{poll.isClosed ? ` · ${t("pollClosed")}` : ""}
			</p>
		</div>
	);
}
