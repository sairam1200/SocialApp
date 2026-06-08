# Search & Trending Content Integration

## Overview

This implementation adds a complete search functionality with trending content section to the Discover page. The system is fully integrated with the backend API while providing mock data fallback for development.

## Features

✅ **Dynamic Search** - Real-time search across multiple social media platforms
✅ **Pagination** - Navigate through search results with next/previous controls
✅ **Trending Content** - Display trending topics with growth metrics
✅ **Loading States** - Skeleton loaders for all async operations
✅ **Error Handling** - Comprehensive error states with retry functionality
✅ **Responsive Design** - Mobile and desktop optimized layouts
✅ **Mock Data Support** - Built-in mock data for development/testing
✅ **Platform Filtering** - Filter results by social media platforms
✅ **Advanced Filters** - Content type, metrics, date, and monetization filters

## Architecture

### New Files Created

#### Types
- [src/types/search.types.ts](src/types/search.types.ts) - TypeScript interfaces for search API
  - `SearchRequest` - Search query parameters
  - `SearchResponse` - API response structure
  - `SearchResult` - Individual result item
  - `TrendingItem` - Trending content structure
  - `TrendingResponse` - Trending API response

#### API Services
- [src/services/api/search.service.ts](src/services/api/search.service.ts) - REST API service
  - `search()` - POST /search - Main search endpoint
  - `getTrending()` - GET /search/trending - Trending content
  - `getSuggestions()` - GET /search/suggestions - Search suggestions

#### Custom Hooks
- [src/hooks/useSearch.ts](src/hooks/useSearch.ts) - Search management hook
  - State management for search results
  - Debounced search with configurable delay
  - Pagination support
  - Error handling with fallback to mock data
  
- [src/hooks/useTrending.ts](src/hooks/useTrending.ts) - Trending content hook
  - Fetch and manage trending items
  - Mock data generation
  - Loading and error states

#### Components
- [src/components/search/SearchInput.tsx](src/components/search/SearchInput.tsx) - Search input component
  - Text input with clear button
  - Loading indicator
  - Suggestions dropdown support
  - Focus/blur handling
  
- [src/components/search/SearchResults.tsx](src/components/search/SearchResults.tsx) - Results display
  - Grid/list view support
  - Loading skeleton animation
  - Error state with retry
  - Empty state handling
  
- [src/components/search/TrendingSection.tsx](src/components/search/TrendingSection.tsx) - Trending display
  - Trending items with growth metrics
  - Loading skeletons
  - Error state
  - Clickable items

#### Updated Files
- [src/services/apiClient.service.ts](src/services/apiClient.service.ts) - Added SearchService to API client
- [src/services/api/index.ts](src/services/api/index.ts) - Exported SearchService
- [src/hooks/index.ts](src/hooks/index.ts) - Exported new hooks
- [src/app/(dashboard)/discover/page.tsx](src/app/(dashboard)/discover/page.tsx) - Integrated search

## Usage

### Basic Search Implementation

```tsx
import { useSearch } from "@/hooks/useSearch";
import { SearchInput, SearchResults } from "@/components/search";

export function MySearchComponent() {
  const [query, setQuery] = useState("");
  const searchState = useSearch({ 
    debounceMs: 300,
    useMockData: true // Set to false to use real API
  });

  const handleSearch = (term: string) => {
    searchState.debouncedSearch(
      term,
      ["twitter", "instagram", "facebook"],
      { contentType: ["feed_post"] },
      1
    );
  };

  return (
    <>
      <SearchInput 
        value={query}
        onChange={setQuery}
        onSearch={handleSearch}
        isLoading={searchState.isLoading}
      />
      <SearchResults
        results={searchState.results}
        isLoading={searchState.isLoading}
        isError={searchState.isError}
        error={searchState.error}
        onRetry={() => handleSearch(query)}
      />
    </>
  );
}
```

### Trending Content

```tsx
import { useTrending } from "@/hooks/useTrending";
import { TrendingSection } from "@/components/search";

export function TrendingComponent() {
  const trending = useTrending(
    ["twitter", "instagram"],
    true // useMockData
  );

  return (
    <TrendingSection
      items={trending.items}
      isLoading={trending.isLoading}
      isError={trending.isError}
      onItemClick={(item) => console.log("Clicked:", item)}
    />
  );
}
```

## API Endpoints

### Search
**POST** `/search`

