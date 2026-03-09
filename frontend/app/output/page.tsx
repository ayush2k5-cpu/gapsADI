"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clapperboard, Pencil, Download, AlertTriangle } from "lucide-react";
import ScreenplayViewer from "@/components/ScreenplayViewer";
import ADDashboard from "@/components/ADDashboard";
import CharactersTab from "@/components/CharactersTab";
import MoodboardTab from "@/components/MoodboardTab";
import MultilingualTab from "@/components/MultilingualTab";
import { exportScreenplay } from "@/lib/api";
import CBFCTab from "@/components/CBFCTab";

const TABS = ["AD INTELLIGENCE", "CHARACTERS", "MOODBOARD", "MULTILINGUAL", "CBFC RATING"];

export default function OutputScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(0);
    const [projectName, setProjectName] = useState("Untitled Project");
    const [projectData, setProjectData] = useState<any>(null);
    const [exporting, setExporting] = useState<string | null>(null);
    const [exportError, setExportError] = useState<string | null>(null);
    const [translatedScript, setTranslatedScript] = useState<string | null>(null);
    const [translatedLanguage, setTranslatedLanguage] = useState<string | null>(null);

    useEffect(() => {
        // Load from local storage for hackathon MVP
        let gen: any = {};
        let analyzing: any = {};
        let moods: any[] = [];
        try {
            gen = JSON.parse(localStorage.getItem("scriptoria_response_gen") || "{}");
            analyzing = JSON.parse(localStorage.getItem("scriptoria_response_analyze") || "{}");
            moods = JSON.parse(localStorage.getItem("scriptoria_response_moods") || "[]");
        } catch {
            router.push("/");
            return;
        }

        if (!gen?.screenplay || !gen?.project_id) {
            router.push("/");
            return;
        }

        setProjectData({ gen, analyzing, moods });
    }, [router]);

    const handleExport = async (format: string) => {
        if (!projectData?.gen?.project_id || exporting) return;
        setExporting(format);
        setExportError(null);
        try {
            const blob = await exportScreenplay({
                project_id: projectData.gen.project_id,
                format: format as "pdf" | "docx" | "txt",
                screenplay_override: translatedScript || undefined,
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Scriptoria_${projectData.gen.project_id.slice(0, 8)}.${format}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export failed", err);
            setExportError(`${format.toUpperCase()} export failed — try again`);
            setTimeout(() => setExportError(null), 4000);
        } finally {
            setExporting(null);
        }
    };

    if (!projectData) return <div className="min-h-screen bg-bg-base"></div>;

    return (
        <div className="h-screen flex flex-col bg-bg-base overflow-hidden">
            {/* Top Bar */}
            <header className="h-[56px] flex-shrink-0 bg-bg-surface border-b border-border-default flex items-center justify-between px-[24px]">
                {/* Left */}
                <div className="w-[30%] flex items-center gap-[8px]">
                    <Clapperboard size={16} className="text-brand-white" />
                    <span className="font-display text-[16px] text-brand-white uppercase leading-none mt-1">SCRIPTORIA</span>
                </div>

                {/* Center */}
                <div className="w-[40%] flex items-center justify-center gap-[8px] group cursor-pointer relative top-0 flex-1">
                    <input
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="font-ui text-[15px] text-text-primary bg-transparent text-center focus:outline-none w-[160px] cursor-pointer focus:cursor-text"
                    />
                    <Pencil size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Right */}
                <div className="w-[30%] flex flex-col items-end gap-[4px]">
                    {translatedScript && translatedLanguage && (
                        <span className="font-ui text-[10px] text-text-muted uppercase tracking-[0.08em]">
                            EXPORTING: {translatedLanguage}
                        </span>
                    )}
                    <div className="flex gap-[8px]">
                    {(["PDF", "DOCX", "TXT"] as const).map((ext) => {
                        const fmt = ext.toLowerCase();
                        const isLoading = exporting === fmt;
                        return (
                            <button
                                key={ext}
                                onClick={() => handleExport(fmt)}
                                disabled={!!exporting}
                                className={`flex items-center gap-[6px] px-[16px] py-[10px] rounded-[4px] font-ui text-[12px] leading-none border transition-colors
                                    ${isLoading
                                        ? "bg-brand-white text-brand-black border-brand-white cursor-wait animate-pulse"
                                        : "bg-bg-base border-brand-white text-brand-white hover:bg-brand-white hover:text-brand-black disabled:opacity-40"
                                    }`}
                            >
                                <Download size={12} />
                                {isLoading ? "..." : ext}
                            </button>
                        );
                    })}
                    </div>
                </div>
            </header>

            {/* Export error toast */}
            {exportError && (
                <div className="flex items-center gap-[8px] px-[16px] py-[10px] bg-pair1-dark border-b border-pair1-accent font-ui text-[12px] text-pair1-accent">
                    <AlertTriangle size={14} />
                    <span>{exportError}</span>
                </div>
            )}

            {/* Main Workspace */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel */}
                <div className="w-[38%] border-r border-border-default flex flex-col bg-bg-base overflow-hidden">
                    {/* Panel Header */}
                    <div className="h-[48px] px-[24px] flex items-center gap-[12px] border-b border-border-default shrink-0">
                        <span className="font-ui text-[10px] text-text-muted uppercase tracking-[0.12em]">SCREENPLAY</span>
                        <div className="bg-bg-elevated border border-border-default px-[10px] py-[6px] rounded-[2px] font-ui text-[10px] text-text-muted">
                            {projectData.gen.scene_count || 0} SCENES
                        </div>
                    </div>

                    {/* Scrollable Screenplay */}
                    <div className="flex-1 overflow-y-auto w-full custom-scrollbar pl-[24px] pr-[12px] py-[16px]">
                        <ScreenplayViewer script={projectData.gen.screenplay} />
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-[62%] flex flex-col bg-bg-base min-h-0">
                    {/* Tab Navigation */}
                    <div className="h-[48px] relative border-b border-border-default flex shrink-0">
                        {/* Fades */}
                        <div className="absolute left-0 top-0 bottom-0 w-[48px] bg-gradient-to-r from-bg-base to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-[48px] bg-gradient-to-l from-bg-base to-transparent z-10 pointer-events-none" />

                        <div className="flex-1 overflow-x-auto hide-scrollbar flex items-end px-[48px] gap-[32px]">
                            {TABS.map((tab, i) => {
                                const isActive = activeTab === i;
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(i)}
                                        className={`pb-[14px] font-display text-[14px] uppercase tracking-[0.08em] relative whitespace-nowrap transition-colors duration-150 ${isActive ? "text-brand-white" : "text-text-muted hover:text-text-primary"
                                            }`}
                                    >
                                        {tab}
                                        {isActive && (
                                            <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-brand-white" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Active Tab Content */}
                    <div className="flex-1 relative overflow-hidden">
                        <div className={`absolute inset-0 transition-opacity duration-150 p-[24px] overflow-y-auto custom-scrollbar ${activeTab === 0 ? "opacity-100 z-10" : "opacity-0 -z-10"}`}>
                            <ADDashboard analysis={projectData.analyzing} />
                        </div>

                        <div className={`absolute inset-0 transition-opacity duration-150 p-[24px] overflow-y-auto custom-scrollbar ${activeTab === 1 ? "opacity-100 z-10" : "opacity-0 -z-10"}`}>
                            <CharactersTab
                                characters={projectData.gen.characters}
                                projectId={projectData.gen.project_id}
                                tone={projectData.gen.tone ?? 50}
                            />
                        </div>

                        <div className={`absolute inset-0 transition-opacity duration-150 p-[24px] overflow-y-auto custom-scrollbar ${activeTab === 2 ? "opacity-100 z-10" : "opacity-0 -z-10"}`}>
                            <MoodboardTab moods={projectData.moods} />
                        </div>

                        <div className={`absolute inset-0 transition-opacity duration-150 p-[24px] overflow-y-auto custom-scrollbar ${activeTab === 3 ? "opacity-100 z-10" : "opacity-0 -z-10"}`}>
                            <MultilingualTab
                                originalScript={projectData.gen.screenplay}
                                projectId={projectData.gen.project_id}
                                onTranslated={(text, lang) => {
                                    setTranslatedScript(text);
                                    setTranslatedLanguage(lang);
                                }}
                            />
                        </div>

                        <div className={`absolute inset-0 transition-opacity duration-150 p-[24px] overflow-y-auto custom-scrollbar ${activeTab === 4 ? "opacity-100 z-10" : "opacity-0 -z-10"}`}>
                            <CBFCTab projectId={projectData.gen.project_id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
