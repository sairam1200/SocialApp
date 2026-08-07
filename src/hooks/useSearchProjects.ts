import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient.service";
import { queryKeys } from "@/lib/query-keys";
import type { ProjectSearchResult } from "@/services/api/project.service";

interface UseSearchProjectsParams {
  q?: string;
  status?: string;
  projectType?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
  allowEmpty?: boolean;
}

interface UseSearchProjectsReturn {
  projects: ProjectSearchResult[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  page: number;
  totalResults: number;
  hasNextPage: boolean;
  retry: () => void;
}

export const useSearchProjects = ({
  q,
  status,
  projectType,
  page = 1,
  limit = 20,
  enabled = true,
  allowEmpty,
}: UseSearchProjectsParams): UseSearchProjectsReturn => {
  const query = useQuery({
    queryKey: queryKeys.searchProjects(q ?? "", page, limit),
    queryFn: async () => {
      const response = await apiClient.Project.search(
        q?.trim(),
        status,
        projectType,
        page,
        limit
      );
      return {
        projects: response.result ?? [],
        totalResults: response.total ?? 0,
        page,
      };
    },
    enabled: enabled && (allowEmpty || !!q?.trim()),
    staleTime: 30 * 1000,
  });

  const projects = query.data?.projects ?? [];
  const totalResults = query.data?.totalResults ?? 0;
  const currentPage = query.data?.page ?? page;
  const hasNextPage = currentPage * limit < totalResults;

  return {
    projects,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error instanceof Error
      ? query.error
      : query.error
        ? new Error(String(query.error))
        : null,
    page: currentPage,
    totalResults,
    hasNextPage,
    retry: query.refetch,
  };
};
