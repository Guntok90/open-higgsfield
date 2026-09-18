"use client";

interface TogglePillProps {
    label: string;
    icon: "sparkle" | "shield";
    value: boolean;
    onChange: (value: boolean) => void;
}

export function TogglePill({ label, value, onChange }: TogglePillProps) {
    return (
        <button
            type="button"
            onClick={() => onChange(!value)}
            className="flex items-center gap-2 h-9 rounded-[12px] border border-white/[.08] px-2.5 text-[12px] font-medium transition-all whitespace-nowrap cursor-pointer"
            style={{ background: "rgba(255,255,255,.035)", color: "rgba(244,247,251,.78)" }}
        >
            <span>{label}</span>
            {/* Custom toggle track */}
            <span
                className="inline-flex items-center rounded-full transition-colors"
                style={{
                    width: 30,
                    height: 18,
                    padding: "0 3px",
                    background: value ? "#d5ff47" : "rgba(255,255,255,.14)",
                }}
            >
                <span
                    className="h-3 w-3 rounded-full shadow-sm transition-transform shrink-0"
                    style={{
                        background: value ? "#0b1118" : "#fff",
                        transform: value ? "translateX(12px)" : "translateX(0)",
                    }}
                />
            </span>
        </button>
    );
}
