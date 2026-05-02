import { cn } from "@/lib/utils";

type AuraVariant = "hero" | "docs" | "overview" | "webhooks" | "security" | "footer";

export function Aura({ variant }: { variant: AuraVariant }) {
  if (variant === "hero") {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Solid Bottom Horizon bridging the gap and filling corners */}
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-distill-core via-distill-violet to-transparent opacity-40 blur-[80px] mix-blend-screen" />
        {/* Left Vertical Curve of the U */}
        <div className="absolute bottom-[-10vh] left-[-20vw] w-[70vw] h-[100vh] bg-[radial-gradient(ellipse_at_bottom_left,_var(--distill-core)_0%,_var(--distill-violet)_50%,_transparent_70%)] opacity-60 blur-[100px] mix-blend-screen" />
        {/* Right Vertical Curve of the U */}
        <div className="absolute bottom-[-10vh] right-[-20vw] w-[70vw] h-[100vh] bg-[radial-gradient(ellipse_at_bottom_right,_var(--distill-core)_0%,_var(--distill-violet)_50%,_transparent_70%)] opacity-60 blur-[100px] mix-blend-screen" />
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Inverted U Shape - Solid Top Horizon */}
        <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-distill-core via-distill-violet to-transparent opacity-40 blur-[80px] mix-blend-screen" />
        {/* Left Vertical Curve of the Inverted U */}
        <div className="absolute top-[-10vh] left-[-20vw] w-[70vw] h-[100vh] bg-[radial-gradient(ellipse_at_top_left,_var(--distill-core)_0%,_var(--distill-violet)_50%,_transparent_70%)] opacity-60 blur-[100px] mix-blend-screen" />
        {/* Right Vertical Curve of the Inverted U */}
        <div className="absolute top-[-10vh] right-[-20vw] w-[70vw] h-[100vh] bg-[radial-gradient(ellipse_at_top_right,_var(--distill-core)_0%,_var(--distill-violet)_50%,_transparent_70%)] opacity-60 blur-[100px] mix-blend-screen" />
      </div>
    );
  }

  if (variant === "docs") {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Soft, wide top-left glow for the docs page */}
        <div className="absolute top-[-10vh] left-[-10vw] w-[60vw] h-[50vh] bg-[radial-gradient(ellipse_at_top_left,_var(--distill-violet)_0%,_transparent_70%)] opacity-[0.25] blur-[120px] mix-blend-screen" />
      </div>
    );
  }

  // Consolidated Dashboard Variants (Neat, clean, subtle)
  if (variant === "overview" || variant === "webhooks" || variant === "security") {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Very subtle, wide top glow so it doesn't distract from data tables and cards */}
        <div className="absolute top-[-10vh] left-1/2 -translate-x-1/2 w-[100vw] h-[40vh] bg-[radial-gradient(ellipse_at_top,_var(--distill-violet)_0%,_transparent_70%)] opacity-[0.25] blur-[120px] mix-blend-screen" />
      </div>
    );
  }

  return null;
}
