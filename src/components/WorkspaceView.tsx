"use client";

import * as React from "react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  createTaskAction,
  updateTaskStatusAction,
  createMilestoneAction,
  toggleMilestoneAction,
  createResourceAction,
  deleteResourceAction,
} from "@/lib/actions/workspace";
import {
  Plus,
  Trash2,
  Link as LinkIcon,
  FileText,
  Layers,
} from "lucide-react";
import { Github } from "@/components/BrandIcons";

interface TaskAssignee {
  profile: {
    fullName: string;
    username: string;
  } | null;
}

export interface WorkspaceTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | string | null;
  assigneeId: string | null;
  assignee: TaskAssignee | null;
}

export interface WorkspaceMilestone {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | string | null;
  isCompleted: boolean;
}

export interface WorkspaceResource {
  id: string;
  title: string;
  url: string;
  type: string;
}

export interface WorkspaceMember {
  userId: string;
  user: {
    profile: {
      fullName: string;
      username: string;
    } | null;
  };
}

export interface WorkspaceActivity {
  id: string;
  details: string;
  createdAt: Date | string;
}

interface WorkspaceViewProps {
  projectId: string;
  projectTitle: string;
  initialTasks: WorkspaceTask[];
  initialMilestones: WorkspaceMilestone[];
  initialResources: WorkspaceResource[];
  members: WorkspaceMember[];
  activities: WorkspaceActivity[];
}

