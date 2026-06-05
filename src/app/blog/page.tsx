import { BlurReveal } from "@/components/ui/blur-reveal";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-8 flex flex-col items-center">
      <div className="max-w-3xl w-full flex flex-col gap-12">
        <BlurReveal duration={1}>
          <h1 className="text-4xl md:text-5xl font-bold font-sergena text-foreground tracking-tighter mb-4">Engineering Blog</h1>
          <p className="text-lg text-distill-muted font-sans">Deep dives into local audio extraction, ONNX optimization, and building stateless architectures.</p>
        </BlurReveal>

        <BlurReveal duration={1} delay={0.1}>
          <div className="p-8 border border-white/10 bg-white/5 rounded-2xl flex flex-col gap-4">
            <span className="text-xs font-mono text-distill-core tracking-widest uppercase">April 2026</span>
            <h2 className="text-2xl font-bold text-foreground font-sans">Why we abandoned the Cloud for Audio Processing</h2>
            <p className="text-distill-muted leading-relaxed font-sans">
              The shift from centralized API endpoints to optimized proxy routing for heavy machine learning tasks.
            </p>
          </div>
        </BlurReveal>
      </div>
    </div>
  );
}
