'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import styles from './SpecsDetail.module.css';

interface SpecItem {
  value: number;
  displayPrefix?: string;
  suffix: string;
  label: string;
  detail?: string;
}

const specs: SpecItem[] = [
  { value: 610, suffix: 'KM', label: 'Range' },
  { value: 200, suffix: 'KM/H', label: 'Top Speed' },
  { value: 0, displayPrefix: '0-100', suffix: 'KM/H', label: 'Acceleration', detail: '3.8s' },
  { value: 100, suffix: 'KWH', label: 'Battery' },
];

function easeOutQuad(t: number): number {
  return t * (2 - t);
}

export default function SpecsDetail() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const [counters, setCounters] = useState<number[]>(specs.map(() => 0));

  const animateCounters = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuad(progress);

      setCounters(
        specs.map((spec) => {
          if (spec.displayPrefix) return 0;
          return Math.round(easedProgress * spec.value);
        })
      );

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [animateCounters]);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        {/* Image Showcase */}
        <div className={styles.imageShowcase}>
          <div className={styles.imageWrapper}>
            <Image
              src="/images/dashboard.jpg"
              alt="NIO ES6 Dashboard Cockpit"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          <div className={styles.imageWrapper}>
            <Image
              src="/images/interior.jpg"
              alt="NIO ES6 Interior Seats"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Spec Cards */}
        <div className={styles.specsRow}>
          {specs.map((spec, index) => (
            <div
              className={`${styles.specCard} ${index === specs.length - 1 ? styles.specCardLast : ''}`}
              key={spec.label}
            >
              <div className={styles.specValue}>
                {spec.displayPrefix ? (
                  <>
                    <span>{spec.displayPrefix}</span>
                    <span className={styles.specSuffix}>{spec.suffix}</span>
                  </>
                ) : (
                  <>
                    <span>{counters[index]}</span>
                    <span className={styles.specSuffix}>{spec.suffix}</span>
                  </>
                )}
              </div>
              {spec.detail && (
                <div className={styles.specDetail}>{spec.detail}</div>
              )}
              <div className={styles.specLabel}>{spec.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
