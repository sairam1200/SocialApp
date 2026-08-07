import { describe, expect, it } from "vitest";
import { createApiService } from "restfit";
import { PlaylistService } from "./playlist.service";
import { SearchService } from "./search.service";

type RestfitTestInstance = {
  __axiosInstance: {
    defaults: {
      adapter: (config: unknown) => Promise<unknown>;
    };
  };
};

function captureUrls(service: object): string[] {
  const urls: string[] = [];
  const instance = service as unknown as RestfitTestInstance;
  instance.__axiosInstance.defaults.adapter = async (rawConfig: unknown) => {
    const config = rawConfig as { url?: string };
    urls.push(config.url ?? "");
    return {
      data: {},
      status: 200,
      statusText: "OK",
      headers: {},
      config: rawConfig,
    };
  };
  return urls;
}

describe("Restfit dynamic paths", () => {
  it("interpolates playlist path values instead of sending literal tokens", async () => {
    const service = createApiService(PlaylistService, {
      baseUrl: "https://api.test",
      resilience: false,
    });
    const urls = captureUrls(service);

    await service.getPlaylists("alex");
    await service.getPlaylist("collection-reference");
    await service.addContentToOwnedCollection("Summer Trip", {
      contentId: "post-1",
    });
    await service.deletePlaylist("collection-reference");

    expect(urls).toEqual([
      "/playlists/alex",
      "/playlist/get-by-id",
      "/playlist/owned/Summer%20Trip/content/add",
      "/playlist/collection-reference",
    ]);
  });

  it("interpolates engagement and profile path values", async () => {
    const service = createApiService(SearchService, {
      baseUrl: "https://api.test",
      resilience: false,
    });
    const urls = captureUrls(service);
    const id = "70d06643-1ca6-4da3-8239-a5abef3a277d";

    await service.getResultStats(id);
    await service.getProfileContentStreams("alex", 1, 24);

    expect(urls).toEqual([
      `/search/content-streams/${id}/stats`,
      "/search/profiles/alex/content-streams",
    ]);
  });
});
