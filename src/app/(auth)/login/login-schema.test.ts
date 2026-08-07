import { describe, expect, it } from "vitest";
import { loginSchema } from "./LoginFormClient";

describe("loginSchema", () => {
  it("reports both required fields on an empty submit", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "",
      rememberMe: false,
    });
    expect(result.success).toBe(false);
    if (result.success) return;

    const messages = result.error.issues.map((issue) => issue.message);
    expect(messages).toContain("Email is required");
    expect(messages).toContain("Password is required");
  });
});
