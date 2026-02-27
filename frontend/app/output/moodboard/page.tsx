"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import OutputNav from "@/components/OutputNav";
import Stack from "@/components/reactbits/Stack";

const ACT_LABELS = ["ACT I — SETUP", "ACT II — CONFRONTATION", "ACT III — RESOLUTION"];
const ACT_COLORS = ["#f1e194", "#fd802e", "#cbdde9"];

export default function MoodboardPage() {
  const router = useRouter();
  const [moods, setMoods] = useState<any[]>([]);
  const [projectName, setProjectName] = useState("Untitled Project");
  const [projectId, setProjectId] = useState<string | undefined>();

  useEffect(() => {
    const gen = JSON.parse(localStorage.getItem("scriptoria_response_gen") || "{}");
    const raw = JSON.parse(localStorage.getItem("scriptoria_response_moods") || "[]");
    if (!raw || raw.filter(Boolean).length === 0) { router.push("/output"); return; }
    setMoods(raw.filter(Boolean));
    setProjectId(gen.project_id);
  }, [router]);

  // Build stack cards from moods
  const stackCards: React.ReactNode[] = moods.map((mood, i) => (
    <div key={`act-${i}`} className="w-full h-full flex flex-col relative overflow-hidden bg-bg-surface rounded-xl">
      {/* Image */}
      <div className="flex-1 relative">
        <img
          src={mood.image_url}
          alt={mood.caption}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${ACT_COLORS[i] ?? "#F5F5F5"}30 0%, transparent 50%)`,
          }}
        />
        {/* Glow on edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 40px ${ACT_COLORS[i] ?? "#F5F5F5"}18`,
          }}
        />
      </div>

      {/* Caption bar */}
      <div
        className="h-[52px] px-5 flex items-center justify-between bg-bg-surface border-t"
        style={{ borderColor: (ACT_COLORS[i] ?? "#2D2B28") + "40" }}
      >
        <div>
          <p
            className="font-display text-[11px] uppercase tracking-[0.14em]"
            style={{ color: ACT_COLORS[i] ?? "#F5F5F5" }}
          >
            {ACT_LABELS[i] ?? `ACT ${i + 1}`}
          </p>
          <p className="font-ui text-[11px] text-text-muted truncate max-w-[300px]">{mood.caption}</p>
        </div>
        {mood.image_url && (
          <a
            href={mood.image_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-brand-white transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  ));

  return (
    <div className="h-screen flex flex-col bg-bg-base overflow-hidden">
      <OutputNav projectId={projectId} projectName={projectName} onProjectNameChange={setProjectName} />

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Hero band */}
        <div
          className="relative px-10 py-8 border-b border-border-default"
          style={{ background: "linear-gradient(135deg, #0A0908 60%, #120d04 100%)" }}
        >
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.push("/output")}
              className="flex items-center gap-1.5 font-ui text-[11px] text-text-muted hover:text-brand-white transition-colors uppercase tracking-wider"
            >
              <ArrowLeft size={12} /> Hub
            </button>
            <span className="text-border-default">·</span>
            <span className="font-display text-[13px] uppercase tracking-[0.2em] text-pair1-accent">
              MOODBOARD
            </span>
          </div>
          <h1 className="font-display text-[40px] leading-none text-brand-white">
            VISUAL <span className="text-text-muted">DIRECTION</span>
          </h1>
          <p className="font-ui text-[12px] text-text-muted mt-1">
            Drag cards left/right to cycle · Generated via Pollinations.ai
          </p>
        </div>

        {/* Act color indicators */}
        <div className="flex px-10 pt-6 gap-6">
          {ACT_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: ACT_COLORS[i] }} />
              <span className="font-ui text-[10px] text-text-muted uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>

        {/* Stack */}
        <div className="px-10 pt-4 pb-10 flex border-2 justify-center" style={{ height: "400px" }}>
          {stackCards.length > 0 ? (
            <Stack cards={stackCards} />
          ) : (
            <div className="flex items-center justify-center h-64 text-text-muted font-ui text-[13px]">
              No moodboard data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
