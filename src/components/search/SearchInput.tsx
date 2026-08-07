    "use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import SearchIcon from "@/components/svg/search.svg";
import CloseIcon from "@/components/svg/icon-close.svg";
import { cn } from "@/utils/cn.util";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: (value: string) => void;
    isLoading?: boolean;
    placeholder?: string;
    showSuggestions?: boolean;
    suggestions?: string[];
    onSuggestionClick?: (suggestion: string) => void;
    className?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
    (
        {
            value,
            onChange,
            onSearch,
            isLoading = false,
            placeholder = "Search content, creators, and more...",
            showSuggestions = false,
            suggestions = [],
            onSuggestionClick,
            className,
        },
        ref
    ) => {
        const [isFocused, setIsFocused] = useState(false);
        const [activeIndex, setActiveIndex] = useState(-1);
        const containerRef = useRef<HTMLDivElement>(null);
        const listRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (
                    containerRef.current &&
                    !containerRef.current.contains(event.target as Node)
                ) {
                    setIsFocused(false);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        useEffect(() => {
            setActiveIndex(-1);
        }, [value, suggestions]);

        const handleClear = useCallback(() => {
            onChange("");
        }, [onChange]);

        const executeSearch = useCallback((term: string) => {
            onSearch(term);
            setIsFocused(false);
            setActiveIndex(-1);
        }, [onSearch]);

        const handleSuggestionClick = useCallback((suggestion: string) => {
            onChange(suggestion);
            executeSearch(suggestion);
            onSuggestionClick?.(suggestion);
        }, [onChange, executeSearch, onSuggestionClick]);

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (!showSuggestions || suggestions.length === 0) {
                if (e.key === "Enter") {
                    executeSearch(value);
                    onChange("");
                }
                return;
            }

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setActiveIndex((prev) =>
                        prev < suggestions.length - 1 ? prev + 1 : 0
                    );
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setActiveIndex((prev) =>
                        prev > 0 ? prev - 1 : suggestions.length - 1
                    );
                    break;
                case "Enter":
                    e.preventDefault();
                    if (activeIndex >= 0 && activeIndex < suggestions.length) {
                        handleSuggestionClick(suggestions[activeIndex]);
                    } else {
                        executeSearch(value);
                        onChange("");
                    }
                    break;
                case "Escape":
                    setIsFocused(false);
                    setActiveIndex(-1);
                    break;
            }
        };

        useEffect(() => {
            if (listRef.current && activeIndex >= 0) {
                const items = listRef.current.querySelectorAll<HTMLButtonElement>("button");
                if (items[activeIndex]) {
                    items[activeIndex].scrollIntoView({ block: "nearest" });
                }
            }
        }, [activeIndex]);

        return (
            <div ref={containerRef} className={cn("relative w-full", className)}>
                <div
                    className={cn(
                        "flex items-center gap-2 px-4 py-3 border rounded-lg transition-all",
                        "bg-background border-border hover:border-border/80",
                        isFocused && "border-black-default ring-1 ring-black-default/20"
                    )}
                >
                    <button
                        type="button"
                        onClick={() => executeSearch(value)}
                        aria-label="Search"
                        className="shrink-0"
                    >
                        <SearchIcon className="w-5 h-5 text-gray-neutral" />
                    </button>
                    <input
                        ref={ref}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        placeholder={placeholder}
                        aria-label="Search"
                        className={cn(
                            "flex-1 bg-transparent text-sm outline-none",
                            "placeholder-gray-neutral text-gray-neutral"
                        )}
                        autoComplete="off"
                        role="combobox"
                        aria-expanded={isFocused && showSuggestions && suggestions.length > 0}
                        aria-controls="search-suggestions-list"
                        aria-activedescendant={
                            activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
                        }
                    />

                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-gray-neutral border-t-transparent rounded-full animate-spin shrink-0"></div>
                    ) : value ? (
                        <button
                            onClick={handleClear}
                            className="p-1 hover:bg-muted rounded transition-colors shrink-0"
                            aria-label="Clear search"
                        >
                            <CloseIcon className="w-5 h-5 text-gray-neutral" />
                        </button>
                    ) : null}
                </div>

                {isFocused &&
                    showSuggestions &&
                    suggestions.length > 0 && (
                        <div
                            id="search-suggestions-list"
                            ref={listRef}
                            role="listbox"
                            className="absolute top-full left-0 right-0 mt-2 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg z-50 overflow-hidden"
                        >
                            <div className="max-h-64 overflow-y-auto">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        id={`suggestion-${index}`}
                                        role="option"
                                        aria-selected={index === activeIndex}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className={cn(
                                            "w-full px-4 py-3 text-left text-sm transition-colors",
                                            index === activeIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent text-muted-foreground hover:text-accent-foreground",
                                            "flex items-center gap-2"
                                        )}
                                    >
                                        <SearchIcon className="w-4 h-4 text-gray-neutral shrink-0" />
                                        <span className="truncate">{suggestion}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                {isFocused &&
                    showSuggestions &&
                    value &&
                    suggestions.length === 0 &&
                    !isLoading && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg z-50 p-4">
                            <p className="text-sm text-muted-foreground text-center">
                                No suggestions found
                            </p>
                        </div>
                    )}
            </div>
        );
    }
);

SearchInput.displayName = "SearchInput";
