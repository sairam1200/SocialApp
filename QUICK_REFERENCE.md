# Quick Reference Guide

## File Locations

### Type Definitions
- `src/types/search.types.ts` - All search-related types

### API Service
- `src/services/api/search.service.ts` - REST endpoints
- `src/services/apiClient.service.ts` - Client configuration

### Custom Hooks
- `src/hooks/useSearch.ts` - Search state management
- `src/hooks/useTrending.ts` - Trending content management

### UI Components
- `src/components/search/SearchInput.tsx` - Search input field
- `src/components/search/SearchResults.tsx` - Results display
- `src/components/search/TrendingSection.tsx` - Trending items
- `src/components/search/index.ts` - Component exports

### Integration
- `src/app/(dashboard)/discover/page.tsx` - Discover page with search

---

## API Endpoints

### Search
```
POST /search
Body: SearchRequest
Returns: SearchResponse
```

### Trending
```
GET /search/trending?platforms=twitter,instagram&limit=10
Returns: TrendingResponse
```

---

## Usage Examples

### Basic Search
```tsx
import { useSearch } from "@/hooks/useSearch";

const { results, isLoading, search, debouncedSearch } = useSearch({
  useMockData: true
});

// Debounced search (recommended)
debouncedSearch("javascript", ["twitter", "instagram"]);

// Direct search
search("javascript", ["twitter"], {}, 1);
```

### Trending Content
```tsx
import { useTrending } from "@/hooks/useTrending";

const { items, isLoading, isError } = useTrending(
  ["twitter", "instagram"],
  true
);
```

### UI Components
```tsx
import { SearchInput, SearchResults, TrendingSection } from "@/components/search";

<SearchInput
  value={query}
  onChange={setQuery}
  onSearch={handleSearch}
  isLoading={loading}
/>

<SearchResults
  results={results}
  isLoading={loading}
  isError={error}
  viewType="grid"
/>

<TrendingSection
  items={trending}
  isLoading={loading}
  onItemClick={handleTrendingClick}
/>
```

---

## State Management

### useSearch Returns
```typescript
{
  results: SearchResult[];          // Search results
  isLoading: boolean;               // Loading state
  isError: boolean;                 // Error state
  error: Error | null;              // Error object
  page: number;                     // Current page
  totalResults: number;             // Total available
  hasNextPage: boolean;             // More pages available
  paginationTokens: Record;         // Platform-specific tokens
  search: Function;                 // Direct search
  debouncedSearch: Function;        // Debounced search
  nextPage: Function;               // Go to next page
  previousPage: Function;           // Go to previous page
}
```

### useTrending Returns
```typescript
{
  items: TrendingItem[];            // Trending topics
  isLoading: boolean;               // Loading state
  isError: boolean;                 // Error state
  error: Error | null;              // Error object
}
```

---

## Tailwind Classes Used

### Common
- `shrink-0` - Prevent shrinking
- `gap-2`, `gap-3`, `gap-4` - Spacing
- `px-4`, `py-3` - Padding
- `rounded-lg` - Border radius
- `bg-white`, `bg-[#F0F0F0]` - Colors
- `text-gray-900`, `text-gray-600` - Text colors
- `flex`, `grid`, `flex-col` - Layout

### States
- `hover:` - Hover effects
- `focus:` - Focus effects
- `disabled:` - Disabled state
- `animate-pulse` - Loading skeleton

### Responsive
- `md:`, `lg:` - Media queries
- `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` - Responsive grid

---

## Mock Data Examples

### Search Result
```json
{
  "id": "mock-twitter-5",
  "type": "post",
  "platform": "twitter",
  "title": "javascript - Result 5",
  "description": "This is a mock post...",
  "author": {
    "name": "Creator 5",
    "handle": "@creator5",
    "profileImage": "/icons/gaddr-logo-xs.svg"
  },
  "engagement": {
    "views": 25000,
    "likes": 1500,
    "comments": 200,
    "shares": 50
  }
}
```

### Trending Item
```json
{
  "id": "trend-1",
  "title": "#TechTrends2025",
  "category": "Technology",
  "trendScore": 95,
  "platforms": ["twitter", "instagram"],
  "growth": 45
}
```

---

## Configuration

### Enable/Disable Features

**Use Mock Data (Development)**
```tsx
const search = useSearch({ useMockData: true });
```

**Use Real API (Production)**
```tsx
const search = useSearch({ useMockData: false });
```

**Custom Debounce Delay**
```tsx
const search = useSearch({ debounceMs: 500 });
```

---

## Common Tasks

### Search on Input Change
```tsx
const handleChange = (value: string) => {
  setQuery(value);
  search State.debouncedSearch(
    value,
    selectedPlatforms,
    filters,
    1
  );
};
```

### Handle Pagination
```tsx
const handleNextPage = () => {
  searchState.nextPage(query, selectedPlatforms, filters);
};
```

### Display Trending Items
```tsx
{trendingState.items.map(item => (
  <div key={item.id} onClick={() => handleTrendingClick(item)}>
    {item.title}
    <span>{item.trendScore}</span>
  </div>
))}
```

---

## Debugging

### Check Loading State
```tsx
{isLoading && <Spinner />}
```

### Check Error State
```tsx
{isError && (
  <ErrorMessage error={error} onRetry={handleRetry} />
)}
```

### Console Logging
```tsx
useEffect(() => {
  console.log("Results:", results);
  console.log("Loading:", isLoading);
  console.log("Error:", error);
}, [results, isLoading, error]);
```

### Mock Data Testing
```tsx
// Enable mock data
useMockData: true

// Test with various queries
"javascript", "react", "web development"

// Check pagination
page 1 → 2 → 3 (only goes to 8 pages with mock data)
```

---

## Performance Tips

1. **Use Debounced Search** - Reduces API calls
2. **Paginate Results** - Limits data transfer
3. **Memoize Callbacks** - Prevent unnecessary renders
4. **Lazy Load Components** - Load on demand
5. **Cache Trending** - Fetch once, reuse

---

## Browser DevTools

### Network Tab
- Monitor API calls to `/api/v1/search`
- Check response times
- Verify request payloads

### Console Tab
- Check for TypeScript errors
- Verify hook output
- Debug state changes

### React DevTools
- Inspect component props
- Check hook state
- Profile performance

---

## Links & References

- [Gaddr Backend](https://gaddr-backend-api.onrender.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks](https://react.dev/reference/react/hooks)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)

---

## Support & Troubleshooting

**Issue: No results showing**
- Check `useMockData` setting
- Verify query is not empty
- Check browser console for errors

**Issue: Styling looks broken**
- Ensure Tailwind CSS is loaded
- Check class names syntax
- Clear browser cache

**Issue: Search not working**
- Verify API endpoint is correct
- Check network requests in DevTools
- Test with mock data first

---

**Last Updated**: January 26, 2025
**Status**: Production Ready
