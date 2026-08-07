"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import ImageIcon from "@/components/svg/image.svg";
import MicIcon from "@/components/svg/mic.svg";
import SearchIcon from "@/components/svg/search.svg";
import CloseIcon from "@/components/svg/icon-close.svg";
import { Button } from "@/components/ui/button";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient.service";
import { SearchResult } from "@/types/search.types";
import { normalizeFlatSearchResults } from "@/lib/normalizers/search.normalizer";
import { cn } from "@/utils/cn.util";
import { PublicProfileModel } from "@/types/account/profile.type";
import { hydrateFollowState } from "@/store/follow.store";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";

const aiSuggestions = [
  { label: "Hidden Gems in Turkey", gradient: "from-[#437BD7] to-[#5629BD]" },
  { label: "Smart Travel", gradient: "from-[#3E34EF] to-[#E8177E]" },
  { label: "Monetize your Instagram", gradient: "from-[#D83D8C] to-[#FF9C58]" },
  { label: "Beach Getaways", gradient: "from-[#DC60EA] to-[#F94861]" },
  { label: "AI-Optimize your Business", gradient: "from-[#A113C4] to-[#76C9ED]" },
];
const related = ["Kittens", "Funny dogs", "Exotic animals", "Marine life", "Wildlife", "Horses", "Dangerous animals"];

