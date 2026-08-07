"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send } from "lucide-react";
import { cn } from "@/utils/cn.util";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { apiClient } from "@/services/apiClient.service";
import { communityKeys, useConversations, useMessages } from "@/hooks/useCommunity";

/**
 * Direct messages.
 *
 * A two-pane layout that collapses to one on mobile: the list until a
 * conversation is chosen, then the thread. The chosen conversation is in the
 * URL (`?c=`), so a link to a specific thread works and the back button does
 * what it looks like it does.
 */
export function Conversations() {
	const t = useTranslations("community");
	const format = useFormatter();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();

	const [active, setActive] = useState<string | null>(searchParams.get("c"));
	const [draft, setDraft] = useState("");
	const [sending, setSending] = useState(false);
	const bottomRef = useRef<HTMLDivElement>(null);

	const { data: conversations, isLoading } = useConversations();
	const { data: messages } = useMessages(active ?? "");

	// Keep the newest message in view as the thread grows.
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ block: "end" });
	}, [messages?.length]);

	const send = async () => {
		if (!active || !draft.trim() || sending) return;
		const body = draft.trim();
		setDraft("");
		setSending(true);
		try {
			await apiClient.Community.sendMessage(active, { body });
			await queryClient.invalidateQueries({
				queryKey: communityKeys.messages(active),
			});
			await queryClient.invalidateQueries({
				queryKey: communityKeys.conversations(),
			});
		} catch {
			// Restore what they typed rather than losing it to a failed send.
			setDraft(body);
		} finally {
			setSending(false);
		}
	};

	return (
		<div className="mx-auto w-full max-w-[900px] py-6">
			<h1 className="mb-4 flex items-center gap-2 text-2xl font-bold">
				<MessageCircle className="size-6 text-primary" aria-hidden />
				{t("messages")}
			</h1>

			<div className="grid gap-4 md:grid-cols-[280px_1fr]">
				{/* ------------------------------------------------------ list */}
				<aside
					className={cn(
						"rounded-2xl border border-border",
						active && "hidden md:block",
					)}
				>
					{isLoading && (
						<ul className="space-y-2 p-3" aria-busy="true">
							{Array.from({ length: 4 }).map((_, i) => (
								<li key={i} className="h-14 animate-pulse rounded-xl bg-muted/50" />
							))}
						</ul>
					)}

					{!isLoading && (conversations?.length ?? 0) === 0 && (
						<p className="p-8 text-center text-sm text-muted-foreground">
							{t("noConversations")}
						</p>
					)}

					<ul className="divide-y divide-border">
						{(conversations ?? []).map((conversation) => {
							const other = conversation.participants[0];
							return (
								<li key={conversation.id}>
									<button
										type="button"
										onClick={() => setActive(conversation.id)}
										aria-current={active === conversation.id}
										className={cn(
											"flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted",
											active === conversation.id && "bg-muted",
										)}
									>
										<UserAvatar
											src={other?.avatarUrl}
											alt={other?.displayName ?? ""}
											size="sm"
										/>
										<span className="min-w-0 flex-1">
											<span className="block truncate text-sm font-medium">
												{conversation.title ?? other?.displayName ?? "—"}
											</span>
											<span className="block truncate text-xs text-muted-foreground">
												{conversation.lastMessagePreview ?? ""}
											</span>
										</span>
										{conversation.unreadCount > 0 && (
											<span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">
												{conversation.unreadCount}
											</span>
										)}
									</button>
								</li>
							);
						})}
					</ul>
				</aside>

				{/* ---------------------------------------------------- thread */}
				<section
					className={cn(
						"flex h-[560px] flex-col rounded-2xl border border-border",
						!active && "hidden md:flex",
					)}
				>
					{!active ? (
						<p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
							{t("noConversations")}
						</p>
					) : (
						<>
							<button
								type="button"
								onClick={() => setActive(null)}
								className="border-b border-border p-3 text-left text-sm text-primary md:hidden"
							>
								← {t("conversations")}
							</button>

							<ul className="flex-1 space-y-3 overflow-y-auto p-4">
								{(messages ?? []).map((message) => (
									<li key={message.id} className="flex gap-2">
										<UserAvatar
											src={message.sender.avatarUrl}
											alt={message.sender.displayName}
											size="xs"
											className="mt-0.5 shrink-0"
										/>
										<div className="min-w-0">
											<p className="text-xs text-muted-foreground">
												{message.sender.displayName}{" "}
												<time dateTime={message.createdOn}>
													{format.relativeTime(new Date(message.createdOn))}
												</time>
											</p>
											<p className="whitespace-pre-wrap break-words text-sm">
												{message.body}
											</p>
										</div>
									</li>
								))}
								<div ref={bottomRef} />
							</ul>

							<form
								className="flex gap-2 border-t border-border p-3"
								onSubmit={(event) => {
									event.preventDefault();
									void send();
								}}
							>
								<label htmlFor="message-input" className="sr-only">
									{t("messagePlaceholder")}
								</label>
								<input
									id="message-input"
									value={draft}
									onChange={(event) => setDraft(event.target.value.slice(0, 5000))}
									placeholder={t("messagePlaceholder")}
									className="min-w-0 flex-1 rounded-full border border-input bg-transparent px-4 py-2 text-sm outline-none focus:border-primary"
								/>
								<Button
									type="submit"
									size="icon-sm"
									aria-label={t("sendMessage")}
									icon={<Send className="size-4" />}
									disabled={!draft.trim() || sending}
								/>
							</form>
						</>
					)}
				</section>
			</div>
		</div>
	);
}
