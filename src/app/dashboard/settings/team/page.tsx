"use client";

import { BlurReveal } from "@/components/ui/blur-reveal";
import { Users, ShieldCheck, Mail, ArrowRight, Loader2, Plus } from "lucide-react";
import { Aura } from "@/components/ui/aura";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function TeamSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<{id: string, name: string} | null>(null);
  const [members, setMembers] = useState<{id: string, user_id: string, role: string, email: string}[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('member');

  // Create Team State
  const [newTeamName, setNewTeamName] = useState("");
  const [creating, setCreating] = useState(false);

  // Invite State
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'error'|'success'} | null>(null);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teams");
      const data = await res.json();
      if (data.team) {
        setTeam(data.team);
        setMembers(data.members || []);
        setCurrentUserRole(data.currentUserRole || 'member');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName) return;
    
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      await fetchTeamData();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create team";
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !team) return;

    setInviting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/teams/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, teamId: team.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setMessage({ text: "User successfully added to the team!", type: 'success' });
      setInviteEmail("");
      await fetchTeamData();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to invite member";
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] w-full">
        <Loader2 className="w-8 h-8 animate-spin text-distill-core" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 max-w-4xl w-full">
      <Aura variant="overview" />
      <BlurReveal duration={0.8}>
        <div className="flex flex-col gap-4 relative">
          <Link href="/dashboard/settings" className="text-zinc-500 hover:text-white transition-colors text-sm font-sans w-fit">&larr; Back to Settings</Link>
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-foreground font-sans tracking-tight">Team Workspace</h1>
              <p className="text-zinc-500 font-sans text-sm">Collaborate on pipelines and share extractions.</p>
            </div>
          </div>
        </div>
      </BlurReveal>

      {!team ? (
        // Empty State: Create Team
        <BlurReveal duration={1} delay={0.1}>
          <div className="flex flex-col gap-6 p-8 rounded-2xl bg-[#05040a] border border-white/5 shadow-2xl items-center text-center max-w-xl mx-auto mt-10">
            <div className="w-16 h-16 rounded-full bg-distill-core/10 flex items-center justify-center mb-2">
              <Users className="w-8 h-8 text-distill-core" />
            </div>
            <h2 className="text-2xl font-bold text-foreground font-sans">Create your Team Workspace</h2>
            <p className="text-sm text-zinc-400 font-sans">
              Set up a shared workspace to pool API keys, access collective pipelines, and collaborate with your colleagues.
            </p>
            
            <form onSubmit={handleCreateTeam} className="w-full flex flex-col gap-4 mt-4">
              <input 
                type="text" 
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g. Acme Corp Engineering"
                className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-foreground focus:outline-none focus:border-distill-core transition-colors"
                required
              />
              {message?.type === 'error' && <p className="text-red-400 text-sm">{message.text}</p>}
              <button 
                type="submit"
                disabled={creating || !newTeamName}
                className="w-full py-4 rounded-xl bg-distill-violet text-white font-bold tracking-wide hover:bg-distill-violet/80 transition-colors flex justify-center items-center shadow-[0_0_20px_rgba(72,38,185,0.4)] disabled:opacity-50"
              >
                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Workspace"}
              </button>
            </form>
          </div>
        </BlurReveal>
      ) : (
        // Active Team State
        <div className="flex flex-col gap-8">
          <BlurReveal duration={1} delay={0.1}>
            <div className="flex flex-col gap-6 p-8 rounded-2xl bg-[#05040a] border border-white/5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-distill-violet/20 flex items-center justify-center">
                    <span className="text-lg font-black text-distill-core uppercase">{team.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white font-sans">{team.name}</h2>
                    <span className="text-xs text-zinc-500 font-mono">WORKSPACE</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/5 text-zinc-400 text-xs font-medium border border-white/10">
                  Your Role: <span className="text-white capitalize">{currentUserRole}</span>
                </span>
              </div>
            </div>
          </BlurReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 flex flex-col gap-6">
              <BlurReveal duration={1} delay={0.2}>
                <div className="flex flex-col gap-4 p-8 rounded-2xl bg-[#05040a] border border-white/5 shadow-2xl h-full">
                  <h3 className="text-lg font-bold text-white font-sans border-b border-white/5 pb-4">Team Members</h3>
                  <div className="flex flex-col gap-2 mt-2">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 rounded-xl bg-black border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white uppercase">
                            {member.email.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-white">{member.email}</span>
                        </div>
                        {member.role === 'admin' ? (
                          <div className="flex items-center gap-1 text-xs text-distill-core bg-distill-core/10 px-2 py-1 rounded">
                            <ShieldCheck className="w-3 h-3" /> Admin
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded capitalize">{member.role}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </BlurReveal>
            </div>

            {currentUserRole === 'admin' && (
              <div className="flex flex-col gap-6">
                <BlurReveal duration={1} delay={0.3}>
                  <div className="flex flex-col gap-4 p-8 rounded-2xl bg-black border border-distill-core/40 shadow-[0_0_80px_rgba(228,221,244,0.05)] h-full relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-distill-violet to-distill-core" />
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-5 h-5 text-distill-core" />
                      <h3 className="text-lg font-bold text-white font-sans">Invite Member</h3>
                    </div>
                    
                    <form onSubmit={handleInvite} className="flex flex-col gap-4">
                      <p className="text-xs text-zinc-400">
                        They must already have a Distill account with this email address to be added instantly.
                      </p>
                      <input 
                        type="email" 
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className="w-full bg-[#05040a] border border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-distill-core transition-colors"
                        required
                      />
                      {message && (
                        <p className={`text-xs ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                          {message.text}
                        </p>
                      )}
                      <button 
                        type="submit"
                        disabled={inviting || !inviteEmail}
                        className="w-full py-3 rounded-lg bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                      >
                        {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Add to Team <Plus className="w-4 h-4" /></>}
                      </button>
                    </form>
                  </div>
                </BlurReveal>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
