import { Get, Query } from "restfit";

export interface ProjectSearchResult {
  id: number;
  title: string;
  description: string | null;
  budget: string | null;
  currency: string;
  paymentType: string;
  timeline: string | null;
  skills: string[];
  status: string;
  projectType: string;
  bountyAmount: string | null;
  trialDuration: number | null;
  hireOnCompletion: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSearchResponse {
  result: ProjectSearchResult[];
  total: number;
}

export class ProjectService {
  @Get("/projects/search")
  async search(
    @Query("q") q?: string,
    @Query("status") status?: string,
    @Query("projectType") projectType?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ): Promise<ProjectSearchResponse> {
    return { result: [], total: 0 };
  }
}
