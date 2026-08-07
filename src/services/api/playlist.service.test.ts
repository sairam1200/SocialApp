import { describe, expect, it } from "vitest";
import {
  findPlaylistByName,
  normalizePlaylist,
  normalizePlaylists,
} from "./playlist.service";

const playlist = {
  id: "collection-1",
  referenceId: "travel",
  name: "Travel",
  owner: { id: "user-1", userName: "alex", displayName: "Alex" },
};

describe("playlist response normalization", () => {
  it.each([
    ["bare", [playlist]],
    ["result wrapper", { result: [playlist] }],
    ["data wrapper", { data: [playlist] }],
  ])("accepts a %s collection list", (_label, response) => {
    expect(normalizePlaylists(response)).toEqual([playlist]);
  });

  it("unwraps a newly-created collection", () => {
    expect(normalizePlaylist({ data: { result: playlist } })).toEqual(playlist);
  });

  it("returns safe empty values for malformed responses", () => {
    expect(normalizePlaylists({ data: null })).toEqual([]);
    expect(normalizePlaylist({ data: null })).toBeNull();
  });

  it("finds existing collection names case-insensitively", () => {
    expect(findPlaylistByName({ data: [playlist] }, " travel ")).toEqual(playlist);
    expect(findPlaylistByName([playlist], "School")).toBeUndefined();
  });

  it("allows different owners to use the same common collection name", () => {
    const samTravel = {
      ...playlist,
      id: "collection-2",
      referenceId: "sam-travel",
      owner: { id: "user-2", userName: "sam", displayName: "Sam" },
    };
    expect(findPlaylistByName([playlist, samTravel], "Travel", "sam")).toEqual(
      samTravel,
    );
    expect(findPlaylistByName([playlist], "Travel", "sam")).toBeUndefined();
  });
});
