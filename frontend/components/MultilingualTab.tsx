import { useState, useEffect } from "react";
import ScreenplayViewer from "./ScreenplayViewer";
import { translateScreenplay } from "@/lib/api";

export default function MultilingualTab({ originalScript, projectId }: { originalScript: string, projectId: string }) {
    const [viewState, setViewState] = useState<"ORIGINAL" | "TRANSLATED">("ORIGINAL");
    const [translatedScript, setTranslatedScript] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [translateError, setTranslateError] = useState<string | null>(null);
    const [targetLanguage, setTargetLanguage] = useState("Hindi");

    useEffect(() => {
        // Attempt to load language requested from landing page
        const req = JSON.parse(localStorage.getItem("scriptoria_request") || "{}");
        if (req.language && req.language !== "English") {
            setTargetLanguage(req.language);
        } else {
            setTargetLanguage("Hindi"); // fallback default
        }
    }, []);

    const handleTranslate = async () => {
        setViewState("TRANSLATED");
        if (translatedScript) return;

        setIsLoading(true);
        setTranslateError(null);
        try {
            const res = await translateScreenplay({ project_id: projectId, target_language: targetLanguage });
            if (res.fallback) {
                setTranslateError("Translation engine unavailable — showing original screenplay");
            }
            setTranslatedScript(res.translated_screenplay);
        } catch (err) {
            console.error(err);
            setTranslateError("Translation failed — please try again");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full gap-[24px]">
            <div className="flex justify-between items-center bg-pair3-bg/5 p-4 border border-border-default rounded-[4px]">
                <h2 className="font-display text-[20px] text-pair3-accent uppercase">{targetLanguage}</h2>

                {/* Toggle Container */}
                <div className="flex bg-bg-elevated border border-border-default rounded-[4px] p-1 gap-[4px]">
                    <button
                        onClick={() => setViewState("ORIGINAL")}
                        className={`px-[12px] py-[6px] rounded-[2px] font-ui text-[12px] transition-colors border ${viewState === "ORIGINAL"
                                ? "bg-pair3-accent text-pair3-bg border-transparent font-medium"
                                : "bg-transparent text-text-muted border-brand-white"
                            }`}
                    >
                        ORIGINAL
                    </button>
                    <button
                        onClick={handleTranslate}
                        className={`px-[12px] py-[6px] rounded-[2px] font-ui text-[12px] transition-colors border ${viewState === "TRANSLATED"
                                ? "bg-pair3-accent text-pair3-bg border-transparent font-medium"
                                : "bg-transparent text-text-muted border-brand-white"
                            }`}
                    >
                        TRANSLATED
                    </button>
                </div>
            </div>

            {translateError && (
                <div className="flex items-center gap-[10px] px-[14px] py-[10px] bg-pair1-dark border border-pair1-accent rounded-[4px] font-ui text-[12px] text-pair1-accent">
                    <span>⚠</span>
                    <span>{translateError}</span>
                </div>
            )}

            <div className="flex-1 overflow-y-auto relative custom-scrollbar">
                {viewState === "ORIGINAL" ? (
                    <ScreenplayViewer script={originalScript} />
                ) : (
                    <div>
                        {isLoading ? (
                            <div className="flex items-center justify-center h-[200px] text-pair3-accent font-ui text-[12px] animate-pulse">
                                Generating {targetLanguage} dialogue via Sarvam AI...
                            </div>
                        ) : translatedScript ? (
                            <ScreenplayViewer script={translatedScript} isTranslated={true} />
                        ) : !translateError ? null : (
                            <ScreenplayViewer script={originalScript} />
                        )}
                    </div>
                )}
            </div>

            <div className="text-center w-full font-ui text-[10px] text-text-muted pb-2 border-t border-border-default pt-4">
                Culturally Generated — Not Translated · Sarvam AI
            </div>
        </div>
    );
}
