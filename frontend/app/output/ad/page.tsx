"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import OutputNav from "@/components/OutputNav";

const ACCENT = "#fd802e";
const ACCENT2 = "#cbdde9";

function CountUp({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.round(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{val}</>;
}

export default function ADIntelligencePage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<any>(null);
  const [projectName, setProjectName] = useState("Untitled Project");
  const [projectId, setProjectId] = useState<string | undefined>();

  useEffect(() => {
    const analyzing = JSON.parse(localStorage.getItem("scriptoria_response_analyze") || "{}");
    const gen = JSON.parse(localStorage.getItem("scriptoria_response_gen") || "{}");
    if (!analyzing || Object.keys(analyzing).length === 0) {
      router.push("/output");
      return;
    }
    setAnalysis(analyzing);
    setProjectId(gen.project_id);
  }, [router]);

  if (!analysis) {
    return (
      <div className="h-screen bg-bg-base flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border border-brand-white/20 animate-spin border-t-brand-white" />
      </div>
    );
  }

  const scores = [
    { label: "HEALTH", value: analysis.health_score, color: ACCENT },
    { label: "PACING", value: analysis.pacing_score, color: ACCENT2 },
    { label: "BALANCE", value: analysis.balance_score, color: "#acc8a2" },
    { label: "TENSION", value: analysis.tension_score, color: "#f1e194" },
  ];

  return (
    <div className="h-screen flex flex-col bg-bg-base overflow-hidden">
      <OutputNav projectId={projectId} projectName={projectName} onProjectNameChange={setProjectName} />

      {/* Page body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Hero score band */}
        <div
          className="relative w-full px-10 py-10 border-b border-border-default overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0A0908 60%, #1a1008 100%)" }}
        >
          {/* Big bg number */}
          <div
            className="absolute right-8 top-1/2 -translate-y-1/2 font-display text-[180px] leading-none pointer-events-none select-none"
            style={{ color: ACCENT + "08" }}
          >
            {analysis.health_score}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.push("/output")}
              className="flex items-center gap-1.5 font-ui text-[11px] text-text-muted hover:text-brand-white transition-colors uppercase tracking-wider"
            >
              <ArrowLeft size={12} /> Hub
            </button>
            <span className="text-border-default">·</span>
            <span className="font-display text-[13px] uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
              AD INTELLIGENCE
            </span>
          </div>

          <div className="flex items-end gap-12 relative z-10">
            {/* Main ring */}
            <div className="relative w-[120px] h-[120px] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="44" fill="transparent" stroke="#2D2B28" strokeWidth="6" />
                <motion.circle
                  cx="50" cy="50" r="44" fill="transparent"
                  stroke={`url(#adGrad)`} strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="276"
                  initial={{ strokeDashoffset: 276 }}
                  animate={{ strokeDashoffset: 276 - (276 * (analysis.health_score ?? 0)) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="adGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2872a1" />
                    <stop offset="100%" stopColor={ACCENT} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex flex-col items-center">
                <span className="font-display text-[40px] leading-none" style={{ color: ACCENT }}>
                  <CountUp target={analysis.health_score ?? 0} />
                </span>
                <span className="font-ui text-[9px] text-text-muted uppercase tracking-widest">HEALTH</span>
              </div>
            </div>

            {/* Sub scores */}
            <div className="flex gap-8 items-end pb-1">
              {scores.slice(1).map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="font-display text-[36px] leading-none" style={{ color: s.color }}>
                    <CountUp target={s.value ?? 0} />
                  </span>
                  <span className="font-ui text-[9px] text-text-muted uppercase tracking-widest">{s.label}</span>
                  {/* mini bar */}
                  <div className="w-12 h-[3px] rounded-full bg-border-default overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: s.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value}%` }}
                      transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-2 gap-6 p-8">
          {/* Tension Arc — full width */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-2 bg-bg-surface border border-border-default rounded-[4px] p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-[13px] uppercase tracking-[0.14em]" style={{ color: ACCENT }}>
                TENSION ARC
              </h3>
              <span className="font-ui text-[10px] text-text-muted uppercase tracking-wider">
                SCENE × INTENSITY
              </span>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analysis.tension_curve} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="tensionFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ACCENT} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dangerZone" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="55%" stopColor="transparent" />
                      <stop offset="100%" stopColor="#5b0e14" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="scene" tick={{ fill: "#6B6560", fontSize: 10, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#6B6560", fontSize: 10, fontFamily: "Inter" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip
                    contentStyle={{ background: "#1C1A18", border: "1px solid #2D2B28", borderRadius: 4, fontSize: 11, fontFamily: "Inter" }}
                    labelStyle={{ color: "#EDE8DF" }}
                    itemStyle={{ color: ACCENT }}
                  />
                  <Area type="monotone" dataKey="score" stroke="none" fill="url(#dangerZone)" isAnimationActive={false} />
                  <Area type="monotone" dataKey="score" stroke={ACCENT} strokeWidth={2} fill="url(#tensionFill)" dot={false} activeDot={{ r: 5, fill: ACCENT, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Character Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-bg-surface border border-border-default rounded-[4px] p-6"
          >
            <h3 className="font-display text-[13px] uppercase tracking-[0.14em] mb-4" style={{ color: ACCENT2 }}>
              CHARACTER DISTRIBUTION
            </h3>
            <div className="flex flex-col gap-2">
              <div className="flex ml-24 gap-1 mb-1">
                {["ACT I", "ACT II", "ACT III"].map((a) => (
                  <div key={a} className="flex-1 text-center font-ui text-[9px] text-text-muted uppercase">{a}</div>
                ))}
              </div>
              {Object.entries(analysis.character_heatmap || {}).map(([char, acts]: [string, any], i) => (
                <motion.div
                  key={char}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="flex items-center gap-2 h-6"
                >
                  <span className="w-20 font-ui text-[10px] text-text-primary text-right truncate">{char}</span>
                  <div className="flex flex-1 gap-1">
                    {([acts.act1, acts.act2, acts.act3] as number[]).map((v, j) => (
                      <motion.div
                        key={j}
                        className="flex-1 rounded-[2px]"
                        style={{ background: ACCENT2 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: (v ?? 0) / 100 }}
                        transition={{ delay: 0.5 + i * 0.05 + j * 0.03, duration: 0.4 }}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Pacing Blocks */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-bg-surface border border-border-default rounded-[4px] p-6"
          >
            <h3 className="font-display text-[13px] uppercase tracking-[0.14em] mb-4" style={{ color: "#acc8a2" }}>
              PACING MAP
            </h3>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {analysis.pacing_blocks?.map((p: any, i: number) => {
                const colors: Record<string, string> = { fast: "#acc8a2", medium: "#f1e194", slow: "#5b0e14" };
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.015 }}
                    className="w-4 h-4 rounded-[2px] cursor-help"
                    style={{ backgroundColor: colors[p.speed] ?? "#2D2B28" }}
                    title={`Scene ${p.scene} — ${p.speed}`}
                  />
                );
              })}
            </div>
            <div className="flex gap-4">
              {[
                { label: "FAST", color: "#acc8a2" },
                { label: "MEDIUM", color: "#f1e194" },
                { label: "SLOW", color: "#5b0e14" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-[1px]" style={{ background: l.color }} />
                  <span className="font-ui text-[9px] text-text-muted uppercase tracking-wider">{l.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Flags section */}
        {analysis.flags?.length > 0 && (
          <div className="px-8 pb-8">
            <h3 className="font-display text-[13px] uppercase tracking-[0.14em] mb-3 text-pair1-accent">
              DIRECTOR FLAGS
            </h3>
            <div className="flex flex-col gap-3">
              {analysis.flags.map((flag: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-[4px] border"
                  style={{ background: "#5b0e1412", borderColor: "#f1e19430" }}
                >
                  <AlertTriangle size={15} className="text-pair1-accent mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-ui text-[13px] text-pair1-accent">{flag.issue}</p>
                  </div>
                  <span className="font-ui text-[11px] text-text-muted shrink-0">{flag.scene_range}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
