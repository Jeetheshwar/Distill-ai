import { BlurReveal } from "@/components/ui/blur-reveal";

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-8 flex flex-col items-center">
      <div className="max-w-3xl w-full flex flex-col gap-12">
        <BlurReveal duration={1}>
          <h1 className="text-4xl md:text-5xl font-bold font-pixel text-foreground tracking-tighter mb-4">Changelog</h1>
          <p className="text-lg text-distill-muted font-sans">New updates and improvements to the Distill Engine and Dashboard.</p>
        </BlurReveal>

        <BlurReveal duration={1} delay={0.1}>
          <div className="relative border-l border-white/10 pl-8 pb-12 flex flex-col gap-4">
            <div className="absolute w-3 h-3 rounded-full bg-distill-core -left-[6.5px] top-2 shadow-[0_0_10px_rgba(228,221,244,0.8)]" />
            <span className="text-sm font-mono text-distill-core tracking-widest uppercase">v2.1.0 • April 24, 2026</span>
            <h2 className="text-2xl font-bold text-foreground font-sans">The Local Docker Engine Release</h2>
            <ul className="text-distill-muted leading-relaxed font-sans list-disc pl-4 space-y-2 mt-2">
               <li>Released the stateless Docker inference container for local execution.</li>
               <li>Implemented BYOK (Bring Your Own Key) architecture for zero-trust routing.</li>
               <li>Shipped the highly optimized Webhooks engine to forward JSON artifacts instantly.</li>
               <li>Added native Stripe integration for Team and Scale tier upgrades.</li>
               <li>Complete aesthetic overhaul to the new Light Corporate Brutalist/Dark Premium hybrid style.</li>
            </ul>
          </div>
        </BlurReveal>
      </div>
    </div>
  );
}
