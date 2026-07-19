"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createProjectAction } from "@/lib/actions/projects";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Plus, X } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  // Form states
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("Web Development");
  const [timeline, setTimeline] = React.useState("3 Months");
  const [githubUrl, setGithubUrl] = React.useState("");
  const [demoUrl, setDemoUrl] = React.useState("");

  const [currentRole, setCurrentRole] = React.useState("");
  const [roles, setRoles] = React.useState<string[]>(["Frontend Dev", "Backend Engineer"]);

  const addRole = () => {
    if (!currentRole.trim()) return;
    if (roles.some((r) => r.toLowerCase() === currentRole.trim().toLowerCase())) {
      return;
    }
    setRoles([...roles, currentRole.trim()]);
    setCurrentRole("");
  };

  const removeRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category.trim() || !timeline.trim()) {
      toast({ title: "Validation Error", description: "Please fill out all required fields.", type: "error" });
      return;
    }

    if (description.trim().length < 20) {
      toast({ title: "Validation Error", description: "Description must be at least 20 characters.", type: "error" });
      return;
    }

    if (roles.length === 0) {
      toast({ title: "Validation Error", description: "Please list at least one required developer/designer role.", type: "error" });
      return;
    }

    setLoading(true);
    const payload = {
      title,
      description,
      category,
      timeline,
      githubUrl,
      demoUrl,
      roles,
    };

    const result = await createProjectAction(JSON.stringify(payload));

    if (result.success) {
      toast({
        title: "Project Opportunity Live!",
        description: result.message,
        type: "success",
      });
      router.push(`/projects/${result.projectId}`);
      router.refresh();
    } else {
      toast({
        title: "Failed to pitch project",
        description: result.error,
        type: "error",
      });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">Pitch a New Project</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Share your startup ideas, hackathon drafts, or research concepts. Recruit skilled peers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-deepslate/50 border border-border p-6 md:p-8 rounded-2xl space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Project Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. EcoTrack Carbon Savings Platform"
            required
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Project Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the problem, solution, technologies, and target user for this project..."
            className="flex min-h-[120px] w-full rounded-lg border border-border bg-deepslate px-3 py-2 text-sm text-cloud ring-offset-ink placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
            required
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Project Category</label>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} disabled={loading}>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Climate Tech">Climate Tech</option>
              <option value="Accessibility">Accessibility</option>
              <option value="Education">Education</option>
              <option value="Campus Life">Campus Life</option>
              <option value="AI / ML">AI / ML</option>
              <option value="Game Dev">Game Dev</option>
            </Select>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Target Timeline</label>
            <Input
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              placeholder="e.g. 2 Weeks (Hackathon) or 3 Months"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* GitHub Repo */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">GitHub URL (Optional)</label>
            <Input
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username/project"
              disabled={loading}
            />
          </div>

          {/* Demo Link */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Demo Link (Optional)</label>
            <Input
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://project-demo.vercel.app"
              disabled={loading}
            />
          </div>
        </div>

        {/* Roles Needed */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Co-builder Roles Needed</label>
          <div className="flex gap-2">
            <Input
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              placeholder="e.g. Flutter Developer, UX Researcher, Copywriter"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRole())}
              disabled={loading}
            />
            <Button type="button" variant="secondary" size="icon" onClick={addRole} disabled={loading}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {roles.map((role, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cobalt/15 text-indigo-300 border border-cobalt/35 select-none">
                {role}
                <button type="button" onClick={() => removeRole(idx)} className="hover:text-white" disabled={loading}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" className="flex-1 font-semibold" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1 font-semibold" disabled={loading}>
            {loading ? "Launching Opportunity..." : "Pitch Opportunity"}
          </Button>
        </div>
      </form>
    </div>
  );
}
