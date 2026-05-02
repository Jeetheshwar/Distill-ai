"use client";

import { Aura } from "@/components/ui/aura";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { ShieldCheck, Lock, Server, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SecurityPage() {
  return (
    <div className="w-full bg-background min-h-screen pt-24 px-8 pb-32 relative">
      <Aura variant="docs" />
      <div className="max-w-4xl mx-auto flex flex-col gap-16 relative z-10">
        
        <BlurReveal duration={1}>
          <div className="flex flex-col gap-4 text-center items-center">
            <span className="text-distill-core font-mono text-sm tracking-widest uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Security & Trust
            </span>
            <h1 className="font-pixel text-5xl md:text-6xl text-foreground">Security Whitepaper</h1>
            <p className="text-distill-muted text-lg font-sans max-w-2xl mt-2 leading-relaxed">
              Distill is engineered with a local-first, zero-trust architecture. We believe sensitive audio data should never leave your VPC unless explicitly routed by your team.
            </p>
          </div>
        </BlurReveal>

        <div className="flex flex-col gap-12 mt-8">
          <BlurReveal duration={1} delay={0.1}>
            <div className="flex flex-col gap-6 p-8 rounded-2xl bg-white/[0.02] border border-white/10">
              <h2 className="text-2xl font-bold font-sans text-foreground flex items-center gap-3">
                <Lock className="w-6 h-6 text-distill-violet" />
                Encryption & Memory Isolation
              </h2>
              <p className="text-distill-muted font-sans text-base leading-relaxed">
                When running the Distill Core locally, audio payloads are never written to disk. All processing occurs entirely in isolated VRAM (Video RAM) and system memory. Once the JSON extraction is completed, the memory buffer is immediately wiped.
              </p>
              <ul className="flex flex-col gap-3 mt-2">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-distill-core mt-0.5" />
                  <span className="text-white font-sans text-sm">TLS 1.3 encryption in transit for Webhook delivery.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-distill-core mt-0.5" />
                  <span className="text-white font-sans text-sm">Zero disk-persistence of audio arrays.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-distill-core mt-0.5" />
                  <span className="text-white font-sans text-sm">No third-party observability or logging of your payload data.</span>
                </li>
              </ul>
            </div>
          </BlurReveal>

          <BlurReveal duration={1} delay={0.2}>
            <div className="flex flex-col gap-6 p-8 rounded-2xl bg-white/[0.02] border border-white/10">
              <h2 className="text-2xl font-bold font-sans text-foreground flex items-center gap-3">
                <Server className="w-6 h-6 text-distill-core" />
                Compliance & Data Gravity
              </h2>
              <p className="text-distill-muted font-sans text-base leading-relaxed">
                By utilizing a local execution model, you bypass the majority of compliance hurdles associated with third-party data sub-processors. Because Distill does not host or store your audio, your data gravity remains 100% within your internal network.
              </p>
            </div>
          </BlurReveal>
        </div>

        <BlurReveal duration={1} delay={0.3}>
          <div className="flex justify-center mt-8">
             <Link href="/docs" className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-distill-violet/50 text-distill-core font-medium tracking-wide hover:bg-distill-violet/10 transition-colors">
              Read the Docs
            </Link>
          </div>
        </BlurReveal>

      </div>
    </div>
  );
}
