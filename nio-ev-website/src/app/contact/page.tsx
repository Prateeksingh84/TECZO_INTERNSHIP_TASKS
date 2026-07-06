'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './contact.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setStatusMessage(data.message);
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setStatus('error');
        setStatusMessage(data.error);
      }
    } catch {
      setStatus('error');
      setStatusMessage('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <ScrollReveal>
            <div className={styles.header}>
              <h1 className={styles.title}>Get In Touch</h1>
              <p className={styles.subtitle}>
                Have a question or want to learn more about NIO? We&apos;d love to hear from you. 
                Fill out the form below and our team will get back to you within 24 hours.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="contact-name" className={styles.label}>Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="contact-email" className={styles.label}>Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="contact-phone" className={styles.label}>Phone (optional)</label>
                <input
                  id="contact-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="contact-message" className={styles.label}>Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  required
                  rows={6}
                  className={styles.textarea}
                />
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
                {status !== 'loading' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>

              {status !== 'idle' && status !== 'loading' && (
                <div className={`${styles.statusMessage} ${styles[status]}`}>
                  {statusMessage}
                </div>
              )}
            </form>
          </ScrollReveal>
        </div>

        <div className={styles.watermark}>CONTACT</div>
      </main>
      <Footer />
    </>
  );
}
