import { describe, expect, it } from "vitest";
import { metricDisplayValue, statusTone } from "./evaluation-ui.util";

describe("evaluation dashboard helpers", () => {
  it("formats quality metrics as percentages and latency as milliseconds", () => {
    expect(
      metricDisplayValue("recallAt5", {
        value: 0.86,
        threshold: 0.8,
        status: "pass",
        sampleSize: 100,
      }),
    ).toEqual({ value: 86, unit: "percent" });
    expect(
      metricDisplayValue("p95LatencyMs", {
        value: 1499.7,
        threshold: 1500,
        status: "pass",
        sampleSize: 100,
      }),
    ).toEqual({ value: 1500, unit: "milliseconds" });
  });

  it("uses a neutral tone for checks that have not run", () => {
    expect(statusTone("not_run")).toContain("bg-muted");
    expect(statusTone("fail")).toContain("text-destructive");
  });
});

