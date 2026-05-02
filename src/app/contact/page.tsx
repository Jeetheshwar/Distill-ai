import { BlurReveal } from "@/components/ui/blur-reveal";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-8 flex flex-col items-center text-center">
      <div className="max-w-2xl w-full flex flex-col items-center gap-8">
        <BlurReveal duration={1}>
          <h1 className="text-4xl md:text-5xl font-bold font-pixel text-foreground tracking-tighter">Contact Us</h1>
        </BlurReveal>

        <BlurReveal duration={1} delay={0.1}>
          <p className="text-lg text-distill-muted font-sans leading-relaxed">
            For enterprise deployment inquiries, volume licensing, or technical support, please reach out to our team at:
          </p>
          <a href="mailto:founders@distill.ai" className="mt-8 inline-block px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-mono text-distill-core hover:bg-white/10 transition-colors">
            founders@distill.ai
          </a>
        </BlurReveal>
      </div>
    </div>
  );
}
