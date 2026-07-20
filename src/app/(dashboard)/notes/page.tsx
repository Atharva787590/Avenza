"use client";

import * as React from "react";
import { getNoteAction, saveNoteAction, getMyNotePeersAction, getAIAssistAction } from "@/lib/actions/notes";
import { useToast } from "@/components/ui/toast";
import { IndianAvatar } from "@/components/IndianAvatar";
import {
  BookOpen,
  Users,
  Save,
  Clock,
  ChevronRight,
  StickyNote,
  Sparkles,
  Lightbulb,
  Plus,
  Trash2,
  Bot,
  Wand2,
  Languages,
  ListCheck,
} from "lucide-react";

interface Peer {
  userId: string;
  username: string;
  fullName: string;
  college: string;
}

interface NoteData {
  id: string;
  content: string;
  updatedAt: Date | string;
}

interface IdeaCard {
  id: string;
  title: string;
  description: string;
  tag: string;
  color: string;
}

const IDEA_COLORS = [
  "bg-amber-500/15 border-amber-500/40 text-amber-200",
  "bg-cobalt/20 border-cobalt/40 text-indigo-200",
  "bg-emerald-500/15 border-emerald-500/40 text-emerald-200",
  "bg-saffron/15 border-saffron/40 text-orange-200",
  "bg-purple-500/15 border-purple-500/40 text-purple-200",
];

