# ShopHive

An Amazon-style product listing and detail app built for the Leegality frontend assessment. It lists products from the [DummyJSON](https://dummyjson.com/docs/products) API with combined category, price and brand filters, pagination, and a product detail page.

- **Live demo:** https://shophive-lime.vercel.app
- **Repository:** https://github.com/Bhavana-code-dev/shophive

**Built with:** React 19, TypeScript, React Router 7, Tailwind CSS 4, Vite 8, Vitest. No UI component library.

## Setup

Requires **Node.js 20.19+** (or 22.12+).

```bash
git clone https://github.com/Bhavana-code-dev/shophive.git
cd shophive
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the unit tests (filter, sort and pagination logic) |
| `npm run lint` | Run ESLint |

**Deploying:** works on Vercel or Netlify with no configuration. `vercel.json` and `public/_redirects` send every path to `index.html`, so deep links such as `/product/5` survive a refresh. (GitHub Pages does not support this kind of routing fallback.)

## Requirements checklist

| Requirement | Where |
| --- | --- |
| Product listing: filters, product grid, pagination | `pages/ListingPage.tsx`, `components/FilterPanel.tsx`, `Pagination.tsx` |
| Card shows image, name, price, rating; click opens `/product/:id` | `components/ProductCard.tsx` |
| Category filter loaded from `/products/categories` | `FilterPanel.tsx`, `CategoryChips.tsx`, `api/products.ts` |
| Price range (min and max) | `components/PriceSlider.tsx` |
| Brand filter built from the fetched products, multi-select | `lib/filterProducts.ts`, `FilterPanel.tsx` |
| Filters combine, update immediately, reset pagination | `lib/filterProducts.ts`, `hooks/useProductFilters.ts` |
| Loading and error states | skeletons, `StateMessage.tsx`, retry buttons |
| Detail page: image, name, price, rating, description, brand, category | `pages/DetailPage.tsx` |
| Back button keeps the previous filters | filters live in the URL, see below |
| React, Router, hooks, light styling | `package.json` |

## Features beyond the brief

- Splash screen on load, and a logo loader while a product opens (the product is prefetched during the loader, so the page appears fully loaded).
- Wishlist (heart on cards and on the detail page) and cart with quantities, both saved in `localStorage`.
- Detail page: image gallery with a 360° spin, discount price, Add to cart, Buy now, Share (copy link, or the native share sheet on phones), paginated reviews.
- Header: debounced search, offers panel (sample content), wishlist, cart and profile menus.
- Category chips, a styled sort menu, and a filters drawer opened from the menu button.
- Accessibility: keyboard support for the sort menu, drawer and sliders; labelled controls; visible focus; `prefers-reduced-motion` respected.

## Architectural decisions

1. **Filters live in the URL** (`/?category=laptops&min=100&max=900&brand=Apple&page=2`). The URL is the single source of truth, which gives shareable links, refresh safety, and "filters persist on Back" without extra state code. Filter changes use `history.replace`, so Back leaves the page in one step instead of undoing every filter click.
2. **Data strategy.** DummyJSON cannot filter by price or brand on the server. The app fetches the catalogue once per category (`limit=0` plus `select=` to download only the fields the list needs), caches the result, and filters, sorts and paginates on the client. Combined filters are therefore instant and always correct. Choosing a category uses `/products/category/{slug}`; the detail page uses `/products/{id}`.
3. **Pure, tested logic.** Filtering, sorting, brand extraction and pagination are plain functions in `lib/filterProducts.ts`, separate from the UI and covered by unit tests (inclusive price bounds, multi-brand, AND-combination, no mutation of input, page clamping).
4. **Small custom hooks instead of a data library.** `useAsync` handles loading, error and retry and ignores stale responses, so a slow earlier request can never overwrite a newer one. `useProductFilters` maps the URL to filters, and `useDebounce` powers search and the slider.
5. **Request caching with a synchronous `peek`.** Promise caches avoid duplicate requests, and resolved values can be read synchronously, so Listing, Detail and Back render instantly with no skeleton flash. Failed requests are evicted so "Try again" really retries.
6. **Two small contexts.** `StoreProvider` holds the wishlist, cart and toast messages (persisted to `localStorage`). `LoaderProvider` runs the "show logo, prefetch, then navigate" transition. Hooks and providers live in separate files to keep React fast-refresh working.
7. **Price slider.** Two stacked native range inputs, so keyboard, touch and screen readers work without custom code, plus two typed fields. The track uses a logarithmic scale because the catalogue mixes $1 items with items costing thousands; a linear track would squeeze almost every product into a few pixels. Typed prices are kept exact, and the list updates shortly after the handles stop moving.
8. **Back navigation.** If you arrived from the listing, Back calls `navigate(-1)`, which restores the filtered URL and scroll position. A direct link goes to the listing instead.
9. **Styling.** Tailwind with a few theme tokens (`navy`, `brand`, `ink`). Small reusable components (`ProductCard`, `Rating`, `Pagination`, `StateMessage`, `FadeImage`).

## Assumptions

- Page size is 12 products (three rows of four on desktop).
- The brief's "filters on the left" is implemented as a left slide-in drawer opened by the menu button, as in the mockup. By default the page shows only the product list. A badge on the menu button shows how many filters are active, and "Clear" resets them.
- Category is single-select (radio buttons and chips); brand is multi-select. Changing category clears the brand selection, because brands from the previous category would usually give an empty list.
- Price bounds are inclusive. The slider range is the cheapest to the priciest product of the current category, in whole dollars. Handles at either end mean "no limit"; a handle moved away from its end counts as one applied filter.
- Some products (for example groceries) have no brand. They appear when no brand is selected and are excluded while a brand filter is active.
- Brand options come from the products of the selected category.
- Search matches product title and brand, on the client.
- The categories endpoint returns objects today and plain strings in older versions; both are handled.
- Cart, wishlist, profile, "Buy now" and the offers panel are demo-only. There is no checkout or sign-in, the offer codes are sample content, and nothing is sent to a server.

## Improvements with more time

- **Server-driven pagination and filtering** with `limit`/`skip` (and a small backend or BFF for price and brand), so very large catalogues are not downloaded in full.
- **More tests:** component and integration tests (React Testing Library) for filter, URL and results, and Playwright for the Back flow, the drawer and the slider.
- **Real commerce pages:** cart and wishlist pages, checkout, authentication, and offers from an API.
- **Performance:** a virtualised grid, responsive images (`srcset`) with blur placeholders, and prefetching a product on card hover.
- **Accessibility:** a focus trap in the drawer, plus a screen-reader pass on the dual-handle slider.
- **Slider polish:** click the track to jump to a price, show a price histogram, and let the drawer state live in the URL.
- **Resilience:** a route-level error boundary, request timeouts, and analytics for filter usage.