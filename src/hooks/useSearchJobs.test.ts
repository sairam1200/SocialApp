import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSearchJobsQueryOptions } from "./useSearchJobs";

const { search } = vi.hoisted(() => ({ search: vi.fn() }));

vi.mock("@/services/apiClient.service", () => ({
  apiClient: { Job: { search } },
}));

describe("createSearchJobsQueryOptions", () => {
  beforeEach(() => search.mockReset());

  it("includes every filter in the cache key and sends it to the backend", async () => {
    search.mockResolvedValue({ result: [], total: 0 });
    const options = createSearchJobsQueryOptions({
      q: " designer ",
      status: "open",
      jobType: "contract",
      locationType: "remote",
      page: 2,
      limit: 10,
    });

    expect(options.queryKey).toEqual([
      "jobs",
      "search",
      " designer ",
      "open",
      "contract",
      "remote",
      2,
      10,
    ]);
    await options.queryFn();
    expect(search).toHaveBeenCalledWith(
      "designer",
      "open",
      "contract",
      "remote",
      2,
      10,
    );
  });
});
