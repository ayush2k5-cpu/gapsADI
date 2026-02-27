'use client';

import Link from 'next/link';
import Antigravity from '@/components/reactbits/Antigravity';

type NavZone = {
  label: string;
  href: string;
  top: string;
  left: string;
  width: string;
  height: string;
};

const NAV_ZONES: NavZone[] = [
  { label: "WHAT'S YOUR STORY", href: '/generate', top: '61%', left: '11%', width: '37%', height: '8%' },
  { label: 'ADI', href: '#about', top: '73%', left: '11%', width: '20%', height: '7%' },
  { label: 'MCP', href: '#mcp', top: '84%', left: '11%', width: '24%', height: '7%' },
  { label: 'BUILT ON', href: '#built-on', top: '84%', left: '38%', width: '24%', height: '7%' },
  { label: 'ABOUT GAPS', href: '#about', top: '84%', left: '63%', width: '24%', height: '7%' },
];

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center bg-[#DDD5C8] overflow-hidden"
    >
      {/* Antigravity Animated Background */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply pointer-events-auto">
        <Antigravity color="#fd802e" particleShape="sphere" autoAnimate={true} count={200} waveSpeed={0.5} waveAmplitude={1.2} />
      </div>

      <div className="relative z-10 max-w-[640px] w-full mx-auto cursor-none">
        {/* Main clapperboard image, slightly dimmed */}
        <div className="bg-black">
          <img
            src="/clapperboard.svg"
            alt="Scriptoria Clapperboard"
            className="w-full h-auto select-none opacity-80"
            draggable={false}
          />
        </div>

        {/* GAPS-ADI Logo Overlay within the red section */}
        <div
          className="absolute flex items-center justify-center pointer-events-none"
          style={{ top: '22%', left: '10%', width: '80%', height: '36%' }}
        >
          <img
            src="/gaps-adi-logo.jpg"
            alt="GAPS-ADI Logo"
            className="w-full h-full object-contain drop-shadow-xl opacity-95 blend-screen mix-blend-screen"
            draggable={false}
          />
        </div>

        {/* Clickable navigation overlay zones with visible text and dimming */}
        {NAV_ZONES.map((zone) => (
          <Link
            key={zone.label}
            href={zone.href}
            className="cursor-target absolute flex items-center justify-center text-center
                     bg-black/20 hover:bg-black/50 transition-all duration-300
                     border border-white/5 rounded-sm overflow-hidden group"
            style={{
              top: zone.top,
              left: zone.left,
              width: zone.width,
              height: zone.height,
            }}
            aria-label={`Navigate to ${zone.label}`}
          >
            <span className="font-display text-[8px] sm:text-[10px] md:text-[12px] 
                           text-white/60 group-hover:text-[#fd802e] tracking-[0.2em] uppercase">
              {zone.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
