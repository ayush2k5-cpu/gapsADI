"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface Step {
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    title: "DROP YOUR IDEA",
    description: "A raw concept. One line. A feeling.",
  },
  {
    title: "SCREENPLAY GENERATED",
    description: "Scene-by-scene. Formatted. Ready to direct.",
  },
  {
    title: "AD INTELLIGENCE RUNS",
    description: "Cast. Budget. Locations. Tension mapped.",
  },
  {
    title: "VISUAL WORLD BUILT",
    description: "Moodboards. Characters. Multilingual dialogue.",
  },
  {
    title: "EXPORT",
    description: "PDF. DOCX. Production-ready.",
  },
];

interface StepCardProps {
  step: Step;
  index: number;
  isLast: boolean;
}

// Each step has its own scroll trigger — reveals individually as you scroll down.
function StepCard({ step, index, isLast }: StepCardProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex gap-6"
    >
      {/* Left: circle indicator + connector line */}
      <div className="flex flex-col items-center w-10 flex-shrink-0">
        <div className="w-10 h-10 rounded-full border-2 border-[#F06820] flex items-center justify-center bg-[#1E1E1E] flex-shrink-0">
          <span
            style={{ fontFamily: "Bebas Neue" }}
            className="text-base text-[#F06820] leading-none"
          >
            {index + 1}
          </span>
        </div>
        {!isLast && (
          <div
            className="w-px flex-1 mt-2 bg-[#F06820]"
            style={{ opacity: 0.4, minHeight: "44px" }}
          />
        )}
      </div>

      {/* Card — mb-6 on non-last items lets the connector line fill the gap */}
      <div className={`bg-[#1E1E1E] rounded-lg p-6 flex-1 ${!isLast ? "mb-6" : ""}`}>
        <h3
          style={{ fontFamily: "Bebas Neue" }}
          className="text-2xl tracking-[0.08em] text-[#F06820] mb-2"
        >
          {step.title}
        </h3>
        <p
          style={{ fontFamily: "Inter" }}
          className="text-sm text-[#E8E3DC] leading-relaxed"
        >
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function AboutSection(): React.ReactElement {
  return (
    <section
      id="about"
      className="min-h-screen flex flex-col items-center justify-center px-16 py-20 bg-[#8B7355]"
    >
      <div className="w-full max-w-2xl flex flex-col">
        {/* Slate label */}
        <div className="flex items-center gap-3 mb-10">
          <span
            style={{ fontFamily: "Bebas Neue" }}
            className="text-sm tracking-[0.2em] text-[#E8E3DC]"
          >
            ABOUT GAPS-ADI
          </span>
          <div className="flex-1 h-px bg-[#E8E3DC] opacity-30" />
        </div>

        {/* Vertical stepper */}
        <div>
          {STEPS.map((step, i) => (
            <StepCard
              key={step.title}
              step={step}
              index={i}
              isLast={i === STEPS.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
