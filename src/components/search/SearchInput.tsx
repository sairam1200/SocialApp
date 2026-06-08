"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
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

/**
 * SearchInput Component
 * Provides a search input field with optional suggestions dropdown
 */
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
        const containerRef = useRef<HTMLDivElement>(null);

        // Close suggestions when clicking outside
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

        const handleClear = () => {
            onChange("");
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                onSearch(value);
                setIsFocused(false);
            }
        };

        const handleSuggestionClick = (suggestion: string) => {
            onChange(suggestion);
            onSearch(suggestion);
            onSuggestionClick?.(suggestion);
            setIsFocused(false);
        };

        return (
            <div ref={containerRef} className={cn("relative w-full", className)}>
                <div
                    className={cn(
                        "flex items-center gap-2 px-4 py-3 border rounded-lg transition-all",
                        "bg-white border-[#E6E6E6] hover:border-[#CCCCCC]",
                        isFocused && "border-black-default ring-1 ring-black-default/20"
                    )}
                >
                    <Search className="w-5 h-5 text-gray-neutral shrink-0" />
                    <input
                        ref={ref}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        placeholder={placeholder}
                        className={cn(
                            "flex-1 bg-transparent text-sm outline-none",
                            "placeholder-gray-neutral text-gray-neutral",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                        disabled={isLoading}
                    />

                    {isLoading ? (
                        <Loader2 className="w-5 h-5 text-gray-neutral animate-spin shrink-0" />
                    ) : value ? (
                        <button
                            onClick={handleClear}
                            className="p-1 hover:bg-gray-100 rounded transition-colors shrink-0"
                            aria-label="Clear search"
                        >
                            <X className="w-5 h-5 text-gray-neutral" />
                        </button>
                    ) : null}
                </div>

                {/* Suggestions Dropdown */}
                {isFocused &&
                    showSuggestions &&
                    suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E6E6E6] rounded-lg shadow-lg z-50 overflow-hidden">
                            <div className="max-h-64 overflow-y-auto">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className={cn(
                                            "w-full px-4 py-3 text-left text-sm transition-colors",
                                            "hover:bg-[#F5F5F5] flex items-center gap-2",
                                            "text-gray-neutral hover:text-gray-default"
                                        )}
                                    >
                                        <Search className="w-4 h-4 text-gray-neutral shrink-0" />
                                        <span className="truncate">{suggestion}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                {/* Empty Suggestions State */}
                {isFocused &&
                    showSuggestions &&
                    value &&
                    suggestions.length === 0 &&
                    !isLoading && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E6E6E6] rounded-lg shadow-lg z-50 p-4">
                            <p className="text-sm text-gray-neutral text-center">
                                No suggestions found
                            </p>
                        </div>
                    )}
            </div>
        );
    }
);

SearchInput.displayName = "SearchInput";
