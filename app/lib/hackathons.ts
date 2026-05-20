// app/lib/hackathons.ts — typed loader for hackathons.json.
//
// Source of truth: .planning/research/hackathons/hackathons.json (22 projects).
// This module imports the JSON, casts it to HackathonItem[], and exposes a
// HACK_STATS summary the Section footer can render from data.

import hackathonsData from '@/.planning/research/hackathons/hackathons.json';

export interface HackathonTeamMember {
  name: string;
  devpost_url: string;
  linkedin?: string;
  github?: string;
}

export interface HackathonItem {
  slug: string;
  project_url: string;
  title: string;
  tagline: string;
  thumbnail_url: string;
  thumbnail_local: string;
  date: string;
  date_iso: string | null;
  event_name: string | null;
  event_url: string;
  organizer: string;
  prizes: string[];
  team: HackathonTeamMember[];
  built_with: string[];
  description_md: string;
  gallery: string[];
  is_winner: boolean;
  extra_links: string[] | null;
  extra_images?: string[];
  sources: string[];
}

// Sort: most-recent first by date_iso; entries with null date_iso (beacons-only
// projects) fall to the end preserving JSON order among themselves.
const sortByDateDesc = (a: HackathonItem, b: HackathonItem): number => {
  if (a.date_iso && b.date_iso) return a.date_iso < b.date_iso ? 1 : -1;
  if (a.date_iso && !b.date_iso) return -1;
  if (!a.date_iso && b.date_iso) return 1;
  return 0;
};

export const HACK_ITEMS: HackathonItem[] = (
  hackathonsData.projects as HackathonItem[]
)
  .slice()
  .sort(sortByDateDesc);

export interface HackStats {
  total: number;
  wins: number;
  prizes: number;
}

export const HACK_STATS: HackStats = {
  total: HACK_ITEMS.length,
  wins: HACK_ITEMS.filter((p) => p.is_winner).length,
  prizes: HACK_ITEMS.reduce((n, p) => n + p.prizes.length, 0),
};
