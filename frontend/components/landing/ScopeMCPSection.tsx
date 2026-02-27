'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import DecryptedText from '@/components/reactbits/DecryptedText';

// ─── Scope lines ──────────────────────────────────────────────────────────────

const SCOPE_LINES: string[] = [
  'BOLLYWOOD. INDIE FILMS. OTT ORIGINALS.',
  'FILM SCHOOLS. DOCUMENTARIES. AD FILMS.',
  'REGIONAL CINEMA. SHORT FILMS. BRAND STORIES.',
  'ANY STORY. ANY FORMAT. ANY FILMMAKER.',
];

// ─── Staggered scope block ─────────────────────────────────────────────────
// Each line mounts 300ms after the previous once the section enters the viewport.
// DecryptedText fires its IntersectionObserver immediately on mount, so mounting
// them sequentially is the cleanest way to achieve the stagger.

function ScopeLines() {
  const triggerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(triggerRef, { once: true });
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const timeouts = SCOPE_LINES.map((_, i) =>
      setTimeout(() => setVisibleCount((n) => Math.max(n, i + 1)), i * 300)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [isInView]);

  return (
    <div ref={triggerRef} className="flex flex-col gap-3">
      {SCOPE_LINES.map((line, i) => (
        // min-h prevents layout shift while the line is not yet mounted
        <div key={line} className="min-h-8">
          {visibleCount > i && (
            <DecryptedText
              text={line}
              animateOn="view"
              sequential={true}
              revealDirection="start"
              speed={30}
              className="font-display text-2xl text-[#E8E3DC] tracking-wide"
              encryptedClassName="font-display text-2xl text-[#8B7355] tracking-wide"
              parentClassName="block"
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Slate label ──────────────────────────────────────────────────────────────

function SlateLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <span
        style={{ fontFamily: 'Bebas Neue' }}
        className="text-sm tracking-[0.2em] text-[#8B7355]"
      >
        {text}
      </span>
      <div className="flex-1 h-px bg-[#8B7355] opacity-40" />
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function ScopeMCPSection() {
  return (
    <section
      id="mcp"
      className="bg-[#0F0D0B] min-h-screen flex flex-col justify-between px-16 py-20"
    >
      {/* Two-column layout — flex-1 fills available height */}
      <div className="grid grid-cols-2 gap-16 flex-1 items-center">

        {/* LEFT — Scope */}
        <div>
          <SlateLabel text="SCOPE" />
          <ScopeLines />
        </div>

        {/* RIGHT — MCP */}
        <div>
          <SlateLabel text="MCP" />

          {/* Terminal card */}
          <div className="bg-[#1A1814] border border-[#2A2520] rounded p-6">

            {/* Traffic-light dots */}
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
            </div>

            <p
              className="text-[#8B7355] text-xs tracking-widest mb-3"
              style={{ fontFamily: 'Bebas Neue' }}
            >
              INSTALL GAPS-ADI MCP
            </p>

            <code className="text-[#F06820] text-sm font-mono block mb-2">
              npx gaps-adi-mcp init
            </code>

            <p className="text-[#8B7355] text-xs font-mono opacity-60">
              # MCP server coming soon
            </p>
          </div>
        </div>
      </div>

      {/* Bottom — GitHub CTA */}
      <div className="mt-16 text-center">
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-transparent border border-[#E8E3DC] text-[#E8E3DC] px-8 py-3 rounded-sm tracking-widest text-base transition-colors duration-200 hover:bg-[#E8E3DC] hover:text-[#0F0D0B]"
          style={{ fontFamily: 'Bebas Neue' }}
        >
          ★  EXPLORE ON GITHUB
        </a>
      </div>
    </section>
  );
}
