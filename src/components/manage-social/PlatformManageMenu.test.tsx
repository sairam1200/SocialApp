import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PlatformManageMenu, { type PlatformWithState } from "./PlatformManageMenu";

const integrationMock = vi.hoisted(() => ({
  importContent: vi.fn(),
  getImportStatus: vi.fn(),
  cancelImport: vi.fn(),
}));

vi.mock("@/services/apiClient.service", () => ({
  apiClient: { Integration: integrationMock },
}));

const platform: PlatformWithState = {
  id: "youtube",
  name: "YouTube",
  urlPrefix: "https://youtube.com/",
  icon: () => null,
  connected: true,
  connectionMethod: "import",
  importStatus: "not_imported",
  oauthStatus: "ready",
  capabilities: { manualLink: true, oauth: true, importContent: true },
};

function renderMenu(overrides: Partial<PlatformWithState> = {}) {
  const onImportStatusChange = vi.fn();
  const onStopImporting = vi.fn().mockResolvedValue(undefined);
  render(
    <PlatformManageMenu
      platform={{ ...platform, ...overrides }}
      menuId="youtube-menu"
      openMenuId="youtube-menu"
      setOpenMenuId={vi.fn()}
      onImportStatusChange={onImportStatusChange}
      onAuthenticate={vi.fn()}
      onStopImporting={onStopImporting}
      onDisconnect={vi.fn()}
    />
  );
  return { onImportStatusChange, onStopImporting };
}

describe("PlatformManageMenu import job truth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    integrationMock.importContent.mockResolvedValue({ message: "queued" });
    integrationMock.getImportStatus.mockResolvedValue({
      platform: "youtube",
      jobId: "youtube-import-user",
      status: "running",
      progress: 10,
    });
  });

  it("keeps an accepted import in progress instead of claiming completion", async () => {
    const user = userEvent.setup();
    const { onImportStatusChange } = renderMenu();

    await user.click(screen.getByRole("button", { name: "Import content" }));
    await waitFor(() => expect(integrationMock.importContent).toHaveBeenCalled());

    expect(onImportStatusChange).toHaveBeenCalledWith("youtube", "importing");
    expect(onImportStatusChange).not.toHaveBeenCalledWith("youtube", "imported");
  });

  it("offers real cancellation while an import is running", async () => {
    const user = userEvent.setup();
    const { onStopImporting } = renderMenu({ importStatus: "importing" });

    await user.click(screen.getByRole("button", { name: "Stop importing" }));

    expect(onStopImporting).toHaveBeenCalledWith("youtube", "YouTube");
  });
});
