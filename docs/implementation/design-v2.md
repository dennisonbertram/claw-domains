# Design V2 — .claw Domains Redesign

## Summary

Complete visual overhaul of the .claw domain service app. Replaced the dark crypto-themed UI with a light, warm, SaaS-style design. New palette: off-white base (#FCFCFD), brand indigo (#5B61FE), coral accent (#FF8162). Framer Motion animations throughout. All blockchain language hidden behind friendly copy.

## Files Changed / Created

### New Components

| File | Purpose |
|------|---------|
| `src/components/AuroraBackground.tsx` | Three animated radial gradient orbs for hero background (framer-motion infinite loops) |
| `src/components/SearchBar.tsx` | Hero search with 600ms debounce, mock availability check, AnimatePresence result states |
| `src/components/DomainCard.tsx` | Spring-animated card with lift on hover, gradient orb effect |
| `src/components/HeroContent.tsx` | Client wrapper for animated hero text/search (needed because home page is server component) |
| `src/components/PricingSection.tsx` | 4-tier pricing grid with scroll-triggered fade-in |
| `src/components/RecordRow.tsx` | Domain record display row with copy/edit actions on hover |

### Modified Components

| File | Changes |
|------|---------|
| `src/components/Nav.tsx` | Floating pill nav — frosted glass, brand logo, ConnectKit button |
| `src/components/TxStatus.tsx` | Complete rewrite — new `state` prop interface, friendly messages, animated checkmark |

### Modified Pages

| File | Changes |
|------|---------|
| `src/app/globals.css` | Light theme, Tailwind v4 `@theme` token definitions, gradient-text utility |
| `src/app/layout.tsx` | Added Outfit font, light body background, updated footer |
| `src/app/page.tsx` | Full hero/features/pricing layout with AuroraBackground |
| `src/app/register/[name]/RegisterClient.tsx` | Complete rewrite — mocked blockchain, AnimatePresence states, canvas-confetti on success |
| `src/app/domain/[name]/DomainClient.tsx` | Complete rewrite — cover gradient, two-col layout, inline edit mode, RecordRow |
| `src/app/profile/ProfileClient.tsx` | Complete rewrite — stagger animation, DomainCard grid, friendly empty state |

## Design Tokens (Tailwind v4 CSS @theme)

```
bg-base:        #FCFCFD  (page background)
bg-surface:     #FFFFFF  (card surfaces)
bg-wash:        #F3F4F6  (subtle wash)
brand-primary:  #5B61FE  (indigo — CTAs, links, accents)
brand-hover:    #4A50E2  (darker on hover)
brand-accent:   #FF8162  (coral — primary CTA button)
brand-glow:     #E0E7FF  (soft glow)
text-main:      #171717  (headings, body)
text-muted:     #666666  (secondary text)
text-placeholder: #A3A3A3
status-success: #10B981
status-error:   #EF4444
status-pending: #F59E0B
border-light:   #E5E5E5
border-focus:   #A5B4FC
```

## Architecture Notes

- **Tailwind v4** — no `tailwind.config.ts`. Custom tokens defined in `globals.css` via `@theme {}`.
- **Framer Motion v12+** — `Variants` `ease` must use typed `Easing` values; plain strings cause TS errors. Fixed by removing `ease` from variant definitions and using `whileHover`/`whileTap` props instead.
- **canvas-confetti** — loaded dynamically via `import()` to avoid SSR issues.
- **All blockchain calls mocked** — `RegisterClient`, `DomainClient`, `ProfileClient` use `useState + setTimeout` to simulate async. Existing `wagmi`/`viem` hooks in untouched files remain functional.
- **TxStatus interface changed** — new API is `state: 'pending' | 'confirming' | 'success' | 'error'` instead of individual booleans. Existing usage in `DomainClient` updated accordingly.

## Caveats / TODOs

1. **TxStatus API breaking change** — The old `TxStatus` component accepted `{ hash, isPending, isConfirming, isSuccess, error }`. The new design uses a simpler `{ state, errorMessage }`. Any other places that imported the old TxStatus (e.g. original `RegisterClient` and `DomainClient`) now use the new client-side mock versions — no regressions because those files were fully rewritten.

2. **Fonts** — Outfit is loaded via `next/font/google`. Geist Mono variable `--font-geist-mono` is available globally for monospace domain text. If Google Fonts is unavailable (offline), fallback is system monospace.

3. **Mock data** — Profile page shows 3 hardcoded demo domains. Domain page shows hardcoded records. These should be replaced with real wagmi contract reads once contracts are deployed.

4. **Nav search removed** — The old nav included an inline search form. The new nav is clean (logo + My Domains link + ConnectKit). Search lives only in the hero. If a nav search is needed, it can be added back.

5. **`RecentRegistrations` component** — No longer used on the home page. The file `src/components/RecentRegistrations.tsx` still exists but is unused. It can be removed or re-integrated as a "Recently registered" marquee section.

6. **`AddressDisplay` component** — No longer used directly in the redesigned pages. The file `src/components/AddressDisplay.tsx` still exists for potential reuse.

## Build Status

```
Route (app)
├ / (Static)
├ /domain/[name] (Dynamic)
├ /profile (Static)
└ /register/[name] (Dynamic)

Build: PASS - no TypeScript or ESLint errors
```
