"use client";

import { useEffect } from 'react';
import HeroSection from '@/components/landing/HeroSection';
import MarqueeDivider from '@/components/landing/MarqueeDivider';
import BuiltOnSection from '@/components/landing/BuiltOnSection';
import AboutSection from '@/components/landing/AboutSection';
import ScopeMCPSection from '@/components/landing/ScopeMCPSection';
import TargetCursor from '@/components/reactbits/TargetCursor';

export default function LandingPage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  return (
    <>
      <TargetCursor targetSelector=".cursor-target" spinDuration={2} />
      <main className="cursor-none">
        <HeroSection />
        <MarqueeDivider />
        <BuiltOnSection />
        <MarqueeDivider />
        <AboutSection />
        <MarqueeDivider />
        <ScopeMCPSection />
      </main>
    </>
  );
}
