'use client';

import { useEffect, useState } from 'react';
import { useHashSubRoute } from '@/app/hooks/useHashRoute';
import { PRODUCT_ITEMS, formatProductStatus } from '@/app/lib/sections';
import NotFoundPage from './NotFoundPage';
import styles from './ProductsPage.module.css';

function hostOf(href: string): string {
  try {
    const u = new URL(href);
    return `${u.host}${u.pathname.replace(/\/$/, '')}`;
  } catch {
    return href;
  }
}

export default function ProductDetail() {
  const slug = useHashSubRoute();
  const product = PRODUCT_ITEMS.find((p) => p.slug === slug);

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const closeLightbox = () => setLightboxIdx(null);

  // Hero is zoomable too, matching how the meetups lightbox flattens.
  const images = product ? [product.hero, ...product.gallery] : [];
  const imageCount = images.length;

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight' && lightboxIdx < imageCount - 1)
        setLightboxIdx(lightboxIdx + 1);
      if (e.key === 'ArrowLeft' && lightboxIdx > 0)
        setLightboxIdx(lightboxIdx - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx, imageCount]);

  if (!product) {
    return <NotFoundPage />;
  }

  return (
    <div style={{ fontFamily: '"Anonymous Pro", monospace' }}>
      {/* Breadcrumb back-link — always the canonical path, even when the
          visitor arrived through an alias. */}
      <div>
        <a
          href="#/products"
          className={styles.back}
          aria-label="Back to products list"
        >
          ← ~/kaleb / products
        </a>
      </div>

      <div className={styles.title}>{product.name}</div>

      <div className={styles.statusRow}>
        <span className={styles.statusChip}>
          [{formatProductStatus(product)}]
        </span>
        <span className={styles.metaLine}>
          {product.kind} · published {product.published}
        </span>
      </div>

      {typeof product.installs === 'number' && product.installsAsOf && (
        <div className={styles.installsNote}>
          install count is a point-in-time figure as of {product.installsAsOf}
        </div>
      )}

      <p className={styles.tagline}>{product.tagline}</p>
      <p className={styles.narrative}>{product.narrative}</p>

      <img
        src={product.hero}
        alt={`${product.name} screenshot`}
        className={styles.hero}
        onClick={() => setLightboxIdx(0)}
      />

      <div className={styles.sectionLabel}>Features</div>
      <ul className={styles.featureList}>
        {product.features.map((f) => (
          <li key={f} className={styles.featureItem}>
            {f}
          </li>
        ))}
      </ul>

      <div className={styles.sectionLabel}>Stack</div>
      <div className={styles.stackRow}>
        {product.stack.map((s) => (
          <span key={s} className={styles.stackChip}>
            {s}
          </span>
        ))}
      </div>

      {product.gallery.length > 0 && (
        <>
          <div className={styles.sectionLabel}>Gallery</div>
          <div className={styles.gallery}>
            {product.gallery.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`${product.name} screenshot ${i + 2}`}
                className={styles.thumb}
                loading="lazy"
                onClick={() => setLightboxIdx(i + 1)}
              />
            ))}
          </div>
        </>
      )}

      <div className={styles.sectionLabel}>Links</div>
      <div className={styles.linkList}>
        {product.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={styles.linkChip}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${link.label} for ${product.name} in new tab`}
          >
            <span className={styles.linkLabel}>[ {link.label} ↗ ]</span>
            <span className={styles.linkHost}>{hostOf(link.href)}</span>
          </a>
        ))}
      </div>

      {lightboxIdx !== null && (
        <div className={styles.lightboxBackdrop} onClick={closeLightbox}>
          <div
            className={styles.lightboxInner}
            onClick={(e) => e.stopPropagation()}
          >
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
              src={images[lightboxIdx]}
              alt={`${product.name} screenshot ${lightboxIdx + 1}`}
              className={styles.lightboxImg}
            />
            {lightboxIdx < images.length - 1 && (
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
              {lightboxIdx + 1} / {images.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
