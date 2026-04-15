# Quick Task 260415-l3w: Add Important Links to Terminal - Research

**Researched:** 2026-04-15
**Domain:** React component modification, HTML `<a>` inside `<pre>`, CSS styling
**Confidence:** HIGH

## Summary

The CognitiveStatus component currently renders all rows as plain text strings inside `<pre>` tags via `formatTwoColumn()` which returns a single string. To make link values clickable, the rendering must switch from returning a plain string to returning JSX with embedded `<a>` tags for link rows, while keeping plain string rendering for joke rows.

**Primary recommendation:** Replace the string-only `formatTwoColumn` approach with a JSX-returning render function for link rows. `<a>` tags inside `<pre>` elements are valid HTML and render correctly in all browsers -- the key constraint is that the `<a>` content must be plain text (no block elements) and the surrounding whitespace/padding must be handled outside the anchor.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Replace rows in the existing CognitiveStatus component
- Keep two-column monospace dashboard format
- Do NOT add a new section
- Row 1: LinkedIn (left) + GitHub (right) -- real links
- Row 2: Email (left) + Resume/CV (right) -- real links
- Row 3: Coffee Consumed (left, joke) + Side Projects (right, joke) -- keep as-is
- Row 4: Prod Incidents (left, joke) + Emotion Index (right, joke) -- keep as-is
- Remove the 5th row (Neural Activity / Model)
- Value portion is clickable `<a>` tag styled gold (#FFD700)
- Label portion stays green (#00FF00)
- LinkedIn + GitHub + Resume: target="_blank"
- Email: mailto: link
- CV: copy to public/kaleb-cv.pdf, served as static file
- Keep monospace alignment, typewriter animation, responsive fallback
- Subtle hover state (underline or brightness)
</user_constraints>

## Architecture Patterns

### Current Implementation (What Exists)

The `CognitiveStatus.tsx` component:
- Defines `statusData: StatusRow[]` with `left`/`right` objects containing `label` and `value` strings
- `formatTwoColumn()` returns a single string with `padEnd` alignment
- Renders inside `<pre className={styles.statusLine}>` which preserves whitespace
- Row-by-row animation via `visibleRows` state counter

### Required Change: Mixed Text + Links in `<pre>`

**Problem:** `formatTwoColumn()` returns a string. You cannot embed `<a>` tags in a string return -- you need JSX.

**Solution:** For link rows, return JSX instead of a string. `<a>` tags inside `<pre>` are valid HTML5 (phrasing content is allowed in `<pre>`). [VERIFIED: HTML spec -- `<pre>` accepts phrasing content which includes `<a>`]

**Pattern:**

```tsx
// Extend the data model to support links
interface StatusCell {
  label: string;
  value: string;
  href?: string;        // If present, value becomes a link
  external?: boolean;   // target="_blank" + rel="noopener noreferrer"
}

interface StatusRow {
  left: StatusCell;
  right: StatusCell;
}
```

For rendering a two-column row with links:

```tsx
const renderTwoColumn = (row: StatusRow): React.ReactNode => {
  const leftLabel = `  ${row.left.label.padEnd(22, ' ')}: `;
  const leftValue = row.left.value.padEnd(18, ' ');
  const rightLabel = `${row.right.label.padEnd(25, ' ')}: `;
  const rightValue = row.right.value;

  return (
    <>
      {leftLabel}
      {row.left.href ? (
        <a href={row.left.href}
           className={styles.goldLink}
           target={row.left.external ? "_blank" : undefined}
           rel={row.left.external ? "noopener noreferrer" : undefined}>
          {leftValue}
        </a>
      ) : leftValue}
      {rightLabel}
      {row.right.href ? (
        <a href={row.right.href}
           className={styles.goldLink}
           target={row.right.external ? "_blank" : undefined}
           rel={row.right.external ? "noopener noreferrer" : undefined}>
          {rightValue}
        </a>
      ) : rightValue}
    </>
  );
};
```

**Critical detail:** The padding spaces must be OUTSIDE the `<a>` tag for non-link cells, but the padded value string goes INSIDE the `<a>` for link cells. This keeps the monospace grid intact because `<a>` inherits the `<pre>` font and does not add any box model space.

### CSS for Gold Links

Add to `CognitiveStatus.module.css`:

```css
.goldLink {
  color: var(--yellow-accent);
  text-decoration: none;
  cursor: pointer;
  /* Override any inherited text-shadow from phosphor-glow */
  text-shadow:
    0 0 4px rgba(255, 215, 0, 0.4),
    0 0 8px rgba(255, 215, 0, 0.2);
}

.goldLink:hover {
  text-decoration: underline;
  filter: brightness(1.2);
}
```

### Mobile Single-Column Handling

The existing `formatSingleColumn` also returns a string. Same pattern applies -- for link rows, return JSX with `<a>` wrapping just the value. Since mobile uses `<div>` not `<pre>`, the link just needs `white-space: normal` compatibility (already handled by existing `.singleColumn .statusLine` rule).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF serving | Custom API route for PDF | Next.js `public/` directory | Files in `public/` are served statically at root path -- zero config |
| Link security | Manual rel attributes | Always add `rel="noopener noreferrer"` with `target="_blank"` | Prevents reverse tabnapping [VERIFIED: standard practice] |

## Common Pitfalls

### Pitfall 1: Broken Monospace Alignment After Adding Links
**What goes wrong:** If `<a>` tags add CSS that changes the font or spacing, columns misalign.
**How to avoid:** Ensure `.goldLink` inherits `font-family` from parent `<pre>` (it does by default). Do NOT add padding/margin to the link. The `<a>` must be purely a color/interaction wrapper.

### Pitfall 2: padEnd Alignment With Variable-Length Display Text
**What goes wrong:** If link display text (e.g., "linkedin.com/in/kaleb-nim") is longer than the padEnd target width (18 chars for left value), the right column shifts.
**How to avoid:** Use short display values: "LinkedIn", "GitHub", "kaleb.nim@gmail.com" (or truncated). Measure character counts against the 18-char left value budget. Alternatively, adjust padEnd width if needed.

**Character budget check:**
- Left value column: 18 chars (current `padEnd(18)`)
- "LinkedIn" = 8 chars -- fits
- "GitHub" = 6 chars -- fits
- "kaleb.nim@gmail.com" = 19 chars -- overflows by 1. Either truncate to "kaleb.nim@gmail" or increase padEnd to 22+.
- "Download CV [PDF]" = 17 chars -- fits

### Pitfall 3: CV PDF Not Found in Production
**What goes wrong:** Forgetting to copy the PDF to `public/` or the filename having spaces.
**How to avoid:** The file must be at `public/kaleb-cv.pdf` (no spaces). Next.js serves it at `/kaleb-cv.pdf`. Verify with `bun dev` and visiting the URL directly.

### Pitfall 4: mailto: Link Display
**What goes wrong:** `mailto:` links can look odd or trigger unexpected behavior on devices without email clients.
**How to avoid:** This is acceptable for a portfolio site. The `mailto:` href is standard. No mitigation needed -- worst case, the user copies the email address.

## Data Model Update

Replace the current `statusData` array with:

```tsx
const statusData: StatusRow[] = [
  {
    left:  { label: "LinkedIn", value: "LinkedIn", href: "https://www.linkedin.com/in/kaleb-nim/", external: true },
    right: { label: "GitHub", value: "GitHub", href: "https://github.com/Kaleb-Nim", external: true },
  },
  {
    left:  { label: "Email", value: "kaleb.nim@gmail.com", href: "mailto:kaleb.nim@gmail.com" },
    right: { label: "Resume", value: "Download CV [PDF]", href: "/kaleb-cv.pdf", external: true },
  },
  {
    left:  { label: "Coffee Consumed", value: "4.2L today" },
    right: { label: "Side Projects", value: "∞ (unfinished)" },
  },
  {
    left:  { label: "Prod Incidents", value: "definitely 0" },
    right: { label: "Emotion Index", value: "Stable" },
  },
];
```

**Note on email value width:** "kaleb.nim@gmail.com" is 19 chars, exceeding the current 18-char `padEnd`. Recommend increasing left value `padEnd` from 18 to 22 to accommodate. This shifts the right column slightly but keeps alignment clean. Alternatively, use a shorter display value like "Email Me" for the link text.

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `CognitiveStatus.tsx`, `CognitiveStatus.module.css`, `globals.css`
- HTML spec: `<a>` is phrasing content, valid inside `<pre>` [ASSUMED -- standard HTML5 spec, well-established]

### Secondary (MEDIUM confidence)
- Next.js `public/` static file serving [ASSUMED -- standard Next.js behavior, verified by existing files in public/]

## Metadata

**Confidence breakdown:**
- Implementation approach: HIGH -- straightforward JSX refactor of existing component
- CSS styling: HIGH -- CSS variables already defined, just need new class
- Alignment math: HIGH -- verified character counts against padEnd values
- PDF serving: HIGH -- public/ directory already has files

**Research date:** 2026-04-15
**Valid until:** No expiry -- stable patterns
