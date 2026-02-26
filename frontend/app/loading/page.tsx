"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { generateScreenplay, analyzeScreenplay, getMoodboard } from "@/lib/api";

const STEPS = [
    "STRUCTURING YOUR NARRATIVE...",
    "WRITING YOUR SCREENPLAY...",
    "BUILDING YOUR CHARACTERS...",
    "RUNNING AD INTELLIGENCE...",
    "GENERATING VISUAL MOODBOARDS...",
];

export default function Loading() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        async function process() {
            // Small delay for initial animation
            await new Promise(r => setTimeout(r, 1000));

            const payload = JSON.parse(localStorage.getItem("scriptoria_request") || "{}");
            if (!payload.story_idea) {
                router.push("/");
                return;
            }

            try {
                // Step 1: Generate
                setCurrentStep(1);
                const genRes = await generateScreenplay(payload);
                localStorage.setItem("scriptoria_response_gen", JSON.stringify(genRes));

                setCurrentStep(2);
                await new Promise(r => setTimeout(r, 1000)); // artifical delay for character parsing feel

                // Step 3 & 4 in parallel
                setCurrentStep(3);
                const { project_id } = genRes;

                const analyzeP = analyzeScreenplay({ project_id });

                setCurrentStep(4);
                const mood1 = getMoodboard({ project_id, act: 1 }).catch(() => null);
                const mood2 = getMoodboard({ project_id, act: 2 }).catch(() => null);
                const mood3 = getMoodboard({ project_id, act: 3 }).catch(() => null);

                const [analyzeRes, m1, m2, m3] = await Promise.all([analyzeP, mood1, mood2, mood3]);

                localStorage.setItem("scriptoria_response_analyze", JSON.stringify(analyzeRes));
                localStorage.setItem("scriptoria_response_moods", JSON.stringify([m1, m2, m3]));

                router.push("/output");
            } catch (err) {
                console.error("Pipeline failed", err);
                router.push("/");
            }
        }

        process();
    }, [router]);

    return (
        <div className="relative min-h-screen bg-bg-base flex flex-col items-center justify-center">
            {/* Film Reel Animation */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-[96px] h-[96px] rounded-full border-[2px] border-brand-white flex items-center justify-center relative"
            >
                <div className="w-[80px] h-[80px] rounded-full border-[1px] border-text-muted absolute"></div>
                {/* Spokes */}
                {[0, 60, 120].map((deg) => (
                    <div key={deg} className="absolute w-[96px] h-[2px] bg-brand-white" style={{ transform: `rotate(${deg}deg)` }} />
                ))}
                {/* Inner Hub */}
                <div className="w-[16px] h-[16px] rounded-full bg-brand-white relative z-10 box-content border-[4px] border-bg-base"></div>
            </motion.div>

            {/* Status Text */}
            <div className="mt-[32px] h-[24px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="font-display text-[20px] text-text-primary tracking-[0.1em]"
                    >
                        {STEPS[currentStep]}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Step Dots */}
            <div className="flex gap-[12px] mt-[24px]">
                {STEPS.map((_, i) => (
                    <div
                        key={i}
                        className={`w-[8px] h-[8px] rounded-full transition-colors duration-300 ${i <= currentStep ? "bg-brand-white border-brand-white" : "bg-border-default border-border-default"
                            } border`}
                    />
                ))}
            </div>

            {/* Attribution */}
            <div className="absolute bottom-[32px] font-ui text-[11px] text-text-muted tracking-wide text-center w-full">
                Powered by Gemini · Sarvam AI · Scriptoria RAG
            </div>
        </div>
    );
}
