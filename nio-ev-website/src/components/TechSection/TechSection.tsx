'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './TechSection.module.css';

export default function TechSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={`${styles.container} ${isVisible ? styles.visible : ''}`}>
        {/* Main Heading */}
        <h2 className={styles.heading}>
          Your NIO Adapts And Evolves, Advanced AI Learns Your Preferences While
          Autonomous Driving Capabilities
        </h2>

        {/* Subtitle */}
        <p className={styles.subtitle}>
          And Smart Cockpit Features Create A Seamless Connection Between You And
          Your Vehicle.
        </p>

        {/* Sub-heading */}
        <h3 className={styles.subHeading}>Where Comfort Meets Innovation</h3>

        {/* Image Showcase */}
        <div className={styles.imageRow}>
          <div className={styles.imageContainer}>
            <Image
              src="/images/dashboard.jpg"
              alt="NIO Smart Dashboard with AI Integration"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className={styles.imageContainer}>
            <Image
              src="/images/interior.jpg"
              alt="NIO Premium Interior Design"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