export function WorkspaceView({
  projectId,
  projectTitle,
  initialTasks,
  initialMilestones,
  initialResources,
  members,
  activities: initialActivities,
}: WorkspaceViewProps) {
  const { toast } = useToast();
  const [tasks, setTasks] = React.useState(initialTasks);
  const [milestones, setMilestones] = React.useState(initialMilestones);
  const [resources, setResources] = React.useState(initialResources);
  const [activities] = React.useState(initialActivities);

  // Dialog states
  const [taskOpen, setTaskOpen] = React.useState(false);
  const [milestoneOpen, setMilestoneOpen] = React.useState(false);
  const [resourceOpen, setResourceOpen] = React.useState(false);

  // Add Task form state
  const [taskTitle, setTaskTitle] = React.useState("");
  const [taskDesc, setTaskDesc] = React.useState("");
  const [taskAssignee, setTaskAssignee] = React.useState("");
  const [taskPriority, setTaskPriority] = React.useState("MEDIUM");
  const [taskDueDate, setTaskDueDate] = React.useState("");
  const [taskLoading, setTaskLoading] = React.useState(false);

  // Add Milestone form state
  const [milestoneTitle, setMilestoneTitle] = React.useState("");
  const [milestoneDesc, setMilestoneDesc] = React.useState("");
  const [milestoneDate, setMilestoneDate] = React.useState("");
  const [milestoneLoading, setMilestoneLoading] = React.useState(false);

  // Add Resource form state
  const [resourceTitle, setResourceTitle] = React.useState("");
  const [resourceUrl, setResourceUrl] = React.useState("");
  const [resourceType, setResourceType] = React.useState("LINK");
  const [resourceLoading, setResourceLoading] = React.useState(false);

  // 1. Task operations
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setTaskLoading(true);
    const result = await createTaskAction(
      projectId,
      taskTitle,
      taskDesc,
      taskAssignee,
      taskPriority,
      taskDueDate
    );

    if (result.success) {
      toast({ title: "Task Created", description: result.message, type: "success" });
      setTaskOpen(false);
      // Reset form
      setTaskTitle("");
      setTaskDesc("");
      setTaskAssignee("");
      setTaskDueDate("");
      // Refresh page data or reload page to sync activity
      window.location.reload();
    } else {
      toast({ title: "Error", description: result.error, type: "error" });
    }
    setTaskLoading(false);
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    // Optimistic Update
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    const result = await updateTaskStatusAction(taskId, newStatus, projectId);

    if (result.success) {
      toast({ title: "Task Updated", description: result.message, type: "success" });
      // Re-trigger layout sync to fetch updated activities
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast({ title: "Update Failed", description: result.error, type: "error" });
      // Revert
      setTasks(initialTasks);
    }
  };

  // 2. Milestone operations
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) return;

    setMilestoneLoading(true);
    const result = await createMilestoneAction(projectId, milestoneTitle, milestoneDesc, milestoneDate);

    if (result.success) {
      toast({ title: "Milestone Added", description: result.message, type: "success" });
      setMilestoneOpen(false);
      setMilestoneTitle("");
      setMilestoneDesc("");
      setMilestoneDate("");
      window.location.reload();
    } else {
      toast({ title: "Error", description: result.error, type: "error" });
    }
    setMilestoneLoading(false);
  };

  const handleToggleMilestone = async (milestoneId: string, isCompleted: boolean) => {
    // Optimistic Update
    setMilestones(
      milestones.map((m) => (m.id === milestoneId ? { ...m, isCompleted } : m))
    );
    const result = await toggleMilestoneAction(milestoneId, isCompleted, projectId);

    if (result.success) {
      toast({ title: "Milestone Updated", description: result.message, type: "success" });
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast({ title: "Update Failed", description: result.error, type: "error" });
      setMilestones(initialMilestones);
    }
  };

  // 3. Resource operations
  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle.trim() || !resourceUrl.trim()) return;

    setResourceLoading(true);
    const result = await createResourceAction(projectId, resourceTitle, resourceUrl, resourceType);

    if (result.success) {
      toast({ title: "Resource Added", description: result.message, type: "success" });
      setResourceOpen(false);
      setResourceTitle("");
      setResourceUrl("");
      window.location.reload();
    } else {
      toast({ title: "Error", description: result.error, type: "error" });
    }
    setResourceLoading(false);
  };

  const handleDeleteResource = async (resId: string) => {
    setResources(resources.filter((r) => r.id !== resId));
    const result = await deleteResourceAction(resId, projectId);
    if (result.success) {
      toast({ title: "Resource Removed", description: result.message, type: "success" });
    } else {
      toast({ title: "Failed to Delete", description: result.error, type: "error" });
      setResources(initialResources);
    }
  };

  // Calculate milestone progress
  const completedMilestones = milestones.filter((m) => m.isCompleted).length;
  const milestoneProgress =
    milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

  // Group tasks by status
  const columns = [
    { id: "TODO", title: "To Do", border: "border-t-slate-500" },
    { id: "IN_PROGRESS", title: "In Progress", border: "border-t-cobalt" },
    { id: "REVIEW", title: "Review", border: "border-t-amber" },
    { id: "DONE", title: "Completed", border: "border-t-mint" },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-mint tracking-wider uppercase">Project Workspace</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">{projectTitle}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setTaskOpen(true)} className="text-xs font-semibold h-10">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Task
          </Button>
          <Button variant="secondary" onClick={() => setMilestoneOpen(true)} className="text-xs font-semibold h-10">
            <Plus className="h-4 w-4 mr-1.5" />
            Milestone
          </Button>
          <Button variant="secondary" onClick={() => setResourceOpen(true)} className="text-xs font-semibold h-10">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Resource
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Kanban Board Area - 3 columns width on desktop */}
        <div className="xl:col-span-3 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-cobalt" />
            Task Board
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            {columns.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);

              return (
                <div key={col.id} className={`bg-deepslate/30 border border-border rounded-xl flex flex-col p-4 min-h-[350px] border-t-4 ${col.border}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white text-xs uppercase tracking-wider">{col.title}</h3>
                    <span className="text-xs bg-deepslate border border-border px-2 py-0.5 rounded text-muted-foreground font-semibold">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3 overflow-y-auto max-h-[500px]">
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-deepslate border border-border p-4 rounded-lg flex flex-col justify-between hover:border-cobalt/40 transition-colors gap-3"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-white line-clamp-2 leading-relaxed">{task.title}</h4>
                            <span
                              className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                task.priority === "HIGH"
                                  ? "bg-coral/10 text-coral border border-coral/20"
                                  : task.priority === "MEDIUM"
                                  ? "bg-amber/10 text-amber border border-amber/20"
                                  : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                          <div className="h-6 w-6 rounded-full bg-cobalt/15 border border-cobalt/25 text-white font-bold text-[10px] flex items-center justify-center" title={task.assignee?.profile?.fullName || "Unassigned"}>
                            {task.assignee?.profile?.fullName.charAt(0) || "?"}
                          </div>

                          <Select
                            value={task.status}
                            onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                            className="w-[100px] h-7 text-[10px] px-1 bg-deepslate py-0"
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="REVIEW">Review</option>
                            <option value="DONE">Completed</option>
                          </Select>
                        </div>
                      </div>
                    ))}

                    {colTasks.length === 0 && (
                      <div className="py-8 text-center text-[10px] text-muted-foreground border border-dashed border-border/80 rounded-lg">
                        Empty column
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Milestones, Resources, Activity Logs */}
        <div className="space-y-8">
          {/* Milestones Tracker */}
          <div className="bg-deepslate/35 border border-border p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">Milestones Progress</h3>
              <span className="text-xs font-bold text-mint">{milestoneProgress}%</span>
            </div>
            <div className="w-full bg-border rounded-full h-1.5">
              <div
                className="bg-mint h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${milestoneProgress}%` }}
              />
            </div>

            <div className="space-y-2 pt-2">
              {milestones.map((m) => (
                <div key={m.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-ink/20 border border-border/60">
                  <input
                    type="checkbox"
                    checked={m.isCompleted}
                    onChange={(e) => handleToggleMilestone(m.id, e.target.checked)}
                    className="h-4 w-4 rounded border-border text-cobalt focus:ring-cobalt cursor-pointer bg-deepslate shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className={`text-xs font-semibold truncate ${m.isCompleted ? "line-through text-muted-foreground" : "text-white"}`}>
                      {m.title}
                    </h4>
                  </div>
                </div>
              ))}

              {milestones.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No milestones created.</p>
              )}
            </div>
          </div>

          {/* Uploaded Resources links */}
          <div className="bg-deepslate/35 border border-border p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Shared Resource Assets</h3>
            <div className="space-y-2">
              {resources.map((res) => {
                const isRepo = res.type === "REPO";
                const isDoc = res.type === "DOC";

                return (
                  <div
                    key={res.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-ink/20 hover:border-cobalt/40 transition-colors group"
                  >
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 min-w-0 text-xs text-muted-foreground hover:text-white transition-colors"
                    >
                      {isRepo ? (
                        <Github className="h-4 w-4 text-cloud shrink-0" />
                      ) : isDoc ? (
                        <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                      ) : (
                        <LinkIcon className="h-4 w-4 text-mint shrink-0" />
                      )}
                      <span className="truncate">{res.title}</span>
                    </a>

                    <button
                      onClick={() => handleDeleteResource(res.id)}
                      className="text-muted-foreground hover:text-coral opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}

              {resources.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No links uploaded yet.</p>
              )}
            </div>
          </div>

          {/* Project Activity Log Feed */}
          <div className="bg-deepslate/35 border border-border p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Activity Feed</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {activities.map((act) => (
                <div key={act.id} className="text-[11px] leading-relaxed border-b border-border/40 pb-2 last:border-0 last:pb-0">
                  <p className="text-cloud">{act.details}</p>
                  <span className="text-[9px] text-muted-foreground mt-0.5 block">
                    {new Date(act.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}

              {activities.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No activity logged.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <Dialog isOpen={taskOpen} onClose={() => setTaskOpen(false)}>
        <DialogTitle>Create Task</DialogTitle>
        <DialogDescription>Assign a new item to team co-members.</DialogDescription>
        <form onSubmit={handleAddTask} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Task Title</label>
            <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="e.g. Design user profiles view" required disabled={taskLoading} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Description</label>
            <textarea
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              placeholder="Describe what needs to be implemented..."
              className="flex min-h-[80px] w-full rounded-lg border border-border bg-deepslate px-3 py-2 text-sm text-cloud ring-offset-ink placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
              disabled={taskLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Assignee</label>
              <Select value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)} disabled={taskLoading}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user.profile?.fullName} (@{m.user.profile?.username})
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Priority</label>
              <Select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)} disabled={taskLoading}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Due Date (Optional)</label>
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="flex h-11 w-full rounded-lg border border-border bg-deepslate px-3 py-2 text-sm text-cloud ring-offset-ink focus-visible:outline-none"
              disabled={taskLoading}
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setTaskOpen(false)} disabled={taskLoading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={taskLoading}>
              {taskLoading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Add Milestone Modal */}
      <Dialog isOpen={milestoneOpen} onClose={() => setMilestoneOpen(false)}>
        <DialogTitle>Add Project Milestone</DialogTitle>
        <DialogDescription>Define a major check-point for the timeline.</DialogDescription>
        <form onSubmit={handleAddMilestone} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Milestone Title</label>
            <Input value={milestoneTitle} onChange={(e) => setMilestoneTitle(e.target.value)} placeholder="e.g. Launch Beta to testers" required disabled={milestoneLoading} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Description</label>
            <Input value={milestoneDesc} onChange={(e) => setMilestoneDesc(e.target.value)} placeholder="e.g. Release Apple Testflight and APK" disabled={milestoneLoading} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Due Date (Optional)</label>
            <input
              type="date"
              value={milestoneDate}
              onChange={(e) => setMilestoneDate(e.target.value)}
              className="flex h-11 w-full rounded-lg border border-border bg-deepslate px-3 py-2 text-sm text-cloud ring-offset-ink focus-visible:outline-none"
              disabled={milestoneLoading}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setMilestoneOpen(false)} disabled={milestoneLoading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={milestoneLoading}>
              {milestoneLoading ? "Adding..." : "Add Milestone"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Add Resource Modal */}
      <Dialog isOpen={resourceOpen} onClose={() => setResourceOpen(false)}>
        <DialogTitle>Add Shared Resource Asset</DialogTitle>
        <DialogDescription>Link code repositories, UI drafts, or files.</DialogDescription>
        <form onSubmit={handleAddResource} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Asset Title</label>
            <Input value={resourceTitle} onChange={(e) => setResourceTitle(e.target.value)} placeholder="e.g. Figma Layouts" required disabled={resourceLoading} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Asset URL</label>
            <Input value={resourceUrl} onChange={(e) => setResourceUrl(e.target.value)} placeholder="https://figma.com/..." required disabled={resourceLoading} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Asset Type</label>
            <Select value={resourceType} onChange={(e) => setResourceType(e.target.value)} disabled={resourceLoading}>
              <option value="LINK">Web Link</option>
              <option value="REPO">Repository</option>
              <option value="DOC">Document</option>
            </Select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setResourceOpen(false)} disabled={resourceLoading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={resourceLoading}>
              {resourceLoading ? "Uploading..." : "Add Asset"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
