"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import OutputNav from "@/components/OutputNav";
import ScreenplayViewer from "@/components/ScreenplayViewer";

export default function ScreenplayPage() {
  const router = useRouter();
  const [screenplay, setScreenplay] = useState("");
  const [sceneCount, setSceneCount] = useState(0);
  const [projectName, setProjectName] = useState("Untitled Project");
  const [projectId, setProjectId] = useState<string | undefined>();

  useEffect(() => {
    const gen = JSON.parse(localStorage.getItem("scriptoria_response_gen") || "{}");
    if (!gen.screenplay) { router.push("/output"); return; }
    setScreenplay(gen.screenplay);
    setSceneCount(gen.scene_count ?? 0);
    setProjectId(gen.project_id);
  }, [router]);

  return (
    <div className="h-screen flex flex-col bg-bg-base overflow-hidden">
      <OutputNav projectId={projectId} projectName={projectName} onProjectNameChange={setProjectName} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-[44px] px-8 flex items-center gap-4 border-b border-border-default shrink-0">
          <button
            onClick={() => router.push("/output")}
            className="flex items-center gap-1.5 font-ui text-[11px] text-text-muted hover:text-brand-white transition-colors uppercase tracking-wider"
          >
            <ArrowLeft size={12} /> Hub
          </button>
          <div className="w-px h-4 bg-border-default" />
          <span className="font-ui text-[10px] text-text-muted uppercase tracking-[0.14em]">SCREENPLAY</span>
          <div className="px-2.5 py-1 border border-border-default rounded-[2px] font-ui text-[10px] text-text-muted">
            {sceneCount} SCENES
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[680px] mx-auto px-8 py-8">
            <ScreenplayViewer script={screenplay} />
          </div>
        </div>
      </div>
    </div>
  );
}
