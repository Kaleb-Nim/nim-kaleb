'use client';

import { formatProductStatus, type ProductItem } from '@/app/lib/sections';
import styles from './ProductsPage.module.css';

export default function ProductCard({ product }: { product: ProductItem }) {
  // A real anchor (not a role="button" div) so middle-click and
  // open-in-new-tab work, and `hashchange` drives back/forward —
  // same rationale as Directory.tsx.
  return (
    <a
      href={`#/products/${product.slug}`}
      className={styles.card}
      aria-label={`Open ${product.name} details`}
    >
      <img
        src={product.hero}
        alt=""
        loading="lazy"
        className={styles.cardImg}
      />
      <div className={styles.cardOverlay}>
        <span className={styles.cardTitle}>{product.name}</span>
        <span className={styles.cardKind}>{product.kind}</span>
        <span className={styles.cardStatus}>
          [{formatProductStatus(product)}]
        </span>
      </div>
    </a>
  );
}
