# Phase 17: Meetups Page UX Redesign - Research

**Researched:** 2026-05-25
**Domain:** CSS Grid layout, image overlay techniques, React expand/collapse interaction
**Confidence:** HIGH

## Summary

This phase transforms the meetups page from a vertically-scrolling card list into a photo-forward grid with a stats hero section. The current implementation renders 11 `MeetupCard` components sequentially, each containing a hero image, description, speakers block, and gallery. The redesign removes speakers from the main view, overlays title/date on hero images, and adds an expand-on-click interaction for detail views.

The codebase already uses CSS Grid (HackathonsPage uses `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`), inline styles with a shared `mpColors` palette, and a `MeetupLightbox` component with keyboard navigation. The redesign can reuse the lightbox shell for the expand interaction but needs to replace its image-only content with a detail panel (description + gallery).

**Primary recommendation:** Build a new `MeetupsPage` with a stats hero section, replace `MeetupCard` with a compact `MeetupGridCard` (image + overlay), and adapt the existing `MeetupLightbox` into a `MeetupDetail` overlay for the expand interaction. Use CSS Module for the grid layout (matching the HackathonsPage pattern).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Stats hero section | Browser / Client | -- | Pure presentational, computed from static data at render time |
| Photo grid layout | Browser / Client | -- | CSS Grid, no server involvement |
| Image overlay text | Browser / Client | -- | CSS gradient overlay + absolute positioning |
| Expand interaction | Browser / Client | -- | React state toggle, no data fetching |
| Image serving | CDN / Static | -- | Images in `/public/meetups/`, served by Next.js static |

## Standard Stack

No new packages required. This phase is purely CSS + React component work using the existing stack.

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.0.10 | App Router, static image serving | Already in use |
| React | 19.2.0 | Component rendering, state management | Already in use |
| CSS Modules | built-in | Scoped styles for grid layout | Used by HackathonsPage already |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS Modules | Inline styles (current MeetupCard pattern) | CSS Modules better for pseudo-selectors, media queries, hover states -- matches HackathonsPage precedent |
| React state expand | `<details>` HTML element | Native but poor animation control and doesn't support overlay/lightbox style |

## Architecture Patterns

### System Architecture Diagram

```
SYAI_ITEMS (static data, 11 events)
    |
    v
MeetupsPage
    |
    +-- StatsHero (computed aggregates from SYAI_ITEMS)
    |       |-- stat blocks: events count, attendees, venues
    |       +-- one-liner: "Kaleb organizes SYAI monthly meetups"
    |
    +-- MeetupGrid (CSS Grid, 2-3 columns)
    |       |-- MeetupGridCard x11 (hero image + gradient overlay + title/date)
    |       |       +-- onClick -> setSelectedEvent(idx)
    |       |
    +-- MeetupDetail (overlay/lightbox, conditional on selectedEvent)
    |       |-- event title, date, description
    |       |-- gallery grid (photo-forward)
    |       +-- keyboard nav (Escape to close)
    |
    +-- FooterMeta (reused from PageHeader.tsx)
```

### Recommended Project Structure
```
app/components/
  MeetupsPage.tsx          # REWRITE: stats hero + grid + detail overlay
  MeetupsPage.module.css   # NEW: CSS Module for grid, cards, overlay
  MeetupGridCard.tsx        # NEW: compact image card with overlay text
  MeetupDetail.tsx          # NEW: expand overlay (replaces lightbox content)
  MeetupImage.tsx           # KEEP: reuse for gallery images inside detail
  MeetupLightbox.tsx        # DEPRECATE: functionality absorbed into MeetupDetail
  MeetupCard.tsx            # DEPRECATE: replaced by MeetupGridCard
  MeetupRibbon.tsx          # DEPRECATE: title/date now overlaid on image
  SpeakersBlock.tsx         # DEPRECATE from meetups view (may still be used elsewhere)
  PageHeader.tsx            # KEEP: reuse for breadcrumb + title
```

### Pattern 1: CSS Grid Photo Card with Aspect Ratio
**What:** Fixed aspect-ratio grid cards using CSS `aspect-ratio` + `object-fit: cover`
**When to use:** Whenever creating a uniform photo grid from images of varying dimensions
**Example:**
```css
/* Source: CSS spec / established pattern [ASSUMED] */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.card {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border: 1px solid rgba(0, 255, 0, 0.25);
  cursor: pointer;
  transition: border-color 120ms ease-out, transform 120ms ease-out;
}

.card:hover {
  border-color: rgba(0, 255, 0, 0.55);
  transform: translateY(-2px);
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
```

