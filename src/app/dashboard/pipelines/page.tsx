"use client";

import { BlurReveal } from "@/components/ui/blur-reveal";
import { Aura } from "@/components/ui/aura";
import { UploadCloud, AudioLines, Database, FileJson, CheckCircle2, ChevronRight, Terminal, ShieldCheck, Cpu, Square, History, Mic, Square as StopSquare, Code, Trash2, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { defaultStandupSchema, defaultRetroSchema } from "@/app/api/extract/helpers";

export default function TranscribePipelinePage() {
  const [activeTab, setActiveTab] = useState<"new" | "history" | "schema">("new");
  const [stage, setStage] = useState<"idle" | "processing" | "clarifying" | "finished">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [resultPayload, setResultPayload] = useState<any>(null);
  const [hasKey, setHasKey] = useState(true);
  const [schemaMode, setSchemaMode] = useState<"standup" | "retro">("standup");
  const [showJiraModal, setShowJiraModal] = useState(false);
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [clarificationQuestions, setClarificationQuestions] = useState<string[]>([]);
  const [clarificationAnswers, setClarificationAnswers] = useState<string[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState<string>("");
  const [userSettings, setUserSettings] = useState<{ groq_api_key?: string, webhook_url?: string, custom_standup_schema?: string, custom_retro_schema?: string } | null>(null);
  const [provider, setProvider] = useState<string>("hosted");
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const [schemaEditorMode, setSchemaEditorMode] = useState<"standup" | "retro">("standup");
  const [schemaEditorContent, setSchemaEditorContent] = useState("");
  const [isSavingSchema, setIsSavingSchema] = useState(false);
  const [editableTickets, setEditableTickets] = useState<any[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], 'native-recording.webm', { type: 'audio/webm' });
        executeExtraction(file);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure you have granted permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    function loadSettings() {
      const groq_api_key = localStorage.getItem("groq_api_key") || undefined;
      const webhook_url = localStorage.getItem("webhook_url") || undefined;
      const custom_standup_schema = localStorage.getItem("custom_standup_schema") || undefined;
      const custom_retro_schema = localStorage.getItem("custom_retro_schema") || undefined;
      const extraction_provider = localStorage.getItem("extraction_provider") || "hosted";
      
      setUserSettings({ groq_api_key, webhook_url, custom_standup_schema, custom_retro_schema });
      setProvider(extraction_provider);
      setHasKey(!!groq_api_key || extraction_provider === "local");
      setSchemaEditorContent(schemaEditorMode === "retro" ? (custom_retro_schema || defaultRetroSchema) : (custom_standup_schema || defaultStandupSchema));
    }
    loadSettings();
  }, [schemaEditorMode]);

  useEffect(() => {
    if (activeTab === "history") {
      setLoadingHistory(true);
      const fetchHistory = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("extractions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          if (data) setHistoryData(data);
        }
        setLoadingHistory(false);
      };
      fetchHistory();
    }
  }, [activeTab, supabase]);

  const logQueue = useRef<string[]>([
    "[SYS] Initializing BYOK Proxy...",
    "[SYS] Establishing secure TLS tunnel to Groq API...",
    "[API] Analyzing input (Whisper or Text)...",
    "[API] Streaming transcript to Llama-3.3-70B Versatile schema...",
    "[SYS] Payload securely received. Sequence completed."
  ]);

  const executeExtraction = async (file: File) => {
    setStage("processing");
    setLogs([]);
    setResultPayload(null);

    // 1. Kick off visual terminal loop
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < logQueue.current.length) {
        setLogs((prev) => [...prev, logQueue.current[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    // 2. Map Payload securely
    const formData = new FormData();
    formData.append("file", file);
    formData.append("schema", schemaMode);
    
    const customPrompt = schemaMode === "retro" ? userSettings?.custom_retro_schema : userSettings?.custom_standup_schema;
    if (customPrompt) {
      formData.append("custom_schema", customPrompt);
    }

    try {
      // 3. Dispatch to API Infrastructure
      const key = userSettings?.groq_api_key || "sk_mock_pro_key_9281";
      const provider = localStorage.getItem("extraction_provider") || "hosted";
      const endpoint = provider === "local" ? "http://127.0.0.1:47341/extract" : "/api/extract";
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: provider === "local" ? {} : {
          "Authorization": `Bearer ${key}`
        },
        body: formData
      });

      const data = await res.json();
      
      if (res.ok) {
        if (data.entities?.requires_clarification) {
          setCurrentTranscript(data.transcript);
          setClarificationQuestions(data.entities.clarification_questions || []);
          setClarificationAnswers(new Array((data.entities.clarification_questions || []).length).fill(""));
          clearInterval(interval);
          setTimeout(() => setStage("clarifying"), 800);
        } else {
          setResultPayload(data);
          // Guarantee terminal visually finishes if server responds faster than 2 seconds
          clearInterval(interval);
          setTimeout(() => setStage("finished"), 800);
        }
      } else {
        clearInterval(interval);
        setLogs((prev) => [...prev, `[ERROR] ${data.error}`]);
      }
    } catch (err) {
      clearInterval(interval);
      setLogs((prev) => [...prev, "[ERROR] Connection to API closed dynamically."]);
    }
  };

  const submitClarifications = async () => {
    setStage("processing");
    setLogs([]);
    setResultPayload(null);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < logQueue.current.length) {
        setLogs((prev) => [...prev, logQueue.current[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    const formData = new FormData();
    formData.append("schema", schemaMode);
    formData.append("transcript", currentTranscript);
    
    const answersStr = clarificationQuestions.map((q, i) => `Q: ${q}\nA: ${clarificationAnswers[i]}`).join('\n\n');
    formData.append("answers", answersStr);

    try {
      const key = userSettings?.groq_api_key || "sk_mock_pro_key_9281";
      const provider = localStorage.getItem("extraction_provider") || "hosted";
      const endpoint = provider === "local" ? "http://127.0.0.1:47341/extract" : "/api/extract";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: provider === "local" ? {} : { "Authorization": `Bearer ${key}` },
        body: formData
      });

      const data = await res.json();
      
      if (res.ok) {
        if (data.entities?.requires_clarification) {
           setClarificationQuestions(data.entities.clarification_questions || []);
           setClarificationAnswers(new Array((data.entities.clarification_questions || []).length).fill(""));
           clearInterval(interval);
           setTimeout(() => setStage("clarifying"), 800);
        } else {
           setResultPayload(data);
           clearInterval(interval);
           setTimeout(() => setStage("finished"), 800);
        }
      } else {
        clearInterval(interval);
        setLogs((prev) => [...prev, `[ERROR] ${data.error}`]);
      }
    } catch (err) {
      clearInterval(interval);
      setLogs((prev) => [...prev, "[ERROR] Connection to API closed dynamically."]);
    }
  };

  const deleteExtraction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this extraction record?")) return;
    try {
      await supabase.from("extractions").delete().eq("id", id);
      setHistoryData(prev => prev.filter(item => item.id !== id));
    } catch (e) {
      console.error("Failed to delete extraction", e);
    }
  };

  const openJiraModal = () => {
    if (resultPayload) {
      let ticketsToEdit: any[] = [];
      if (Array.isArray(resultPayload.entities)) {
         ticketsToEdit = resultPayload.entities;
      } else if (resultPayload.entities?.extracted_tickets) {
         ticketsToEdit = resultPayload.entities.extracted_tickets;
      } else if (resultPayload.entities?.retro_categories?.action_items) {
         ticketsToEdit = resultPayload.entities.retro_categories.action_items;
      } else {
         const findArray = (obj: any): any[] | null => {
           for (const key in obj) {
             if (Array.isArray(obj[key]) && obj[key].length > 0 && typeof obj[key][0] === "object") {
               return obj[key];
             } else if (typeof obj[key] === "object" && obj[key] !== null) {
               const res = findArray(obj[key]);
               if (res) return res;
             }
           }
           return null;
         };
         ticketsToEdit = findArray(resultPayload.entities) || [];
      }

      setEditableTickets(ticketsToEdit.map((t: any, i: number) => ({
        _id: i.toString(),
        selected: true,
        title: t.title || t.summary || "Untitled Issue",
        description: t.description || "",
        type: t.type || t.ticket_type || "Task",
        priority: t.priority || "Medium",
        assignee: t.assignee || t.assignee_context || t.owner || "Unassigned"
      })));
      setShowJiraModal(true);
    }
  };

  const handleFireWebhook = async () => {
    setIsSendingWebhook(true);
    const savedWebhookUrl = userSettings?.webhook_url;
    
    // Build human-in-the-loop payload
    const finalTickets = editableTickets.filter(t => t.selected).map(t => {
      const { _id, selected, ...rest } = t;
      return rest;
    });

    const finalPayload = {
      ...resultPayload,
      entities: {
        ...resultPayload.entities,
        extracted_tickets: schemaMode === "standup" ? finalTickets : undefined,
        retro_categories: schemaMode === "retro" ? {
          ...(resultPayload.entities.retro_categories || {}),
          action_items: finalTickets
        } : undefined
      }
    };
    
    if (savedWebhookUrl && resultPayload) {
      try {
        await fetch(savedWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalPayload),
        });
        alert("Webhook successfully fired with human-reviewed tickets!");
      } catch (err) {
        console.error(err);
        alert("Failed to fire webhook. Check console.");
      }
    } else if (!savedWebhookUrl) {
      alert("No webhook URL configured in settings. Simulating success for human-reviewed tickets.");
    }
    setIsSendingWebhook(false);
    setShowJiraModal(false);
  };

  // True File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    let file: File | null = null;
    
    if ('dataTransfer' in e && e.dataTransfer.files.length > 0) {
      file = e.dataTransfer.files[0];
    } else if ('target' in e && (e.target as HTMLInputElement).files?.length) {
      file = (e.target as HTMLInputElement).files![0];
    }

    if (file) {
      executeExtraction(file);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-6xl w-full">
      <Aura variant="overview" />

      <div className="flex gap-8 border-b border-white/5 mb-2 px-2">
        <button 
          onClick={() => setActiveTab("new")} 
          className={cn("pb-4 font-bold text-sm transition-all border-b-2", activeTab === "new" ? "border-white text-foreground" : "border-transparent text-zinc-500 hover:text-zinc-300")}
        >
          New Extraction
        </button>
        <button 
          onClick={() => setActiveTab("history")} 
          className={cn("pb-4 font-bold text-sm transition-all border-b-2", activeTab === "history" ? "border-white text-foreground" : "border-transparent text-zinc-500 hover:text-zinc-300")}
        >
          Extraction History
        </button>
        <button 
          onClick={() => setActiveTab("schema")} 
          className={cn("pb-4 font-bold text-sm transition-all border-b-2", activeTab === "schema" ? "border-white text-foreground" : "border-transparent text-zinc-500 hover:text-zinc-300")}
        >
          Schema Configuration
        </button>
      </div>

      {activeTab === "new" && (
        <div className="flex flex-col gap-10 w-full">
          {!hasKey && (
            <div className="w-full bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center justify-center text-yellow-500 font-sans text-sm gap-2">
              <ShieldCheck className="w-5 h-5" />
              <span><strong>Demo Mode:</strong> No Groq API key configured. Add your key in Settings to process real audio.</span>
            </div>
          )}
      {stage === "idle" && (
        <BlurReveal duration={0.8}>
          <div className="flex flex-col gap-4 relative">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-foreground font-sans tracking-tight">Data Extraction Pipeline</h1>
                <p className="text-zinc-500 max-w-2xl font-sans mb-6 mt-2">
                  Drop an unstructured audio file. Distill will safely proxy it to Groq API using your credentials and orchestrate the schema constraints without retaining data.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-64">
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Target Schema</label>
                <div className="relative">
                  <select 
                    value={schemaMode}
                    onChange={(e) => setSchemaMode(e.target.value as any)}
                    className="w-full bg-[#05040a] border border-white/10 rounded-md p-2 pr-8 text-sm text-foreground font-mono focus:outline-none focus:border-white/30 appearance-none cursor-pointer"
                  >
                    <option value="standup" className="bg-[#111] text-white py-2">Standup Mode</option>
                    <option value="retro" className="bg-[#111] text-white py-2">Sprint Retro Mode</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-2">
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileUpload}
                className="w-full h-full group"
              >
                <label 
                  htmlFor="file-upload" 
                  className="relative cursor-pointer transition-all hover:scale-[1.01] flex flex-col items-center justify-center w-full h-64 md:h-full min-h-[280px] rounded-2xl border border-dashed border-white/10 bg-[#05040a] hover:bg-white/[0.02] hover:border-white/30"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.05)_0%,_transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-black mb-4 shadow-[0_0_30px_rgba(255,255,255,0.03)]">
                    <UploadCloud className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Initialize BYOK Extraction</h3>
                  <p className="text-zinc-500 text-sm max-w-xs text-center">
                    Drag and drop an audio or text file, or click to browse. Max 100MB per file natively.
                  </p>
                  <div className="flex gap-4 mt-6">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-mono text-zinc-500">.WAV</span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-mono text-zinc-500">.MP3</span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-mono text-zinc-500">.M4A</span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-mono text-zinc-500">.TXT</span>
                  </div>
                  <input 
                    id="file-upload" 
                    type="file" 
                    accept="audio/*,text/plain,.txt,.md" 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              <div className="w-full h-full flex flex-col justify-center">
                {!isRecording ? (
                  <button 
                    onClick={startRecording}
                    className="w-full h-64 md:h-full min-h-[280px] relative group overflow-hidden rounded-2xl border border-white/10 bg-[#05040a] hover:border-white/30 hover:bg-white/[0.02] transition-all flex flex-col items-center justify-center gap-4 shadow-[0_0_40px_rgba(255,255,255,0.01)] hover:shadow-[0_0_40px_rgba(255,255,255,0.03)]"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all">
                      <Mic className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold text-foreground">Record Audio Natively</span>
                      <span className="text-xs text-zinc-500 mt-1">Speak directly into your browser</span>
                    </div>
                  </button>
                ) : (
                  <button 
                    onClick={stopRecording}
                    className="w-full h-64 md:h-full min-h-[280px] relative overflow-hidden rounded-2xl border border-red-500/50 bg-red-500/5 hover:bg-red-500/10 transition-all flex flex-col items-center justify-center gap-4 shadow-[0_0_40px_rgba(239,68,68,0.1)]"
                  >
                    <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center animate-pulse">
                      <StopSquare className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg font-bold text-red-500">Stop & Extract</span>
                      <span className="text-xl font-mono font-bold tracking-widest text-white">{formatTime(recordingTime)}</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
            
            <div className="w-full flex items-center justify-center gap-2 mt-4 text-xs font-mono text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-zinc-500" />
              <span>{provider === "local" ? "Local Mode Active: Audio stays on your machine and is processed via Local Companion." : "BYOK Proxied: Audio is processed via Groq and never stored."}</span>
            </div>
          </div>
        </BlurReveal>
      )}

      {/* STAGE B: TERMINAL PROCESSING */}
      {stage === "processing" && (
        <BlurReveal duration={0.8}>
          <div className="flex flex-col gap-6 relative w-full h-[60vh] justify-center max-w-3xl mx-auto">
            <div className="flex justify-between items-end">
              <h2 className="text-2xl font-bold text-foreground font-sans tracking-tight flex items-center gap-3">
                <Cpu className="w-6 h-6 text-white animate-pulse" /> 
                Processing via Groq API
              </h2>
              <span className="text-white font-mono text-xs border border-white/20 px-2 py-1 rounded bg-white/10 animate-pulse">
                PROCESSING
              </span>
            </div>
            
            <div className="w-full h-80 bg-black border border-white/10 rounded-lg p-6 font-mono text-sm overflow-y-auto flex flex-col gap-2 relative shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
              {logs.map((log, index) => (
                <div key={index} className="flex gap-3 text-zinc-500 items-start">
                  <span className="text-white/30 shrink-0 select-none">
                    {new Date().toISOString().substring(11, 23)}
                  </span>
                  <span className={cn(
                    "text-white",
                    log?.includes("[SYS]") && "text-zinc-500",
                    log?.includes("[MODEL]") && "text-blue-400",
                    log?.includes("[EXTRACT]") && "text-zinc-300"
                  )}>
                    {log}
                  </span>
                </div>
              ))}
              <div className="animate-pulse w-3 h-5 bg-white/50 mt-1" />
            </div>
          </div>
        </BlurReveal>
      )}

      {/* STAGE B.5: CLARIFICATION */}
      {stage === "clarifying" && (
        <BlurReveal duration={0.8}>
           <div className="flex flex-col gap-6 relative w-full justify-center max-w-3xl mx-auto mt-10">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/50">
                 <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               <h2 className="text-2xl font-bold text-foreground font-sans tracking-tight">Clarification Needed</h2>
             </div>
             <p className="text-zinc-500">The audio was too vague to generate accurate tickets. Please answer the following questions so we don't have to guess.</p>
             
             <div className="flex flex-col gap-6 mt-4">
               {clarificationQuestions.map((q, i) => (
                 <div key={i} className="flex flex-col gap-2">
                   <label className="text-sm font-medium text-white">{q}</label>
                   <input
                     type="text"
                     value={clarificationAnswers[i] || ""}
                     onChange={(e) => {
                       const newAnswers = [...clarificationAnswers];
                       newAnswers[i] = e.target.value;
                       setClarificationAnswers(newAnswers);
                     }}
                     className="w-full bg-[#05040a] border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                     placeholder="Your answer..."
                   />
                 </div>
               ))}
               <div className="flex justify-end gap-4 mt-2">
                 <button onClick={() => setStage("idle")} className="px-6 py-2 border border-white/10 rounded-md font-sans text-sm hover:bg-white/5 transition-colors text-white">Cancel</button>
                 <button onClick={submitClarifications} className="px-6 py-2 bg-white text-black rounded-md font-sans text-sm font-bold hover:bg-zinc-200 transition-colors">Submit Clarifications</button>
               </div>
             </div>
           </div>
        </BlurReveal>
      )}

      {/* STAGE C: DUAL PANE VERIFICATION */}
      {stage === "finished" && (
        <BlurReveal duration={1}>
          <div className="flex flex-col gap-8 relative w-full">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">Extraction Completed</h1>
                </div>
                <p className="text-zinc-500">
                  The audio tensor was successfully processed and mapped entirely to deterministic outputs. 
                </p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={openJiraModal}
                  className="px-6 py-2 bg-[#0052CC] text-white rounded-md font-sans text-sm font-bold hover:bg-[#0047b3] transition-colors shadow-[0_0_15px_rgba(0,82,204,0.4)]"
                >
                  Preview Tickets & Send
                </button>
                <button 
                  onClick={() => setStage("idle")}
                  className="px-6 py-2 border border-white/10 rounded-md font-sans text-sm hover:bg-white/5 transition-colors"
                >
                  Upload New File
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
              {/* Left Column: Transcript */}
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <AudioLines className="w-5 h-5 text-zinc-500" />
                  Raw Timeline
                </h3>
                <div className="w-full bg-[#05040a] border border-white/10 rounded-xl p-6 h-[50vh] overflow-y-auto">
                  <pre className="font-mono text-sm leading-loose whitespace-pre-wrap text-zinc-500">
                    {resultPayload?.transcript?.split('\n').map((line: string, i: number) => (
                      <span key={i} className={cn("block", line.includes("Auth State") && "bg-white/10 text-white rounded px-1")}>
                        {line}
                      </span>
                    ))}
                  </pre>
                </div>
              </div>

              {/* Right Column: Deterministic JSON */}
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Database className="w-5 h-5 text-white" />
                  Structured Artifacts
                </h3>
                <div className="w-full bg-[#05040a] border border-distill-violet/30 rounded-xl overflow-hidden relative h-[50vh] flex flex-col shadow-[0_0_40px_rgba(72,38,185,0.1)]">
                  <div className="w-full bg-distill-violet/10 border-b border-distill-violet/20 px-4 py-2 flex justify-between items-center text-xs font-mono">
                    <span className="text-distill-core font-bold">payload.json</span>
                    <span className="text-distill-muted">{resultPayload?.metadata?.schema_applied || "standup"}</span>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1">
                    <pre className="text-sm font-mono text-[#4ec9b0] leading-relaxed">
                      <code className="block whitespace-pre">
                        {resultPayload ? JSON.stringify(resultPayload.entities, null, 2) : ""}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BlurReveal>
      )}
        </div>
      )}

      {activeTab === "history" && (
        <BlurReveal duration={0.8} delay={0.1}>
          <div className="flex flex-col gap-6 w-full">
            <h2 className="text-xl font-bold text-foreground font-sans">Extraction History</h2>
            <div className="w-full bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left font-sans">
                  <thead className="text-xs uppercase bg-white/[0.02] text-zinc-500 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 font-bold">Source Name</th>
                      <th className="px-6 py-4 font-bold">Schema</th>
                      <th className="px-6 py-4 font-bold">Duration</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold">Date</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingHistory ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Loading history...</td>
                      </tr>
                    ) : historyData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No extractions found.</td>
                      </tr>
                    ) : (
                      historyData.map((item, i) => (
                        <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                          <td className="px-6 py-4 font-medium text-foreground">
                            {item.source_name || "Unknown"}
                          </td>
                          <td className="px-6 py-4 text-zinc-500">
                            <span className="bg-white/5 px-2 py-1 rounded-md font-mono text-xs uppercase">{item.schema_applied || "standup"}</span>
                          </td>
                          <td className="px-6 py-4 text-zinc-500">
                            {item.duration_seconds ? `${Math.round(item.duration_seconds)}s` : "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn("px-2 py-1 rounded-full text-xs font-bold uppercase", item.status === "completed" ? "bg-green-500/10 text-green-500" : "bg-zinc-500/10 text-zinc-500")}>
                              {item.status || "Completed"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-zinc-500 text-xs">
                            {new Date(item.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => deleteExtraction(item.id)} className="text-zinc-600 hover:text-red-500 transition-colors p-1" title="Delete record">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </BlurReveal>
      )}

      {activeTab === "schema" && (
        <BlurReveal duration={0.8} delay={0.1}>
          <div className="flex flex-col gap-6 w-full">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-xl font-bold text-foreground font-sans">Schema Configuration</h2>
                <p className="text-zinc-500 text-sm mt-1 max-w-lg">
                  Customize the exact JSON structure and system prompts used by the LLM during extraction.
                </p>
              </div>
              <div className="flex gap-2 bg-[#05040a] p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => {
                    setSchemaEditorMode("standup");
                    setSchemaEditorContent(userSettings?.custom_standup_schema || defaultStandupSchema);
                  }}
                  className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", schemaEditorMode === "standup" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white")}
                >
                  Standup
                </button>
                <button
                  onClick={() => {
                    setSchemaEditorMode("retro");
                    setSchemaEditorContent(userSettings?.custom_retro_schema || defaultRetroSchema);
                  }}
                  className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", schemaEditorMode === "retro" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white")}
                >
                  Sprint Retro
                </button>
              </div>
            </div>

            <div className="w-full bg-[#05040a] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
              <div className="bg-white/[0.02] border-b border-white/5 p-4 flex items-center gap-2">
                <Code className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-mono text-zinc-500">System Prompt Template</span>
              </div>
              <textarea
                value={schemaEditorContent}
                onChange={(e) => setSchemaEditorContent(e.target.value)}
                className="w-full h-[50vh] bg-transparent border-none p-6 text-sm font-mono text-[#4ec9b0] focus:ring-0 resize-none"
                spellCheck={false}
              />
            </div>

            <div className="flex justify-between items-center">
              <button 
                onClick={() => setSchemaEditorContent(schemaEditorMode === "retro" ? defaultRetroSchema : defaultStandupSchema)}
                className="text-zinc-500 hover:text-white text-sm font-bold transition-colors"
              >
                Restore Defaults
              </button>
              <button 
                onClick={() => {
                  setIsSavingSchema(true);
                  if (schemaEditorMode === "retro") {
                    localStorage.setItem("custom_retro_schema", schemaEditorContent);
                    setUserSettings(prev => prev ? { ...prev, custom_retro_schema: schemaEditorContent } : { custom_retro_schema: schemaEditorContent });
                  } else {
                    localStorage.setItem("custom_standup_schema", schemaEditorContent);
                    setUserSettings(prev => prev ? { ...prev, custom_standup_schema: schemaEditorContent } : { custom_standup_schema: schemaEditorContent });
                  }
                  setIsSavingSchema(false);
                }}
                disabled={isSavingSchema}
                className="px-6 py-3 bg-distill-violet hover:bg-distill-core text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(72,38,185,0.4)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSavingSchema ? "Saving..." : "Save Custom Schema"}
              </button>
            </div>
          </div>
        </BlurReveal>
      )}

      {/* Jira Preview Modal */}
      {showJiraModal && resultPayload && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#05040a] w-full max-w-2xl rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(72,38,185,0.15)] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="bg-distill-violet text-white p-1.5 rounded-md shadow-[0_0_15px_rgba(72,38,185,0.4)]">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 10.37h-3.3v-3.3c0-.66-.54-1.2-1.2-1.2h-3.3c-.66 0-1.2.54-1.2 1.2v3.3h3.3c.66 0 1.2.54 1.2 1.2v3.3h-3.3c-.66 0-1.2.54-1.2 1.2v3.3c0 .66.54 1.2 1.2 1.2h3.3c.66 0 1.2-.54 1.2-1.2v-3.3h3.3c.66 0 1.2-.54 1.2-1.2v-3.3c0-.66-.54-1.2-1.2-1.2z"/></svg>
                </div>
                <h3 className="text-white font-bold font-sans">Preview Tickets Before Creating</h3>
              </div>
              <button onClick={() => setShowJiraModal(false)} className="text-white/50 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] flex flex-col gap-4">
              {editableTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-zinc-500 font-sans">
                  <span className="text-4xl mb-4">👻</span>
                  <p className="text-lg font-bold text-white mb-1">No Actionable Items Found</p>
                  <p className="text-sm text-center max-w-sm">The AI couldn't find any explicit tasks, bugs, or action items in this transcript to convert into tickets.</p>
                </div>
              ) : (
                editableTickets.map((ticket, i) => (
                  <div key={ticket._id} className="bg-white/[0.02] p-5 rounded-xl border border-white/5 flex gap-4 hover:border-white/10 transition-colors shadow-sm">
                    <div className="pt-1">
                      <input 
                        type="checkbox" 
                        checked={ticket.selected} 
                        onChange={(e) => {
                          const newTickets = [...editableTickets];
                          newTickets[i].selected = e.target.checked;
                          setEditableTickets(newTickets);
                        }}
                        className="w-4 h-4 accent-distill-core rounded border-white/20 cursor-pointer" 
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-3">
                        <input 
                          type="text" 
                          value={ticket.title} 
                          onChange={(e) => {
                            const newTickets = [...editableTickets];
                            newTickets[i].title = e.target.value;
                            setEditableTickets(newTickets);
                          }}
                          className="bg-transparent border-none text-white font-bold text-lg focus:outline-none focus:ring-1 focus:ring-distill-core rounded px-1 w-full transition-colors hover:bg-white/5" 
                        />
                      </div>
                      {schemaMode === "standup" && (
                        <textarea 
                          value={ticket.description} 
                          onChange={(e) => {
                            const newTickets = [...editableTickets];
                            newTickets[i].description = e.target.value;
                            setEditableTickets(newTickets);
                          }}
                          className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-zinc-400 text-sm mb-4 h-24 focus:outline-none focus:ring-1 focus:ring-distill-core transition-colors hover:border-white/20 resize-none font-sans" 
                        />
                      )}
                      <div className="flex gap-3 mt-1">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-white/5 rounded-md text-xs font-mono text-zinc-400">
                          <span className="w-2 h-2 rounded-full bg-distill-core"></span> {ticket.type}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-white/5 rounded-md text-xs font-mono text-zinc-400">
                          <span className={cn("w-2 h-2 rounded-full", ticket.priority?.toLowerCase() === 'high' ? 'bg-orange-500' : 'bg-yellow-500')}></span> {ticket.priority}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-white/5 rounded-md text-xs font-mono text-zinc-400">
                          Assignee: <span className="text-white font-sans font-bold">{ticket.assignee}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-white/10 flex justify-between items-center bg-white/[0.02]">
              <button className="text-sm text-zinc-500 hover:text-white transition-colors">Save as Draft</button>
              <div className="flex gap-3">
                <button onClick={() => setShowJiraModal(false)} className="px-5 py-2 text-zinc-400 hover:text-white text-sm font-bold transition-colors">Cancel</button>
                <button 
                  onClick={handleFireWebhook} 
                  disabled={isSendingWebhook || editableTickets.filter(t => t.selected).length === 0} 
                  className="px-5 py-2 bg-distill-violet text-white rounded-lg text-sm font-bold hover:bg-distill-core transition-all shadow-[0_0_15px_rgba(72,38,185,0.4)] disabled:opacity-50 disabled:shadow-none"
                >
                  {isSendingWebhook ? "Sending..." : `Create Selected (${editableTickets.filter(t => t.selected).length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
