'use client';

import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <nav
      className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}
    >
      {/* Left links */}
      <div className={styles.navLeft}>
        <a href="#about" className={styles.navLink}>
          About
        </a>
        <a href="#our-power" className={styles.navLink}>
          Our Power
        </a>
      </div>

      {/* Center logo */}
      <a href="#" className={styles.logoContainer}>
        <svg
          className={styles.logoEmblem}
          viewBox="0 0 60 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Upward-pointing V-shape emblem inspired by NIO */}
          <path
            d="M30 4L4 46h10L30 18l16 28h10L30 4z"
            fill="#ffffff"
          />
        </svg>
        <span className={styles.logoText}>NIO</span>
      </a>

      {/* Right links */}
      <div className={styles.navRight}>
        <a href="#products" className={styles.navLink}>
          Products
        </a>
        <a href="#contact" className={styles.navLink}>
          Contact
        </a>
      </div>

      {/* Hamburger */}
      <button
        className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
      >
        <span className={styles.hamburgerLine} />
        <span className={styles.hamburgerLine} />
        <span className={styles.hamburgerLine} />
      </button>

      {/* Mobile overlay */}
      <div
        className={`${styles.mobileOverlay} ${menuOpen ? styles.mobileOverlayOpen : ''}`}
      >
        <a
          href="#about"
          className={styles.mobileNavLink}
          onClick={() => setMenuOpen(false)}
        >
          About
        </a>
        <a
          href="#our-power"
          className={styles.mobileNavLink}
          onClick={() => setMenuOpen(false)}
        >
          Our Power
        </a>
        <a
          href="#products"
          className={styles.mobileNavLink}
          onClick={() => setMenuOpen(false)}
        >
          Products
        </a>
        <a
          href="#contact"
          className={styles.mobileNavLink}
          onClick={() => setMenuOpen(false)}
        >
          Contact
        </a>
      </div>
    </nav>
  );
}
