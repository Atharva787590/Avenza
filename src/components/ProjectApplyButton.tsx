"use client";

import * as React from "react";
import { applyToProjectAction } from "@/lib/actions/projects";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { FileEdit, Send } from "lucide-react";

interface ProjectApplyButtonProps {
  projectId: string;
  projectTitle: string;
  rolesNeeded: string[];
}

export function ProjectApplyButton({ projectId, projectTitle, rolesNeeded }: ProjectApplyButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [role, setRole] = React.useState(rolesNeeded[0] || "Contributor");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim()) return;

    setLoading(true);
    const result = await applyToProjectAction(projectId, role, message);

    if (result.success) {
      toast({
        title: "Application Submitted!",
        description: result.message,
        type: "success",
      });
      setOpen(false);
      setMessage("");
    } else {
      toast({
        title: "Application Failed",
        description: result.error,
        type: "error",
      });
    }
    setLoading(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full font-semibold flex items-center justify-center gap-2">
        <FileEdit className="h-5 w-5" />
        Apply to Join Team
      </Button>

      <Dialog isOpen={open} onClose={() => setOpen(false)}>
        <DialogTitle>Apply to Join {projectTitle}</DialogTitle>
        <DialogDescription>
          Select your target role and write a short pitch to the project co-founders.
        </DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Select Role */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">
              Choose Role
            </label>
            <Select value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
              {rolesNeeded.length > 0 ? (
                rolesNeeded.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))
              ) : (
                <option value="Contributor">Contributor</option>
              )}
            </Select>
          </div>

          {/* Application Cover Message */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">
              Pitch / Application Note
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi co-founders, I have built 3 Next.js apps and would love to help code the frontend user views..."
              className="flex min-h-[90px] w-full rounded-lg border border-border bg-deepslate px-3 py-2 text-sm text-cloud ring-offset-ink placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
              required
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5" />
              Submit Application
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
