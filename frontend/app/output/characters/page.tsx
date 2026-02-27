"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft } from "lucide-react";
import OutputNav from "@/components/OutputNav";
import ChromaGrid, { ChromaItem } from "@/components/reactbits/ChromaGrid";

const CHAR_COLORS = ["#fefacd", "#acc8a2", "#cbdde9", "#ffd2c2", "#f1e194", "#fd802e"];

export default function CharactersPage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<any[]>([]);
  const [projectName, setProjectName] = useState("Untitled Project");
  const [projectId, setProjectId] = useState<string | undefined>();
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    const gen = JSON.parse(localStorage.getItem("scriptoria_response_gen") || "{}");
    if (!gen.characters?.length) { router.push("/output"); return; }
    setCharacters(gen.characters);
    setProjectId(gen.project_id);
  }, [router]);

  const gridItems: ChromaItem[] = characters.map((char, i) => ({
    title: char.name,
    subtitle: char.role,
    image: `https://ui-avatars.com/api/?name=${char.name.replace(' ', '+')}&background=random`,
    borderColor: CHAR_COLORS[i % CHAR_COLORS.length],
    description: char.bio, // Saving this here to use in the detail panel, even though ChromaGrid doesn't render it directly
  }));

  return (
    <div className="h-screen flex flex-col bg-bg-base overflow-hidden">
      <OutputNav projectId={projectId} projectName={projectName} onProjectNameChange={setProjectName} />

      {/* Page */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Hero band */}
        <div
          className="relative px-10 py-8 border-b border-border-default"
          style={{ background: "linear-gradient(135deg, #0A0908 50%, #0f100a 100%)" }}
        >
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.push("/output")}
              className="flex items-center gap-1.5 font-ui text-[11px] text-text-muted hover:text-brand-white transition-colors uppercase tracking-wider"
            >
              <ArrowLeft size={12} /> Hub
            </button>
            <span className="text-border-default">·</span>
            <span className="font-display text-[13px] uppercase tracking-[0.2em] text-pair6-accent">
              CHARACTERS
            </span>
          </div>
          <h1 className="font-display text-[40px] leading-none text-brand-white">
            {characters.length} <span className="text-text-muted">CHARACTERS</span>
          </h1>
          <p className="font-ui text-[12px] text-text-muted mt-1">
            Hover a card to explore · Click to view full profile
          </p>
        </div>

        {/* Chroma Grid */}
        <div className="p-8">
          <ChromaGrid items={gridItems} onSelect={setSelected} />
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selected && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-bg-base/80 backdrop-blur-sm z-40"
              onClick={() => setSelected(null)}
            />

            {/* Slide-in panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed right-0 top-0 h-full w-[420px] bg-bg-elevated border-l border-border-default z-50 flex flex-col overflow-hidden"
            >
              {/* Top bar */}
              <div
                className="h-[3px] w-full"
                style={{ background: selected.color }}
              />
              <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
                <span className="font-ui text-[10px] text-text-muted uppercase tracking-widest">CHARACTER PROFILE</span>
                <button
                  onClick={() => setSelected(null)}
                  className="text-text-muted hover:text-brand-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
                {/* Avatar + Name */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center font-display text-[28px] border-2"
                    style={{ borderColor: selected.color, color: selected.color, background: selected.color + "18" }}
                  >
                    {selected.title[0]}
                  </div>
                  <div>
                    <h2 className="font-display text-[28px] leading-none uppercase" style={{ color: selected.color }}>
                      {selected.title}
                    </h2>
                    <p className="font-ui text-[11px] text-text-muted uppercase tracking-widest mt-1">{selected.subtitle}</p>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <span className="font-ui text-[9px] text-text-muted uppercase tracking-[0.18em] block mb-2">BIO</span>
                  <p className="font-ui text-[13px] text-text-primary leading-relaxed">{selected.description}</p>
                </div>

                {/* Arc */}
                {selected.tags && selected.tags.length > 0 && (
                  <div>
                    <span className="font-ui text-[9px] text-text-muted uppercase tracking-[0.18em] block mb-2">CHARACTER ARC</span>
                    <p className="font-display text-[15px] uppercase tracking-wide" style={{ color: selected.color }}>
                      {selected.tags[0]}
                    </p>
                  </div>
                )}

                {/* Find the original character for extra data */}
                {(() => {
                  const orig = characters.find((c) => c.name === selected.title);
                  if (!orig?.motivations && !orig?.key_scenes) return null;
                  return (
                    <>
                      {orig.motivations && (
                        <div>
                          <span className="font-ui text-[9px] text-text-muted uppercase tracking-[0.18em] block mb-2">MOTIVATIONS</span>
                          <p className="font-ui text-[13px] text-text-primary leading-relaxed">{orig.motivations}</p>
                        </div>
                      )}
                      {orig.key_scenes && (
                        <div>
                          <span className="font-ui text-[9px] text-text-muted uppercase tracking-[0.18em] block mb-2">KEY SCENES</span>
                          <p className="font-ui text-[13px] text-text-muted leading-relaxed">{orig.key_scenes}</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
