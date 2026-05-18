'use client';

import type { Section, WorkItem } from '@/app/lib/sections';
import PageHeader, { FooterMeta } from './PageHeader';
import WorkLogoChip from './WorkLogoChip';
import { workStatusOf } from '@/app/lib/workStatus';

export default function WorkPage({ section }: { section: Section }) {
  const items = section.items as WorkItem[];
  return (
    <div>
      <PageHeader section={section} />
      <div style={{ position: 'relative', paddingLeft: 32 }}>
        {/* Vertical rail */}
        <div
          style={{
            position: 'absolute',
            left: 10,
            top: 6,
            bottom: 6,
            width: 1,
            background:
              'linear-gradient(180deg, rgba(0,255,0,0.55) 0%, rgba(0,255,0,0.25) 100%)',
            boxShadow: '0 0 6px rgba(0,255,0,0.35)',
          }}
        />
        {items.map((it, i) => {
          const s = workStatusOf(it.tag || 'SHIPPED');
          const isLast = i === items.length - 1;
          return (
            <div
              key={i}
              style={{ position: 'relative', paddingBottom: isLast ? 0 : 26 }}
            >
              {/* Status node on rail */}
              <div
                style={{
                  position: 'absolute',
                  left: -27,
                  top: 6,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#010810',
                  boxShadow: `inset 0 0 0 1.5px ${s.color}, 0 0 10px ${s.glow}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: s.color,
                  fontSize: '0.58rem',
                  textShadow: `0 0 4px ${s.glow}`,
                }}
              >
                {s.sym}
              </div>

              {/* Row: logo + content */}
              <div
                style={{
                  display: 'flex',
                  gap: 'clamp(10px, 2.5vw, 16px)',
                  alignItems: 'flex-start',
                }}
              >
                {it.logo && (
                  <WorkLogoChip src={it.logo} bg={it.logoBg} alt={it.org} />
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  {/* Date */}
                  <div
                    style={{
                      color: 'rgba(0,255,0,0.6)',
                      fontSize: '0.72rem',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                      textShadow: 'none',
                    }}
                  >
                    {it.date}
                  </div>
                  {/* Title + status chip */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 10,
                      flexWrap: 'wrap',
                      marginTop: 2,
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        color: '#00FF00',
                        fontSize: 'clamp(0.95rem, 2.6vw, 1.05rem)',
                        fontWeight: 700,
                        textShadow:
                          '0 0 4px rgba(0,255,0,0.55), 0 0 10px rgba(0,255,0,0.25)',
                      }}
                    >
                      {it.title}
                    </span>
                    <span
                      style={{
                        color: s.color,
                        fontSize: '0.7rem',
                        letterSpacing: '0.08em',
                        textShadow: `0 0 4px ${s.glow}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      [{it.tag || 'SHIPPED'}]
                    </span>
                  </div>
                  {/* Org */}
                  {it.org && (
                    <div
                      style={{
                        color: 'rgba(0,255,0,0.78)',
                        fontSize: 'clamp(0.78rem, 2vw, 0.82rem)',
                        marginTop: 2,
                        textShadow: '0 0 4px rgba(0,255,0,0.3)',
                      }}
                    >
                      {it.org}
                    </div>
                  )}
                  {/* Description */}
                  {it.note && (
                    <div
                      style={{
                        color: '#00FF00',
                        fontSize: 'clamp(0.78rem, 2vw, 0.84rem)',
                        lineHeight: 1.7,
                        marginTop: 8,
                        textShadow:
                          '0 0 4px rgba(0,255,0,0.3), 0 0 8px rgba(0,255,0,0.15)',
                      }}
                    >
                      {it.note}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <FooterMeta section={section} />
    </div>
  );
}
