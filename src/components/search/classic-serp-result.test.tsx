import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import messages from "@/i18n/messages/en.json";
import { SearchEntityType, type SearchResult } from "@/types/search.types";
import { ClassicSerpResult } from "./ClassicSerpResult";

function renderResult(result: SearchResult) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
      <ClassicSerpResult result={result} />
    </NextIntlClientProvider>,
  );
}

describe("ClassicSerpResult", () => {
  it("does not turn an executable URL into a link", () => {
    renderResult({
      id: "unsafe-result",
      type: SearchEntityType.CONTENT,
      description: "Untrusted cached result",
      platform: "youtube",
      title: "Unsafe result",
      url: "javascript:alert(document.domain)",
    });

    expect(screen.getByText("Unsafe result")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
