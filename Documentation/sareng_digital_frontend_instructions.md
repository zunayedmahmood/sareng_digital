# Sareng Digital — Frontend Rebuild Instructions
### AI Implementation Guide: Adapting Errum V2 E-commerce Architecture

> **Project Context**: Sareng Digital is a premium tech accessories e-commerce brand based in Bangladesh. The brand identity is built on **Black (#0A0A0A) and Gold (#C9A84C)** as primary colours, with Ivory (#F5F3EF) and Graphite (#2A2A2A) as supporting tones. The brand voice is confident, curated, and modern. Products include earbuds, mice, keyboards, pendrives, and other accessories — many with strong character-design aesthetics (duck-face buds, cat-shaped mice, etc.).
>
> **Design Philosophy**: Mobile-first. Every layout decision starts from a 390px viewport and scales up. Premium but playful. Fast, smooth, and highly animated without sacrificing performance.
>
> **Source Reference**: All page/component references in this document refer to the existing `app/e-commerce` and `components/ecommerce` structure from the Errum V2 architecture document.

---

## Table of Contents

1. [Global Design Tokens & Theming](#1-global-design-tokens--theming)
2. [Global Layout & Providers](#2-global-layout--providers)
3. [Navigation](#3-navigation)
4. [Home Page](#4-home-page)
5. [Category & Product Feed Pages](#5-category--product-feed-pages)
6. [Search Experience](#6-search-experience)
7. [Product Detail Page (PDP)](#7-product-detail-page-pdp)
8. [Cart & Checkout](#8-cart--checkout)
9. [Post-Purchase & Tracking](#9-post-purchase--tracking)
10. [Component Glossary — Changes](#10-component-glossary--changes)
11. [Performance & Optimisation Directives](#11-performance--optimisation-directives)
12. [Admin CMS Integration Points (Future)](#12-admin-cms-integration-points-future)

---

## 1. Global Design Tokens & Theming

### 1.1 CSS Custom Properties

Create a global `tokens.css` (or add to `globals.css`) with the following Sareng Digital design tokens. These must be used **exclusively** throughout the codebase — no hardcoded hex values anywhere.

```css
:root {
  /* === PRIMARY PALETTE === */
  --sd-black:        #0A0A0A;
  --sd-onyx:         #1A1A1A;
  --sd-graphite:     #2A2A2A;
  --sd-graphite-mid: #3A3A3A;
  --sd-gold:         #C9A84C;
  --sd-gold-soft:    #E8CC80;
  --sd-gold-dim:     rgba(201, 168, 76, 0.15);
  --sd-ivory:        #F5F3EF;
  --sd-ivory-dark:   #ECEAE4;
  --sd-white:        #FFFFFF;

  /* === TEXT === */
  --sd-text-primary:    #F5F3EF;        /* On dark backgrounds */
  --sd-text-secondary:  rgba(245,243,239,0.6);
  --sd-text-muted:      rgba(245,243,239,0.35);
  --sd-text-on-light:   #0A0A0A;        /* On ivory/white backgrounds */
  --sd-text-gold:       #C9A84C;

  /* === BORDERS === */
  --sd-border-default:  rgba(201,168,76,0.15);
  --sd-border-hover:    rgba(201,168,76,0.35);
  --sd-border-strong:   rgba(201,168,76,0.6);
  --sd-border-light:    rgba(245,243,239,0.08);

  /* === SEMANTIC === */
  --sd-success:   #3D9970;
  --sd-warning:   #E8B84B;
  --sd-danger:    #E74C3C;
  --sd-info:      #3498DB;

  /* === SPACING === */
  --sd-space-xs:  4px;
  --sd-space-sm:  8px;
  --sd-space-md:  16px;
  --sd-space-lg:  24px;
  --sd-space-xl:  40px;
  --sd-space-2xl: 64px;

  /* === RADIUS === */
  --sd-radius-sm:   6px;
  --sd-radius-md:   12px;
  --sd-radius-lg:   20px;
  --sd-radius-xl:   32px;
  --sd-radius-pill: 999px;

  /* === TRANSITIONS === */
  --sd-ease-out:   cubic-bezier(0.22, 1, 0.36, 1);
  --sd-ease-in:    cubic-bezier(0.64, 0, 0.78, 0);
  --sd-ease-spring:cubic-bezier(0.34, 1.56, 0.64, 1);
  --sd-duration-fast:   150ms;
  --sd-duration-base:   250ms;
  --sd-duration-slow:   400ms;
  --sd-duration-slower: 700ms;

  /* === SHADOWS === */
  --sd-shadow-card:   0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3);
  --sd-shadow-hover:  0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px var(--sd-border-hover);
  --sd-shadow-gold:   0 0 24px rgba(201,168,76,0.2);

  /* === TYPOGRAPHY === */
  --sd-font-sans:   'Inter', 'Segoe UI', system-ui, sans-serif;
  --sd-font-display:'Playfair Display', Georgia, serif;  /* For hero headings only */

  /* === Z-INDEX SCALE === */
  --sd-z-base:      1;
  --sd-z-card:      10;
  --sd-z-sticky:    100;
  --sd-z-nav:       200;
  --sd-z-drawer:    300;
  --sd-z-modal:     400;
  --sd-z-toast:     500;
}
```

### 1.2 Base Body Styles

```css
body {
  background-color: var(--sd-black);
  color: var(--sd-text-primary);
  font-family: var(--sd-font-sans);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  overscroll-behavior: none; /* prevents pull-to-refresh jarring on product pages */
}
```

### 1.3 Scrollbar Styling

```css
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: var(--sd-onyx); }
::-webkit-scrollbar-thumb {
  background: var(--sd-gold-dim);
  border-radius: var(--sd-radius-pill);
}
::-webkit-scrollbar-thumb:hover { background: var(--sd-gold); }
```

### 1.4 Selection Colour

```css
::selection {
  background: var(--sd-gold);
  color: var(--sd-black);
}
```

### 1.5 Image Handling Policy — CRITICAL

- **No animal emojis** anywhere on the storefront. Products that have character designs (duck buds, cat mouse) should be represented by their **actual product photographs**.
- **No emoji icons** for UI elements. Use geometric SVG icons or Lucide React icons exclusively.
- **Broken image fallback**: Replace the generic placeholder with a branded one: a dark card with the Sareng Digital gold logomark centred and a subtle gold shimmer animation.
- All product images must be served through the existing `/api/proxy-image` proxy to handle CORS. Maintain the `toAbsoluteAssetUrl` utility.
- Use `next/image` with `sizes` prop tuned per breakpoint on every image throughout.

---

## 2. Global Layout & Providers

**File**: `app/e-commerce/layout.tsx`

### 2.1 What Stays

- `CustomerAuthProvider` — unchanged logic
- `CartContext` / `GlobalCartSidebar` — unchanged logic, reskinned UI
- `PromotionContext` — unchanged logic
- `ScrollToTopOnRouteChange` — unchanged

### 2.2 What Changes

**Add a `ThemeProvider`** that injects the `tokens.css` custom properties. Even though Sareng Digital is a single dark theme, this provider should accept a future `theme` prop so light/dark toggling can be introduced later without refactoring.

**Add a `ToastProvider`** using a custom toast system styled in the Sareng palette (black background, gold left-border, ivory text). Do not use a third-party toast library that will inject its own styles.

**Add `PageTransitionWrapper`**: Wrap the main content area in a motion wrapper (using Framer Motion) that applies a subtle fade + translateY(8px → 0) on every route change. Duration: 300ms. This creates the "live and smooth" feel across the entire site.

```tsx
// Example motion config
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.15 } }
};
```

**Add `CurrencyProvider`**: Centralise ৳ (Bangladeshi Taka) symbol rendering. All price displays across the site must go through a `<Price amount={number} />` component that formats numbers with proper comma separation (e.g., ৳1,290 not ৳1290).

---

## 3. Navigation

### 3.1 Desktop Navigation

**File**: `components/ecommerce/Navigation.tsx`

Replace the existing navigation with a full-width dark header matching the Sareng identity.

**Layout structure** (desktop, ≥1024px):
```
[SARENG DIGITAL logo left] ──────── [Search bar centre] ──────── [Icons right: wishlist | cart | account]
[Category pills row below: All | Earbuds | Mice | Keyboards | Pendrives | Accessories]
```

**Styling rules**:
- Background: `var(--sd-onyx)` with a `1px` bottom border of `var(--sd-border-default)`
- On scroll past 60px: apply `backdrop-filter: blur(20px)` and reduce opacity of background to 0.85. Add `box-shadow: 0 4px 24px rgba(0,0,0,0.5)`.
- Logo: "SARENG" in bold tracked text (letter-spacing: 0.12em) in `var(--sd-gold)`. "DIGITAL" in smaller weight below or inline in `var(--sd-text-secondary)`.
- Category pills: Small pill buttons. Default state: transparent background, `var(--sd-border-default)` border, `var(--sd-text-secondary)` text. Hover/active: `var(--sd-gold-dim)` background, `var(--sd-border-hover)` border, `var(--sd-gold)` text. Transition: 200ms ease-out.
- Cart icon must display a count badge. Badge: `var(--sd-gold)` background, `var(--sd-black)` text, 16px height, pill shape. Animate badge on count change with a spring pop (scale 1.4 → 1).
- Search bar: Dark input with `var(--sd-border-default)` border. On focus: border shifts to `var(--sd-border-hover)`. Placeholder in `var(--sd-text-muted)`. Include a subtle gold magnifier icon on the right.

### 3.2 Mobile Bottom Navigation

On screens below 1024px, **hide the top header entirely** and replace with a bottom navigation bar.

**Bottom nav items**: Home | Shop | Search | Wishlist | Account

**Styling**:
- Fixed to bottom: `position: fixed; bottom: 0; left: 0; right: 0; z-index: var(--sd-z-nav)`.
- Background: `var(--sd-onyx)`, `1px` top border `var(--sd-border-default)`.
- Height: 64px. Add `padding-bottom: env(safe-area-inset-bottom)` for iPhone notch support.
- Active tab icon: `var(--sd-gold)` colour with a small gold underline dot beneath it.
- Icons: Lucide React icons. Size 22px. Inactive: `var(--sd-text-muted)`. Active: `var(--sd-gold)`.
- Cart icon includes the same count badge as desktop.
- Tab switch animation: active icon scales to 1.15 with a spring ease, then returns to 1.

### 3.3 Mobile Top Bar

On mobile, show a minimal top bar (height: 48px) with:
- Left: Hamburger menu (opens a slide-in drawer from the left for category navigation)
- Centre: Sareng Digital logo
- Right: Cart icon with badge

This top bar should also gain `backdrop-filter: blur(20px)` on scroll.

### 3.4 Category Drawer (Mobile)

Slides in from the left. Contains:
- Brand logo at top
- Full category list with icons (SVG geometric icons — no animal emoji)
- "New Arrivals" tag beside relevant categories
- Bottom: social links and "About Sareng" link
- Overlay behind drawer: `rgba(0,0,0,0.6)`, tapping it closes the drawer
- Animation: translateX(-100% → 0), duration 350ms, ease-out

---

## 4. Home Page

**File**: `app/e-commerce/page.tsx`

This is the most important page. It should feel like a curated editorial experience, not a generic product grid. Every section should load with a subtle entrance animation (staggered fade-in from below) as it enters the viewport, using IntersectionObserver or Framer Motion's `whileInView`.

### 4.1 Hero Section

**Component**: `HeroSection`

**⚠️ Admin CMS Note**: The hero image/video and all text copy in this section must be configurable from the admin panel. For now, implement with hardcoded values but structure the component to accept a `heroData` prop fetched from the backend. The API endpoint `/api/admin/homepage/hero` should be the eventual source. Use a `getHeroContent()` server function that currently returns hardcoded defaults but can be swapped for a real API call without component changes.

**Layout (Mobile)**:
- Full-viewport-height section (100svh).
- Background: A dark product photograph (fetched from admin config). Overlay: `linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.85) 70%, rgba(10,10,10,1) 100%)`.
- Centre-aligned text:
  - Small overline: "NEW ARRIVALS — 2026" in `var(--sd-gold)`, 10px, letter-spacing 0.4em
  - Main headline: 36px, font-weight 700, ivory, using `var(--sd-font-display)` for the italic wordmark feel
  - Subline: 14px, `var(--sd-text-secondary)`
  - CTA button: "Shop Now" — gold background, black text, 44px tall (minimum tap target), pill shape, with a right-arrow SVG icon. On tap: scale 0.97 for 100ms then back. No href change animation lag.
- Scroll indicator at bottom: a small animated chevron-down in gold that bobs up and down. Disappears after user scrolls 100px.

**Layout (Desktop)**:
- Height: 90vh, maximum 700px.
- Text aligns left, image occupies full background.
- Headline can be larger: 56px.
- Add a secondary CTA: "View Collections" as a ghost button beside the primary.

**Hero Image Loading**:
- Use `next/image` with `priority` flag since this is above the fold.
- Implement a skeleton: a `var(--sd-onyx)` rectangle with a gold shimmer sweep animation (`@keyframes shimmer`) while the image loads.
- The shimmer animation:
```css
@keyframes sd-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
.sd-skeleton {
  background: linear-gradient(
    90deg,
    var(--sd-onyx) 25%,
    var(--sd-graphite) 50%,
    var(--sd-onyx) 75%
  );
  background-size: 200% 100%;
  animation: sd-shimmer 1.5s infinite;
}
```

Apply this skeleton pattern to **every image on the site** via a reusable `<SdImage />` wrapper component.

### 4.2 Quick Search Bar (Mobile Floating)

Below the hero, on mobile, render a large floating search bar:
- Full width with 16px horizontal padding
- 52px tall, pill shape
- `var(--sd-onyx)` background, `var(--sd-border-default)` border
- Gold magnifier icon left, microphone icon right (placeholder for future voice search)
- On tap: immediately navigate to `/search` with the keyboard pre-focused

On desktop this is part of the navigation header, so do not render this section on desktop.

### 4.3 Featured Categories Strip

A horizontally scrollable strip of category cards. On mobile: scroll horizontally. On desktop: a 5-column grid.

**Each category card**:
- Aspect ratio: 1:1 on mobile (square), 4:3 on desktop
- Background: actual product category photo as background image
- Dark overlay: `linear-gradient(to top, rgba(10,10,10,0.85) 0%, transparent 60%)`
- Category name at bottom-left: 14px, bold, ivory
- A small geometric icon (SVG, not emoji) at top-right inside a small gold-bordered circle

**Categories to show** (in order):
1. Earbuds
2. Mice
3. Keyboards
4. Pendrives
5. Accessories

Each card should have a hover state (desktop): slight scale-up (1.03) on the inner image with overflow hidden on the card, creating a zoom-pan feel. Transition: 400ms ease-out.

On mobile, add a "See All Categories" link as the last scrollable item, styled as a dark card with a right-arrow.

### 4.4 "New Arrivals" Horizontal Scroll

**Heading**: `SARENG` in small gold tracking + "New Arrivals" in large ivory text beside it.

A horizontally scrollable row of `PremiumProductCard` components (see Section 10). On desktop: show 4 cards in a grid. On mobile: scrollable row showing 1.5 cards (the half-card signals there are more).

Add a "View All" link aligned right to the heading row.

The entire row entrance: stagger each card with a 60ms delay between them as they fade in from the bottom when the section scrolls into view.

### 4.5 Instagram Reels Viewer

**Component**: `InstagramReelViewer`

**⚠️ Admin CMS Note**: The list of Instagram Reel URLs must be stored in the admin panel and fetched via `/api/admin/homepage/reels`. For now hardcode a placeholder array, but structure the component identically to how it will behave with live data. The component must accept a `reels: string[]` prop.

**Redesign**:
- Remove the automatic `ResizeObserver` iframe-wrapping approach. Instead, fix the iframe container to a consistent 9:16 aspect ratio card (Instagram Reel native ratio).
- On mobile: full-width, card-style. User scrolls horizontally through reels. Show a dot indicator below.
- On desktop: show 3 reels side by side in a row.
- Add a section header: small gold tag "FOLLOW US @SARENGDIGITAL" with an Instagram SVG icon. No emoji.
- Between the header and the reel row, add a subtle gold horizontal line (1px, 30% opacity).
- Lazy load each iframe. Show the `sd-skeleton` shimmer while the embed loads.

### 4.6 ⭐ Pendrives — Hardcoded Feature Section

This section is unique to Sareng Digital and has **no equivalent in the Errum V2 architecture**. It is a permanent, hardcoded editorial section on the home page dedicated specifically to pendrives. It does not need to be CMS-driven.

**Section design**:

```
┌─────────────────────────────────────────────┐
│  [Gold accent bar left]  STORAGE ESSENTIALS  │  ← Section header
│  Fast, reliable, always with you.            │
├─────────────────────────────────────────────┤
│  [Product grid: see below]                  │
├─────────────────────────────────────────────┤
│  [Feature callouts: Speed | Capacity | Plug]│
└─────────────────────────────────────────────┘
```

**Section header**:
- Left: a 3px vertical gold bar
- "STORAGE ESSENTIALS" — 10px, gold, letter-spacing 0.3em
- Main title: "Fast. Reliable. Yours." — 28px, ivory, font-weight 700

**Product display**:
- Fetch products dynamically from `/api/products?category=pendrives&limit=4` — this is real data, not hardcoded.
- Display as a 2x2 grid on mobile, 4-column row on desktop.
- Use `PremiumProductCard` (reskinned version — see Section 10).

**Feature callouts row** (hardcoded, below the product grid):
Three small info pills in a row:
- "USB 3.0 Speed" with a lightning bolt SVG icon
- "Up to 256GB" with a stack/layers SVG icon
- "Plug & Play" with a plug SVG icon

Each pill: `var(--sd-graphite)` background, `var(--sd-border-default)` border, gold icon, ivory text, `var(--sd-radius-pill)` shape, 12px font.

**Section background**: Slightly elevated from the page background. Use `var(--sd-onyx)` as the section background with a subtle top and bottom gold gradient fade: `linear-gradient(to right, var(--sd-gold-dim) 0%, transparent 30%, transparent 70%, var(--sd-gold-dim) 100%)` as a decorative overlay.

### 4.7 "Why Sareng Digital" Editorial Block

A brand-trust section that appears below the Pendrives section. Three columns on desktop, stacked on mobile.

**Cards**:
1. **Curated Selection** — geometric diamond SVG icon — "Every product handpicked for quality and personality."
2. **Fast Delivery** — geometric arrow SVG icon — "Delivered across Bangladesh within 3–5 days."
3. **Genuine Products** — geometric shield SVG icon — "Imported directly. Authentic always."

**Styling**:
- Card background: `var(--sd-onyx)`
- Icon: 32px SVG in gold, inside a 56px circle with `var(--sd-gold-dim)` background
- Title: 16px, ivory, font-weight 500
- Body: 13px, `var(--sd-text-secondary)`
- `var(--sd-border-default)` border, `var(--sd-radius-lg)` corners

### 4.8 "Best Sellers" Section

Identical layout structure to "New Arrivals" (Section 4.4) but fetches from `/api/products?sort=best_selling&limit=8`.

On desktop: a 4-column grid (no horizontal scroll). On mobile: horizontal scroll row showing 1.5 cards.

### 4.9 Testimonials / Social Proof Strip

A horizontally auto-scrolling (infinite loop, no user interaction needed, pausable on hover) strip of customer review snippets.

Each review card:
- Width: 280px fixed
- `var(--sd-onyx)` background, gold border
- Star rating: 5 gold geometric star SVGs (not emoji stars)
- Review text: 13px, italic, `var(--sd-text-secondary)`, max 2 lines
- Customer name: 12px, `var(--sd-text-muted)`

Auto-scroll: CSS `animation: scroll-left 40s linear infinite`. On hover: `animation-play-state: paused`.

### 4.10 Footer

Full-width footer section.

**Structure**:
```
[SARENG DIGITAL logo + tagline]  [Quick Links]  [Categories]  [Contact]
─────────────────────────────────────────────────────────────────────────
[© 2026 Sareng Digital]  [Facebook | Instagram | TikTok icons]  [SSLCommerz badge]
```

**Styling**:
- Background: `var(--sd-onyx)`
- Top border: `1px solid var(--sd-border-default)`
- Column headings: 11px, gold, letter-spacing 0.3em, uppercase
- Links: 14px, `var(--sd-text-secondary)`. Hover: `var(--sd-gold)`, `translateX(4px)` with 150ms ease.
- Social icons: Lucide React icons. 20px. On hover: gold colour with `var(--sd-shadow-gold)`.
- Mobile: all columns stack vertically. Accordions for "Quick Links" and "Categories" sections on mobile.

---

## 5. Category & Product Feed Pages

**Files**: `products/page.tsx`, `[slug]/page.tsx`

### 5.1 Page Header

Each category page opens with a full-width banner:
- Height: 200px mobile, 300px desktop
- Background: category photo (fetched from category API) with a dark gradient overlay
- Category name: large, ivory, centred
- Product count: small gold badge below name, e.g., "24 products"

### 5.2 Filter & Sort Bar

**Desktop**: A persistent left sidebar (`CategorySidebar`, 260px wide). The main product grid takes the remaining width.

**Mobile**: No sidebar. Replace with a sticky bottom pill bar:
- "Filters" pill on left, "Sort" pill on right
- Gold border, dark background, 44px tall
- Tapping either opens a bottom sheet drawer (slides up from bottom, 85vh max height)
- The bottom sheet has a drag handle at top, `backdrop-filter: blur(20px)` on the overlay behind it
- Filter and Sort bottom sheets are separate drawers

**Filter chips** (active filters shown):
- When a filter is active, show it as a small dismissible gold chip below the search bar / above the grid
- Each chip: `var(--sd-gold-dim)` background, `var(--sd-gold)` text, "×" dismiss button

### 5.3 Product Grid

**Grid columns**:
- Mobile: 2 columns
- Tablet (768px+): 3 columns
- Desktop (1280px+): 4 columns

**Grid gap**: 12px mobile, 16px desktop.

Use CSS Grid: `grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))` on mobile, overriding at breakpoints.

**Loading state**: When filters change or page loads, show a skeleton grid matching the expected card dimensions. Use the `sd-skeleton` shimmer pattern. Show at least 8 skeleton cards.

**Pagination / Infinite Scroll**:
- Use **infinite scroll** (IntersectionObserver on the last card) rather than traditional pagination buttons.
- When loading more: show 4 skeleton cards appended at the bottom.
- Show a small gold spinner (`border: 2px solid var(--sd-gold-dim); border-top-color: var(--sd-gold)`) centred beneath the grid while fetching.

### 5.4 Empty State

When no products match the filters:
- Centred illustration: a simple geometric SVG (abstract lines, no animal imagery)
- "No products found" in ivory, 18px
- "Try adjusting your filters" in `var(--sd-text-secondary)`, 14px
- Gold "Clear Filters" button

### 5.5 URL Synchronisation

Preserve the existing URL sync logic from Errum V2 (filter states in URL params). No change to the logic — only the UI.

---

## 6. Search Experience

**File**: `app/e-commerce/search/search-client.tsx`

### 6.1 Search Page Layout

**Mobile**:
- The search input is pre-focused when the page loads.
- Above the input: a row of "Recent Searches" pills (stored in localStorage, max 5). Gold border, dismissible.
- Below: "Popular Categories" — a 3-column grid of category chips.
- Once the user starts typing (after 500ms debounce): the categories grid fades out and results fade in.

**Desktop**:
- Two-column layout: filters sidebar on the left (same as category page), results grid on the right.
- The search input at the top spans the full width of the results column.

### 6.2 Search Results Presentation

- Results use the same `PremiumProductCard` component.
- If fewer than 4 results exist, show a "You might also like" section below the results, fetching from `/api/products?sort=best_selling&limit=4`.
- Highlighted matching text: wrap matched query terms in the product title with a `<mark>` styled as `background: var(--sd-gold-dim); color: var(--sd-gold)`.

### 6.3 No Results State

- A geometric SVG illustration (abstract magnifier shape made of geometric lines, no cartoon faces)
- "No results for "{query}""
- Suggestions: Did you mean X? (if backend provides spelling suggestions)
- 4 "Popular Products" cards below

---

## 7. Product Detail Page (PDP)

**File**: `app/e-commerce/product/[id]/page.tsx`

This is the conversion engine. Every element here must earn its place.

### 7.1 Image Gallery — `ProductImageGallery`

**Mobile**:
- Full-width image with CSS scroll snapping. `scroll-snap-type: x mandatory`.
- Aspect ratio: 1:1 (square). Products like the duck buds and cat mouse photograph well square.
- Dot indicators below (not thumbnail strip): small circles, active one is gold and wider (pill shape). Smooth width transition.
- Pinch-to-zoom: implement using `touch-action: manipulation` and a zoom modal on double-tap. The zoom modal shows the full-size image with panning support.

**Desktop**:
- Left column: main image (large, 1:1) with hover-zoom (CSS transform scale 1.5 on hover, overflow hidden on container, cursor: zoom-in).
- Below main image: horizontal thumbnail strip. Thumbnails: 72px × 72px, `var(--sd-border-default)` border. Active thumbnail: `var(--sd-border-hover)` border with a gold bottom line.
- Thumbnail hover: smooth border transition, slight scale (1.05).

**Image loading**: `sd-skeleton` shimmer while each image loads. Never show broken images — fallback to the branded gradient placeholder.

### 7.2 Product Information Block

**Price display**:
- If no promotion: `৳{price}` in 28px, ivory, font-weight 700.
- If promotion active: `৳{discounted}` in 28px gold + `৳{original}` strikethrough in 16px `var(--sd-text-muted)` + "SAVE {X}%" badge in `var(--sd-gold-dim)` background and `var(--sd-gold)` text.
- If variation price range: `৳{min} – ৳{max}` until a variant is selected, then resolve to the exact price.

**Product title**: 22px mobile, 28px desktop. Ivory. Font-weight 600.

**SKU / Category breadcrumb**: 12px, `var(--sd-text-muted)`. Shows the category chain. Tapping a breadcrumb navigates to that category page.

### 7.3 Variant Selector — `VariantSelector`

Keep the existing `parseMarketSizePairs` and `deriveVariantMeta` logic unchanged.

**UI redesign**:

**Colour variants**: Show as small circular swatches (32px diameter on mobile, 36px on desktop). Border: 2px transparent. Selected: 2px `var(--sd-gold)` border with a 2px gap (achieved with `outline: 2px solid var(--sd-gold); outline-offset: 2px`). Out of stock: show a diagonal line through the swatch using a CSS pseudo-element.

**Size variants**: Show as pill-shaped buttons. 40px tall. Default: `var(--sd-graphite)` background, `var(--sd-border-light)` border, `var(--sd-text-secondary)` text. Selected: `var(--sd-gold)` background, `var(--sd-black)` text. Out of stock: opacity 0.35, `cursor: not-allowed`, show strikethrough text inside.

**Variant selection animation**: When a variant is selected, the price block does a quick fade (opacity 0 for 100ms, then back to 1 with the new price). This signals the price has updated.

### 7.4 Inventory Indicators

- Show stock progress bar only when inventory < 20 units.
- Bar colours: `var(--sd-danger)` for < 5, `var(--sd-warning)` for 5–10, `var(--sd-success)` for > 10.
- Bar animation: `transition: width 600ms var(--sd-ease-out)` on mount.
- "Only X left in stock" text: use `var(--sd-danger)` for < 5, `var(--sd-warning)` for 5–10. Do not show this message if stock > 20.
- "Live Viewers": Keep this component. Style as: small green pulsing dot + "X people viewing this". Green dot: `background: var(--sd-success)` with a keyframe `@keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(61,153,112,0.4) } 100% { box-shadow: 0 0 0 8px transparent } }`.

### 7.5 Add to Cart / Buy Now Buttons

**Mobile (`StickyAddToCart`)**: Fixed at the bottom of the viewport once the main buy section scrolls off screen. Height: 64px + `env(safe-area-inset-bottom)`. Background: `var(--sd-onyx)`, `1px` top border `var(--sd-border-default)`.
- "Add to Cart" button: full width minus 16px padding each side. `var(--sd-gold)` background, `var(--sd-black)` text. 52px tall.
- On tap: animate a cart icon flying from the button to the cart badge in the bottom nav (use Framer Motion `AnimateSharedLayout` or a manual absolute-position animation).

**Desktop (inline)**: Two buttons side by side.
- "Add to Cart": `var(--sd-gold)` background, `var(--sd-black)` text.
- "Buy Now": `var(--sd-graphite)` background, `var(--sd-border-hover)` border, ivory text.
- Both: 52px tall, `var(--sd-radius-md)` corners, full width of the info column.

**Quantity selector**: Small +/− control beside the buttons (inline, not a separate row). Dark background, gold +/− icons. Min tap area: 36px × 36px per button.

### 7.6 Product Description & Specifications

Use a tab/accordion system:
- Tabs: "Description" | "Specifications" | "Delivery Info"
- Active tab: gold underline border, `var(--sd-gold)` text. Inactive: `var(--sd-text-secondary)`.
- Tab content: fade in on switch with 200ms ease.
- On mobile: convert to accordions (collapsible sections with a chevron-right rotating to chevron-down). This saves vertical space.

### 7.7 Related Products

Below the description tabs: "You Might Also Like" heading.
- Horizontal scroll row on mobile. 4-column grid on desktop.
- Fetch from `/api/products?category={same_category}&exclude={current_id}&limit=8`.
- Same `PremiumProductCard` component.

---

## 8. Cart & Checkout

### 8.1 Cart Sidebar — `GlobalCartSidebar`

**Slide-in from right**. Width: 100vw on mobile, 420px on desktop.

**Header**:
- "Your Bag" title left, cart count badge in gold, close button (×) right.
- Background: `var(--sd-onyx)`.

**`CartItem` rows**:
- Product image: 72px × 72px, `var(--sd-radius-md)` corners, `sd-skeleton` while loading.
- Product name: 14px ivory, max 2 lines, `overflow: hidden; text-overflow: ellipsis`.
- Variant label (colour/size): 12px `var(--sd-text-muted)`.
- Price: 15px `var(--sd-gold)`, font-weight 600.
- Quantity: same +/− control as PDP.
- Remove: small trash icon, `var(--sd-text-muted)` colour. On hover: `var(--sd-danger)`. Confirmation: not required — just remove immediately with a slide-up exit animation.
- "Over Stock" warning: small red badge inline with the item quantity controls if `available_inventory` is exceeded.

**Cart Footer**:
- Subtotal row: `var(--sd-text-secondary)` label + ivory amount.
- Promotion discount row (if any): gold label + green amount.
- Total row: bold ivory label + **gold** amount (28px, font-weight 700).
- Free delivery threshold message: e.g., "Add ৳500 more for free delivery!" in `var(--sd-warning)`, 12px. Hide when threshold is met.
- "Checkout" button: full width, `var(--sd-gold)` background, `var(--sd-black)` text, 52px tall.
- "Continue Shopping" link: centred below, `var(--sd-text-secondary)`, 13px.

**Empty state**:
- Centred geometric SVG illustration (abstract bag lines, no emoji).
- "Your bag is empty" — ivory, 18px.
- "Start Shopping" gold button.

### 8.2 Checkout Page — `CheckoutClient`

Preserve all existing logic (dual guest/member flow, delivery charge calculation, SSLCommerz, COD).

**UI changes**:
- Step indicators (for member 3-step flow): use a horizontal progress bar with gold filled steps. Active step: gold circle with step number. Completed: gold circle with a checkmark SVG. Future: `var(--sd-graphite)` circle.
- Form inputs: `var(--sd-onyx)` background, `var(--sd-border-default)` border. On focus: `var(--sd-border-hover)` border with a subtle gold glow (`box-shadow: 0 0 0 3px var(--sd-gold-dim)`). Label: 12px, `var(--sd-text-secondary)`, above the input.
- Error states: `var(--sd-danger)` border + small error message below in 12px.
- City selector: styled dropdown. Selected option shows the delivery price beside it (e.g., "Inside Dhaka — ৳60").
- SSLCommerz "Secure Handshake" overlay: dark fullscreen overlay with a gold animated spinner and the text "Connecting to secure payment..." in ivory.

---

## 9. Post-Purchase & Tracking

### 9.1 Thank You Page

Keep the localStorage-based instant rendering approach.

**Visual changes**:
- Full-page dark background with an animated gold confetti burst on mount. Use a CSS-only confetti: 20–30 small gold rectangles (`background: var(--sd-gold)`) with randomised `@keyframes` fall animations. Duration: 3 seconds, then stop.
- Large gold checkmark SVG in the centre, with a draw-on animation (`stroke-dasharray`/`stroke-dashoffset` transition).
- "Order Confirmed!" heading in `var(--sd-gold)`.
- Order number in ivory, large, monospace font.
- "Track Your Order" and "Continue Shopping" buttons.

### 9.2 Order Confirmation Page

**Timeline view**:
- Vertical timeline with gold connector lines.
- Each status node: a circle — completed statuses filled gold, current status pulsing gold ring animation, future statuses empty with `var(--sd-border-default)` border.
- Status labels: ivory. Timestamps: `var(--sd-text-muted)`, 12px.

### 9.3 Order Tracking by Phone

Preserve logic. Style the form input and results consistently with the checkout form styling above. No structural changes required.

---

## 10. Component Glossary — Changes

### `PremiumProductCard`

This is the most-used component across the site. Apply these changes globally — every instance benefits.

**Card structure**:
```
┌───────────────────────────┐
│  [Image area — square]    │  ← Uses SdImage wrapper
│  [Badges: NEW | SALE]     │  ← Top-left overlay badges
│  [Wishlist icon]          │  ← Top-right overlay
├───────────────────────────┤
│  [Product name]           │  14px, 2-line clamp
│  [Variant hint "+3 more"] │  12px, muted
│  [Price]                  │  Gold, 15px
│  [Quick Add button]       │  Appears on hover (desktop)
└───────────────────────────┘
```

**Image area**:
- Background: `var(--sd-graphite)` (shows while image loads).
- Aspect ratio: 1:1 (`aspect-ratio: 1 / 1`).
- `overflow: hidden; border-radius: var(--sd-radius-md)`.
- Hover (desktop): inner image scales to 1.08 with a 400ms ease-out. Do not scale the card itself.
- Hover swap (secondary image): preserve existing logic. The secondary image should cross-fade in (opacity 0→1) over 300ms rather than hard-swap.
- **No product emoji under any circumstances.** If no image is available, show the branded placeholder (dark card + gold logomark).

**Badges**:
- "NEW": small pill, `var(--sd-gold)` background, `var(--sd-black)` text, 10px, bold.
- "SALE": small pill, `var(--sd-danger)` background, white text, 10px, bold.
- "SOLD OUT": semi-transparent dark overlay across the entire image area + centred "Sold Out" text.
- Badges: top-left, stacked vertically with 4px gap.

**Wishlist icon**:
- Top-right, 32px × 32px tap target.
- Icon: Lucide `Heart` outline. When wishlisted: filled gold heart.
- On tap: spring animation (scale 1.4 → 1, 250ms).

**Quick Add button** (desktop hover only):
- Slides up from the bottom of the image area on hover.
- "Quick Add" text + "+" icon.
- `var(--sd-gold)` background, `var(--sd-black)` text.
- If the product has variants: clicking opens a small inline variant picker (bottom sheet on mobile) before adding to cart.
- If single variant: adds directly to cart and shows a brief success toast.

**Pricing**:
- Single price: `৳{price}` in `var(--sd-gold)`, 15px, font-weight 600.
- Price range: `৳{min} – ৳{max}` in gold.
- Sale: `৳{discounted}` gold + `৳{original}` strikethrough in `var(--sd-text-muted)`.

**Card container**:
- Background: `var(--sd-onyx)`.
- Border: `0.5px solid var(--sd-border-light)`.
- Border-radius: `var(--sd-radius-md)`.
- On hover: border becomes `var(--sd-border-default)`, card lifts with `var(--sd-shadow-card)`. Transition: 250ms.
- No `box-shadow` by default (for performance on grids of 20+ cards).

### `CategorySidebar`

- Background: `var(--sd-black)` (not onyx — slightly darker to distinguish from the main content area).
- Category items: 14px ivory. Active: `var(--sd-gold)` text + a `var(--sd-gold)` 3px left border. Hover: `var(--sd-text-primary)` + `translateX(4px)`.
- Price range filter: use a dual-handle range slider styled in gold.
- Filter section headings: 10px, `var(--sd-text-muted)`, letter-spacing 0.25em, uppercase.
- "Apply Filters" button at bottom of sidebar: full-width gold button (44px tall).
- "Clear All" link: right-aligned, 12px, `var(--sd-text-muted)`.

### `SdImage` (New Wrapper Component)

Create `components/ecommerce/SdImage.tsx`. This wraps `next/image` with:
- Automatic skeleton shimmer while loading (`onLoad` → hide skeleton)
- Automatic branded fallback on error (`onError` → show branded placeholder)
- Consistent `sizes` prop based on a `context` prop (`"card"` | `"gallery"` | `"thumbnail"` | `"hero"`)
- Applies `toAbsoluteAssetUrl` internally so callers never need to remember the proxy

### `CartItem`

See Section 8.1 for visual specs. Logic unchanged.

### `Navigation`

See Section 3 for complete spec.

### `InstagramReelViewer`

See Section 4.5 for complete spec.

### `StickyAddToCart`

See Section 7.5 for complete spec.

### `VariantSelector`

See Section 7.3 for complete spec.

### `Paymentstatuschecker`

No visual changes. Logic unchanged.

---

## 11. Performance & Optimisation Directives

This section is non-negotiable. The site must score **90+ on Lighthouse mobile**.

### 11.1 Image Performance

- Every `<img>` must be replaced with the new `<SdImage />` component.
- `next/image` handles WebP conversion and responsive srcsets automatically — rely on this.
- Hero image: `priority` flag. All below-the-fold images: `loading="lazy"` (default in next/image).
- Set explicit `width` and `height` on every image to prevent layout shift (CLS).
- Home page image grid: use `sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"` on product card images.

### 11.2 Code Splitting & Dynamic Imports

Preserve and extend the existing `next/dynamic` usage:
- `InstagramReelViewer` — dynamic, no SSR (iframes)
- `ProductImageGallery` — dynamic (loads Framer Motion)
- `CartSidebar` — dynamic, no SSR
- `CheckoutClient` — dynamic
- Any component using `window` or `document` directly — dynamic, no SSR

### 11.3 Animation Performance

- **Never animate `width`, `height`, `top`, `left`, `right`, or `bottom`**. These trigger layout reflow.
- Only animate `transform` and `opacity`. These use GPU compositing and are performant on mobile.
- All Framer Motion animations must use `will-change: transform` on the animated element (Framer adds this automatically — verify it's not being overridden).
- Skeleton shimmer: use `background-position` animation, not `width`.
- Auto-scroll testimonials strip: use CSS animation, not JavaScript scroll manipulation.

### 11.4 Font Loading

```tsx
// In layout.tsx
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--sd-font-sans',
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--sd-font-display',
  weight: ['700'],
  preload: false, // Only used on hero — not critical
});
```

### 11.5 Mobile Tap Targets

- Every interactive element must have a minimum tap target of **44px × 44px**.
- If an icon is visually smaller (e.g., 22px), add `padding` to bring the total tap area to 44px.
- Never rely on `font-size` alone to indicate something is tappable.

### 11.6 Scroll Performance

- Use `overscroll-behavior: none` on the body to prevent scroll chaining.
- The bottom navigation bar must not cause content to be obscured. Add `padding-bottom: 80px` (or the actual nav height + 16px) to the main content wrapper on mobile.
- Horizontal scroll strips (New Arrivals, Best Sellers, etc.): use `-webkit-overflow-scrolling: touch` and hide the scrollbar: `scrollbar-width: none; &::-webkit-scrollbar { display: none; }`.

### 11.7 Network & Data

- All category/home page data should be fetched server-side (Next.js Server Components or `getServerSideProps`/`generateStaticParams` where appropriate) to eliminate client-side loading waterfalls.
- Product grid pages: use React Suspense boundaries around the grid so the filter sidebar shows instantly while products load.
- Cart: the sidebar state is client-side only. Do not block rendering on cart data.

---

## 12. Admin CMS Integration Points (Future)

These sections of the site are flagged for future CMS integration. When implementing now, structure each as follows:

1. Create a server-side data-fetching function (e.g., `getHeroContent()`) that returns hardcoded defaults.
2. The component accepts the data as props — it has **no internal hardcoded content**.
3. When the admin panel is ready, replace the hardcoded return value in the fetching function with a real API call. No component changes needed.

### CMS Integration Points Table

| Section | Component | Future API Endpoint | Data Shape |
|---|---|---|---|
| Hero image & copy | `HeroSection` | `GET /api/admin/homepage/hero` | `{ imageUrl, heading, subline, ctaText, ctaHref }` |
| Instagram Reels | `InstagramReelViewer` | `GET /api/admin/homepage/reels` | `{ reels: string[] }` |
| Homepage banner promotions | (New component) | `GET /api/admin/homepage/banners` | `{ banners: { imageUrl, href, altText }[] }` |
| Category featured images | `CategoryCard` | `GET /api/categories` (already exists) | Add `featuredImageUrl` field to existing category API |
| Announcement bar | (New component) | `GET /api/admin/announcements` | `{ text, linkText, linkHref, isActive }` |

### Announcement Bar (Add Now, CMS-Ready)

Add an announcement bar above the navigation (or below it on mobile). Height: 36px. Background: `var(--sd-gold)`. Text: `var(--sd-black)`, 12px, bold, centred.

Example content (hardcoded for now): "🚚 Free delivery on orders above ৳1,500 — Shop Now →"

Wait — remove the truck emoji. Replace with a small right-arrow SVG for "Shop Now →" and no decorative icon before "Free delivery". Keep it clean text only.

The bar should be dismissible (localStorage stores the dismissed state). On dismiss, it slides up and the navigation shifts down smoothly.

---

## Appendix A — File Change Summary

| File | Change Type | Priority |
|---|---|---|
| `globals.css` | Add design tokens | Critical |
| `app/e-commerce/layout.tsx` | Add providers, page transition | Critical |
| `components/ecommerce/Navigation.tsx` | Full redesign | Critical |
| `app/e-commerce/page.tsx` | Full redesign | Critical |
| `components/ecommerce/PremiumProductCard.tsx` | Full redesign | Critical |
| `components/ecommerce/SdImage.tsx` | New component | Critical |
| `app/e-commerce/products/page.tsx` | Visual redesign | High |
| `app/e-commerce/search/search-client.tsx` | Visual redesign | High |
| `app/e-commerce/product/[id]/page.tsx` | Visual redesign | High |
| `components/ecommerce/VariantSelector.tsx` | Visual redesign | High |
| `components/ecommerce/CartItem.tsx` | Visual redesign | High |
| `components/ecommerce/CartSidebar.tsx` | Visual redesign | High |
| `app/e-commerce/checkout/CheckoutClient.tsx` | Visual redesign | High |
| `components/ecommerce/CategorySidebar.tsx` | Visual redesign | Medium |
| `app/e-commerce/cart/page.tsx` | No change (deprecated) | None |
| `app/e-commerce/thank-you/page.tsx` | Visual redesign | Medium |
| `app/e-commerce/order-confirmation/page.tsx` | Visual redesign | Medium |

---

## Appendix B — Do Not Change

The following files and systems must remain **logically unchanged**. Only their visual output (JSX/CSS) is being updated:

- `CartContext.tsx` — all cart logic, guest merging, `getTotalPrice`, inventory sync
- `CustomerAuthProvider` — all auth logic
- `PromotionContext` — all promotion calculation logic
- `cartService`, `checkoutService`, `guestCheckoutService` — all API service files
- `parseMarketSizePairs`, `deriveVariantMeta` — variant parsing logic
- `groupProductsByMother`, `getAdditionalVariantCount` — SKU grouping logic
- `toAbsoluteAssetUrl` — image proxy utility
- `SSLCommerzPayment.tsx` — payment gateway logic
- `Paymentstatuschecker.tsx` — payment status recovery logic
- URL synchronisation logic on filter pages
- Scroll restoration (`ScrollToTopOnRouteChange`)

---

*Document version: 1.0 — Prepared for Sareng Digital frontend implementation.*
*Brand primary: #0A0A0A (Midnight) + #C9A84C (Sareng Gold) | Mobile-first | Next.js 15 + React 19*
