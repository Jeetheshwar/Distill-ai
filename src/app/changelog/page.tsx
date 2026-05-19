import { Aura } from "@/components/ui/aura";

export default function ChangelogPage() {
  const releases = [
    {
      version: "v2.0.0",
      date: "May 2026",
      title: "The Standup-to-Jira Upgrade",
      changes: [
        "Added Standup Mode schema to auto-extract tasks, bugs, and blockers.",
        "Added Sprint Retro Mode schema for team retrospectives.",
        "Introduced the Chrome Extension MVP for one-click recording from Google Meet, Zoom, and Teams.",
        "Added interactive Jira Preview Modal before webhook fires.",
        "Completely rewritten landing page and live demo."
      ]
    },
    {
      version: "v1.5.0",
      date: "April 2026",
      title: "Team Workspaces & Custom Schemas",
      changes: [
        "Introduced Team Workspaces for shared webhook management.",
        "Added support for completely custom JSON extraction schemas.",
        "Improved Groq Llama-3 parsing reliability to 99.7%."
      ]
    },
    {
      version: "v1.0.0",
      date: "February 2026",
      title: "Initial Release",
      changes: [
        "Launched Distill AI as a stateless audio-to-JSON engine.",
        "Bring Your Own Key (BYOK) architecture established.",
        "Whisper-large-v3-turbo integration."
      ]
    }
  ];

  return (
    <div className="min-h-screen w-full bg-background flex flex-col font-sans relative overflow-hidden">
      <Aura variant="hero" />
      
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col gap-16 pt-32 pb-24 px-8 w-full">
        <div className="flex flex-col gap-4">
          <h1 className="font-sergena text-4xl md:text-6xl tracking-tighter text-foreground">Changelog.</h1>
          <p className="text-xl text-distill-muted leading-relaxed">
            A history of updates, feature releases, and architectural improvements to the Distill engine.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {releases.map((release, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-6 md:gap-12 relative">
              {/* Timeline dot */}
              <div className="hidden md:block absolute top-2 -left-[25px] w-3 h-3 rounded-full bg-distill-violet border-2 border-black z-10" />
              {/* Timeline line */}
              {i !== releases.length - 1 && (
                <div className="hidden md:block absolute top-4 -left-[20px] bottom-[-48px] w-px bg-white/10" />
              )}
              
              <div className="flex flex-col gap-1 min-w-[120px] pt-1">
                <span className="text-lg font-mono font-bold text-white">{release.version}</span>
                <span className="text-sm text-distill-muted">{release.date}</span>
              </div>
              
              <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5 w-full">
                <h3 className="text-xl font-bold text-white">{release.title}</h3>
                <ul className="flex flex-col gap-3">
                  {release.changes.map((change, j) => (
                    <li key={j} className="text-white/70 text-sm flex gap-3">
                      <span className="text-distill-violet mt-1">•</span>
                      <span className="leading-relaxed">{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
