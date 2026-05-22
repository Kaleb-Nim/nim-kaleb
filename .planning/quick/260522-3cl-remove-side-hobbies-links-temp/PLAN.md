---
slug: remove-side-hobbies-links-temp
created: 2026-05-22
status: in-progress
---

# Temporarily hide Sidequests / Hobbies / Links from home directory

## Intent

Trim the home directory listing down to three "columns" (sections) for now:
- `work-experience`
- `syai-meetups`
- `hackathons`

The three currently-hidden sections — `sidequests`, `hobbies`, `links` — are
**not deleted**. They'll come back once their content is polished. Restoring
them is a one-line change (see `HomePage.tsx` HIDDEN_SECTION_IDS).

## Restoration plan (when ready to bring them back)

1. In `app/components/HomePage.tsx`, remove `'sidequests'`, `'hobbies'`,
   `'links'` from the `HIDDEN_SECTION_IDS` set (or drop the filter entirely).
2. The underlying data (`SIDE_ITEMS`, `HOBBIES_ITEMS`, `LINK_ITEMS`) and the
   `SECTIONS` entries are intact in `app/lib/sections.ts`.
3. The route dispatcher in `app/page.tsx` still falls through to
   `StubSectionPage` for these IDs, so hash routes like `#/hobbies` keep
   working even while hidden from the index.
4. Revisit the grid layout — at 6 items the 3-col grid renders as 2 rows of 3,
   which works at all breakpoints; no further CSS needed.

## Changes

1. `app/components/HomePage.tsx` — filter SECTIONS through `HIDDEN_SECTION_IDS`
   before passing to `<Directory>`. Add inline comment pointing at this plan.
2. `app/components/Directory.tsx` — switch the list to a responsive grid:
   - desktop (≥900px): 3 columns
   - tablet (≥600px): 2 columns
   - mobile (<600px): 1 column (current behaviour preserved)
   - tighten row chrome so a 3-col grid doesn't look sparse: collapse the
     description on narrow grid cells, keep count + chevron always visible.
3. Header line "$ ls ~/kaleb" — keep, but the trailing "N dirs · tap any to
   open" reflects filtered count.
