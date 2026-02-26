import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function ADDashboard({ analysis }: { analysis: any }) {
    const [hoveredScene, setHoveredScene] = useState<number | null>(null);

    useEffect(() => {
        const handleSceneHover = (e: any) => setHoveredScene(e.detail.scene);
        window.addEventListener("scene_hover", handleSceneHover);
        return () => window.removeEventListener("scene_hover", handleSceneHover);
    }, []);

    if (!analysis) return null;

    return (
        <div className="flex flex-col gap-[32px] font-ui">

            {/* Top Row: Health Score & Stats */}
            <div className="flex items-center gap-[48px] p-[24px] bg-pair4-dark/5 rounded-[4px] border border-border-default">
                {/* Ring Chart Placeholder */}
                <div className="relative w-[100px] h-[100px] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 100 100" className="w-[100px] h-[100px] absolute transform -rotate-90">
                        <circle cx="50" cy="50" r="46" fill="transparent" stroke="#2D2B28" strokeWidth="8" />
                        <motion.circle
                            cx="50" cy="50" r="46" fill="transparent"
                            stroke="url(#gradient)" strokeWidth="8"
                            strokeDasharray="289" // 2 * pi * 46
                            initial={{ strokeDashoffset: 289 }}
                            animate={{ strokeDashoffset: 289 - (289 * analysis.health_score) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#2872a1" /> {/* pair5-primary */}
                                <stop offset="100%" stopColor="#fd802e" /> {/* pair4-accent */}
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="font-display text-[48px] text-pair5-accent leading-none mt-2">
                        {analysis.health_score}
                    </span>
                </div>

                {/* Sub Scores */}
                <div className="flex gap-[32px]">
                    <div className="flex flex-col items-center">
                        <span className="font-display text-[24px] text-brand-white">{analysis.pacing_score}</span>
                        <span className="text-[11px] text-text-muted mt-1 tracking-wider uppercase">PACING</span>
                    </div>
                    <div className="w-[1px] h-[32px] bg-border-default self-center" />
                    <div className="flex flex-col items-center">
                        <span className="font-display text-[24px] text-brand-white">{analysis.balance_score}</span>
                        <span className="text-[11px] text-text-muted mt-1 tracking-wider uppercase">BALANCE</span>
                    </div>
                    <div className="w-[1px] h-[32px] bg-border-default self-center" />
                    <div className="flex flex-col items-center">
                        <span className="font-display text-[24px] text-brand-white">{analysis.tension_score}</span>
                        <span className="text-[11px] text-text-muted mt-1 tracking-wider uppercase">TENSION</span>
                    </div>
                </div>
            </div>

            {/* Tension Arc Chart */}
            <div>
                <h3 className="text-[10px] text-text-muted uppercase tracking-[0.12em] mb-3">TENSION ARC</h3>
                <div className="h-[140px] bg-bg-surface border border-border-default rounded-[4px] p-[16px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analysis.tension_curve}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#fd802e" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#fd802e" stopOpacity={0} />
                                </linearGradient>
                                {/* Danger Zone: Y < 40 using gradient bounds approximation */}
                                <linearGradient id="dangerZone" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="60%" stopColor="transparent" />
                                    <stop offset="100%" stopColor="#5b0e14" stopOpacity={0.4} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="scene" hide />
                            <YAxis domain={[0, 100]} hide />
                            {/* Plot area with Danger Zone */}
                            <Area type="monotone" dataKey="score" stroke="none" fill="url(#dangerZone)" isAnimationActive={false} />

                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke="#fd802e"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorScore)"
                                isAnimationActive={true}
                                animationDuration={1000}
                                activeDot={{
                                    r: hoveredScene ? (hoveredScene && hoveredScene === hoveredScene ? 6 : 4) : 4,
                                    fill: "#fd802e",
                                    strokeWidth: 0,
                                    className: "transition-all duration-300"
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Character Heatmap */}
            <div>
                <h3 className="text-[10px] text-text-muted uppercase tracking-[0.12em] mb-3">CHARACTER DISTRIBUTION</h3>
                <div className="flex flex-col gap-1 w-[400px]">
                    <div className="flex w-full ml-[80px]">
                        {["ACT I", "ACT II", "ACT III"].map(a => (
                            <div key={a} className="flex-1 text-center font-ui text-[9px] text-text-muted">{a}</div>
                        ))}
                    </div>
                    {Object.entries(analysis.character_heatmap || {}).map(([char, acts]: [string, any]) => (
                        <div key={char} className="flex w-full h-[24px] items-center gap-[4px]">
                            <div className="w-[76px] font-screenplay text-[11px] text-text-primary text-right truncate overflow-hidden whitespace-nowrap">{char}</div>
                            <div className="flex-1 rounded-[8px]" style={{ backgroundColor: '#2872a1', opacity: acts.act1 / 100 }} />
                            <div className="flex-1 rounded-[8px]" style={{ backgroundColor: '#2872a1', opacity: acts.act2 / 100 }} />
                            <div className="flex-1 rounded-[8px]" style={{ backgroundColor: '#2872a1', opacity: acts.act3 / 100 }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Pacing Blocks */}
            <div>
                <h3 className="text-[10px] text-text-muted uppercase tracking-[0.12em] mb-3">PACING</h3>
                <div className="flex flex-wrap gap-[2px]">
                    {analysis.pacing_blocks?.map((p: any, i: number) => {
                        const colors = { fast: "#acc8a2", medium: "#f1e194", slow: "#5b0e14" };
                        return (
                            <div
                                key={i}
                                className="w-[12px] h-[12px] rounded-[2px]"
                                style={{ backgroundColor: colors[p.speed as keyof typeof colors] }}
                                title={`Scene ${p.scene} - ${p.speed}`}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Flag Warning Card */}
            {analysis.flags?.length > 0 && (
                <div className="bg-pair1-dark border border-pair1-accent rounded-[4px] p-[16px] mt-[16px]">
                    {analysis.flags.map((flag: any, i: number) => (
                        <div key={i} className="flex items-start gap-4">
                            <AlertTriangle size={16} className="text-pair1-accent mt-0.5 shrink-0" />
                            <div>
                                <p className="font-ui text-[13px] text-pair1-accent mb-3">{flag.issue}</p>
                                <button className="bg-transparent border border-pair1-accent text-pair1-accent font-ui text-[12px] px-[14px] py-[6px] rounded-[4px] hover:bg-pair1-dark hover:brightness-110 transition-colors">
                                    Refine Scenes {flag.scene_range}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
