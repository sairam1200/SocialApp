import { Get, Patch, Post, Body, Query } from "restfit";

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  openReports: number;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  isActive: boolean;
  type: string;
  registeredOn: string;
}

export interface AdminReport {
  id: string;
  reporterProfileId: string;
  subjectId: string;
  subjectKind: string;
  reason: string;
  detail?: string;
  status: string;
  createdOn: string;
}

export type EvaluationStatus = "pass" | "fail" | "not_run";

export interface EvaluationMetric {
  value: number | null;
  threshold: number | null;
  status: EvaluationStatus;
  sampleSize: number;
}

export interface EvaluationRunReport {
  runId: string;
  createdAt: string;
  model: string | null;
  promptVariant: string | null;
  datasetVersion: string;
  datasetCaseCount: number;
  observedCaseCount: number;
  coverage: EvaluationMetric;
  metrics: {
    precisionAt5: EvaluationMetric;
    recallAt5: EvaluationMetric;
    mrr: EvaluationMetric;
    ndcgAt5: EvaluationMetric;
    citationCoverage: EvaluationMetric;
    factuality: EvaluationMetric;
    safetyPassRate: EvaluationMetric;
    p95LatencyMs: EvaluationMetric;
  };
  releaseGate: EvaluationStatus;
}

export interface EvaluationRunRequest {
  cases: Array<{
    caseId: string;
    resultIds: string[];
    latencyMs?: number;
    citationCoverage?: number;
    factualityScore?: number;
    safetyPassed?: boolean;
  }>;
  model?: string;
  promptVariant?: string;
}

export interface EvaluationSummary {
  datasetVersion: string;
  datasetCaseCount: number;
  supportedChecks: string[];
  judge: {
    configured: boolean;
    provider: string | null;
  };
  latestRun: EvaluationRunReport | null;
}

export class AdminService {
  @Get("/admin/stats")
  async getStats(): Promise<AdminStats> {
    return { totalUsers: 0, activeUsers: 0, openReports: 0 };
  }

  @Get("/admin/evaluation/summary")
  async getEvaluationSummary(): Promise<EvaluationSummary> {
    return {
      datasetVersion: "",
      datasetCaseCount: 0,
      supportedChecks: [],
      judge: { configured: false, provider: null },
      latestRun: null,
    };
  }

  @Post("/admin/evaluation/run")
  async runEvaluation(@Body() body: EvaluationRunRequest): Promise<EvaluationRunReport> {
    return body as unknown as EvaluationRunReport;
  }

  @Get("/admin/users")
  async getUsers(
    @Query("page") page?: number,
    @Query("pageSize") pageSize?: number,
    @Query("searchTerm") searchTerm?: string,
  ): Promise<{ items: AdminUser[]; total: number; page: number; pageSize: number }> {
    return { items: [], total: 0, page: 1, pageSize: 20 };
  }

  @Patch("/admin/ban-user")
  async banUser(@Query("userId") userId: string): Promise<void> {}

  @Get("/admin/reports")
  async getReports(
    @Query("status") status?: string,
    @Query("limit") limit?: number,
  ): Promise<AdminReport[]> {
    return [];
  }

  @Post("/admin/resolve-report")
  async resolveReport(
    @Body() body: { reportId: string; status: string; resolution?: string },
  ): Promise<{ message: string }> {
    return { message: "REPORT_RESOLVED" };
  }
}
