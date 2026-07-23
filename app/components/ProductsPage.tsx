'use client';

import type { Section, ProductItem } from '@/app/lib/sections';
import PageHeader, { FooterMeta } from './PageHeader';
import ProductCard from './ProductCard';
import styles from './ProductsPage.module.css';

export default function ProductsPage({ section }: { section: Section }) {
  const items = section.items as ProductItem[];

  return (
    <div>
      <PageHeader section={section} />
      <div className={styles.grid}>
        {items.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
      <FooterMeta section={section} />
    </div>
  );
}
