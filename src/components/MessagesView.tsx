"use client";

import * as React from "react";
import { sendMessageAction } from "@/lib/actions/messages";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IndianAvatar } from "@/components/IndianAvatar";
import { Send, MessageSquare, Search, Smile, CheckCheck, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";

interface Peer {
  userId: string;
  username: string;
  fullName: string;
  college: string;
  course: string;
  bio: string;
  avatarUrl?: string | null;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date | string;
}

interface MessagesViewProps {
  currentUserId: string;
  peers: Peer[];
  initialMessages: Message[];
}

const QUICK_EMOJIS = ["👍", "🚀", "🔥", "💡", "❤️", "😂", "🎉", "🙏", "💯", "👏"];

function formatISTTime(date: Date | string) {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function MessagesView({ currentUserId, peers, initialMessages }: MessagesViewProps) {
  const { toast } = useToast();
  const [selectedPeer, setSelectedPeer] = React.useState<Peer | null>(peers[0] || null);
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);
  const [input, setInput] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showEmojis, setShowEmojis] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Filter peers by search query
  const filteredPeers = React.useMemo(() => {
    if (!searchQuery.trim()) return peers;
    const q = searchQuery.toLowerCase();
    return peers.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        p.college.toLowerCase().includes(q)
    );
  }, [peers, searchQuery]);

  // Messages for active peer
  const activeMessages = React.useMemo(() => {
    if (!selectedPeer) return [];
    return messages.filter(
      (m) =>
        (m.senderId === currentUserId && m.receiverId === selectedPeer.userId) ||
        (m.senderId === selectedPeer.userId && m.receiverId === currentUserId)
    );
  }, [messages, selectedPeer, currentUserId]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !selectedPeer) return;

    const content = input.trim();
    setInput("");
    setShowEmojis(false);
    setIsTyping(false);

    // Optimistic message append
    const tempId = Math.random().toString(36).substring(2);
    const tempMsg: Message = {
      id: tempId,
      senderId: currentUserId,
      receiverId: selectedPeer.userId,
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setLoading(true);

    const result = await sendMessageAction(selectedPeer.userId, content);
    if (!result.success) {
      toast({ title: "Message Failed", description: result.error, type: "error" });
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } else {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? (result.message as Message) : m)));
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    }
  };

  const addEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-deepslate/30 border border-border rounded-2xl overflow-hidden min-h-[580px] max-h-[82vh] shadow-xl shadow-ink/50">
      {/* ── Left Sidebar: Connections & DM Threads ── */}
      <div className="w-full md:w-80 border-r border-border bg-deepslate/50 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Direct Messages
            </h2>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cobalt/20 text-indigo-300 border border-cobalt/30">
              {peers.length} Connections
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search peers by name or @username..."
              className="h-8 pl-8 text-xs bg-ink/40 border-border"
            />
          </div>
        </div>

        {/* Peers list */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/40">
          {filteredPeers.map((peer) => {
            const isSelected = selectedPeer?.userId === peer.userId;

            const peerMsgs = messages.filter(
              (m) =>
                (m.senderId === currentUserId && m.receiverId === peer.userId) ||
                (m.senderId === peer.userId && m.receiverId === currentUserId)
            );
            const lastMsg = peerMsgs[peerMsgs.length - 1];

            return (
              <div
                key={peer.userId}
                onClick={() => setSelectedPeer(peer)}
                className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all select-none ${
                  isSelected
                    ? "bg-cobalt/15 border-l-4 border-saffron"
                    : "hover:bg-deepslate/60 text-cloud"
                }`}
              >
                <IndianAvatar name={peer.fullName} avatarUrl={peer.avatarUrl} size="md" />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white truncate">{peer.fullName}</h4>
                    {lastMsg && (
                      <span className="text-[9px] text-muted-foreground font-mono">
                        {formatISTTime(lastMsg.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">@{peer.username}</p>
                  {lastMsg && (
                    <p className="text-[11px] text-cloud/70 truncate mt-1">
                      {lastMsg.senderId === currentUserId ? "You: " : ""}
                      {lastMsg.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {filteredPeers.length === 0 && (
            <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
              <p>No connections found.</p>
              <Link href="/discover" className="text-cobalt underline text-xs font-semibold">
                Find students on Discover →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Right Panel: Active Chat Thread ── */}
      <div className="flex-1 flex flex-col justify-between bg-ink/30 relative">
        {selectedPeer ? (
          <>
            {/* Active Header */}
            <div className="p-3.5 border-b border-border bg-deepslate/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IndianAvatar name={selectedPeer.fullName} avatarUrl={selectedPeer.avatarUrl} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{selectedPeer.fullName}</h3>
                    <span className="text-[10px] text-muted-foreground font-mono">@{selectedPeer.username}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate max-w-md">
                    {selectedPeer.college} · {selectedPeer.course}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Link
                  href="/notes"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber/30 bg-amber/10 text-amber text-xs font-semibold hover:bg-amber/20 transition-colors"
                  title="Open Shared Study Notes"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Shared Notes</span>
                </Link>
                <Link
                  href={`/people/${selectedPeer.username}`}
                  className="px-2.5 py-1.5 rounded-lg border border-border bg-deepslate text-xs font-semibold text-cloud hover:border-cobalt transition-colors"
                >
                  Student ID Card
                </Link>
              </div>
            </div>

            {/* Chat Messages Thread Log (WhatsApp Style) */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[radial-gradient(#1e294b_1px,transparent_1px)] [background-size:16px_16px]">
              {activeMessages.map((msg) => {
                const isOwn = msg.senderId === currentUserId;

                return (
                  <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-md transition-all ${
                        isOwn
                          ? "bg-[#075E54] text-white rounded-tr-none border border-emerald-500/20"
                          : "bg-deepslate text-cloud rounded-tl-none border border-border"
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap break-words font-sans text-[13px]">
                        {msg.content}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-75">
                        <span>{formatISTTime(msg.createdAt)}</span>
                        {isOwn && <CheckCheck className="h-3 w-3 text-emerald-300 inline" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Emojis Bar (Collapsible) */}
            {showEmojis && (
              <div className="p-2 border-t border-border bg-deepslate/80 flex flex-wrap gap-2 animate-in fade-in duration-200">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addEmoji(emoji)}
                    className="h-8 w-8 text-base rounded-lg hover:bg-ink flex items-center justify-center transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-border bg-deepslate/40 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEmojis((v) => !v)}
                className={`p-2 rounded-lg text-muted-foreground hover:text-white transition-colors ${
                  showEmojis ? "text-amber" : ""
                }`}
                title="Quick Emojis"
              >
                <Smile className="h-5 w-5" />
              </button>

              <Input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Message @${selectedPeer.username} (Press Enter to send)...`}
                disabled={loading}
                className="flex-1 bg-ink/60 border-border text-sm h-11"
                maxLength={500}
              />

              <Button
                type="submit"
                size="icon"
                disabled={loading || !input.trim()}
                className="h-11 w-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-3 animate-pulse" />
            <h3 className="text-lg font-bold text-white mb-1">Select a Conversation</h3>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Connect with peers on Discover using their @username to start chatting and sharing study notes!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
