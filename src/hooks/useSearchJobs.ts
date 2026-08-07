import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient.service";
import { queryKeys } from "@/lib/query-keys";
import type { JobSearchResult } from "@/services/api/job.service";

export interface UseSearchJobsParams {
  q?: string;
  status?: string;
  jobType?: string;
  locationType?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
  allowEmpty?: boolean;
}

interface UseSearchJobsReturn {
  jobs: JobSearchResult[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  page: number;
  totalResults: number;
  hasNextPage: boolean;
  retry: () => void;
}

export function createSearchJobsQueryOptions({
  q,
  status,
  jobType,
  locationType,
  page = 1,
  limit = 20,
  enabled = true,
  allowEmpty,
}: UseSearchJobsParams) {
  return {
    queryKey: queryKeys.searchJobs(
      q ?? "",
      status ?? "",
      jobType ?? "",
      locationType ?? "",
      page,
      limit,
    ),
    queryFn: async () => {
      const response = await apiClient.Job.search(
        q?.trim(),
        status || undefined,
        jobType || undefined,
        locationType || undefined,
        page,
        limit,
      );
      return {
        jobs: response.result ?? [],
        totalResults: response.total ?? 0,
        page,
      };
    },
    enabled: enabled && (allowEmpty || !!q?.trim()),
    staleTime: 30 * 1000,
  };
}

export const useSearchJobs = ({
  q,
  status,
  jobType,
  locationType,
  page = 1,
  limit = 20,
  enabled = true,
  allowEmpty,
}: UseSearchJobsParams): UseSearchJobsReturn => {
  const query = useQuery(createSearchJobsQueryOptions({
    q,
    status,
    jobType,
    locationType,
    page,
    limit,
    enabled,
    allowEmpty,
  }));

  const jobs = query.data?.jobs ?? [];
  const totalResults = query.data?.totalResults ?? 0;
  const currentPage = query.data?.page ?? page;
  const hasNextPage = currentPage * limit < totalResults;

  return {
    jobs,
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
