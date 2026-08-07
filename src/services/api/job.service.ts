import { Get, Query } from "restfit";

export interface JobSearchResult {
  id: string | number;
  title: string;
  companyName: string;
  companyInitials: string;
  jobType: string;
  salaryType: string | null;
  currency: string;
  salaryMin: number | null;
  salaryMax: number | null;
  location: string;
  locationType: string | null;
  description: string | null;
  skills: string[];
  status: string;
  sourceType: string | null;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface JobSearchResponse {
  result: JobSearchResult[];
  total: number;
}

export class JobService {
  @Get("/jobs/search")
  async search(
    @Query("q") q?: string,
    @Query("status") status?: string,
    @Query("jobType") jobType?: string,
    @Query("locationType") locationType?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ): Promise<JobSearchResponse> {
    return { result: [], total: 0 };
  }

  @Get("/jobs/discover")
  async discover(
    @Query("q") q?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ): Promise<JobSearchResponse> {
    return { result: [], total: 0 };
  }
}
