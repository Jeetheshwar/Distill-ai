"use client";

import Link from "next/link";

export function BottomBar() {
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center py-4 text-xs font-mono text-distill-muted">
      {/* Background with fading blur effect from bottom upwards */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-md [mask-image:linear-gradient(to_top,black_60%,transparent_100%)] pointer-events-none -z-10" />

      <div className="flex justify-between items-center w-full max-w-7xl px-8 relative z-10">
        <div />
        <div className="flex items-center gap-6 text-distill-muted font-mono">
          <button type="button" onClick={() => alert("Legal documentation is locked in this demo instance.")} className="hover:text-foreground transition-colors">Privacy</button>
          <button type="button" onClick={() => alert("Legal documentation is locked in this demo instance.")} className="hover:text-foreground transition-colors">Terms</button>
          <button type="button" onClick={() => alert("Legal documentation is locked in this demo instance.")} className="hover:text-foreground transition-colors">SOC2</button>
        </div>
      </div>
    </div>
  );
}
