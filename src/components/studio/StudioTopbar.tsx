"use client";

export function StudioTopbar() {
  return (
    <header
      className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 sm:px-7"
      style={{ height: 52 }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{ background: "#d5ff47", boxShadow: "0 0 0 3px rgba(213,255,71,.12)" }}
          aria-hidden
        />
        <span
          className="text-[13px] font-medium tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif", color: "rgba(244,247,251,.88)" }}
        >
          Open Higgsfield
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "rgba(213,255,71,.85)" }}
          aria-hidden
        />
        <span
          className="text-[11px] font-medium uppercase tracking-[0.12em]"
          style={{ color: "rgba(244,247,251,.38)" }}
        >
          Studio
        </span>
      </div>
    </header>
  );
}
