import { BlurReveal } from "@/components/ui/blur-reveal";
import { Terminal } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-8 flex flex-col items-center text-center">
      <div className="max-w-2xl w-full flex flex-col items-center gap-8">
        <BlurReveal duration={1}>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mb-4 inline-flex">
             <Terminal className="w-8 h-8 text-distill-core" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-pixel text-foreground tracking-tighter">About Distill</h1>
        </BlurReveal>

        <BlurReveal duration={1} delay={0.1}>
          <p className="text-lg text-distill-muted font-sans leading-relaxed">
            Distill was born out of a frustration with modern AI APIs. Every tool required sending highly sensitive audio data over the network to a third-party server, creating massive compliance bottlenecks for enterprise teams.
          </p>
          <p className="text-lg text-distill-muted font-sans leading-relaxed mt-4">
            We built Distill to invert the paradigm: bringing the intelligence directly to the data, entirely locally.
          </p>
        </BlurReveal>
      </div>
    </div>
  );
}
