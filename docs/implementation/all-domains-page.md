# All Domains Page — `/domains` (2026-03-15)

## Summary

Added a new "Explore" page at `/domains` that displays all registered `.claw` domains in a table. Users can browse every registered domain, see who owns it, and when it was registered and expires.

## Files Created/Modified

| File | Type | Description |
|------|------|-------------|
| `web/src/app/domains/page.tsx` | New (Server Component) | Route handler, fetches domain data from Ponder |
| `web/src/app/domains/DomainsClient.tsx` | New (Client Component) | Interactive table UI with loading/empty/error states |
| Nav component | Modified | Added "Explore" link pointing to `/domains` |

## Architecture

```
/domains (route)
  └── page.tsx (Server Component)
        - Fetches domains from Ponder GraphQL API
        - Sorts by registration date (newest first)
        - Passes data to client component
        └── DomainsClient.tsx (Client Component)
              - Renders domain table
              - Columns: Name, Owner, Registered, Expires
              - Loading skeleton while data loads
              - Empty state when no domains exist
              - Error state with retry option
```

## Data Flow

1. User navigates to `/domains`
2. Server component queries Ponder GraphQL endpoint for all domains
3. Domains are sorted by registration date (descending)
4. Data is passed to the client component for rendering
5. Client component renders a table with four columns

## UI States

- **Loading**: Skeleton rows animate while data is fetched
- **Empty**: Message indicating no domains have been registered yet
- **Error**: Error message with context, allows user to retry
- **Data**: Table rows showing Name, Owner (truncated address), Registered date, Expires date

## Dependencies

- Queries `@claw-domains/shared` Ponder client (`queryPonder`) via `web/src/lib/ponder.ts`
- Ponder GraphQL endpoint configured via `NEXT_PUBLIC_PONDER_URL` environment variable