### Pattern 2: Gradient Overlay for Text on Images
**What:** Bottom gradient overlay ensuring text readability regardless of image brightness
**When to use:** Text overlaid on photographs with varying brightness
**Example:**
```css
/* Source: established web pattern [ASSUMED] */
.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 14px;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.55) 50%,
    transparent 100%
  );
}
```
The gradient approach is superior to `text-shadow` alone because it works on both light and dark images. The 85% opacity at the bottom ensures WCAG AA contrast for green (#00FF00) text against any photo.

### Pattern 3: Stats Hero with Terminal Aesthetic
**What:** Horizontal stat blocks with large numbers and small labels, terminal-styled
**When to use:** Top-of-page aggregate impact numbers
**Example:**
```tsx
// Computed from SYAI_ITEMS at render time
const stats = {
  events: items.length,                    // 11
  attendees: '500+',                       // from section.footer or hardcoded
  venues: new Set(/* extract from desc */).size,
};
```
Layout: flex row of stat blocks, each with a large gold number and a small green label beneath. Bordered with `rgba(0,255,0,0.25)` to match the terminal card pattern. The one-liner beneath establishes Kaleb's role: "Organised and hosted by Kaleb Nim as Head of Community, SYAI".

### Pattern 4: Detail Overlay (Adapted from Existing Lightbox)
**What:** Full-screen overlay showing event details + gallery when a grid card is clicked
**When to use:** Replacing the current scrollable card detail
**Example:**
```tsx
// Reuse the existing lightbox shell pattern from MeetupLightbox.tsx
// Key adaptations:
// 1. Replace single-image view with description + gallery grid
// 2. Keep Escape-to-close and backdrop-click-to-close
// 3. Keep the kniPanelOpen animation
// 4. Add internal image lightbox (click gallery photo -> zoom)
```

The existing `MeetupLightbox` has good patterns to reuse:
- Fixed overlay with `backdrop-filter: blur(4px)` and `rgba(1,8,16,0.92)` background
- Keyboard event handling (Escape, arrow keys)
- `kniPanelOpen` animation (already defined in globals.css)
- Close button and caption styling

### Anti-Patterns to Avoid
- **Inline grid styles:** The current `MeetupCard` uses inline `style={{}}` for its grid. Use CSS Modules for the new grid (media queries, pseudo-selectors, hover states are painful inline). Matches HackathonsPage precedent.
- **Duplicating mpColors:** The `mpColors` object is copy-pasted across 5 files. The new components should use CSS custom properties from `globals.css` (already defined as `--kni-green`, `--kni-gold`, etc.).
- **Loading all gallery images upfront:** Gallery images should only load when the detail overlay opens. Use `loading="lazy"` or conditional rendering.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image aspect ratio consistency | Manual width/height calculations | CSS `aspect-ratio: 4/3` + `object-fit: cover` | Built-in, works across all browsers |
| Text readability on images | Per-image brightness detection | CSS gradient overlay (bottom-to-transparent) | Works on any image, zero JS |
| Scroll lock when overlay open | Manual body overflow toggling | `document.body.style.overflow = 'hidden'` on open, restore on close (or use existing lightbox pattern) | Simple, already done in codebase |
| Keyboard navigation in overlay | Custom key handler | Reuse the `useEffect` keydown pattern from `MeetupLightbox.tsx` | Already tested, handles Escape + arrows |

## Common Pitfalls

### Pitfall 1: Image Loading Performance
**What goes wrong:** 11 hero images loading simultaneously causes layout shift and slow initial paint
**Why it happens:** All images are `<img>` tags without lazy loading
**How to avoid:** Use `loading="lazy"` on all grid card images except the first 3-4 (above the fold). Gallery images inside detail overlay should only render when overlay is open.
**Warning signs:** Large Cumulative Layout Shift (CLS), slow Time to Interactive

### Pitfall 2: Overlay Scroll Bleed
**What goes wrong:** Background page scrolls while overlay is open on mobile
**Why it happens:** Touch events propagate through the overlay
**How to avoid:** Set `document.body.style.overflow = 'hidden'` when detail overlay opens, restore on close. The existing `MeetupLightbox` does NOT do this -- must add.
**Warning signs:** Page position changes when closing overlay on mobile

### Pitfall 3: Image-Free Events
**What goes wrong:** Events without a hero image (`hero: null`) break the grid visual rhythm
**Why it happens:** Not all events have photos (checking data: all current SYAI_ITEMS have `hero` set, but the type allows `null`)
**How to avoid:** Use the existing `MeetupImage` placeholder pattern (grid background + "[ no media ]" text) for null heroes. Ensure it matches the `aspect-ratio: 4/3` of photo cards.
**Warning signs:** Broken grid alignment, missing cards

### Pitfall 4: Text Overlay Contrast on Bright Images
**What goes wrong:** Green text becomes unreadable on bright/white areas of photos
**Why it happens:** Gradient overlay doesn't cover enough of the image, or opacity too low
**How to avoid:** Use 85% opacity black at bottom of gradient, keep text in bottom 40% of card only. Add a subtle `text-shadow: 0 1px 3px rgba(0,0,0,0.8)` as a safety net.
**Warning signs:** Squinting to read titles on specific event cards

### Pitfall 5: Responsive Grid Column Collapse
**What goes wrong:** Grid jumps from 3 columns to 1 column abruptly, creating a jarring layout shift
**Why it happens:** Using `auto-fit` with a minmax that's too wide
**How to avoid:** Use `minmax(260px, 1fr)` for natural 3->2->1 flow. At 768px viewport: 2 columns. Below 480px: 1 column. The `auto-fill` keyword handles this naturally.
**Warning signs:** Cards stretching too wide on tablet, or stacking to 1-col too early

## Code Examples

### Stats Hero Section
```tsx
// Source: derived from existing PageHeader.tsx pattern + terminal aesthetic
const stats = [
  { value: items.length, label: 'EVENTS' },
  { value: '500+', label: 'ATTENDEES' },
  { value: '6+', label: 'VENUES' },
];

<div className={styles.statsHero}>
  {stats.map(s => (
    <div key={s.label} className={styles.statBlock}>
      <div className={styles.statValue}>{s.value}</div>
      <div className={styles.statLabel}>{s.label}</div>
    </div>
  ))}
</div>
<div className={styles.statsTagline}>
  Organised by Kaleb Nim as Head of Community, Singapore Youth AI
</div>
```

### Grid Card with Image Overlay
```tsx
// Source: new component pattern for this redesign
<article className={styles.gridCard} onClick={() => onSelect(event)}>
  <MeetupImage src={event.hero} aspect="4 / 3" fit="cover" />
  <div className={styles.cardOverlay}>
    <span className={styles.cardNum}>#{String(event.num).padStart(2, '0')}</span>
    <div className={styles.cardTitle}>{event.title}</div>
    <div className={styles.cardDate}>{event.date}</div>
  </div>
</article>
```

### Responsive Grid CSS
```css
/* MeetupsPage.module.css */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
  margin-top: 16px;
}

@media (min-width: 900px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
```

### Detail Overlay Structure
```tsx
// Source: adapted from existing MeetupLightbox.tsx pattern
<div className={styles.detailBackdrop} onClick={onClose}>
  <div className={styles.detailPanel} onClick={e => e.stopPropagation()}>
    {/* Header: event number, title, date */}
    <div className={styles.detailHeader}>
      <span className={styles.detailNum}>#{String(event.num).padStart(2, '0')}</span>
      <span className={styles.detailTitle}>{event.title}</span>
      <span className={styles.detailDate}>{event.date}</span>
      <button onClick={onClose} className={styles.detailClose}>x</button>
    </div>
    {/* Hero image large */}
    {event.hero && <img src={event.hero} className={styles.detailHero} alt="" />}
    {/* Description */}
    {event.desc && <p className={styles.detailDesc}>{event.desc}</p>}
    {/* Gallery grid */}
    {event.gallery.length > 0 && (
      <div className={styles.detailGallery}>
        {event.gallery.map((src, i) => (
          src && <img key={i} src={src} className={styles.detailThumb} alt=""
                      onClick={() => openFullImage(src)} loading="lazy" />
        ))}
      </div>
    )}
    {/* Sign-up link if exists */}
    {event.signup && (
      <a href={event.signup} target="_blank" rel="noreferrer"
         className={styles.detailSignup}>SIGN UP</a>
    )}
  </div>
</div>
```

## Component Reuse Assessment

| Component | Verdict | Rationale |
|-----------|---------|-----------|
| `MeetupsPage.tsx` | **REWRITE** | New layout: stats hero + grid + detail overlay. Keep `PageHeader` + `FooterMeta` usage. |
| `MeetupCard.tsx` | **REPLACE** with `MeetupGridCard.tsx` | Current card is too tall (hero + desc + speakers + gallery). New card is just image + overlay. |
| `MeetupImage.tsx` | **KEEP** | Reuse inside detail overlay for gallery images. Also usable for grid card hero with `fit="cover"`. |
| `MeetupLightbox.tsx` | **ADAPT** into `MeetupDetail.tsx` | Keep the overlay shell (backdrop, keyboard handling, animation). Replace image-only content with description + gallery layout. |
| `MeetupRibbon.tsx` | **DEPRECATE** | Title/date will be overlaid on grid card images, no separate ribbon needed. |
| `SpeakersBlock.tsx` | **REMOVE from view** | User explicitly flagged speakers as too distracting. Component file can remain (no dead code cleanup in this phase). |
| `PageHeader.tsx` | **KEEP** | Continue using for breadcrumb + page title. |
| `FooterMeta` | **KEEP** | Continue using for footer. |

## Responsive Strategy

| Breakpoint | Columns | Card Aspect | Gap | Notes |
|------------|---------|-------------|-----|-------|
| >= 900px (desktop) | 3 | 4:3 | 14px | Fixed 3-column grid |
| 481-899px (tablet) | 2 | 4:3 | 14px | `auto-fill, minmax(260px, 1fr)` gives 2 cols naturally |
| <= 480px (mobile) | 1 | 16:10 | 10px | Full-width cards, slightly wider aspect for better mobile use |

Stats hero: flex row on desktop/tablet, stacks to column on mobile (<480px).
Detail overlay: max-width 800px centered, scrollable on mobile if content exceeds viewport.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `object-fit` polyfills | Native `object-fit` + `aspect-ratio` | 2022+ (baseline) | No polyfills needed, all modern browsers support both [ASSUMED] |
| JavaScript masonry layouts | CSS `grid-template-rows: masonry` | Experimental (Firefox only) | Do NOT use -- not baseline. Use uniform `aspect-ratio` instead. [ASSUMED] |
| `@media` breakpoints for grid | `auto-fill` + `minmax()` | CSS Grid Level 1 | Fluid columns without explicit breakpoints for 3->2->1 flow |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `aspect-ratio` CSS property has full browser support | Architecture Patterns | LOW -- fallback is padding-bottom hack, but all modern browsers support it |
| A2 | 500+ total attendees across all events | Stats Hero | MEDIUM -- number derived from "30-60 attendees per event x 11 events" mentioned in section footer; user should confirm exact number |
| A3 | 6+ venues is accurate | Stats Hero | LOW -- can be derived from descriptions but user should confirm |
| A4 | CSS `masonry` layout is still experimental/Firefox-only | State of the Art | LOW -- even if it shipped elsewhere, uniform aspect-ratio is the safer choice |

## Open Questions

1. **Exact attendee count for stats hero**
   - What we know: Section footer says "30-60 attendees per event", 11 events total
   - What's unclear: Exact cumulative number, whether to say "500+" or a different figure
   - Recommendation: Use "500+" as an approximate, or let user provide exact number

2. **Should the detail overlay include speakers at all?**
   - What we know: User said "remove speakers from main view" (grid cards)
   - What's unclear: Whether speakers should appear in the expanded detail view or be completely removed
   - Recommendation: Omit speakers from detail view too (user flagged as "too distracting"). Can add back later if requested.

3. **Gallery image lightbox inside detail overlay**
   - What we know: Current lightbox zooms individual photos with prev/next
   - What's unclear: Should clicking a gallery photo in the detail overlay open a nested lightbox, or is the detail view enough?
   - Recommendation: Allow clicking gallery photos to open them full-screen (reuse existing lightbox image zoom logic). Two-level interaction: grid card -> detail overlay -> full image.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `MeetupsPage.tsx`, `MeetupCard.tsx`, `MeetupLightbox.tsx`, `MeetupImage.tsx`, `MeetupRibbon.tsx`, `SpeakersBlock.tsx`, `PageHeader.tsx`, `HackathonsPage.tsx`, `HackathonsPage.module.css`, `globals.css`, `sections.ts`
- Existing design system: CSS custom properties in `globals.css` (`--kni-*` tokens), `mpColors` palette, `kniPanelOpen` animation

### Secondary (MEDIUM confidence)
- CSS Grid and `aspect-ratio` browser support -- well-established baseline features

### Tertiary (LOW confidence)
- CSS `masonry` layout status -- claimed experimental based on training data [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new packages, purely existing React + CSS
- Architecture: HIGH - patterns derived directly from existing codebase (HackathonsPage grid, MeetupLightbox overlay)
- Pitfalls: HIGH - identified from codebase analysis (missing lazy loading, scroll bleed, null heroes)

**Research date:** 2026-05-25
**Valid until:** 2026-06-25 (stable -- CSS/React patterns, no external dependencies)
