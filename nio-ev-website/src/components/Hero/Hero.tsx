'use client';

import Image from 'next/image';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* Radial gradient glow behind car */}
      <div className={styles.radialOverlay} />

      <div className={styles.content}>
        {/* Left – text */}
        <div className={styles.textBlock}>
          <h1 className={styles.heading}>Drive The Future Today</h1>
          <p className={styles.subtitle}>
            More Than A Car, It&apos;s A Statement Of Progressive Luxury.
            Experience The Perfect Blend Of Innovation And Sustainable Elegance.
          </p>
        </div>

        {/* Right – car image */}
        <div className={styles.imageBlock}>
          <Image
            src="/images/hero-car.jpg"
            alt="NIO ET7 front view"
            width={1200}
            height={680}
            priority
            className={styles.carImage}
          />
          <span className={styles.modelLabel}>ET7</span>
        </div>
      </div>

      {/* Scroll down indicator */}
      <button
        className={styles.scrollIndicator}
        aria-label="Scroll down"
        onClick={() =>
          window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
        }
      >
        <svg
          className={styles.chevronDown}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </section>
  );
}
