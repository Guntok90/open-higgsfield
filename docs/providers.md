# Providers and models

Only the provider selected for a generation needs to be configured. All credentials are read on the server.

## Freepik

```dotenv
FREEPIK_API_KEY=
```

Open-Higgsfield includes Freepik image families such as Flux, Seedream and Z-Image, plus video families such as Kling, Runway, Wan, MiniMax, Seedance, PixVerse, LTX and OmniHuman.

## Google AI Studio

```dotenv
GEMINI_API_KEY=
```

`GOOGLE_AI_API_KEY` is also accepted as a fallback. The integration supports Gemini image generation and Veo video generation.

## Google Vertex AI

```dotenv
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=global
```

Authentication options:

1. Application Default Credentials.
2. A local service account file through `GOOGLE_APPLICATION_CREDENTIALS`.
3. Inline JSON through `GOOGLE_SERVICE_ACCOUNT_JSON` or `GOOGLE_CLOUD_CREDENTIALS`.

Service account files and local credential files are ignored by Git.

## Vercel AI Gateway

```dotenv
AI_GATEWAY_API_KEY=
```

The current catalog includes Google, Black Forest Labs, Recraft, OpenAI, Alibaba Wan and KlingAI models exposed through the gateway.

## xAI Grok Imagine

```dotenv
XAI_API_KEY=
```

Official HTTP against `https://api.x.ai/v1` with Bearer auth. Catalog modes:

- Text-to-image and image edit (up to 5 reference images) via `grok-imagine-image-2.0`
- Text-to-video and image-to-video via `grok-imagine-video-1.5` (async poll)

X OAuth login is unrelated — Imagine always uses `XAI_API_KEY` on the server.

## Studio access (X / Twitter OAuth)

```dotenv
AUTH_SECRET=
AUTH_URL=
AUTH_TWITTER_ID=
AUTH_TWITTER_SECRET=
AUTH_ALLOWED_X_USERNAMES=
```

Auth.js (NextAuth v5) gates the studio and generation APIs. Only allowlisted X usernames (comma-separated, without `@`) can sign in. Leave `AUTH_ALLOWED_X_USERNAMES` empty until HQ fills it — an empty allowlist admits nobody. `NEXTAUTH_URL` / `NEXTAUTH_SECRET` are accepted aliases where Auth.js still recognizes them.

## Reference media uploads

Some providers require a public URL for asynchronous image/video inputs. Open-Higgsfield uses Cloudinary for this handoff.

```dotenv
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

You can alternatively configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` separately.

## Adding a model

If an existing provider already supports the model's API shape:

1. Add its capability entry to `src/models/capabilities/image.ts`, `video.ts` or `external.ts`.
2. Set `provider`, `provider_model_id` and `provider_mode` when needed.
3. Define every supported control and media slot.
4. Verify the model appears in `/api/image-models` or `/api/models`.
5. Run `npm run check`.

Freepik models that need a new payload shape also require a model-family adapter in `src/models/adapters/`.

## Adding a provider

Implement the `GenerationProvider` interface from `src/providers/types.ts`, register it in `src/providers/registry.ts`, and add its credential documentation to `.env.example`.
