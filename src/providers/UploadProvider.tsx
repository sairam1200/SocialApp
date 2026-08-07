"use client";

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { uploadVideo, type UploadVideoResult } from "@/services/api/upload-video.service";

export type UploadTaskStatus = "uploading" | "completed" | "cancelled" | "error";

export interface UploadTask {
	id: string;
	fileName: string;
	progress: number;
	status: UploadTaskStatus;
	error?: string;
	result?: UploadVideoResult;
}

interface UploadContextValue {
	tasks: UploadTask[];
	startUpload: (id: string, file: File) => Promise<UploadVideoResult>;
	cancelUpload: (id: string) => void;
	dismissUpload: (id: string) => void;
}

type UploadActions = Omit<UploadContextValue, "tasks">;

const UploadContext = createContext<UploadContextValue | null>(null);
const UploadActionsContext = createContext<UploadActions | null>(null);

export function UploadProvider({ children }: { children: ReactNode }) {
	const [tasks, setTasks] = useState<UploadTask[]>([]);
	const controllers = useRef(new Map<string, AbortController>());
	const promises = useRef(new Map<string, Promise<UploadVideoResult>>());

	const patchTask = useCallback((id: string, patch: Partial<UploadTask>) => {
		setTasks((current) => current.map((task) => (task.id === id ? { ...task, ...patch } : task)));
	}, []);

	const startUpload = useCallback(
		(id: string, file: File) => {
			const active = promises.current.get(id);
			if (active) return active;
			const controller = new AbortController();
			controllers.current.set(id, controller);
			setTasks((current) => [
				...current.filter((task) => task.id !== id),
				{ id, fileName: file.name, progress: 0, status: "uploading" },
			]);

			const promise = uploadVideo(file, (progress) => patchTask(id, { progress }), controller.signal)
				.then((result) => {
					patchTask(id, { status: "completed", progress: 100, result });
					return result;
				})
				.catch((error: Error) => {
					const cancelled = error.name === "AbortError";
					patchTask(id, {
						status: cancelled ? "cancelled" : "error",
						error: cancelled ? undefined : error.message,
					});
					throw error;
				})
				.finally(() => {
					controllers.current.delete(id);
					promises.current.delete(id);
				});
			promises.current.set(id, promise);
			return promise;
		},
		[patchTask]
	);

	const cancelUpload = useCallback((id: string) => controllers.current.get(id)?.abort(), []);
	const dismissUpload = useCallback((id: string) => {
		setTasks((current) => current.filter((task) => task.id !== id || task.status === "uploading"));
	}, []);
	const actions = useMemo(
		() => ({ startUpload, cancelUpload, dismissUpload }),
		[startUpload, cancelUpload, dismissUpload]
	);
	const value = useMemo(() => ({ tasks, ...actions }), [tasks, actions]);
	return (
		<UploadActionsContext.Provider value={actions}>
			<UploadContext.Provider value={value}>{children}</UploadContext.Provider>
		</UploadActionsContext.Provider>
	);
}

export function useUploadActions(): UploadActions {
	const value = useContext(UploadActionsContext);
	if (!value) throw new Error("useUploadActions must be used inside UploadProvider");
	return value;
}

export function useUploads(): UploadContextValue {
	const value = useContext(UploadContext);
	if (!value) throw new Error("useUploads must be used inside UploadProvider");
	return value;
}
