'use client';

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { carModels } from '@/lib/data';
import styles from './products.module.css';

const categories = ['ALL', 'ET', 'EC', 'ES'] as const;

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const filteredModels = activeCategory === 'ALL'
    ? carModels
    : carModels.filter(m => m.category === activeCategory);

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <ScrollReveal>
            <div className={styles.header}>
              <h1 className={styles.title}>Our Models</h1>
              <p className={styles.subtitle}>
                Discover the complete NIO lineup. Each model represents our commitment
                to redefining what an electric vehicle can be.
              </p>
            </div>
          </ScrollReveal>

          <div className={styles.filters}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`${styles.filterTab} ${activeCategory === cat ? styles.active : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            {filteredModels.map((model, index) => (
              <ScrollReveal key={model.id} delay={index * 0.1}>
                <div className={styles.card}>
                  <div className={styles.cardImage}>
                    <Image
                      src={model.side_image_url}
                      alt={model.name}
                      width={800}
                      height={450}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                    <div className={styles.cardOverlay}>
                      <span className={styles.cardCategory}>{model.category}</span>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <h2 className={styles.cardName}>{model.name}</h2>
                    <p className={styles.cardTagline}>{model.tagline}</p>
                    <div className={styles.cardSpecs}>
                      <div className={styles.spec}>
                        <span className={styles.specValue}>{model.range_km}</span>
                        <span className={styles.specLabel}>KM Range</span>
                      </div>
                      <div className={styles.spec}>
                        <span className={styles.specValue}>{model.top_speed_kmh}</span>
                        <span className={styles.specLabel}>KM/H</span>
                      </div>
                      <div className={styles.spec}>
                        <span className={styles.specValue}>{model.acceleration_0_100}s</span>
                        <span className={styles.specLabel}>0-100</span>
                      </div>
                      <div className={styles.spec}>
                        <span className={styles.specValue}>{model.battery_kwh}</span>
                        <span className={styles.specLabel}>KWH</span>
                      </div>
                    </div>
                    <div className={styles.cardFooter}>
                      <span className={styles.price}>
                        From ${model.price_usd.toLocaleString()}
                      </span>
                      <button className={styles.learnMore}>
                        Learn More
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <div className={styles.watermark}>MODELS</div>
      </main>
      <Footer />
    </>
  );
}
