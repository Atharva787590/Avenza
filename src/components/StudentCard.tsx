"use client";

import * as React from "react";
import Link from "next/link";
import { toggleSaveProfileAction, sendConnectionRequestAction } from "@/lib/actions/profile";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Bookmark, MessageSquare, Send, Sparkles, UserPlus } from "lucide-react";

interface StudentCardProps {
  peer: {
    userId: string;
    username: string;
    fullName: string;
    college: string;
    course: string;
    gradYear: number;
    bio: string;
    avatarUrl: string | null;
    matchScore: number;
    matchingSkills: string[];
    sharedInterests: string[];
  };
  isSaved: boolean;
  connectionStatus: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "CONNECTED";
  connectionId?: string;
}

export function StudentCard({ peer, isSaved: initialSaved, connectionStatus: initialStatus }: StudentCardProps) {
  const { toast } = useToast();
  const [saved, setSaved] = React.useState(initialSaved);
  const [connStatus, setConnStatus] = React.useState(initialStatus);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [connectMessage, setConnectMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSave = async () => {
    // Optimistic update
    setSaved(!saved);
    const result = await toggleSaveProfileAction(peer.userId);
    if (result.success) {
      toast({
        title: result.saved ? "Saved Profile" : "Removed Profile",
        description: result.message,
        type: "success",
      });
    } else {
      setSaved(saved); // Revert
      toast({
        title: "Action Failed",
        description: result.error,
        type: "error",
      });
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await sendConnectionRequestAction(peer.userId, connectMessage);

    if (result.success) {
      toast({
        title: "Request Sent",
        description: result.message,
        type: "success",
      });
      setConnStatus("PENDING_SENT");
      setModalOpen(false);
    } else {
      toast({
        title: "Request Failed",
        description: result.error,
        type: "error",
      });
    }
    setLoading(false);
  };

  return (
    <div className="bg-deepslate/30 border border-border rounded-2xl p-6 hover:border-cobalt/45 hover:bg-deepslate/50 transition-all flex flex-col justify-between group">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-cobalt/15 border border-cobalt/35 flex items-center justify-center font-bold text-white text-base">
              {peer.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <Link href={`/people/${peer.username}`} className="block">
                <h3 className="font-bold text-white group-hover:text-cobalt transition-colors truncate">
                  {peer.fullName}
                </h3>
                <p className="text-xs text-muted-foreground">@{peer.username}</p>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSave}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                saved
                  ? "bg-cobalt/10 border-cobalt/35 text-cobalt"
                  : "border-border text-muted-foreground hover:text-white"
              }`}
              title="Bookmark profile"
            >
              <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
            </button>
            <span className="text-xs font-bold text-mint bg-mint/10 border border-mint/20 px-2 py-1 rounded-full flex items-center gap-1 select-none">
              <Sparkles className="h-3 w-3" />
              {peer.matchScore}% Match
            </span>
          </div>
        </div>

        {/* Credentials */}
        <div className="space-y-1 text-xs font-medium text-cloud">
          <p>{peer.college}</p>
          <p className="text-muted-foreground">
            {peer.course} • Class of {peer.gradYear}
          </p>
        </div>

        {/* Bio */}
        <p className="text-xs text-muted-foreground mt-3 line-clamp-3 leading-relaxed">
          {peer.bio}
        </p>

        {/* Overlapping Info Summary */}
        <div className="mt-4 pt-4 border-t border-border/40 space-y-3">
          {peer.matchingSkills.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                Complementary Skills
              </span>
              <div className="flex flex-wrap gap-1">
                {peer.matchingSkills.map((s) => (
                  <span key={s} className="text-[10px] font-semibold bg-cobalt/15 text-indigo-300 px-2 py-0.5 rounded">
                    Offers {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {peer.sharedInterests.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                Shared Interests
              </span>
              <div className="flex flex-wrap gap-1">
                {peer.sharedInterests.map((i) => (
                  <span key={i} className="text-[10px] font-semibold bg-deepslate text-cloud border border-border px-2 py-0.5 rounded">
                    #{i}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-border/40 flex items-center gap-2">
        <Link href={`/people/${peer.username}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full text-xs font-semibold h-10">
            View Profile
          </Button>
        </Link>

        {connStatus === "CONNECTED" ? (
          <Link href="/messages" className="flex-1">
            <Button variant="primary" size="sm" className="w-full text-xs font-semibold h-10 flex items-center justify-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Message
            </Button>
          </Link>
        ) : connStatus === "PENDING_SENT" ? (
          <Button variant="secondary" size="sm" disabled className="flex-1 text-xs font-semibold h-10">
            Pending Sent
          </Button>
        ) : connStatus === "PENDING_RECEIVED" ? (
          <Link href="/connections" className="flex-1">
            <Button variant="success" size="sm" className="w-full text-xs font-semibold h-10">
              Review Request
            </Button>
          </Link>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="flex-1 text-xs font-semibold h-10 flex items-center justify-center gap-1 hover:border-cobalt/40 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Connect
          </Button>
        )}
      </div>

      {/* Connection Invite Modal */}
      <Dialog isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Send Connection Invitation</DialogTitle>
        <DialogDescription>
          Customize your request note for <strong>{peer.fullName}</strong>. Let them know what you&apos;d love to work on together.
        </DialogDescription>
        <form onSubmit={handleConnect} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">
              Optional Message
            </label>
            <textarea
              value={connectMessage}
              onChange={(e) => setConnectMessage(e.target.value)}
              placeholder="Hi, I saw you offer React and are looking to learn node.js co-founders! Let's swap skills..."
              className="flex min-h-[90px] w-full rounded-lg border border-border bg-deepslate px-3 py-2 text-sm text-cloud ring-offset-ink placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
              disabled={loading}
              maxLength={200}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5" />
              Send Invitation
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