function formatRelative(date: Date | string) {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function NotesPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<"notes" | "ideas" | "ai">("notes");

  // Peer & Shared Notes state
  const [peers, setPeers] = React.useState<Peer[]>([]);
  const [peersLoading, setPeersLoading] = React.useState(true);
  const [selectedPeer, setSelectedPeer] = React.useState<Peer | null>(null);
  const [noteContent, setNoteContent] = React.useState("");
  const [noteLoading, setNoteLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);

  // Digital Ideas state
  const [ideas, setIdeas] = React.useState<IdeaCard[]>([
    {
      id: "1",
      title: "Smart India Hackathon 2025 Idea",
      description: "AI-driven campus resource allocation & hostel grievance management app.",
      tag: "Hackathon",
      color: IDEA_COLORS[0],
    },
    {
      id: "2",
      title: "GATE & Placement Prep Swap",
      description: "Daily 30-min DSA coding sprint with peer review on shared notepad.",
      tag: "Study",
      color: IDEA_COLORS[1],
    },
  ]);
  const [newIdeaTitle, setNewIdeaTitle] = React.useState("");
  const [newIdeaDesc, setNewIdeaDesc] = React.useState("");
  const [newIdeaTag, setNewIdeaTag] = React.useState("Hackathon");

  // AI Assistant state
  const [aiOutput, setAiOutput] = React.useState("");
  const [aiLoading, setAiLoading] = React.useState(false);

  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load peers on mount
  React.useEffect(() => {
    getMyNotePeersAction().then((res) => {
      if (res.success) {
        setPeers(res.peers);
        if (res.peers.length > 0) handleSelectPeer(res.peers[0]);
      }
      setPeersLoading(false);
    });
  }, []);

  const handleSelectPeer = async (peer: Peer) => {
    setSelectedPeer(peer);
    setNoteLoading(true);

    const res = await getNoteAction(peer.userId);
    if (res.success && res.note) {
      setNoteContent(res.note.content);
    } else if (res.error) {
      toast({ title: "Error", description: res.error, type: "error" });
    }
    setNoteLoading(false);
  };

  const handleContentChange = (val: string) => {
    setNoteContent(val);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => doSave(val), 1500);
  };

  const doSave = async (content: string) => {
    if (!selectedPeer) return;
    setSaving(true);
    const res = await saveNoteAction(selectedPeer.userId, content);
    if (res.success) {
      setLastSaved(new Date());
    } else {
      toast({ title: "Save Failed", description: res.error, type: "error" });
    }
    setSaving(false);
  };

  const addIdeaCard = () => {
    if (!newIdeaTitle.trim()) return;
    const newCard: IdeaCard = {
      id: Math.random().toString(36).substring(2),
      title: newIdeaTitle.trim(),
      description: newIdeaDesc.trim(),
      tag: newIdeaTag,
      color: IDEA_COLORS[ideas.length % IDEA_COLORS.length],
    };
    setIdeas([newCard, ...ideas]);
    setNewIdeaTitle("");
    setNewIdeaDesc("");
    toast({ title: "Idea Card Added!", type: "success" });
  };

  const deleteIdeaCard = (id: string) => {
    setIdeas(ideas.filter((i) => i.id !== id));
  };

  const runAIAssistant = async (mode: "ideas" | "summary" | "tasks" | "hindi") => {
    const textToUse = noteContent || ideas.map((i) => `${i.title}: ${i.description}`).join("\n");
    if (!textToUse.trim()) {
      toast({ title: "Empty Context", description: "Write some notes or add idea cards first!", type: "info" });
      return;
    }

    setAiLoading(true);
    setAiOutput("");
    const res = await getAIAssistAction(mode, textToUse);
    if (res.success && res.output) {
      setAiOutput(res.output);
    } else {
      toast({ title: "AI Assist Failed", description: res.output || "Error running AI.", type: "error" });
    }
    setAiLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-10">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <StickyNote className="h-6 w-6 text-saffron" />
            Study Notes & Digital Ideas
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Collaborative shared notepad, digital hackathon idea canvas & Gemini AI assistant.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-deepslate/60 p-1.5 rounded-xl border border-border self-start md:self-auto">
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "notes"
                ? "bg-cobalt text-white shadow-md"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Shared Notes
          </button>
          <button
            onClick={() => setActiveTab("ideas")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "ideas"
                ? "bg-saffron text-black font-bold shadow-md"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            Ideas Canvas
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "ai"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Assist
          </button>
        </div>
      </div>

      {/* ── TAB 1: SHARED NOTES ── */}
      {activeTab === "notes" && (
        <div className="flex gap-6 flex-1 min-h-[500px]">
          {/* Peer sidebar */}
          <div className="w-72 shrink-0 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-cloud uppercase tracking-wider">
              <Users className="h-4 w-4 text-cobalt" />
              Connected Peers
            </div>

            {peersLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-deepslate border border-border animate-pulse" />
                ))}
              </div>
            ) : peers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-border rounded-xl bg-deepslate/30">
                <Users className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm font-semibold text-white">No connections yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Connect with peers on <a href="/discover" className="text-cobalt underline">Discover</a> to start shared notes.
                </p>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-[600px]">
                {peers.map((peer) => (
                  <button
                    key={peer.userId}
                    onClick={() => handleSelectPeer(peer)}
                    className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all flex items-center gap-3 ${
                      selectedPeer?.userId === peer.userId
                        ? "border-saffron bg-saffron/10 text-white shadow-sm"
                        : "border-border bg-deepslate hover:border-cobalt/40 text-muted-foreground hover:text-white"
                    }`}
                  >
                    <IndianAvatar name={peer.fullName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{peer.fullName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">@{peer.username}</p>
                      <p className="text-[9px] text-saffron/80 truncate mt-0.5">{peer.college}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Note editor */}
          <div className="flex-1 flex flex-col min-h-0 bg-deepslate/30 border border-border rounded-2xl p-5 shadow-lg">
            {!selectedPeer ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-base font-semibold text-white">Select a Connected Peer</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Pick a co-builder to open your private shared notepad. Auto-saves every 1.5 seconds.
                </p>
              </div>
            ) : noteLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-saffron/30 border-t-saffron rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col flex-1 gap-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-3">
                    <IndianAvatar name={selectedPeer.fullName} size="md" />
                    <div>
                      <h2 className="text-sm font-bold text-white">
                        Notes with {selectedPeer.fullName}
                      </h2>
                      <p className="text-[11px] text-muted-foreground">@{selectedPeer.username} · {selectedPeer.college}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {lastSaved && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3" /> Saved {formatRelative(lastSaved)}
                      </span>
                    )}
                    {saving && (
                      <span className="text-[11px] text-saffron flex items-center gap-1 font-mono">
                        <div className="h-3 w-3 border-2 border-saffron/30 border-t-saffron rounded-full animate-spin" /> Saving…
                      </span>
                    )}
                    <button
                      onClick={() => doSave(noteContent)}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-saffron text-black text-xs font-bold hover:bg-saffron/90 transition-colors"
                    >
                      <Save className="h-3.5 w-3.5" /> Save
                    </button>
                  </div>
                </div>

                <textarea
                  value={noteContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder={`Start writing shared study notes, hackathon ideas, or meeting agendas with ${selectedPeer.fullName}…\n\n📌 Ideas & Checklist:\n- [ ] Finalize tech stack & database schema\n- [ ] Prepare pitch deck for Smart India Hackathon\n- [ ] Practice DSA problems together`}
                  className="flex-1 w-full rounded-xl border border-border bg-ink/60 p-4 text-sm text-cloud ring-offset-ink placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron transition-colors resize-none font-mono leading-relaxed min-h-[380px]"
                />

                <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-1">
                  <span>{noteContent.length} chars · {noteContent.split("\n").length} lines</span>
                  <span>🔒 End-to-end visible only to you & @{selectedPeer.username}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: DIGITAL IDEAS BOARD ── */}
      {activeTab === "ideas" && (
        <div className="space-y-6">
          {/* Add Idea Card Bar */}
          <div className="p-4 rounded-2xl bg-deepslate/40 border border-border space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-saffron" />
              Add Digital Idea Card
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <input
                value={newIdeaTitle}
                onChange={(e) => setNewIdeaTitle(e.target.value)}
                placeholder="Idea title (e.g. Smart Transport App)..."
                className="md:col-span-4 h-10 px-3 rounded-lg bg-ink border border-border text-xs text-white"
              />
              <input
                value={newIdeaDesc}
                onChange={(e) => setNewIdeaDesc(e.target.value)}
                placeholder="Brief description & key features..."
                className="md:col-span-5 h-10 px-3 rounded-lg bg-ink border border-border text-xs text-white"
              />
              <select
                value={newIdeaTag}
                onChange={(e) => setNewIdeaTag(e.target.value)}
                className="md:col-span-2 h-10 px-3 rounded-lg bg-ink border border-border text-xs text-white"
              >
                <option value="Hackathon">Hackathon</option>
                <option value="Startup">Startup</option>
                <option value="Study">Study</option>
                <option value="OpenSource">Open Source</option>
              </select>
              <button
                onClick={addIdeaCard}
                className="md:col-span-1 h-10 bg-saffron text-black font-bold rounded-lg flex items-center justify-center text-xs hover:bg-saffron/90"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Ideas Canvas Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map((card) => (
              <div
                key={card.id}
                className={`p-5 rounded-2xl border ${card.color} flex flex-col justify-between space-y-3 relative group shadow-lg`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/30 text-white">
                    #{card.tag}
                  </span>
                  <button
                    onClick={() => deleteIdeaCard(card.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-coral"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <h4 className="font-bold text-white text-base mb-1.5">{card.title}</h4>
                  <p className="text-xs opacity-90 leading-relaxed font-sans">{card.description}</p>
                </div>

                <div className="text-[10px] opacity-75 font-mono pt-2 border-t border-white/10 flex items-center justify-between">
                  <span>Digital Idea Canvas</span>
                  <span>Ready to pitch</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: AI ASSISTANT ── */}
      {activeTab === "ai" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-deepslate/40 border border-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Gemini AI Study & Hackathon Assistant</h3>
                <p className="text-xs text-muted-foreground">
                  Transform notes into hackathon ideas, task checklists, or Hinglish concept summaries.
                </p>
              </div>
            </div>

            {/* AI Action Trigger Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => runAIAssistant("ideas")}
                disabled={aiLoading}
                className="p-3 rounded-xl border border-saffron/30 bg-saffron/10 text-saffron hover:bg-saffron/20 transition-all flex flex-col items-center gap-1.5 text-xs font-bold text-center disabled:opacity-50 cursor-pointer"
              >
                <Wand2 className="h-4 w-4" />
                Hackathon Ideas
              </button>
              <button
                onClick={() => runAIAssistant("summary")}
                disabled={aiLoading}
                className="p-3 rounded-xl border border-cobalt/30 bg-cobalt/10 text-indigo-300 hover:bg-cobalt/20 transition-all flex flex-col items-center gap-1.5 text-xs font-bold text-center disabled:opacity-50 cursor-pointer"
              >
                <BookOpen className="h-4 w-4" />
                Summarize Notes
              </button>
              <button
                onClick={() => runAIAssistant("tasks")}
                disabled={aiLoading}
                className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all flex flex-col items-center gap-1.5 text-xs font-bold text-center disabled:opacity-50 cursor-pointer"
              >
                <ListCheck className="h-4 w-4" />
                Extract Tasks
              </button>
              <button
                onClick={() => runAIAssistant("hindi")}
                disabled={aiLoading}
                className="p-3 rounded-xl border border-amber/30 bg-amber/10 text-amber hover:bg-amber/20 transition-all flex flex-col items-center gap-1.5 text-xs font-bold text-center disabled:opacity-50 cursor-pointer"
              >
                <Languages className="h-4 w-4" />
                Hinglish Summary
              </button>
            </div>

            {/* AI Output Window */}
            <div className="mt-4 p-5 rounded-xl bg-ink border border-border min-h-[200px] relative">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                  <div className="h-8 w-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  <p className="text-xs font-mono">Gemini AI is processing notes…</p>
                </div>
              ) : aiOutput ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400 border-b border-border pb-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> AI Response
                    </span>
                    <button
                      onClick={() => setNoteContent((prev) => prev + "\n\n" + aiOutput)}
                      className="text-[10px] text-cobalt hover:underline"
                    >
                      + Append to Active Note
                    </button>
                  </div>
                  <div className="text-xs text-cloud leading-relaxed whitespace-pre-wrap font-sans pt-2">
                    {aiOutput}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Sparkles className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-xs font-medium">Click any button above to run Gemini AI analysis on your notes!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
