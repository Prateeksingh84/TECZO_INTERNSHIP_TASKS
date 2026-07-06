'use client';

import { useState } from 'react';
import styles from './FutureSection.module.css';

interface FutureSectionProps {
  onCategoryChange?: (category: string) => void;
}

const CATEGORIES = ['ALL', 'EC', 'ET', 'ES'] as const;

export default function FutureSection({ onCategoryChange }: FutureSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const handleTabClick = (category: string) => {
    setActiveCategory(category);
    onCategoryChange?.(category);
  };

  return (
    <section id="products" className={styles.section}>
      {/* Top two-column row */}
      <div className={styles.topRow}>
        <h2 className={styles.heading}>
          The Future of Luxury
          <br />
          is Electric
        </h2>

        <div className={styles.descriptionCol}>
          <p className={styles.description}>
            Step into the future of automotive excellence. Advanced technology
            that transforms every journey into an extraordinary experience.
          </p>
          <button className={styles.ctaButton}>
            See Our Products
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className={styles.tabsContainer}>
        <ul className={styles.tabs} role="tablist">
          {CATEGORIES.map((cat) => (
            <li key={cat}>
              <button
                role="tab"
                aria-selected={activeCategory === cat}
                className={`${styles.tab} ${
                  activeCategory === cat ? styles.tabActive : ''
                }`}
                onClick={() => handleTabClick(cat)}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
