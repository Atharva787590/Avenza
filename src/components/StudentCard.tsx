"use client";

import * as React from "react";
import Link from "next/link";
import { toggleSaveProfileAction, sendConnectionRequestAction } from "@/lib/actions/profile";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { IndianAvatar } from "@/components/IndianAvatar";
import { Bookmark, MessageSquare, Send, Sparkles, UserPlus, Trophy, Award, MapPin } from "lucide-react";

interface StudentCardProps {
  peer: {
    userId: string;
    username: string;
    fullName: string;
    college: string;
    course: string;
    gradYear: number;
    yearOfStudy?: number | null;
    cgpa?: number | null;
    location?: string | null;
    state?: string | null;
    city?: string | null;
    bio: string;
    avatarUrl: string | null;
    hackathonWins?: number;
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
    setSaved(!saved);
    const result = await toggleSaveProfileAction(peer.userId);
    if (result.success) {
      toast({
        title: result.saved ? "Saved Student ID" : "Removed Student ID",
        description: result.message,
        type: "success",
      });
    } else {
      setSaved(saved);
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
        title: "Connection Request Sent",
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
    <div className="bg-deepslate/40 border border-border rounded-2xl p-6 hover:border-saffron/40 hover:bg-deepslate/60 transition-all flex flex-col justify-between group relative overflow-hidden">
      {/* Top Saffron/Green Accent Stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <IndianAvatar name={peer.fullName} avatarUrl={peer.avatarUrl} size="lg" />
            <div className="min-w-0">
              <Link href={`/people/${peer.username}`} className="block">
                <h3 className="font-bold text-white group-hover:text-saffron transition-colors truncate text-base">
                  {peer.fullName}
                </h3>
                <p className="text-xs text-muted-foreground font-mono">@{peer.username}</p>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSave}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                saved
                  ? "bg-saffron/10 border-saffron/40 text-saffron"
                  : "border-border text-muted-foreground hover:text-white"
              }`}
              title="Bookmark profile"
            >
              <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
            </button>
            <span className="text-xs font-bold text-mint bg-mint/10 border border-mint/20 px-2.5 py-1 rounded-full flex items-center gap-1 select-none">
              <Sparkles className="h-3 w-3" />
              {peer.matchScore}%
            </span>
          </div>
        </div>

        {/* Credentials & Indian College Badge */}
        <div className="space-y-1 text-xs font-medium text-cloud">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-white bg-cobalt/20 border border-cobalt/30 px-2 py-0.5 rounded text-[11px]">
              🏛️ {peer.college}
            </span>
            {peer.cgpa && (
              <span className="font-bold text-amber bg-amber/10 border border-amber/20 px-2 py-0.5 rounded text-[11px]">
                CGPA: {peer.cgpa}
              </span>
            )}
            {peer.hackathonWins && peer.hackathonWins > 0 ? (
              <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                <Trophy className="h-3 w-3" /> {peer.hackathonWins} Win{peer.hackathonWins > 1 ? "s" : ""}
              </span>
            ) : null}
          </div>

          <p className="text-muted-foreground pt-1">
            {peer.course} • {peer.yearOfStudy ? `Year ${peer.yearOfStudy}` : `Class of ${peer.gradYear}`}
            {peer.location ? ` • ${peer.location}` : ""}
          </p>
        </div>

        {/* Bio */}
        <p className="text-xs text-muted-foreground mt-3 line-clamp-3 leading-relaxed font-sans">
          {peer.bio}
        </p>

        {/* Matching Skills & Shared Interests */}
        <div className="mt-4 pt-3 border-t border-border/40 space-y-2.5">
          {peer.matchingSkills.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                Complementary Skills
              </span>
              <div className="flex flex-wrap gap-1">
                {peer.matchingSkills.map((s) => (
                  <span key={s} className="text-[10px] font-semibold bg-cobalt/15 text-indigo-300 px-2 py-0.5 rounded border border-cobalt/30">
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
      <div className="mt-5 pt-3 border-t border-border/40 flex items-center gap-2">
        <Link href={`/people/${peer.username}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full text-xs font-semibold h-10 border-border hover:border-saffron/40">
            Student ID
          </Button>
        </Link>

        {connStatus === "CONNECTED" ? (
          <Link href="/messages" className="flex-1">
            <Button variant="primary" size="sm" className="w-full text-xs font-semibold h-10 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500">
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
          </Link>
        ) : connStatus === "PENDING_SENT" ? (
          <Button variant="secondary" size="sm" disabled className="flex-1 text-xs font-semibold h-10">
            Pending Sent
          </Button>
        ) : connStatus === "PENDING_RECEIVED" ? (
          <Link href="/connections" className="flex-1">
            <Button variant="success" size="sm" className="w-full text-xs font-semibold h-10">
              Accept Request
            </Button>
          </Link>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="flex-1 text-xs font-semibold h-10 flex items-center justify-center gap-1 hover:border-saffron/40 cursor-pointer bg-saffron/10 border-saffron/30 text-saffron hover:bg-saffron/20"
          >
            <UserPlus className="h-4 w-4" />
            Connect
          </Button>
        )}
      </div>

      {/* Connection Invitation Dialog */}
      <Dialog isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Connect with {peer.fullName} (@{peer.username})</DialogTitle>
        <DialogDescription>
          Send a connection invitation to collaborate on projects or share study notes.
        </DialogDescription>
        <form onSubmit={handleConnect} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">
              Message Note (Optional)
            </label>
            <textarea
              value={connectMessage}
              onChange={(e) => setConnectMessage(e.target.value)}
              placeholder={`Hi ${peer.fullName.split(" ")[0]}, saw your work on ${peer.matchingSkills[0] || "projects"}! Let's connect on Avenza...`}
              className="flex min-h-[90px] w-full rounded-lg border border-border bg-deepslate px-3 py-2 text-sm text-cloud ring-offset-ink placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
              disabled={loading}
              maxLength={200}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="flex items-center gap-1.5 bg-saffron text-black font-bold hover:bg-saffron/90">
              <Send className="h-3.5 w-3.5" />
              Send Request
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
