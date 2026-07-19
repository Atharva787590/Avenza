"use client";

import * as React from "react";
import { sendMessageAction } from "@/lib/actions/messages";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare } from "lucide-react";

interface Peer {
  userId: string;
  username: string;
  fullName: string;
  college: string;
  course: string;
  bio: string;
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

export function MessagesView({ currentUserId, peers, initialMessages }: MessagesViewProps) {
  const { toast } = useToast();
  const [selectedPeer, setSelectedPeer] = React.useState<Peer | null>(peers[0] || null);
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  // Filter messages for active chat conversation
  const activeMessages = React.useMemo(() => {
    if (!selectedPeer) return [];
    return messages.filter(
      (m) =>
        (m.senderId === currentUserId && m.receiverId === selectedPeer.userId) ||
        (m.senderId === selectedPeer.userId && m.receiverId === currentUserId)
    );
  }, [messages, selectedPeer, currentUserId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedPeer) return;

    const content = input.trim();
    setInput("");

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
      toast({ title: "Failed to send message", description: result.error, type: "error" });
      // Remove optimistic message if error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } else {
      // Replace optimistic message with actual DB message
      setMessages((prev) => prev.map((m) => (m.id === tempId ? (result.message as Message) : m)));
    }
    setLoading(false);
  };

  // Scroll to bottom
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-deepslate/30 border border-border rounded-2xl overflow-hidden min-h-[550px] max-h-[80vh] shadow-lg shadow-ink/40">
      {/* Left panel: Peers list */}
      <div className="w-full md:w-80 border-r border-border bg-deepslate/40 flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-white text-base">Direct Messages</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">Chat with accepted co-builders</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {peers.map((peer) => {
            const isSelected = selectedPeer?.userId === peer.userId;

            // Find last message snippet
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
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors select-none ${
                  isSelected ? "bg-cobalt/15 border-l-4 border-cobalt" : "hover:bg-deepslate/50"
                }`}
              >
                <div className="h-9 w-9 rounded-full bg-cobalt/15 border border-cobalt/35 flex items-center justify-center font-bold text-white text-xs shrink-0">
                  {peer.fullName.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white truncate">{peer.fullName}</h4>
                    {lastMsg && (
                      <span className="text-[9px] text-muted-foreground">
                        {new Date(lastMsg.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">@{peer.username}</p>
                  {lastMsg && (
                    <p className="text-[11px] text-muted-foreground truncate mt-1">
                      {lastMsg.senderId === currentUserId ? "You: " : ""}
                      {lastMsg.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {peers.length === 0 && (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No messaging threads. Connect with peers first!
            </div>
          )}
        </div>
      </div>

      {/* Right panel: Active chat */}
      <div className="flex-1 flex flex-col justify-between bg-ink/20">
        {selectedPeer ? (
          <>
            {/* Active Header */}
            <div className="p-4 border-b border-border bg-deepslate/10 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-cobalt/15 border border-cobalt/35 flex items-center justify-center font-bold text-white text-xs">
                {selectedPeer.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">{selectedPeer.fullName}</h3>
                <p className="text-[10px] text-muted-foreground">
                  {selectedPeer.course} • {selectedPeer.college}
                </p>
              </div>
            </div>

            {/* Messages Thread Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {activeMessages.map((msg) => {
                const isOwn = msg.senderId === currentUserId;

                return (
                  <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs ${
                        isOwn
                          ? "bg-cobalt text-white rounded-tr-none shadow-md shadow-cobalt/15"
                          : "bg-deepslate text-cloud rounded-tl-none border border-border"
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                      <span className={`text-[8px] mt-1.5 block text-right ${isOwn ? "text-indigo-200" : "text-muted-foreground"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 border-t border-border bg-deepslate/20 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Send a message to @${selectedPeer.username}...`}
                disabled={loading}
                className="flex-1"
                maxLength={400}
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-3 animate-pulse-slow" />
            <h3 className="text-lg font-bold text-white mb-1">Select a Conversation</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              Pick a co-builder from the sidebar to coordinate projects or schedule skill swaps.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
