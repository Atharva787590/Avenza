"use client";

import * as React from "react";
import { updateProfileSettingsAction } from "@/lib/actions/settings";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { User, Link as LinkIcon, ShieldCheck } from "lucide-react";

interface SettingsViewProps {
  email: string;
  role: string;
  initialProfile: {
    fullName: string;
    location: string;
    bio: string;
    availability: string;
    collabPreferences: string;
    githubUrl: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
  };
}

export function SettingsView({ email, role, initialProfile }: SettingsViewProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState("profile");
  const [loading, setLoading] = React.useState(false);

  // Form State
  const [fullName, setFullName] = React.useState(initialProfile.fullName);
  const [location, setLocation] = React.useState(initialProfile.location);
  const [bio, setBio] = React.useState(initialProfile.bio);
  const [availability, setAvailability] = React.useState(initialProfile.availability);
  const [collabPreferences, setCollabPreferences] = React.useState(initialProfile.collabPreferences);
  const [githubUrl, setGithubUrl] = React.useState(initialProfile.githubUrl || "");
  const [linkedinUrl, setLinkedinUrl] = React.useState(initialProfile.linkedinUrl || "");
  const [portfolioUrl, setPortfolioUrl] = React.useState(initialProfile.portfolioUrl || "");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !location.trim() || !bio.trim() || !collabPreferences.trim()) {
      toast({ title: "Validation Error", description: "Please fill out all required fields.", type: "error" });
      return;
    }

    setLoading(true);
    const payload = {
      fullName,
      location,
      bio,
      availability,
      collabPreferences,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
    };

    const result = await updateProfileSettingsAction(JSON.stringify(payload));
    if (result.success) {
      toast({ title: "Settings Saved", description: result.message, type: "success" });
    } else {
      toast({ title: "Save Failed", description: result.error, type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 bg-deepslate/30 border border-border rounded-2xl p-6 md:p-8 min-h-[500px]">
      {/* Settings Side Menu */}
      <div className="w-full md:w-56 shrink-0 flex flex-col gap-1 border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-left transition-colors cursor-pointer ${
            activeTab === "profile"
              ? "bg-cobalt/15 text-indigo-300 border-l-2 border-cobalt"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          <User className="h-4 w-4" />
          Edit Profile
        </button>

        <button
          onClick={() => setActiveTab("account")}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-left transition-colors cursor-pointer ${
            activeTab === "account"
              ? "bg-cobalt/15 text-indigo-300 border-l-2 border-cobalt"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Account & Security
        </button>
      </div>

      {/* Settings Form Pane */}
      <div className="flex-1 max-w-xl">
        {activeTab === "profile" && (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Edit Profile Preferences</h2>
              <p className="text-xs text-muted-foreground mt-1">Configure details that co-builders see.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Full Name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required disabled={loading} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Location</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} required disabled={loading} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Professional Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="flex min-h-[90px] w-full rounded-lg border border-border bg-deepslate px-3 py-2 text-sm text-cloud ring-offset-ink placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Availability Status</label>
              <Select value={availability} onChange={(e) => setAvailability(e.target.value)} disabled={loading}>
                <option value="ACTIVE">Active (Open for co-building)</option>
                <option value="WEEKENDS">Weekends Only</option>
                <option value="BUSY">Busy (Advisory role only)</option>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Collaboration Goals</label>
              <textarea
                value={collabPreferences}
                onChange={(e) => setCollabPreferences(e.target.value)}
                className="flex min-h-[90px] w-full rounded-lg border border-border bg-deepslate px-3 py-2 text-sm text-cloud ring-offset-ink placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
                required
                disabled={loading}
              />
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <LinkIcon className="h-4 w-4 text-mint" />
                Portfolio Links
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">GitHub Link</span>
                  <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/..." disabled={loading} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">LinkedIn Link</span>
                  <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/..." disabled={loading} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Portfolio Website</span>
                  <Input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://..." disabled={loading} />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full font-semibold">
              {loading ? "Saving Settings..." : "Save Settings"}
            </Button>
          </form>
        )}

        {activeTab === "account" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Account Info</h2>
              <p className="text-xs text-muted-foreground mt-1">Your secure credentials and platform authorizations.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-border bg-ink/20 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Register Email Address</span>
                <p className="text-sm text-white font-medium">{email}</p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-ink/20 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Platform Role Authorization</span>
                <p className="text-sm text-white font-medium flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-mint" />
                  {role}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
