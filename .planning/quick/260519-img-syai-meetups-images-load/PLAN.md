---
slug: img-syai-meetups-images-load
date: 2026-05-19
status: complete
---

# Quick task: load SYAI meetup images

`public/meetups/` was empty (only `.gitkeep`), so all hero/gallery `<img>` tags 404'd
and `MeetupImage` hid them — visible result: bordered empty boxes on /syai-meetups.

## Fix

1. Copied source photos from `.planning/research/portfolio_info/` to
   `public/meetups/<slug>/` with normalized filenames (`hero.jpg`, `g1.jpg`...).
2. Updated `app/lib/sections.ts` `gallery` arrays from `[null, ...]` to real paths
   where assets exist. Sized arrays to match available images.

## Items populated (7/11)

| Slug | Hero | Gallery |
|------|------|---------|
| 2025-11-alibaba-cloud | ✓ | 3 |
| 2025-09-fireside | ✓ | 2 |
| 2025-08-startup-pitching | ✓ | 4 |
| 2025-07-sg60-multilingual | ✓ | 3 |
| 2025-06-vibe-coding | ✓ | 1 |
| 2025-04-pitches | ✓ | 2 |
| 2025-01-fireside | ✓ | 0 |

Not populated (no source photos in research dir): `2025-03-resume-roasting`,
`prompt-eng-juniors`, `llms-from-scratch`. These continue to render
`[ no media ]` placeholders.

## Follow-up: Claude Code Workshop date correction + image fit

User flagged: Claude Code Workshop was held 16 May 2026 (not Dec 2024 as
originally stubbed), and its hero (terminal screenshot) was rendering as a
mostly-black thumbnail until zoomed.

Changes:
1. Moved Claude Code Workshop to top of `SYAI_ITEMS` as the most recent
   (`num: 11, date: 'May 2026'`). Renumbered all other entries 1–10 in
   chronological order — no gap. The stubbed `num 2 / Dec 2024` entry was
   removed (it was the same event misdated).
2. Created `public/meetups/2026-05-claude-code/` and populated with
   `hero.jpg` (terminal screenshot) + `g1.jpg`, `g2.jpg`, `g3.jpg`
   (workshop room photos from `~/Downloads/claude_code{1,2,3}.{jpg,JPG}`).
3. Fixed the "black until zoom" hero crop:
   - Added a `fit?: 'cover' | 'contain'` prop to `MeetupImage` (default `cover`).
   - `MeetupCard` now passes `fit="contain"` on the hero only, so wide images
     show the full frame (with letterbox bars on the black `#000` background)
     instead of being center-cropped. Gallery thumbs keep `cover`.
