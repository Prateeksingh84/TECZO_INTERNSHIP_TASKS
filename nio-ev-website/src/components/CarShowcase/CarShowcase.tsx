'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { CarModel } from '@/types/database';
import styles from './CarShowcase.module.css';

interface CarShowcaseProps {
  models: CarModel[];
  activeCategory: string;
}

export default function CarShowcase({ models, activeCategory }: CarShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  // Filter models by active category
  const filtered =
    activeCategory === 'ALL'
      ? models
      : models.filter((m) => m.category === activeCategory);

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  const current = filtered[currentIndex] as CarModel | undefined;

  const navigate = useCallback(
    (direction: 1 | -1) => {
      if (filtered.length <= 1) return;
      setTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => {
          const next = prev + direction;
          if (next < 0) return filtered.length - 1;
          if (next >= filtered.length) return 0;
          return next;
        });
        setTransitioning(false);
      }, 300);
    },
    [filtered.length],
  );

  if (filtered.length === 0) {
    return (
      <section className={styles.section}>
        <p className={styles.emptyState}>No models found in this category.</p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      {/* Background watermark */}
      {current && <span className={styles.watermark}>{current.name}</span>}

      {/* Previous button */}
      {filtered.length > 1 && (
        <button
          className={`${styles.navButton} ${styles.navPrev}`}
          onClick={() => navigate(-1)}
          aria-label="Previous model"
        >
          <svg
            className={styles.chevron}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Car image */}
      {current && (
        <div
          className={styles.imageWrapper}
          data-transitioning={transitioning}
        >
          <Image
            src={current.side_image_url}
            alt={`${current.name} side profile`}
            width={900}
            height={500}
            className={styles.carImage}
          />
        </div>
      )}

      {/* Next button */}
      {filtered.length > 1 && (
        <button
          className={`${styles.navButton} ${styles.navNext}`}
          onClick={() => navigate(1)}
          aria-label="Next model"
        >
          <svg
            className={styles.chevron}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Bottom specs bar */}
      {current && (
        <div className={styles.specsBar}>
          <div className={styles.specItem}>
            <p className={styles.specValue}>{current.range_km} KM</p>
            <p className={styles.specLabel}>Range</p>
          </div>
          <div className={styles.specItem}>
            <p className={styles.specValue}>{current.top_speed_kmh} KM/H</p>
            <p className={styles.specLabel}>Top Speed</p>
          </div>
          <div className={styles.specItem}>
            <p className={styles.specValue}>{current.acceleration_0_100}s</p>
            <p className={styles.specLabel}>Acceleration</p>
          </div>
          <div className={styles.specItem}>
            <p className={styles.specValue}>{current.battery_kwh} KWH</p>
            <p className={styles.specLabel}>Battery</p>
          </div>
        </div>
      )}
    </section>
  );
}
