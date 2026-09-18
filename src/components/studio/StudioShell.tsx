"use client";

import { useState } from "react";
import { CommandBar } from "@/components/command-bar/CommandBar";
import { ResultsGrid } from "@/components/tasks/ResultsGrid";
import { StudioTopbar } from "@/components/studio/StudioTopbar";

export function StudioShell() {
  const [mode, setMode] = useState<"video" | "image">("image");

  return (
    <div className="studio-stage relative h-screen overflow-hidden">
      {/* Ambient depth — restrained void, not marketing chrome */}
      <div className="studio-stage__ambient pointer-events-none absolute inset-0" aria-hidden />
      <div className="studio-stage__grain pointer-events-none absolute inset-0" aria-hidden />

      <StudioTopbar />

      {/* Workspace — full screen, scrolls naturally */}
      <ResultsGrid mode={mode} />

      {/* Bottom composer */}
      <CommandBar mode={mode} onModeChange={setMode} />
    </div>
  );
}
