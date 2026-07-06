'use client';

import Image from 'next/image';
import { Feature } from '@/types/database';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './FeaturesGrid.module.css';

interface FeaturesGridProps {
  features: Feature[];
}

export default function FeaturesGrid({ features }: FeaturesGridProps) {
  /* Ensure we have at least 4 features; pad with defaults if needed */
  const featureList: Feature[] = [
    ...features,
    ...Array.from({ length: Math.max(0, 4 - features.length) }, (_, i) => ({
      id: `placeholder-${i}`,
      number: `0${features.length + i + 1}`,
      title: 'Coming Soon',
      description: 'More innovative features are on the way.',
      icon_url: '',
      display_order: features.length + i + 1,
    })),
  ].slice(0, 4);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Section Header */}
        <ScrollReveal>
          <h2 className={styles.heading}>
            Beyond Electric — Driving The Future Forward
          </h2>
          <p className={styles.subtitle}>
            NIO Redefines Cars With Advanced Technology, Comprehensive Design,
            Smart Services And Sustainable Innovation.
          </p>
        </ScrollReveal>

        {/* Grid Layout */}
        <div className={styles.grid}>
          {/* Top-left: Feature 01 */}
          <ScrollReveal className={styles.cell01} delay={0.1}>
            <div className={styles.featureCard}>
              <span className={styles.featureNumber}>
                {featureList[0].number}
              </span>
              <h3 className={styles.featureTitle}>{featureList[0].title}</h3>
              <p className={styles.featureDesc}>
                {featureList[0].description}
              </p>
            </div>
          </ScrollReveal>

          {/* Center: Feature image spanning 2 rows */}
          <ScrollReveal className={styles.cellImage} delay={0.2}>
            <div className={styles.centerImage}>
              <Image
                src="/images/feature-car.jpg"
                alt="NIO Feature Close-up"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </ScrollReveal>

          {/* Top-right: Feature 03 */}
          <ScrollReveal className={styles.cell03} delay={0.15}>
            <div className={styles.featureCard}>
              <span className={styles.featureNumber}>
                {featureList[2].number}
              </span>
              <h3 className={styles.featureTitle}>{featureList[2].title}</h3>
              <p className={styles.featureDesc}>
                {featureList[2].description}
              </p>
            </div>
          </ScrollReveal>

          {/* Bottom-left: Feature 02 (highlighted) */}
          <ScrollReveal className={styles.cell02} delay={0.25}>
            <div className={`${styles.featureCard} ${styles.featureHighlight}`}>
              <span className={styles.featureNumber}>
                {featureList[1].number}
              </span>
              <h3 className={styles.featureTitle}>{featureList[1].title}</h3>
              <p className={styles.featureDesc}>
                {featureList[1].description}
              </p>
            </div>
          </ScrollReveal>

          {/* Bottom-right: Feature 04 */}
          <ScrollReveal className={styles.cell04} delay={0.3}>
            <div className={styles.featureCard}>
              <span className={styles.featureNumber}>
                {featureList[3].number}
              </span>
              <h3 className={styles.featureTitle}>{featureList[3].title}</h3>
              <p className={styles.featureDesc}>
                {featureList[3].description}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
