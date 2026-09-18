import type {
    GeneratedAsset,
    GenerationProvider,
    ProviderGenerationRequest,
    ProviderPollRequest,
    ProviderPollResult,
    ProviderSubmission,
} from "./types";
import { errorMessage, getImageUrl, getMediaUrls } from "./utils";

const XAI_API_BASE = "https://api.x.ai/v1";
const MAX_REFERENCE_IMAGES = 5;

interface XaiVideoOperation {
    requestId: string;
}

interface XaiImageItem {
    url?: string | null;
    b64_json?: string | null;
    mime_type?: string | null;
}

function requireApiKey(): string {
    const apiKey = process.env.XAI_API_KEY?.trim();
    if (!apiKey) throw new Error("ERR_XAI_API_KEY_NOT_CONFIGURED");
    return apiKey;
}

function authHeaders(apiKey: string, json = false): HeadersInit {
    const headers: Record<string, string> = {
        Authorization: `Bearer ${apiKey}`,
    };
    if (json) headers["Content-Type"] = "application/json";
    return headers;
}

function normalizeImageResolution(resolution?: string): string | undefined {
    if (!resolution) return undefined;
    const normalized = resolution.trim().toLowerCase();
    if (normalized === "1k" || normalized === "2k" || normalized === "1.5k") return normalized;
    return undefined;
}

function normalizeVideoResolution(resolution?: string): string | undefined {
    if (!resolution) return undefined;
    const normalized = resolution.trim().toLowerCase();
    if (normalized === "480p" || normalized === "720p" || normalized === "1080p") return normalized;
    return undefined;
}

function normalizeAspectRatio(aspectRatio?: string): string | undefined {
    if (!aspectRatio?.trim()) return undefined;
    return aspectRatio.trim();
}

function imagePayloadExtras(request: ProviderGenerationRequest): Record<string, unknown> {
    const extras: Record<string, unknown> = {};
    const aspectRatio = normalizeAspectRatio(request.params.aspect_ratio);
    if (aspectRatio) extras.aspect_ratio = aspectRatio;
    const resolution = normalizeImageResolution(request.params.resolution);
    if (resolution) extras.resolution = resolution;
    const nValue = Number(request.params.field_values?.n ?? 1);
    if (Number.isFinite(nValue) && nValue > 1) {
        extras.n = Math.max(1, Math.min(10, Math.floor(nValue)));
    }
    return extras;
}

function toImageAssets(data: XaiImageItem[] | undefined): GeneratedAsset[] {
    const assets: GeneratedAsset[] = [];
    for (const item of data ?? []) {
        if (item.url) {
            assets.push({ url: item.url, mimeType: item.mime_type ?? "image/jpeg" });
            continue;
        }
        if (item.b64_json) {
            assets.push({
                data: new Uint8Array(Buffer.from(item.b64_json, "base64")),
                mimeType: item.mime_type ?? "image/jpeg",
            });
        }
    }
    if (assets.length === 0) throw new Error("ERR_NO_IMAGE_GENERATED");
    return assets;
}

async function xaiFetch(path: string, init: RequestInit): Promise<Response> {
    const response = await fetch(`${XAI_API_BASE}${path}`, init);
    if (!response.ok) {
        let detail = "";
        try {
            const body = await response.json() as { error?: { message?: string }; message?: string };
            detail = body.error?.message ?? body.message ?? "";
        } catch {
            detail = await response.text().catch(() => "");
        }
        throw new Error(`ERR_XAI_API_${response.status}${detail ? `: ${detail}` : ""}`);
    }
    return response;
}

export class XaiProvider implements GenerationProvider {
    readonly id = "xai" as const;

    async submit(request: ProviderGenerationRequest): Promise<ProviderSubmission> {
        const apiKey = requireApiKey();
        if (request.mediaType === "image") return this.submitImage(apiKey, request);
        return this.submitVideo(apiKey, request);
    }

    private async submitImage(apiKey: string, request: ProviderGenerationRequest): Promise<ProviderSubmission> {
        const urls = getMediaUrls(request.media).slice(0, MAX_REFERENCE_IMAGES);
        const body: Record<string, unknown> = {
            model: request.providerModelId,
            prompt: request.params.prompt,
            ...imagePayloadExtras(request),
        };

        const endpoint = urls.length > 0 ? "/images/edits" : "/images/generations";
        if (urls.length === 1) {
            body.image = { url: urls[0], type: "image_url" };
        } else if (urls.length > 1) {
            body.images = urls.map((url) => ({ url }));
        }

        const response = await xaiFetch(endpoint, {
            method: "POST",
            headers: authHeaders(apiKey, true),
            body: JSON.stringify(body),
        });
        const payload = await response.json() as { data?: XaiImageItem[] };
        return { status: "COMPLETED", assets: toImageAssets(payload.data) };
    }

    private async submitVideo(apiKey: string, request: ProviderGenerationRequest): Promise<ProviderSubmission> {
        const startImage = getImageUrl(request.media, "start_image", "image", "input_image");
        const body: Record<string, unknown> = {
            model: request.providerModelId,
            prompt: request.params.prompt,
        };

        if (startImage) body.image = { url: startImage };

        const duration = request.params.duration ? Number(request.params.duration) : undefined;
        if (Number.isFinite(duration) && duration! >= 1 && duration! <= 15) {
            body.duration = Math.floor(duration!);
        }

        const aspectRatio = normalizeAspectRatio(request.params.aspect_ratio);
        if (aspectRatio) body.aspect_ratio = aspectRatio;

        const resolution = normalizeVideoResolution(request.params.resolution);
        if (resolution) body.resolution = resolution;

        const response = await xaiFetch("/videos/generations", {
            method: "POST",
            headers: authHeaders(apiKey, true),
            body: JSON.stringify(body),
        });
        const payload = await response.json() as { request_id?: string };
        if (!payload.request_id) throw new Error("ERR_XAI_NO_REQUEST_ID");

        return {
            status: "CREATED",
            providerTaskId: payload.request_id,
            operation: { requestId: payload.request_id } satisfies XaiVideoOperation,
        };
    }

    async poll(request: ProviderPollRequest): Promise<ProviderPollResult> {
        const apiKey = requireApiKey();
        const operation = request.operation as XaiVideoOperation | undefined;
        if (!operation?.requestId) {
            return { status: "ERROR", error: "ERR_INVALID_PROVIDER_OPERATION", operation: request.operation };
        }

        try {
            const response = await xaiFetch(`/videos/${operation.requestId}`, {
                method: "GET",
                headers: authHeaders(apiKey),
            });
            const payload = await response.json() as {
                status?: string;
                error?: { message?: string; code?: string };
                video?: { url?: string | null; respect_moderation?: boolean };
            };

            const status = (payload.status ?? "").toLowerCase();
            if (status === "done") {
                const url = payload.video?.url;
                if (!url) {
                    return {
                        status: "FAILED",
                        error: payload.video?.respect_moderation === false
                            ? "ERR_XAI_VIDEO_MODERATION"
                            : "ERR_NO_VIDEO_GENERATED",
                        operation,
                    };
                }
                return {
                    status: "COMPLETED",
                    assets: [{ url, mimeType: "video/mp4" }],
                    operation,
                };
            }

            if (status === "failed" || status === "expired") {
                return {
                    status: "FAILED",
                    error: payload.error?.message ?? `ERR_XAI_VIDEO_${status.toUpperCase()}`,
                    operation,
                };
            }

            return { status: "IN_PROGRESS", operation };
        } catch (error) {
            return { status: "ERROR", error: errorMessage(error), operation };
        }
    }
}
