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
import { GlobalSearchSuggestion } from "@/types/search.types";
import { cn } from "@/utils/cn.util";

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
  const listboxRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query.trim(), 250);

  const suggestionQuery = useQuery({
    queryKey: ["global-search-suggestions", debouncedQuery],
    queryFn: ({ signal }) => {
      const controller = new AbortController();
      signal?.addEventListener("abort", () => controller.abort());
      return apiClient.Search.getSuggestions(debouncedQuery);
    },
    enabled: debouncedQuery.length >= 3,
    staleTime: 60_000,
  });

  const suggestions: GlobalSearchSuggestion[] = suggestionQuery.data?.suggestions ?? [];
  const isLoading = suggestionQuery.isFetching;
  const isTyping = query.trim().length > 0;

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const handleSearch = useCallback(
    (searchValue: string) => {
      if (!searchValue.trim()) return;
      router.push(`/discover?q=${encodeURIComponent(searchValue)}`);
      closeDropdown();
    },
    [router, closeDropdown]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: GlobalSearchSuggestion) => {
      closeDropdown();
      if (suggestion.type === "user" && suggestion.userName) {
        router.push(`/u/${encodeURIComponent(suggestion.userName)}`);
        return;
      }
      if (suggestion.href) {
        window.location.assign(suggestion.href);
        return;
      }
      router.push(`/discover?q=${encodeURIComponent(suggestion.label)}`);
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
      const maxIndex = suggestions.length - 1;

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
          if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
            handleSuggestionClick(suggestions[highlightedIndex]);
          } else {
            handleSearch(query);
          }
          break;
        case "Escape":
          e.preventDefault();
          closeDropdown();
          break;
      }
    },
    [suggestions, highlightedIndex, handleSearch, handleSuggestionClick, closeDropdown, query]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  }, []);

  const showDropdown = open && (debouncedQuery.length >= 1 || (suggestionQuery.data?.suggestions?.length ?? 0) > 0);

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
    if (highlightedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll<HTMLElement>("[role='option']");
      items[highlightedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const visibleSuggestions = suggestions.slice(0, 5);
  const suggestionListId = "search-suggestions-listbox";

  const renderDropdown = () => {
    if (!showDropdown) return null;

    return (
      <div
        ref={listboxRef}
        role="listbox"
        id={suggestionListId}
        aria-label="Search suggestions"
        className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-[#E6E6E6] rounded-lg shadow-[0px_8px_9px_0px_#6136FF40] max-h-[60vh] overflow-y-auto"
      >
        {debouncedQuery.length < 3 && debouncedQuery.length > 0 && (
          <div className="px-4 py-6 text-center text-sm text-gray-neutral">
            Keep typing for suggestions...
          </div>
        )}

        {debouncedQuery.length >= 3 && isLoading && (
          <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-gray-neutral">
            <div className="h-4 w-4 border-2 border-gray-neutral border-t-transparent rounded-full animate-spin"></div>
            Searching...
          </div>
        )}

        {debouncedQuery.length >= 3 && !isLoading && visibleSuggestions.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-gray-neutral">
            No matching profiles or content found.
          </div>
        )}

        {visibleSuggestions.map((suggestion, index) => (
          <button
            key={`${suggestion.type}-${suggestion.id}`}
            role="option"
            aria-selected={highlightedIndex === index}
            id={`suggestion-${index}`}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleSuggestionClick(suggestion);
            }}
            onMouseEnter={() => setHighlightedIndex(index)}
            className={cn(
              "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors",
              highlightedIndex === index ? "bg-[#F0F0FF]" : "hover:bg-[#F5F5F5]"
            )}
          >
            <SearchIcon className="h-4 w-4 shrink-0 text-gray-neutral" />
            <span className="min-w-0">
              <span className="block truncate font-medium text-[#0D0D0D]">{suggestion.label}</span>
              {suggestion.type === "user" && suggestion.userName && (
                <span className="block truncate text-xs text-gray-neutral">@{suggestion.userName}</span>
              )}
            </span>
          </button>
        ))}
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
            "bg-white border-[#E6E6E6] hover:border-[#CCCCCC]",
            open && "border-black-default ring-1 ring-black-default/20"
          )}
        >
          <button
            type="button"
            onClick={() => handleSearch(query)}
            aria-label="Search"
            className="shrink-0"
          >
            <SearchIcon className="w-5 h-5 text-gray-neutral" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder="Search All Socials with AI-Powered Gaddr"
            className="flex-1 bg-transparent text-sm outline-none placeholder-gray-neutral text-gray-neutral"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls={showDropdown ? suggestionListId : undefined}
            aria-expanded={showDropdown ? "true" : "false"}
            aria-activedescendant={
              highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined
            }
            role="combobox"
          />

          {isLoading ? (
            <div className="w-5 h-5 border-2 border-gray-neutral border-t-transparent rounded-full animate-spin shrink-0"></div>
          ) : query ? (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded transition-colors shrink-0"
              aria-label="Clear search"
              type="button"
            >
              <CloseIcon className="w-5 h-5 text-gray-neutral" />
            </button>
          ) : null}

          <div className="flex items-center gap-2 pl-2 border-l border-[#E6E6E6]">
            <ImageIcon
              className="cursor-pointer"
              onClick={(e: React.MouseEvent<SVGSVGElement>) => e.stopPropagation()}
            />
            <MicIcon
              className="cursor-pointer"
              onClick={(e: React.MouseEvent<SVGSVGElement>) => e.stopPropagation()}
            />
          </div>
        </div>

        {renderDropdown()}
      </div>

      {/* AI Suggestions */}
      {pathname === "/discover" && !isTyping && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-sm">AI Suggestions : </span>
          {aiSuggestions.map((item) => (
            <Button
              key={item.label}
              onClick={() => {
                setQuery(item.label);
                setOpen(true);
              }}
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
              onClick={() => {
                setQuery(item);
                setOpen(true);
              }}
              className="whitespace-nowrap transition bg-white border border-[#A1A1A1] shadow-none text-black-default"
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