Request body:
```json
{
  "searchTerm": "string",
  "platforms": ["facebook", "instagram", "twitter"],
  "filter": {
    "contentType": ["feed_post"],
    "metrics": ["highest_liked"],
    "datePosted": "past_week",
    "monetization": ["contains_ads"]
  },
  "page": 1,
  "limit": 25,
  "paginationTokens": {
    "youtube": "CAoQAA",
    "facebook": "next_page_token"
  },
  "forceRefresh": false
}
```

Response:
```json
{
  "query": "string",
  "platforms": ["string"],
  "results": [...],
  "paginationTokens": {...},
  "totalResults": 0,
  "page": 0,
  "limit": 0,
  "hasNextPage": true
}
```

### Trending
**GET** `/search/trending?platforms=twitter,instagram&limit=10`

Response:
```json
{
  "items": [
    {
      "id": "trend-1",
      "title": "#TechTrends",
      "category": "Technology",
      "trendScore": 95,
      "platforms": ["twitter"],
      "growth": 45
    }
  ],
  "timestamp": "2025-01-26T..."
}
```

## Mock Data

Mock data is automatically generated in development. Key features:

- **Search Results**: Generates 100 mock results per query
- **Trending Items**: 5 predefined trending topics
- **Pagination**: Supports client-side pagination
- **Realistic Data**: Includes engagement metrics, dates, and user info

### Enable/Disable Mock Data

```tsx
// Use mock data
const search = useSearch({ useMockData: true });

// Use real API
const search = useSearch({ useMockData: false });
```

## Discover Page Integration

The updated Discover page now includes:

1. **Search Bar** - At the top of the page
2. **Search Results** - Dynamic results with pagination
3. **Trending Section** - Desktop sidebar + mobile collapsible
4. **Filters** - Apply to search results
5. **View Toggle** - Grid/List view for results

### Layout

**Desktop**: Search → Tabs → [Results | Filters + Trending]
**Mobile**: Search → Trending → Tabs → Results + Filters

## Error Handling

### Search Errors
- Network failures → Display error with retry button
- Invalid query → Show "No results found"
- API errors → Fallback to mock data if enabled

### Trending Errors
- Load failure → Show error message
- With mock enabled → Display mock data as fallback

## Loading States

### SearchResults Component
- Shows 12 animated skeleton cards
- Maintains grid/list layout during load
- Smooth transition to real content

### TrendingSection Component
- Shows 5 skeleton items
- Animated placeholders
- Consistent sizing

## Performance Optimizations

1. **Debounced Search** - Reduces API calls (default 300ms)
2. **Pagination** - Limits results per page
3. **Memoization** - Prevents unnecessary re-renders
4. **Lazy Loading** - Components load on demand

## Configuration

### Search Hook Options

```tsx
interface UseSearchOptions {
  debounceMs?: number;      // Debounce delay (default: 300ms)
  useMockData?: boolean;    // Use mock data (default: false)
}
```

### Trending Hook Options

```tsx
const trending = useTrending(
  platforms?: string[],     // Filter by platforms
  useMockData?: boolean     // Use mock data (default: false)
);
```

## Switching to Production API

When ready to use the real backend:

1. **Update API Configuration**
   ```tsx
   // In discover/page.tsx or your component
   const searchState = useSearch({ useMockData: false });
   const trendingState = useTrending(platforms, false);
   ```

2. **Verify Backend Endpoint**
   - Ensure backend is running at `NEXT_PUBLIC_API_BASE_URL`
   - API should respond to POST `/api/v1/search`

3. **Test Search**
   - Search should now call real API
   - Monitor network requests in DevTools

## Troubleshooting

### Search not working
- Check browser console for errors
- Verify `useMockData` setting
- Test with mock data enabled first

### No trending items
- Ensure trending hook is initialized
- Check backend `/search/trending` endpoint
- Verify platform parameters

### Styling issues
- Components use Tailwind CSS
- Ensure Tailwind is configured
- Check `cn()` utility import

## Future Enhancements

- [ ] Search suggestions/autocomplete
- [ ] Advanced filter UI
- [ ] Search history
- [ ] Saved searches
- [ ] Custom trending categories
- [ ] Real-time search updates
- [ ] Analytics tracking

## Dependencies

- React 19.1.0
- Next.js 16.1.0
- Lucide React - Icons
- Tailwind CSS - Styling
- restfit - API service generation

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)
