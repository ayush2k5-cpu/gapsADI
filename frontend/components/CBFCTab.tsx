"use client";

import { useEffect, useState } from "react";
import { getCBFCRating } from "@/lib/api";
import { CBFCResponse } from "@/lib/types";

interface CBFCTabProps {
    projectId: string;
}

const RATING_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; desc: string }> = {
    U: {
        label: "U",
        color: "text-[#acc8a2]",
        bg: "bg-[#1a2517]",
        border: "border-[#acc8a2]",
        desc: "UNIVERSAL",
    },
    UA: {
        label: "UA",
        color: "text-[#f1e194]",
        bg: "bg-[#2a2407]",
        border: "border-[#f1e194]",
        desc: "PARENTAL GUIDANCE",
    },
    A: {
        label: "A",
        color: "text-[#f97c7c]",
        bg: "bg-[#2d1010]",
        border: "border-[#f97c7c]",
        desc: "ADULTS ONLY",
    },
};

const CATEGORY_LABELS: Record<string, string> = {
    violence: "VIOLENCE",
    sexual_content: "SEXUAL CONTENT",
    language: "LANGUAGE",
    drug_references: "DRUGS & SUBSTANCES",
    sensitive_themes: "SENSITIVE THEMES",
    horror: "HORROR",
};

const CONFIDENCE_COLOR: Record<string, string> = {
    high: "text-[#acc8a2]",
    medium: "text-[#f1e194]",
    low: "text-[#fd802e]",
};

function ScoreBar({ value, max = 20 }: { value: number; max?: number }) {
    const pct = Math.min(100, Math.round((value / max) * 100));
    const color =
        pct >= 70 ? "#f97c7c" :
            pct >= 35 ? "#f1e194" :
                "#acc8a2";
    return (
        <div className="flex items-center gap-[12px]">
            <div className="flex-1 h-[4px] bg-bg-elevated rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                />
            </div>
            <span className="font-ui text-[11px] text-text-muted w-[24px] text-right">{value}</span>
        </div>
    );
}

export default function CBFCTab({ projectId }: CBFCTabProps) {
    const [data, setData] = useState<CBFCResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!projectId) return;
        getCBFCRating({ project_id: projectId })
            .then(setData)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [projectId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-[12px]">
                    <div className="w-[32px] h-[32px] border border-border-default border-t-brand-white rounded-full animate-spin" />
                    <span className="font-ui text-[11px] text-text-muted uppercase tracking-[0.12em]">Analysing content…</span>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex items-center justify-center h-full">
                <span className="font-ui text-[12px] text-text-muted">Could not load CBFC rating.</span>
            </div>
        );
    }

    const cfg = RATING_CONFIG[data.rating] ?? RATING_CONFIG.UA;

    return (
        <div className="flex flex-col gap-[24px]">

            {/* Header badge */}
            <div className="flex items-start gap-[20px]">
                <div className={`w-[80px] h-[80px] rounded-[8px] border-2 ${cfg.border} ${cfg.bg} flex flex-col items-center justify-center flex-shrink-0`}>
                    <span className={`font-display text-[32px] leading-none ${cfg.color}`}>{cfg.label}</span>
                    <span className={`font-ui text-[8px] tracking-[0.14em] mt-[2px] ${cfg.color} opacity-70`}>{cfg.desc}</span>
                </div>

                <div className="flex flex-col gap-[6px] pt-[4px]">
                    <div className="flex items-center gap-[8px]">
                        <span className="font-ui text-[10px] text-text-muted uppercase tracking-[0.12em]">Estimated CBFC Rating</span>
                        <span className={`font-ui text-[10px] uppercase tracking-[0.10em] ${CONFIDENCE_COLOR[data.confidence]}`}>
                            · {data.confidence} confidence
                        </span>
                    </div>
                    <p className="font-ui text-[13px] text-text-primary leading-relaxed max-w-[360px]">
                        {data.cbfc_criteria}
                    </p>
                    <span className="font-ui text-[11px] text-text-muted">
                        {data.scene_count} scenes analysed · score {data.total_score}
                    </span>
                </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-border-default" />

            {/* Category breakdown */}
            <div>
                <span className="font-ui text-[10px] text-text-muted uppercase tracking-[0.12em]">Content Breakdown</span>
                <div className="mt-[14px] flex flex-col gap-[14px]">
                    {Object.entries(data.breakdown).map(([key, value]) => (
                        <div key={key} className="flex flex-col gap-[6px]">
                            <span className="font-ui text-[10px] text-text-muted tracking-[0.10em]">
                                {CATEGORY_LABELS[key] ?? key.toUpperCase()}
                            </span>
                            <ScoreBar value={value as number} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-border-default" />

            {/* Reasons */}
            <div>
                <span className="font-ui text-[10px] text-text-muted uppercase tracking-[0.12em]">Why this rating</span>
                <ul className="mt-[12px] flex flex-col gap-[8px]">
                    {data.reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-[10px]">
                            <span className="text-text-muted mt-[2px] flex-shrink-0">—</span>
                            <span className="font-ui text-[13px] text-text-primary leading-relaxed">{r}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Footer note */}
            <div className="bg-bg-elevated border border-border-default rounded-[4px] px-[14px] py-[10px]">
                <p className="font-ui text-[11px] text-text-muted leading-relaxed">
                    This is an <span className="text-text-primary">estimated</span> rating based on automated content analysis.
                    Official CBFC certification requires a formal submission and board review.
                </p>
            </div>
        </div>
    );
}
