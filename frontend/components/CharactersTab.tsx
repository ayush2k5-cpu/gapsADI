"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getCharacterPortraits } from "@/lib/api";

interface CharactersTabProps {
    characters: any[];
    projectId: string;
    tone: number;
}

export default function CharactersTab({ characters, projectId, tone }: CharactersTabProps) {
    const [portraitMap, setPortraitMap] = useState<{ [name: string]: string }>({});
    const [loadingPortraits, setLoadingPortraits] = useState(true);

    useEffect(() => {
        if (!projectId || !characters || characters.length === 0) {
            setLoadingPortraits(false);
            return;
        }

        setLoadingPortraits(true);
        getCharacterPortraits(projectId, tone)
            .then((data) => {
                const map: { [name: string]: string } = {};
                for (const portrait of data.portraits) {
                    map[portrait.name] = portrait.image_url;
                }
                setPortraitMap(map);
            })
            .catch(() => {
                // Graceful fallback — initials will show instead
            })
            .finally(() => {
                setLoadingPortraits(false);
            });
    }, [projectId, tone]);

    if (!characters || characters.length === 0) return null;

    return (
        <div className="grid grid-cols-2 gap-[24px]">
            {characters.map((char, i) => {
                const imageUrl: string = portraitMap[char.name] || "";
                const initial: string = char.name ? char.name.charAt(0) : "?";

                return (
                    <motion.div
                        key={char.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{
                            boxShadow: "0 0 15px rgba(172, 200, 162, 0.15)",
                            borderColor: ["#2D2B28", "#acc8a2", "#789a99", "#2D2B28"]
                        }}
                        className="bg-pair6-dark border border-border-default rounded-[4px] overflow-hidden flex flex-col h-full transition-all duration-300"
                    >
                        {/* Portrait image area */}
                        <div className="w-full aspect-square overflow-hidden">
                            {loadingPortraits ? (
                                <div className="w-full h-full bg-bg-elevated animate-pulse" />
                            ) : imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={char.name}
                                    className="w-full h-full object-cover object-top"
                                />
                            ) : (
                                <div className="w-full h-full bg-bg-elevated flex items-center justify-center">
                                    <span className="font-display text-[48px] text-pair6-accent opacity-50">
                                        {initial}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Text content */}
                        <div className="p-[20px] flex flex-col flex-1">
                            <div className="flex flex-col gap-[8px]">
                                <h3 className="font-display text-[18px] text-pair6-accent uppercase leading-none">
                                    {char.name}
                                </h3>
                                <div className="self-start font-ui text-[10px] text-text-muted bg-pair6-dark border border-pair6-accent rounded-[2px] px-[10px] py-[4px] tracking-wide">
                                    {char.role}
                                </div>
                            </div>

                            <div className="mt-[12px] mb-[16px] flex-1">
                                <p className="font-ui text-[12px] text-text-primary leading-[1.6] line-clamp-3">
                                    {char.bio}
                                </p>
                            </div>

                            <div className="mt-auto pt-[16px]">
                                <span className="font-display text-[13px] text-text-muted uppercase tracking-[0.1em]">
                                    {char.arc}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
