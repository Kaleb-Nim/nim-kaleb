// app/lib/workStatus.ts — status metadata for work-experience timeline nodes.
//
// Source-of-truth:
//   - ACTIVE / SHIPPED / ARCHIVED rows are verbatim from
//     .planning/research/v3-design-kit/pages.jsx (lines 89-92, WORK_STATUS_META).
//   - WIP / MILESTONE rows are verbatim from
//     .planning/research/v3-design-kit/Timeline.jsx (lines 15-21, STATUS_META).
//
// Per Phase 11 D-Implementation Decisions: keep the full table so future tags
// (WIP, MILESTONE) work without code changes.

export type WorkStatusTag =
  | 'ACTIVE'
  | 'SHIPPED'
  | 'ARCHIVED'
  | 'WIP'
  | 'MILESTONE';

export interface WorkStatusMeta {
  color: string;
  glow: string;
  sym: string;
}

export const STATUS_META: Record<WorkStatusTag, WorkStatusMeta> = {
  SHIPPED:   { color: '#00FF00',            glow: 'rgba(0,255,0,0.6)',   sym: '●' },
  ACTIVE:    { color: '#00FF00',            glow: 'rgba(0,255,0,0.7)',   sym: '◉' },
  ARCHIVED:  { color: 'rgba(0,255,0,0.45)', glow: 'rgba(0,255,0,0.2)',   sym: '○' },
  WIP:       { color: '#FFD700',            glow: 'rgba(255,215,0,0.6)', sym: '◐' },
  MILESTONE: { color: '#FFD700',            glow: 'rgba(255,215,0,0.7)', sym: '★' },
};

export function workStatusOf(tag: string | undefined): WorkStatusMeta {
  if (tag && Object.prototype.hasOwnProperty.call(STATUS_META, tag)) {
    return STATUS_META[tag as WorkStatusTag];
  }
  return STATUS_META.SHIPPED;
}
