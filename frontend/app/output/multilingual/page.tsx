"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Globe, Loader2 } from "lucide-react";
import OutputNav from "@/components/OutputNav";
import ScreenplayViewer from "@/components/ScreenplayViewer";
import { translateScreenplay } from "@/lib/api";

const LANGUAGES = ["Hindi", "Tamil", "Telugu", "Bengali", "Kannada", "Marathi"];
const ACCENT = "#acc8a2";

export default function MultilingualPage() {
  const router = useRouter();
  const [originalScript, setOriginalScript] = useState("");
  const [translatedScript, setTranslatedScript] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState("Hindi");
  const [view, setView] = useState<"original" | "translated">("original");
  const [isLoading, setIsLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | undefined>();
  const [projectName, setProjectName] = useState("Untitled Project");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const gen = JSON.parse(localStorage.getItem("scriptoria_response_gen") || "{}");
    const req = JSON.parse(localStorage.getItem("scriptoria_request") || "{}");
    if (!gen.screenplay) { router.push("/output"); return; }
    setOriginalScript(gen.screenplay);
    setProjectId(gen.project_id);
    if (req.language && req.language !== "English") setTargetLanguage(req.language);
  }, [router]);

  const handleTranslate = async () => {
    if (!projectId) return;
    setView("translated");
    if (translatedScript) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await translateScreenplay({ project_id: projectId, target_language: targetLanguage });
      setTranslatedScript(res.translated_screenplay);
    } catch {
      setError("Translation failed. Sarvam AI may be unavailable.");
      setTranslatedScript(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setTargetLanguage(lang);
    setTranslatedScript(null);
    setError(null);
  };

  return (
    <div className="h-screen flex flex-col bg-bg-base overflow-hidden">
      <OutputNav projectId={projectId} projectName={projectName} onProjectNameChange={setProjectName} />

      {/* Page */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div
          className="px-8 py-4 border-b border-border-default flex items-center justify-between shrink-0"
          style={{ background: "linear-gradient(135deg, #0A0908 70%, #0d110a 100%)" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/output")}
              className="flex items-center gap-1.5 font-ui text-[11px] text-text-muted hover:text-brand-white transition-colors uppercase tracking-wider"
            >
              <ArrowLeft size={12} /> Hub
            </button>
            <span className="text-border-default">·</span>
            <Globe size={13} style={{ color: ACCENT }} />
            <span className="font-display text-[13px] uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
              MULTILINGUAL
            </span>
          </div>

          {/* Language pills */}
          <div className="flex gap-1.5">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className="px-3 py-1.5 rounded-[2px] font-ui text-[11px] uppercase tracking-wider border transition-colors"
                style={{
                  borderColor: targetLanguage === lang ? ACCENT : "#2D2B28",
                  color: targetLanguage === lang ? ACCENT : "#6B6560",
                  background: targetLanguage === lang ? ACCENT + "18" : "transparent",
                }}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex bg-bg-elevated border border-border-default rounded-[4px] p-1 gap-1">
            {(["original", "translated"] as const).map((v) => (
              <button
                key={v}
                onClick={() => v === "translated" ? handleTranslate() : setView("original")}
                className="px-4 py-1.5 rounded-[2px] font-ui text-[11px] uppercase tracking-wider transition-colors"
                style={{
                  background: view === v ? ACCENT : "transparent",
                  color: view === v ? "#0A0908" : "#6B6560",
                }}
              >
                {v === "original" ? "ORIGINAL" : targetLanguage.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Split view */}
        <div className="flex flex-1 overflow-hidden">
          {/* Original — always visible */}
          <div
            className="flex flex-col border-r border-border-default overflow-hidden"
            style={{ width: view === "original" ? "100%" : "50%" }}
          >
            <div className="h-[36px] px-5 flex items-center border-b border-border-default shrink-0">
              <span className="font-ui text-[10px] text-text-muted uppercase tracking-widest">ENGLISH</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4">
              <ScreenplayViewer script={originalScript} />
            </div>
          </div>

          {/* Translated panel */}
          <AnimatePresence>
            {view === "translated" && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "50%", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                className="flex flex-col overflow-hidden"
              >
                <div
                  className="h-[36px] px-5 flex items-center border-b border-border-default shrink-0"
                  style={{ borderBottomColor: ACCENT + "40" }}
                >
                  <span
                    className="font-ui text-[10px] uppercase tracking-widest"
                    style={{ color: ACCENT }}
                  >
                    {targetLanguage.toUpperCase()}
                  </span>
                  <span className="ml-2 font-ui text-[9px] text-text-muted">· Culturally Generated · Sarvam AI</span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <Loader2 size={20} className="animate-spin" style={{ color: ACCENT }} />
                      <p className="font-ui text-[12px] text-text-muted animate-pulse">
                        Generating {targetLanguage} via Sarvam AI...
                      </p>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <p className="font-ui text-[12px] text-text-muted">{error}</p>
                      <button
                        onClick={handleTranslate}
                        className="px-4 py-2 border border-border-default rounded-[4px] font-ui text-[11px] text-text-muted hover:border-brand-white hover:text-brand-white transition-colors uppercase tracking-wider"
                      >
                        Retry
                      </button>
                    </div>
                  ) : translatedScript ? (
                    <ScreenplayViewer script={translatedScript} isTranslated />
                  ) : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
