'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import Hero from '@/components/Hero/Hero';
import FutureSection from '@/components/FutureSection/FutureSection';
import CarShowcase from '@/components/CarShowcase/CarShowcase';
import SpecsDetail from '@/components/SpecsDetail/SpecsDetail';
import TechSection from '@/components/TechSection/TechSection';
import FeaturesGrid from '@/components/FeaturesGrid/FeaturesGrid';
import Community from '@/components/Community/Community';
import Footer from '@/components/Footer/Footer';
import { carModels, features } from '@/lib/data';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FutureSection onCategoryChange={setActiveCategory} />
        <CarShowcase models={carModels} activeCategory={activeCategory} />
        <SpecsDetail />
        <TechSection />
        <FeaturesGrid features={features} />
        <Community />
      </main>
      <Footer />
    </>
  );
}
