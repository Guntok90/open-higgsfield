"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { PillPopover } from "./PillPopover";
import { VIDEO_CAPABILITIES, VIDEO_CAPABILITY_GROUPS, getVideoCapabilitiesByGroup } from "@/models/capabilities/video";
import type { AttachmentItem } from "@/components/studio/AttachmentZone";

interface VideoModelPillProps {
    modelId: string;
    variantId: string;
    onModelChange: (modelId: string, variantId: string) => void;
    attachments: AttachmentItem[];
}

export function VideoModelPill({ modelId, variantId: _variantId, onModelChange }: VideoModelPillProps) {
    const [open, setOpen] = useState(false);
    const model = VIDEO_CAPABILITIES[modelId];
    const label = model?.label ?? modelId;

    return (
        <PillPopover
            open={open}
            onOpenChange={setOpen}
            width="w-72"
            contentClassName="flex max-h-[70dvh] min-h-0 flex-col overflow-hidden"
            trigger={
                <>
                    <span className="text-[10px] font-medium tracking-[0.04em]" style={{ color: "rgba(244,247,251,.4)" }}>
                        Model
                    </span>
                    <span className="font-medium" style={{ color: "rgba(244,247,251,.88)" }}>{label}</span>
                </>
            }
        >
            <p className="mb-2 shrink-0 px-1 text-[10px] font-semibold uppercase tracking-[.08em]" style={{ color: "rgba(244,247,251,.44)" }}>
                Model
            </p>
            <div className="model-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pr-1">
                <div className="space-y-3 pr-1">
                    {VIDEO_CAPABILITY_GROUPS.map((group) => {
                        const modelsInGroup = getVideoCapabilitiesByGroup(group);
                        return (
                            <div key={group}>
                                <p className="text-[11px] font-bold px-1 py-1" style={{ color: "rgba(244,247,251,.72)" }}>{group}</p>
                                <div className="space-y-0.5">
                                    {modelsInGroup.map((m) => {
                                        const isSelected = m.id === modelId;

                                        return (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => {
                                                    onModelChange(m.id, m.id === modelId ? _variantId : "");
                                                    setOpen(false);
                                                }}
                                                className="w-full flex items-center justify-between rounded-[10px] px-2.5 py-2 text-xs transition-colors cursor-pointer"
                                                style={{
                                                    background: isSelected ? "rgba(213,255,71,.1)" : "transparent",
                                                    color: isSelected ? "#d5ff47" : "#f4f7fb",
                                                    fontWeight: isSelected ? 600 : 500,
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,.06)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isSelected) e.currentTarget.style.background = "transparent";
                                                }}
                                                >
                                                    <span className="truncate">{m.label}</span>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                    {isSelected && <Check className="h-3.5 w-3.5" style={{ color: "#d5ff47" }} />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </PillPopover>
    );
}
