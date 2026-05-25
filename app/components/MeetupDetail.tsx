'use client';

import { useEffect, useState, useCallback } from 'react';
import type { MeetupItem } from '@/app/lib/sections';
import styles from './MeetupsPage.module.css';

interface MeetupDetailProps {
  event: MeetupItem | null;
  onClose: () => void;
}

export default function MeetupDetail({ event, onClose }: MeetupDetailProps) {
  // Scroll lock: prevent background scroll when overlay is open
  useEffect(() => {
    if (!event) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [event]);

  // Keyboard: Escape to close
  useEffect(() => {
    if (!event) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [event, onClose]);

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const galleryImages = event
    ? event.gallery.filter((src): src is string => src !== null)
    : [];

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight' && lightboxIdx < galleryImages.length - 1)
        setLightboxIdx(lightboxIdx + 1);
      if (e.key === 'ArrowLeft' && lightboxIdx > 0)
        setLightboxIdx(lightboxIdx - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx, galleryImages.length, closeLightbox]);

  if (!event) return null;

  return (
    <div className={styles.detailBackdrop} onClick={onClose}>
      <div
        className={styles.detailPanel}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={styles.detailClose}
          aria-label="Close detail"
          onClick={onClose}
        >
          {'×'}
        </button>

        <div className={styles.detailHeader}>
          <span className={styles.detailNum}>
            #{String(event.num).padStart(2, '0')}
          </span>
          <span className={styles.detailTitle}>{event.title}</span>
          <span className={styles.detailDate}>{event.date}</span>
        </div>

        {event.hero !== null && (
          <img
            src={event.hero}
            alt=""
            className={styles.detailHero}
          />
        )}

        {event.desc && (
          <p className={styles.detailDesc}>{event.desc}</p>
        )}

        {galleryImages.length > 0 && (
          <div className={styles.detailGallery}>
            {galleryImages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className={styles.detailThumb}
                loading="lazy"
                onClick={() => setLightboxIdx(i)}
              />
            ))}
          </div>
        )}

        {lightboxIdx !== null && (
          <div className={styles.lightboxBackdrop} onClick={closeLightbox}>
            <div className={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
              {lightboxIdx > 0 && (
                <button
                  className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                  onClick={() => setLightboxIdx(lightboxIdx - 1)}
                  aria-label="Previous image"
                >
                  ‹
                </button>
              )}
              <img
                src={galleryImages[lightboxIdx]}
                alt=""
                className={styles.lightboxImg}
              />
              {lightboxIdx < galleryImages.length - 1 && (
                <button
                  className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                  onClick={() => setLightboxIdx(lightboxIdx + 1)}
                  aria-label="Next image"
                >
                  ›
                </button>
              )}
              <button
                className={styles.lightboxClose}
                onClick={closeLightbox}
                aria-label="Close lightbox"
              >
                ×
              </button>
              <span className={styles.lightboxCounter}>
                {lightboxIdx + 1} / {galleryImages.length}
              </span>
            </div>
          </div>
        )}

        {event.signup && (
          <a
            href={event.signup}
            target="_blank"
            rel="noreferrer"
            className={styles.detailSignup}
          >
            SIGN UP
          </a>
        )}
      </div>
    </div>
  );
}
