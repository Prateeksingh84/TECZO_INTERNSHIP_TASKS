'use client';

import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './Community.module.css';

export default function Community() {
  return (
    <section className={styles.section}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <ScrollReveal>
          <h2 className={styles.heading}>Be Part of the Nio Community</h2>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <p className={styles.description}>
            Join a vibrant community of forward-thinking drivers who share a
            passion for innovation, sustainability, and the future of mobility.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.3}>
          <button className={styles.ctaButton} type="button">
            Join Our Community →
          </button>
        </ScrollReveal>
      </div>
      <span className={styles.watermark}>ES6</span>
    </section>
  );
}
