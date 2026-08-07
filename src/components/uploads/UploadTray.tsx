"use client";

import { CheckCircle2, Loader2, X, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUploads } from "@/providers/UploadProvider";

export function UploadTray() {
	const t = useTranslations("uploads");
	const { tasks, cancelUpload, dismissUpload } = useUploads();
	if (tasks.length === 0) return null;

	return (
		<aside
			aria-label={t("trayLabel")}
			className="fixed right-4 bottom-4 z-50 w-[min(24rem,calc(100vw-2rem))] space-y-2"
		>
			{tasks.map((task) => (
				<div key={task.id} className="rounded-xl border border-border bg-card p-3 text-card-foreground shadow-lg">
					<div className="flex items-start gap-3">
						{task.status === "uploading" ? (
							<Loader2 className="mt-0.5 size-5 shrink-0 animate-spin text-primary" />
						) : task.status === "completed" ? (
							<CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
						) : (
							<XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
						)}
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium">{task.fileName}</p>
							<p className="text-xs text-muted-foreground">
								{task.status === "uploading"
									? t("uploading", { progress: task.progress })
									: t(task.status)}
							</p>
							{task.status === "uploading" && (
								<div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
									<div
										className="h-full bg-primary transition-[width]"
										style={{ width: `${task.progress}%` }}
									/>
								</div>
							)}
							{task.error && <p className="mt-1 text-xs text-destructive">{t("errorHint")}</p>}
						</div>
						<button
							type="button"
							onClick={() =>
								task.status === "uploading" ? cancelUpload(task.id) : dismissUpload(task.id)
							}
							className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
							aria-label={task.status === "uploading" ? t("cancelAction") : t("dismissAction")}
						>
							<X className="size-4" />
						</button>
					</div>
				</div>
			))}
		</aside>
	);
}
