import { useMemo } from "react";
import { motion } from "framer-motion";

export default function ScreenplayViewer({ script, isTranslated = false }: { script: string; isTranslated?: boolean }) {
    // Simple heuristic parser for Fountain-lite/standard text screenplay layout
    const blocks = useMemo(() => {
        if (!script) return [];
        const lines = script.split("\n");
        const parsed = [];

        let currentScene = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            if (!trimmed) {
                // Empty line
                parsed.push({ type: "empty", content: "", scene: currentScene });
                continue;
            }

            // Scene Heading
            if (trimmed.startsWith("INT.") || trimmed.startsWith("EXT.")) {
                currentScene++;
                parsed.push({ type: "scene_heading", content: trimmed, scene: currentScene });
                continue;
            }

            // Character Name (all caps, usually indented)
            const isUpperCase = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
            const isIndentedDeep = line.startsWith("          ") && !line.startsWith("                    ");
            // ^ very loose heuristic based on standard spacing, but let's check uppercase + short length

            // Let's rely on standard indentation: character names are often ~20 spaces in, dialogue ~10 spaces.
            // E.g. MOCK_DATA: "                    ARYAN" -> 20 spaces
            // MOCK_DATA: "          It's..." -> 10 spaces

            if (line.match(/^ {15,30}[A-Z0-9\s()]+$/)) { // Character
                parsed.push({ type: "character", content: trimmed, scene: currentScene });
            } else if (line.match(/^ {5,14}\S/)) { // Dialogue
                parsed.push({ type: "dialogue", content: trimmed, scene: currentScene });
            } else if (isUpperCase && trimmed.length < 40 && !trimmed.includes(".")) {
                // Fallback for character if spacing is messed up
                parsed.push({ type: "character", content: trimmed, scene: currentScene });
            } else {
                // Action line
                parsed.push({ type: "action", content: trimmed, scene: currentScene });
            }
        }
        return parsed;
    }, [script]);

    const dialogueColor = isTranslated ? "text-pair3-accent" : "text-text-primary";

    return (
        <div className={`font-screenplay text-[12px] leading-relaxed relative ${isTranslated ? "bg-pair3-bg/5 p-4 rounded-md" : ""}`}>
            {blocks.map((block, idx) => {
                if (block.type === "empty") return <div key={idx} className="h-4" />;

                // Create the scene hover wrapper
                const className = [
                    "transition-all duration-150 relative border-l-2 border-transparent hover:border-brand-white",
                    block.type === "scene_heading" ? "text-brand-white uppercase mt-6 mb-2" : "",
                    block.type === "action" ? "text-[#B0A898] w-full" : "",
                    block.type === "character" ? "text-brand-white uppercase text-center w-[60%] ml-[20%] mt-4" : "",
                    block.type === "dialogue" ? `${dialogueColor} w-[60%] ml-[20%]` : ""
                ].join(" ");

                return (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05, duration: 0.1 }} // Simple typewriter-ish reveal
                        className={className.trim()}
                        onMouseEnter={() => {
                            // Dispatch event for linked hover interaction
                            if (block.scene > 0) {
                                window.dispatchEvent(new CustomEvent("scene_hover", { detail: { scene: block.scene } }));
                            }
                        }}
                        onMouseLeave={() => {
                            window.dispatchEvent(new CustomEvent("scene_hover", { detail: { scene: null } }));
                        }}
                    >
                        <span className="pl-4">{block.content}</span>
                    </motion.div>
                );
            })}
        </div>
    );
}
