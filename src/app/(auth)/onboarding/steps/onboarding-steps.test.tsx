import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StepOneAbout } from "./StepAbout";
import { StepTwoInterests } from "./StepInterests";
import { StepThreeSocials } from "./StepSocials";
import type { ProfileFormData } from "./types";
import { StepIndicator } from "../StepIndicator";

const { connect } = vi.hoisted(() => ({ connect: vi.fn() }));

vi.mock("@/services/apiClient.service", () => ({
  apiClient: { Integration: { connect } },
}));

const baseFormData: ProfileFormData = {
  username: "valid.user",
  email: "user@example.com",
  bio: "",
  interests: [],
  connectedAccounts: {},
};

describe("onboarding steps", () => {
  beforeEach(() => {
    connect.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("allows step one to continue with a valid username and an empty optional bio", () => {
    const onNext = vi.fn();
    render(
      <StepOneAbout
        formData={baseFormData}
        handleChange={vi.fn()}
        handleImageChange={vi.fn()}
        onNext={onNext}
      />,
    );

    const continueButton = screen.getByRole("button", {
      name: "Continue to next step",
    });
    expect(continueButton).toBeEnabled();
    fireEvent.click(continueButton);
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("opens external authorization in a separate popup", async () => {
    connect.mockResolvedValue({
      authorizeURL: "https://accounts.example/authorize",
    });
    const popup = {
      location: { href: "" },
      focus: vi.fn(),
      close: vi.fn(),
    };
    const open = vi
      .spyOn(window, "open")
      .mockReturnValue(popup as unknown as Window);

    render(
      <StepThreeSocials
        formData={baseFormData}
        setFormData={vi.fn()}
        isSubmitting={false}
        onBack={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Connect Facebook" }));
    await waitFor(() => {
      expect(popup.location.href).toBe("https://accounts.example/authorize");
    });
    expect(open).toHaveBeenCalledWith(
      "",
      "gaddr-facebook-oauth",
      expect.stringContaining("popup=yes"),
    );
    expect(popup.focus).toHaveBeenCalledOnce();
  });

  it("uses the theme foreground colour for unselected interest labels", () => {
    render(
      <StepTwoInterests
        formData={baseFormData}
        topics={[{ id: "art", name: "Art & Design", icon: "🎨" }]}
        toggleInterest={vi.fn()}
        onBack={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByText("Art & Design")).toHaveClass("text-foreground");
  });

  it("keeps step labels legible on the light onboarding gradient", () => {
    render(<StepIndicator step={4} />);

    expect(screen.getByText("Connected profiles")).toHaveClass(
      "text-[#24183f]",
    );
    expect(screen.getByText("Review profile")).toHaveClass("text-[#24183f]");
  });
});
