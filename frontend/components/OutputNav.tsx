"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, Download, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { exportScreenplay } from "@/lib/api";

const NAV_ITEMS = [
  { label: "HUB", href: "/output", color: "#F5F5F5" },
  { label: "AD INTEL", href: "/output/ad", color: "#fd802e" },
  { label: "CHARACTERS", href: "/output/characters", color: "#fefacd" },
  { label: "MOODBOARD", href: "/output/moodboard", color: "#f1e194" },
  { label: "MULTILINGUAL", href: "/output/multilingual", color: "#acc8a2" },
];

interface OutputNavProps {
  projectId?: string;
  projectName?: string;
  onProjectNameChange?: (name: string) => void;
}

export default function OutputNav({ projectId, projectName = "Untitled Project", onProjectNameChange }: OutputNavProps) {
  const pathname = usePathname();
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: string) => {
    if (!projectId || exporting) return;
    setExporting(format);
    try {
      const blob = await exportScreenplay({ project_id: projectId, format: format as "pdf" | "docx" | "txt" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Scriptoria_${projectId.slice(0, 8)}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <header className="h-[56px] flex-shrink-0 bg-bg-surface border-b border-border-default flex items-center px-6 gap-6 relative z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <Clapperboard size={15} className="text-brand-white" />
        <span className="font-display text-[15px] text-brand-white uppercase leading-none mt-0.5">SCRIPTORIA</span>
      </Link>

      <div className="w-px h-5 bg-border-default" />

      {/* Section nav */}
      <nav className="flex items-end gap-1 h-full flex-1 overflow-x-auto hide-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative h-full flex items-center px-3 font-display text-[12px] uppercase tracking-[0.1em] transition-colors whitespace-nowrap"
              style={{ color: isActive ? item.color : "#6B6560" }}
            >
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ background: item.color }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Project name */}
      <input
        value={projectName}
        onChange={(e) => onProjectNameChange?.(e.target.value)}
        className="font-ui text-[13px] text-text-muted bg-transparent text-center focus:outline-none focus:text-text-primary w-36 border-b border-transparent focus:border-border-default transition-colors"
        placeholder="Project name..."
      />

      {/* Exports */}
      <div className="flex items-center gap-1.5 shrink-0">
        <FileText size={12} className="text-text-muted" />
        {(["pdf", "docx", "txt"] as const).map((fmt) => (
          <button
            key={fmt}
            onClick={() => handleExport(fmt)}
            disabled={!!exporting}
            className={`px-3 py-1.5 rounded-[2px] font-ui text-[11px] uppercase tracking-wider border transition-colors
              ${exporting === fmt
                ? "bg-brand-white text-brand-black border-brand-white animate-pulse"
                : "border-border-default text-text-muted hover:border-brand-white hover:text-brand-white disabled:opacity-30"
              }`}
          >
            {exporting === fmt ? "..." : fmt.toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  );
}
