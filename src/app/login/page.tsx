import { Manrope, Space_Grotesk } from "next/font/google";
import { signIn } from "@/auth";
import "@/app/globals.css";

const manrope = Manrope({
    subsets: ["latin"],
    variable: "--font-manrope",
    weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
    weight: ["500", "700"],
});

export const metadata = {
    title: "Sign in · Open-Higgsfield",
    description: "Sign in with X to access the studio.",
};

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const params = await searchParams;
    const denied = params.error === "AccessDenied" || params.error === "Configuration";

    return (
        <html lang="en" className="dark">
            <body className={`${manrope.variable} ${spaceGrotesk.variable} min-h-dvh bg-background text-foreground`}>
                <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(213,255,71,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(142,244,197,0.08),_transparent_50%)]"
                    />
                    <div className="relative w-full max-w-md space-y-8 text-center">
                        <div className="space-y-3">
                            <p className="font-[family-name:var(--font-space-grotesk)] text-sm font-medium tracking-[0.2em] text-primary uppercase">
                                Open-Higgsfield
                            </p>
                            <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight sm:text-4xl">
                                Studio access
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Sign in with X. Only allowlisted accounts can enter.
                            </p>
                        </div>

                        {denied ? (
                            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                Access denied. Your X account is not on the allowlist.
                            </p>
                        ) : null}

                        <form
                            action={async () => {
                                "use server";
                                await signIn("twitter", { redirectTo: "/" });
                            }}
                        >
                            <button
                                type="submit"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-current">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                                </svg>
                                Sign in with X
                            </button>
                        </form>
                    </div>
                </main>
            </body>
        </html>
    );
}
