"use client";

import * as React from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  toggleSaveProfileAction,
  sendConnectionRequestAction,
  requestMentorshipSessionAction,
} from "@/lib/actions/profile";
import { Bookmark, Calendar, MessageSquare, Send, UserPlus } from "lucide-react";

interface ProfileActionsProps {
  userId: string;
  fullName: string;
  isSaved: boolean;
  connectionStatus: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "CONNECTED";
  isOwnProfile: boolean;
}

export function ProfileActions({
  userId,
  fullName,
  isSaved: initialSaved,
  connectionStatus: initialStatus,
  isOwnProfile,
}: ProfileActionsProps) {
  const { toast } = useToast();
  const [saved, setSaved] = React.useState(initialSaved);
  const [connStatus, setConnStatus] = React.useState(initialStatus);

  // Connection Dialog
  const [connectOpen, setConnectOpen] = React.useState(false);
  const [connectMessage, setConnectMessage] = React.useState("");
  const [connectLoading, setConnectLoading] = React.useState(false);

  // Session Dialog
  const [sessionOpen, setSessionOpen] = React.useState(false);
  const [sessionTopic, setSessionTopic] = React.useState("");
  const [sessionSkills, setSessionSkills] = React.useState("");
  const [sessionDate, setSessionDate] = React.useState("");
  const [sessionLoading, setSessionLoading] = React.useState(false);

  const handleSave = async () => {
    setSaved(!saved);
    const result = await toggleSaveProfileAction(userId);
    if (result.success) {
      toast({
        title: result.saved ? "Saved Profile" : "Removed Profile",
        description: result.message,
        type: "success",
      });
    } else {
      setSaved(saved);
      toast({ title: "Failed to update bookmark", description: result.error, type: "error" });
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectLoading(true);
    const result = await sendConnectionRequestAction(userId, connectMessage);
    if (result.success) {
      toast({ title: "Invitation Sent", description: result.message, type: "success" });
      setConnStatus("PENDING_SENT");
      setConnectOpen(false);
    } else {
      toast({ title: "Failed to Connect", description: result.error, type: "error" });
    }
    setConnectLoading(false);
  };

  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTopic.trim() || !sessionSkills.trim() || !sessionDate) {
      toast({ title: "Validation Error", description: "Please fill out all session fields.", type: "error" });
      return;
    }

    setSessionLoading(true);
    const result = await requestMentorshipSessionAction(userId, sessionTopic, sessionSkills, sessionDate);
    if (result.success) {
      toast({ title: "Session Requested", description: result.message, type: "success" });
      setSessionOpen(false);
      // Reset form
      setSessionTopic("");
      setSessionSkills("");
      setSessionDate("");
    } else {
      toast({ title: "Booking Failed", description: result.error, type: "error" });
    }
    setSessionLoading(false);
  };

  if (isOwnProfile) {
    return (
      <Link href="/settings" className="w-full">
        <Button variant="outline" className="w-full font-semibold border-border">
          Edit Profile Preferences
        </Button>
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-2">
        {connStatus === "CONNECTED" ? (
          <Link href="/messages" className="flex-1">
            <Button variant="primary" className="w-full font-semibold flex items-center justify-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Send Message
            </Button>
          </Link>
        ) : connStatus === "PENDING_SENT" ? (
          <Button variant="secondary" disabled className="flex-1 font-semibold">
            Invitation Pending
          </Button>
        ) : connStatus === "PENDING_RECEIVED" ? (
          <Link href="/connections" className="flex-1">
            <Button variant="success" className="w-full font-semibold">
              Review Connection Invitation
            </Button>
          </Link>
        ) : (
          <Button
            variant="primary"
            onClick={() => setConnectOpen(true)}
            className="flex-1 font-semibold flex items-center justify-center gap-2"
          >
            <UserPlus className="h-5 w-5" />
            Connect Peer
          </Button>
        )}

        <button
          onClick={handleSave}
          className={`p-3 rounded-lg border cursor-pointer shrink-0 transition-colors ${
            saved
              ? "bg-cobalt/10 border-cobalt/35 text-cobalt"
              : "border-border text-muted-foreground hover:text-white"
          }`}
          title="Save student"
        >
          <Bookmark className="h-5 w-5" fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <Button
        variant="secondary"
        onClick={() => setSessionOpen(true)}
        className="w-full font-semibold flex items-center justify-center gap-2 hover:border-cobalt/35"
      >
        <Calendar className="h-5 w-5 text-mint" />
        Book Mentorship / Skill Swap
      </Button>

      {/* Connection Dialog */}
      <Dialog isOpen={connectOpen} onClose={() => setConnectOpen(false)}>
        <DialogTitle>Connect with {fullName}</DialogTitle>
        <DialogDescription>
          Say hello and briefly state what ideas or skills you co-build.
        </DialogDescription>
        <form onSubmit={handleConnect} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">
              Message Note
            </label>
            <textarea
              value={connectMessage}
              onChange={(e) => setConnectMessage(e.target.value)}
              placeholder="Hi co-founder! Let's swap Figma templates for TypeScript..."
              className="flex min-h-[90px] w-full rounded-lg border border-border bg-deepslate px-3 py-2 text-sm text-cloud ring-offset-ink placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
              disabled={connectLoading}
              maxLength={200}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setConnectOpen(false)} disabled={connectLoading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={connectLoading} className="flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5" />
              Send Invitation
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Mentorship Dialog */}
      <Dialog isOpen={sessionOpen} onClose={() => setSessionOpen(false)}>
        <DialogTitle>Request Session with {fullName}</DialogTitle>
        <DialogDescription>
          Coordinate a skill-exchange or technical mentorship chat with your peer.
        </DialogDescription>
        <form onSubmit={handleScheduleSession} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">
              Meeting Topic
            </label>
            <Input
              value={sessionTopic}
              onChange={(e) => setSessionTopic(e.target.value)}
              placeholder="e.g. Next.js server actions walkthrough"
              required
              disabled={sessionLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">
              Skills Exchanged (What each swaps)
            </label>
            <Input
              value={sessionSkills}
              onChange={(e) => setSessionSkills(e.target.value)}
              placeholder="e.g. I swap Figma insights, you swap React state help"
              required
              disabled={sessionLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">
              Proposed Date & Time
            </label>
            <input
              type="datetime-local"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="flex h-11 w-full rounded-lg border border-border bg-deepslate px-3 py-2 text-sm text-cloud ring-offset-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              required
              disabled={sessionLoading}
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setSessionOpen(false)} disabled={sessionLoading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={sessionLoading} className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Schedule Session
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
