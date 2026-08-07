import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { GaddrProduct } from "../estate";
import { GaddrSwitcher } from "./GaddrSwitcher";

const platformProduct: GaddrProduct = {
  id: "search",
  name: "Search",
  blurbKey: "products.search",
  href: "https://demo.gaddr.com/discover",
  status: "live",
  group: "platform",
  current: true,
};

const labProduct: GaddrProduct = {
  id: "neurtask",
  name: "NeurTask",
  blurbKey: "products.neurtask",
  href: "https://neurtask.com",
  status: "live",
  group: "labs",
};

const messages: Record<string, string> = {
  "products.switch": "Switch Gaddr product",
  "products.label": "Gaddr products",
  "products.platformHeading": "One account, all of Gaddr",
  "products.labsHeading": "AI incubator",
  "products.expandLabs": "Show AI incubator products",
  "products.collapseLabs": "Hide AI incubator products",
  "products.youAreHere": "You are here",
  "products.soon": "Soon",
  "products.search": "Search across Gaddr",
  "products.neurtask": "Meeting notes and tasks",
};

describe("GaddrSwitcher", () => {
  it("stays collapsed through the AI incubator heading until its arrow is hovered", () => {
    render(
      <GaddrSwitcher
        products={[platformProduct]}
        labs={[labProduct]}
        t={(key) => messages[key] ?? key}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Switch Gaddr product" }),
    );

    expect(screen.getByText("AI incubator")).toBeInTheDocument();
    const labs = document.querySelector<HTMLElement>("[id$='-labs']");
    expect(labs).toHaveAttribute("hidden");

    fireEvent.pointerEnter(
      screen.getByRole("button", { name: "Show AI incubator products" }),
      { pointerType: "mouse" },
    );

    expect(labs).not.toHaveAttribute("hidden");
    expect(screen.getByRole("link", { name: /NeurTask/ })).toBeInTheDocument();
  });

  it("returns to the collapsed state whenever the product menu closes", async () => {
    render(
      <GaddrSwitcher
        products={[platformProduct]}
        labs={[labProduct]}
        t={(key) => messages[key] ?? key}
      />,
    );
    const trigger = screen.getByRole("button", {
      name: "Switch Gaddr product",
    });
    fireEvent.click(trigger);
    fireEvent.pointerEnter(
      screen.getByRole("button", { name: "Show AI incubator products" }),
      { pointerType: "mouse" },
    );
    fireEvent.click(trigger);

    await waitFor(() =>
      expect(document.querySelector("[id$='-labs']")).toHaveAttribute("hidden"),
    );
  });
});