const SearchBar = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState(searchQuery);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsMenuRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query.trim(), 250);

  const searchResultsQuery = useQuery({
    queryKey: ["global-search-results", debouncedQuery],
    queryFn: async () => {
      const response = await apiClient.Search.search({
        searchTerm: debouncedQuery,
        page: 1,
        limit: 6,
      });
      return normalizeFlatSearchResults(response.items);
    },
    enabled: false,
    staleTime: 60_000,
  });

  const searchResults: SearchResult[] = searchResultsQuery.data ?? [];
  const isLoading = searchResultsQuery.isFetching;
  const isTyping = query.trim().length > 0;

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const handleSearch = useCallback(
    (searchValue: string) => {
      if (!searchValue.trim()) return;
      router.push(`/discover?q=${encodeURIComponent(searchValue)}`);
      setQuery("");
      closeDropdown();
    },
    [router, closeDropdown]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setHighlightedIndex(-1);
      if (value.trim().length > 0) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    },
    []
  );

  const handleInputFocus = useCallback(() => {
    if (query.trim().length > 0) {
      setOpen(true);
    }
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const maxIndex = searchResults.length - 1;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const next = prev < maxIndex ? prev + 1 : 0;
            return next;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const next = prev > 0 ? prev - 1 : maxIndex;
            return next;
          });
          break;
        case "Enter":
          e.preventDefault();
          handleSearch(query);
          break;
        case "Escape":
          e.preventDefault();
          closeDropdown();
          break;
      }
    },
    [searchResults.length, handleSearch, closeDropdown, query]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  }, []);

  const handleVoiceResult = useCallback((transcript: string) => {
    setQuery(transcript);
    setOpen(true);
    inputRef.current?.focus();
  }, []);
  const voiceSearch = useVoiceSearch(handleVoiceResult);

  const showDropdown = open && (debouncedQuery.length >= 1 || searchResults.length > 0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDropdown]);

  useEffect(() => {
    if (highlightedIndex >= 0 && resultsMenuRef.current) {
      const items = resultsMenuRef.current.querySelectorAll<HTMLElement>("[data-search-result]");
      items[highlightedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const visibleResults = searchResults.slice(0, 6);
  useEffect(() => {
    if (Array.isArray(visibleResults)) {
      visibleResults.forEach((result) => {
        if (result.type === "profile" && result.publicProfile) {
          hydrateFollowState(result.publicProfile);
        }
      });
    }
  }, [visibleResults]);

  const renderDropdown = () => {
    if (!showDropdown) return null;

    return (
      <div
        ref={resultsMenuRef}
        role="dialog"
        aria-label="Search results"
        className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-card text-card-foreground shadow-[0px_8px_9px_0px_#6136FF40]"
      >
        {debouncedQuery.length < 3 && debouncedQuery.length > 0 && (
          <div className="px-4 py-6 text-center text-sm text-gray-neutral">
            Keep typing to search...
          </div>
        )}

        {debouncedQuery.length >= 3 && isLoading && (
          <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-gray-neutral">
            <div className="h-4 w-4 border-2 border-gray-neutral border-t-transparent rounded-full animate-spin"></div>
            Searching...
          </div>
        )}

        {debouncedQuery.length >= 3 && !isLoading && visibleResults.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-gray-neutral">
            No matching profiles or content found.
          </div>
        )}

        {visibleResults.length > 0 && (
          <div>
            {visibleResults.map((result, index) => {
              if (result.type === "profile") {
                const publicProfile = result.publicProfile as PublicProfileModel | undefined;
                return (
                  <button
                    key={`res-${result.id}`}
                    data-search-result
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSearch(result.title || debouncedQuery);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors",
                      highlightedIndex === index ? "bg-accent" : "hover:bg-accent/70"
                    )}
                  >
                    {publicProfile?.profileImage && (
                      <img src={publicProfile.profileImage} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-card-foreground">{result.title || "Profile"}</span>
                      <span className="block truncate text-xs text-gray-neutral">Profile</span>
                    </span>
                  </button>
                );
              }
              return (
                <button
                  key={`res-${result.id}`}
                  data-search-result
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSearch(result.title || debouncedQuery);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors",
                    highlightedIndex === index ? "bg-accent" : "hover:bg-accent/70"
                  )}
                >
                  {result.media?.thumbnailUrl && (
                    <img src={result.media.thumbnailUrl} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-card-foreground">{result.title}</span>
                    <span className="block truncate text-xs text-gray-neutral capitalize">{result.type}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {debouncedQuery.length >= 3 && !isLoading && (
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              handleSearch(debouncedQuery);
            }}
            className="w-full border-t border-border px-4 py-3 text-left text-sm font-medium text-primary transition-colors hover:bg-accent"
          >
            See all results for &quot;{debouncedQuery}&quot;
          </button>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Search input area */}
      <div className={cn("relative mb-5 sm:mb-8")}>
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-3 border rounded-lg transition-all",
            "bg-card border-border hover:border-ring",
            open && "border-primary ring-1 ring-primary/25"
          )}
        >
          <button
            type="button"
            onClick={() => handleSearch(query)}
            aria-label="Search"
            className="shrink-0"
          >
            <SearchIcon className="w-5 h-5 text-muted-foreground" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder="Search All Socials with AI-Powered Gaddr"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            autoComplete="off"
            aria-expanded={showDropdown ? "true" : "false"}
            role="combobox"
          />

          {isLoading ? (
            <div className="w-5 h-5 border-2 border-gray-neutral border-t-transparent rounded-full animate-spin shrink-0"></div>
          ) : query ? (
            <button
              onClick={handleClear}
              className="shrink-0 rounded p-1 transition-colors hover:bg-accent"
              aria-label="Clear search"
              type="button"
            >
              <CloseIcon className="w-5 h-5 text-muted-foreground" />
            </button>
          ) : null}

          <div className="flex items-center gap-2 border-l border-border pl-2">
            <ImageIcon
              className="cursor-pointer"
              onClick={(e: React.MouseEvent<SVGSVGElement>) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={voiceSearch.start}
              className="group rounded-md p-1.5 text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Search by voice"
            >
              <MicIcon className="size-5 text-primary group-hover:text-accent-foreground" />
            </button>
          </div>
        </div>
        {voiceSearch.error && <p className="mt-2 text-sm text-muted-foreground">{voiceSearch.error}</p>}
      </div>

      {/* AI Suggestions */}
      {pathname === "/discover" && !isTyping && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-sm">AI Suggestions : </span>
          {aiSuggestions.map((item) => (
            <Button
              key={item.label}
              type="button"
              onClick={() => handleSearch(item.label)}
              className={`bg-linear-to-r ${item.gradient} whitespace-nowrap transition`}
            >
              {item.label}
            </Button>
          ))}
        </div>
      )}

      {/* Related search suggestions */}
      {pathname === "/discover" && isTyping && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-sm">Related : </span>
          {related?.map((item) => (
            <Button
              key={item}
              type="button"
              onClick={() => handleSearch(item)}
              className="whitespace-nowrap border border-border bg-card text-foreground shadow-none transition hover:bg-muted"
            >
              {item}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
