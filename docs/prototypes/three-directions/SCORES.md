# Three visual directions: checklist scores (issue #9)

Prototype branch only. Routes: `/prototypes/a`, `/prototypes/b`, `/prototypes/c` (`?clean` hides the switcher).

## How it was scored

1. **Krebs's own scorer**, [AdrianKrebs/design-slop-cop](https://github.com/AdrianKrebs/design-slop-cop) `check.js` (14 deterministic DOM/CSS checks), run against `http://localhost:3109/prototypes/<x>?clean` on 2026-11-22.
2. **A supplementary script** for the blog's tells the tool doesn't cover: all-caps headings/labels, identical icon-on-top cards, shadcn/Radix markup, em dashes in copy.

| Direction | design-slop-cop (14) | All-caps | Icon-top cards | shadcn | Em dashes | Total tells |
|---|---|---|---|---|---|---|
| A, Editorial | 0 | 0 | 0 | 0 | 0 | **0** |
| B, Product-dense | 0 | 0 | 0 | 0 | 0 | **0** |
| C, Terminal remnant | 0 | 0 | 0 | 0 | 0 | **0** |

All three are in Krebs's "Low" bucket (target was at most 1).

## Things the scripts can't see (honest notes)

- **A** uses hairline rules between sections, which leans towards the "broadsheet" default. The sidenote column is what makes it its own.
- **B** is closest to a generic product page structurally (sticky bar, rounded screenshot, pill links). Its identity rests on the stat headlines and the highlighter on quoted asides.
- **C** uses mono for small labels (prompts, dates), which is a known generated-page habit; here it's deliberate, the brief asks for it, and it's the old site's face (Anonymous Pro). The dark panel is confined to the voice moment, so it isn't perma-dark.

## Fonts

- A: Newsreader (all prose and display) + IBM Plex Sans (meta only)
- B: Schibsted Grotesk (one family)
- C: Hanken Grotesk + Anonymous Pro (accents and the voice panel)

None appear on Krebs's list (Inter, Space Grotesk, Geist, Instrument Serif) or the HN additions (Syne, Fraunces).
