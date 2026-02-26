"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clapperboard, ChevronDown } from "lucide-react";
import { generateScreenplay } from "@/lib/api";

const GENRES = ["Action", "Drama", "Thriller", "Romance", "Comedy", "Horror"];
const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Bengali"];

export default function Home() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [genre, setGenre] = useState("Thriller");
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState(60);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleGenerate = async () => {
    if (!idea.trim()) return;

    // Construct local storage payload to pass to loading screen
    localStorage.setItem("scriptoria_request", JSON.stringify({
      story_idea: idea,
      genre,
      language,
      tone
    }));

    // Trigger clap animation somehow or do it inside the loading page
    router.push("/loading");
  };

  return (
    <div className="relative min-h-screen bg-bg-base overflow-hidden flex flex-col items-center">
      {/* Background Film Lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundSize: "100% 60px",
          backgroundImage: "linear-gradient(to bottom, rgba(245, 245, 245, 0.03) 1px, transparent 1px)"
        }}
      />

      {/* Header */}
      <header className="absolute top-[32px] left-[32px] flex items-center gap-[8px]">
        <Clapperboard size={16} className="text-brand-white" />
        <span className="font-display text-[18px] text-brand-white uppercase leading-none mt-1">SCRIPTORIA</span>
      </header>

      {/* Main Content */}
      <main className="w-[720px] flex flex-col mt-[38vh]">
        <h1 className="font-display text-[64px] text-text-primary text-center mb-[32px] leading-none">
          WHAT'S YOUR STORY?
        </h1>

        {/* Textarea */}
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe your story idea..."
          className="w-full min-h-[120px] bg-transparent border-b border-brand-white text-text-primary font-screenplay text-[14px] resize-y outline-none p-2 placeholder:text-text-muted rounded-none"
        />

        {/* Controls Row */}
        <div className="flex items-center justify-between w-full mt-[24px]">

          {/* Zone 1: Genres */}
          <div className="flex gap-[8px]">
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`px-[14px] py-[6px] rounded-[2px] font-ui text-[12px] transition-colors border ${genre === g
                    ? "bg-brand-white text-brand-black border-brand-white"
                    : "bg-bg-surface text-text-muted border-border-default"
                  }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Zone 2: Language */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-bg-surface border border-border-default rounded-[4px] px-[12px] py-[8px] font-ui text-[13px] text-text-primary"
            >
              {language}
              <ChevronDown size={14} className="text-brand-white" />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full mt-1 left-0 w-full bg-bg-elevated border border-border-default rounded-[4px] shadow-lg z-10 overflow-hidden">
                {LANGUAGES.map((l) => (
                  <button
                    key={l}
                    className="w-full text-left px-[12px] py-[8px] font-ui text-[13px] text-text-primary hover:bg-bg-surface"
                    onClick={() => {
                      setLanguage(l);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Zone 3: Tone Slider */}
          <div className="flex items-center gap-3">
            <span className="font-ui text-[11px] text-pair1-accent tracking-wider uppercase">MASALA</span>
            <input
              type="range"
              min="0" max="100"
              value={tone}
              onChange={(e) => setTone(parseInt(e.target.value))}
              className="w-[120px] h-[4px] appearance-none bg-transparent rounded-[2px]"
              style={{
                background: "linear-gradient(to right, #f1e194, #cbdde9)"
              }}
            />
            {/* Note: In tailwind we'll rely on global CSS for custom range thumb to meet precise spec if needed. For now inline defaults. */}
            <span className="font-ui text-[11px] text-pair5-accent tracking-wider uppercase">NOLAN</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleGenerate}
          className="w-full h-[56px] mt-[32px] bg-brand-white rounded-[4px] font-display text-[22px] text-brand-black tracking-widest hover:bg-[#E0E0E0] transition-colors"
        >
          ROLL CAMERA
        </button>
      </main>

      {/* Required for styling range thumb explicitly */}
      <style dangerouslySetInnerHTML={{
        __html: `
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #F5F5F5;
          cursor: pointer;
          border: none;
        }
        input[type=range]::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #F5F5F5;
          cursor: pointer;
          border: none;
        }
      `}} />
    </div>
  );
}
