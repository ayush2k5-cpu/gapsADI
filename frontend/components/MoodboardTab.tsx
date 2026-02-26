import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MoodboardTab({ moods }: { moods: any[] }) {
    const [isHovered, setIsHovered] = useState(false);

    // If no moods, we could render a skeleton, but for now just wait.
    if (!moods || moods.length === 0) return null;

    return (
        <div className="flex flex-col h-full items-center relative gap-[32px] pt-[24px]">
            <div className="w-full flex justify-between items-center px-[24px]">
                <h2 className="font-display text-[20px] text-text-primary">VISUAL DIRECTION</h2>
                <span className="font-ui text-[10px] text-text-muted">Generated via Pollinations.ai</span>
            </div>

            {/* Visual Stack */}
            <div
                className="relative w-full max-w-[500px] h-[350px] mt-[48px] flex items-center justify-center cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <AnimatePresence>
                    {moods.map((mood, idx) => {
                        if (!mood) return null;

                        // Stack logic: top card (idx=0) rotates least.
                        // 0: translate 0, rotate 0
                        // 1: translate right, rotate right
                        // 2: translate left, rotate left
                        const offsetMultiplier = idx === 0 ? 0 : idx === 1 ? 1 : -1;
                        const isTop = idx === 0;

                        const baseStyle = {
                            rotate: isHovered ? offsetMultiplier * 15 : offsetMultiplier * 5,
                            x: isHovered ? offsetMultiplier * 120 : offsetMultiplier * 15,
                            y: isHovered ? 0 : idx * 10,
                            zIndex: 10 - idx,
                        };

                        return (
                            <motion.div
                                key={idx}
                                animate={baseStyle}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className={`absolute w-[400px] aspect-video bg-bg-surface border border-border-default rounded-[4px] overflow-hidden shadow-2xl origin-bottom transition-shadow duration-300 ${isHovered ? "hover:shadow-[0_0_20px_rgba(255,210,194,0.3)]" : ""
                                    }`}
                            >
                                <div className="w-full h-[calc(100%-36px)] relative group">
                                    <img
                                        src={mood.image_url}
                                        alt={mood.caption}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-pair2-accent opacity-0 group-hover:opacity-15 transition-opacity duration-300 pointer-events-none" />
                                </div>
                                <div className="h-[36px] px-[12px] flex items-center bg-bg-surface border-t border-border-default">
                                    <span className="font-ui text-[11px] text-pair2-secondary uppercase tracking-wider truncate text-ellipsis">
                                        {mood.caption}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
