import { motion } from "framer-motion";

export default function CharactersTab({ characters }: { characters: any[] }) {
    if (!characters || characters.length === 0) return null;

    return (
        <div className="grid grid-cols-2 gap-[24px]">
            {characters.map((char, i) => (
                <motion.div
                    key={char.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{
                        boxShadow: "0 0 15px rgba(172, 200, 162, 0.15)", // Pair 6 accent
                        // Simulating Chroma Grid shift:
                        borderColor: ["#2D2B28", "#acc8a2", "#789a99", "#2D2B28"]
                    }}
                    className="bg-pair6-dark border border-border-default rounded-[4px] p-[20px] flex flex-col h-full overflow-hidden transition-all duration-300"
                >
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
                </motion.div>
            ))}
        </div>
    );
}
