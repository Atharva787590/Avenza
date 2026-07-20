"use client";

import * as React from "react";
import { getNoteAction, saveNoteAction, getMyNotePeersAction } from "@/lib/actions/notes";
import { useToast } from "@/components/ui/toast";
import { BookOpen, Users, Save, Clock, ChevronRight, StickyNote } from "lucide-react";

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

  const [peers, setPeers] = React.useState<Peer[]>([]);
  const [peersLoading, setPeersLoading] = React.useState(true);

  const [selectedPeer, setSelectedPeer] = React.useState<Peer | null>(null);
  const [noteData, setNoteData] = React.useState<NoteData | null>(null);
  const [noteContent, setNoteContent] = React.useState("");
  const [noteLoading, setNoteLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);

  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load peers on mount
  React.useEffect(() => {
    getMyNotePeersAction().then((res) => {
      if (res.success) setPeers(res.peers);
      setPeersLoading(false);
    });
  }, []);

  // Load note when peer is selected
  const handleSelectPeer = async (peer: Peer) => {
    setSelectedPeer(peer);
    setNoteLoading(true);
    setNoteData(null);
    setNoteContent("");

    const res = await getNoteAction(peer.userId);
    if (res.success && res.note) {
      setNoteData(res.note as NoteData);
      setNoteContent(res.note.content);
    } else {
      toast({ title: "Error", description: res.error ?? "Could not load note.", type: "error" });
    }
    setNoteLoading(false);
  };

  // Auto-save with 1.5s debounce
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

  const handleManualSave = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    doSave(noteContent);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <StickyNote className="h-6 w-6 text-amber" />
            Study Notes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Private shared notepads with your connected peers — for study, hackathon planning & more.
          </p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* ── Peer sidebar ── */}
        <div className="w-72 shrink-0 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-cloud uppercase tracking-wider">
            <Users className="h-4 w-4 text-cobalt" />
            Your Connections
          </div>

          {peersLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-deepslate border border-border animate-pulse-slow" />
              ))}
            </div>
          ) : peers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-border rounded-xl bg-deepslate/40">
              <Users className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm font-semibold text-white">No connections yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Connect with peers on{" "}
                <a href="/discover" className="text-cobalt underline underline-offset-2">Discover</a>{" "}
                to start shared notes.
              </p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto">
              {peers.map((peer) => (
                <button
                  key={peer.userId}
                  onClick={() => handleSelectPeer(peer)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all group ${
                    selectedPeer?.userId === peer.userId
                      ? "border-cobalt bg-cobalt/10 text-white"
                      : "border-border bg-deepslate hover:border-cobalt/40 hover:bg-deepslate/80 text-muted-foreground hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-cobalt/20 border border-cobalt/30 flex items-center justify-center font-bold text-cobalt text-sm shrink-0">
                        {peer.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{peer.fullName}</p>
                        <p className="text-[11px] text-muted-foreground truncate">@{peer.username}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 truncate ml-11">{peer.college}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Note editor ── */}
        <div className="flex-1 flex flex-col min-h-0">
          {!selectedPeer ? (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-border rounded-2xl bg-deepslate/30 text-center px-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-white">Select a Connection</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
                Pick a peer from the left to open your shared notepad. 
                Notes auto-save as you type — great for hackathon planning, study notes, and ideas.
              </p>
            </div>
          ) : noteLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="h-8 w-8 border-2 border-cobalt/30 border-t-cobalt rounded-full animate-spin" />
                <p className="text-sm">Loading note…</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col flex-1 min-h-0 gap-3">
              {/* Editor header */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    📝 Notes with {selectedPeer.fullName}
                  </h2>
                  <p className="text-xs text-muted-foreground">@{selectedPeer.username} · {selectedPeer.college}</p>
                </div>
                <div className="flex items-center gap-3">
                  {lastSaved && (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Saved {formatRelative(lastSaved)}
                    </span>
                  )}
                  {saving && (
                    <span className="text-[11px] text-cobalt flex items-center gap-1">
                      <div className="h-3 w-3 border-2 border-cobalt/30 border-t-cobalt rounded-full animate-spin" />
                      Saving…
                    </span>
                  )}
                  <button
                    onClick={handleManualSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cobalt text-white text-xs font-semibold hover:bg-cobalt/90 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save
                  </button>
                </div>
              </div>

              {/* Toolbar hint */}
              <div className="px-1">
                <p className="text-[10px] text-muted-foreground bg-deepslate border border-border rounded-lg px-3 py-2">
                  💡 Use this shared notepad for study notes, hackathon ideas, project links, or anything you both need to access.
                  Edits auto-save after 1.5 seconds.
                </p>
              </div>

              {/* Textarea */}
              <textarea
                value={noteContent}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder={`Start writing shared notes with ${selectedPeer.fullName}…\n\nIdeas:\n• Hackathon project ideas\n• Study resources\n• Code snippets\n• Meeting notes\n• Task lists`}
                className="flex-1 w-full rounded-xl border border-border bg-deepslate px-5 py-4 text-sm text-cloud ring-offset-ink placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 transition-colors resize-none font-mono leading-relaxed min-h-[400px]"
              />

              <div className="flex justify-between items-center px-1">
                <p className="text-[11px] text-muted-foreground">
                  {noteContent.length} characters · {noteContent.split("\n").length} lines
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Only you and {selectedPeer.fullName} can see this note
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
