import { BlurReveal } from "@/components/ui/blur-reveal";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function SOC2Page() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-8 flex flex-col items-center">
      <div className="max-w-3xl w-full flex flex-col gap-12">
        <BlurReveal duration={1}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <ShieldCheck className="w-6 h-6 text-distill-core" />
            </div>
            <h1 className="text-4xl font-bold font-sans text-foreground">SOC2 Compliance</h1>
          </div>
        </BlurReveal>

        <BlurReveal duration={1} delay={0.1}>
          <div className="flex flex-col gap-8">
             <div className="p-8 border border-white/10 bg-white/5 rounded-2xl flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-foreground">We prioritize a minimal-retention architecture.</h2>
                <p className="text-distill-muted leading-relaxed">
                  Traditional SaaS platforms require massive, expensive SOC2 Type II audits because they take your sensitive audio data, send it over the wire, process it on their servers, and store the results in their databases. 
                </p>
                <p className="text-distill-muted leading-relaxed">
                  <strong>Distill changes the paradigm.</strong>
                </p>
                <p className="text-distill-muted leading-relaxed">
                  Audio data is proxy-routed through our servers to the inference provider but is never persisted to disk. We prioritize data privacy by ensuring your meeting recordings are discarded immediately after processing.
                </p>
             </div>
             
             <div className="flex justify-center">
                <Link href="/login" className="px-8 py-3 rounded-xl bg-foreground text-background font-bold tracking-wide hover:scale-105 transition-transform">
                  Deploy Locally Now
                </Link>
             </div>
          </div>
        </BlurReveal>
      </div>
    </div>
  );
}
