import { cn } from "@/lib/utils";

type AuraVariant = "hero" | "docs" | "overview" | "webhooks" | "security" | "footer" | "aurora" | "conic" | "tactical-noise";

export function Aura({ variant }: { variant: AuraVariant }) {
  if (variant === "hero") {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none overflow-visible">
        {/* Solid Bottom Horizon bridging the gap and filling corners */}
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-distill-core via-distill-violet to-transparent opacity-70 blur-[80px] mix-blend-screen" />
        {/* Left Vertical Curve of the U */}
        <div className="absolute bottom-[-10vh] left-[-20vw] w-[70vw] h-[100vh] bg-[radial-gradient(ellipse_at_bottom_left,_var(--distill-core)_0%,_var(--distill-violet)_50%,_transparent_70%)] opacity-90 blur-[100px] mix-blend-screen" />
        {/* Right Vertical Curve of the U */}
        <div className="absolute bottom-[-10vh] right-[-20vw] w-[70vw] h-[100vh] bg-[radial-gradient(ellipse_at_bottom_right,_var(--distill-core)_0%,_var(--distill-violet)_50%,_transparent_70%)] opacity-90 blur-[100px] mix-blend-screen" />
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Inverted U Shape - Solid Top Horizon */}
        <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-distill-core via-distill-violet to-transparent opacity-70 blur-[80px] mix-blend-screen" />
        {/* Left Vertical Curve of the Inverted U */}
        <div className="absolute top-[-10vh] left-[-20vw] w-[70vw] h-[100vh] bg-[radial-gradient(ellipse_at_top_left,_var(--distill-core)_0%,_var(--distill-violet)_50%,_transparent_70%)] opacity-90 blur-[100px] mix-blend-screen" />
        {/* Right Vertical Curve of the Inverted U */}
        <div className="absolute top-[-10vh] right-[-20vw] w-[70vw] h-[100vh] bg-[radial-gradient(ellipse_at_top_right,_var(--distill-core)_0%,_var(--distill-violet)_50%,_transparent_70%)] opacity-90 blur-[100px] mix-blend-screen" />
      </div>
    );
  }

  if (variant === "docs") {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Soft, wide top-left glow for the docs page */}
        <div className="absolute top-[-10vh] left-[-10vw] w-[60vw] h-[50vh] bg-[radial-gradient(ellipse_at_top_left,_var(--distill-violet)_0%,_transparent_70%)] opacity-[0.55] blur-[120px] mix-blend-screen" />
      </div>
    );
  }

  if (variant === "aurora") {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="absolute w-[80vw] h-[80vh] bg-distill-violet rounded-[100%] blur-[200px] animate-premium-pulse mix-blend-screen opacity-10" />
        <div className="absolute w-[60vw] h-[60vh] bg-distill-core rounded-[100%] blur-[200px] animate-premium-pulse mix-blend-screen opacity-10" style={{ animationDelay: "-5s" }} />
      </div>
    );
  }

  if (variant === "conic") {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="absolute w-[100vw] h-[70vh] bg-[radial-gradient(ellipse_at_center,_var(--distill-violet)_0%,_transparent_70%)] blur-[150px] animate-premium-pulse mix-blend-screen opacity-15" />
      </div>
    );
  }

  if (variant === "tactical-noise") {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-[radial-gradient(circle_at_center,_var(--distill-core)_0%,_transparent_60%)] blur-[200px] animate-premium-pulse mix-blend-screen opacity-10" />
      </div>
    );
  }

  // Consolidated Dashboard Variants (Neat, clean, subtle)
  if (variant === "overview" || variant === "webhooks" || variant === "security") {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Very subtle, wide top glow so it doesn't distract from data tables and cards */}
        <div className="absolute top-[-10vh] left-1/2 -translate-x-1/2 w-[100vw] h-[40vh] bg-[radial-gradient(ellipse_at_top,_var(--distill-violet)_0%,_transparent_70%)] opacity-[0.45] blur-[120px] mix-blend-screen" />
      </div>
    );
  }

  return null;
}
