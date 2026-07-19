import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleProjectApplicationAction } from "@/lib/actions/projects";
import { ProjectApplyButton } from "@/components/ProjectApplyButton";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Globe,
  Users,
  CheckCircle,
} from "lucide-react";
import { Github } from "@/components/BrandIcons";

interface ProjectDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailsPage(props: ProjectDetailsPageProps) {
  const params = await props.params;
  const { id } = params;
  const session = await getSession();
  if (!session) return null;

  // 1. Fetch project details
  const project = await db.project.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: { include: { profile: true } },
        },
      },
      applicants: {
        include: {
          user: { include: { profile: true } },
        },
      },
      milestones: true,
      resources: true,
    },
  });

  if (!project) {
    notFound();
  }

  const isOwner = project.ownerId === session.userId;
  const isMember = project.members.some((m) => m.userId === session.userId);
  const pendingApplication = project.applicants.find(
    (a) => a.userId === session.userId && a.status === "PENDING"
  );

  const ownerProfile = project.members.find((m) => m.role === "LEAD")?.user.profile;

  // Extract roles needed from project properties (e.g. mock list or read from applications)
  const defaultRolesPool = ["Frontend Dev", "Backend Engineer", "UI/UX Designer", "Marketing Specialist"];

  return (
    <div className="space-y-8 pb-16">
      {/* Project Header Banner */}
      <div className="bg-deepslate/35 border border-border rounded-2xl overflow-hidden shadow-lg shadow-ink/40">
        <div className="h-32 bg-gradient-to-r from-deepslate via-indigo-950/20 to-cobalt/20" />
        <div className="px-8 pb-8 pt-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 -mt-8">
            <div className="h-16 w-16 rounded-xl bg-cobalt flex items-center justify-center font-bold text-2xl text-white shadow-xl relative z-10">
              {project.title.charAt(0)}
            </div>
            <div className="text-center md:text-left min-w-0">
              <span className="text-xs font-semibold text-mint tracking-wider uppercase">
                {project.category}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">
                {project.title}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Timeline: {project.timeline}
              </p>
            </div>
          </div>

          {/* Contextual Actions */}
          <div className="w-full md:w-auto shrink-0">
            {isMember ? (
              <Link href={`/workspace/${project.id}`}>
                <Button variant="primary" className="w-full font-semibold flex items-center justify-center gap-2">
                  Enter Team Workspace
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            ) : pendingApplication ? (
              <Button variant="secondary" disabled className="w-full font-semibold">
                Application Pending
              </Button>
            ) : (
              <ProjectApplyButton
                projectId={project.id}
                projectTitle={project.title}
                rolesNeeded={defaultRolesPool}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description, Milestones, Owner applications */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="bg-deepslate/50 border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Project Details</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>

          {/* Milestones */}
          <div className="bg-deepslate/50 border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Project Milestones</h2>
            <div className="space-y-3">
              {project.milestones.map((m) => (
                <div key={m.id} className="flex items-start gap-3 p-3 border border-border/80 bg-ink/10 rounded-xl">
                  <div className={`mt-0.5 shrink-0 ${m.isCompleted ? "text-mint" : "text-muted-foreground"}`}>
                    <CheckCircle className="h-5 w-5" fill={m.isCompleted ? "rgba(102,227,196,0.1)" : "none"} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{m.title}</h4>
                    {m.description && <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>}
                  </div>
                </div>
              ))}

              {project.milestones.length === 0 && (
                <p className="text-xs text-muted-foreground">No milestones created for this project.</p>
              )}
            </div>
          </div>

          {/* Review Applications - Owner Only */}
          {isOwner && (
            <div className="bg-deepslate/50 border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-mint" />
                Review Applications ({project.applicants.filter((a) => a.status === "PENDING").length})
              </h2>

              <div className="space-y-4">
                {project.applicants
                  .filter((a) => a.status === "PENDING")
                  .map((app) => (
                    <div
                      key={app.id}
                      className="p-4 border border-border rounded-xl bg-ink/20 flex flex-col justify-between gap-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-cobalt/15 border border-cobalt/35 flex items-center justify-center font-bold text-white text-sm">
                            {app.user.profile!.fullName.charAt(0)}
                          </div>
                          <div>
                            <Link href={`/people/${app.user.profile!.username}`}>
                              <h4 className="font-bold text-white hover:text-cobalt transition-colors">
                                {app.user.profile!.fullName}
                              </h4>
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              Applied for: <span className="text-white font-medium">{app.roleApplied}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <form action={async () => {
                            "use server";
                            await handleProjectApplicationAction(app.id, "ACCEPT");
                          }}>
                            <Button type="submit" variant="success" size="sm" className="text-xs font-semibold">
                              Accept
                            </Button>
                          </form>
                          <form action={async () => {
                            "use server";
                            await handleProjectApplicationAction(app.id, "REJECT");
                          }}>
                            <Button type="submit" variant="destructive" size="sm" className="text-xs font-semibold">
                              Decline
                            </Button>
                          </form>
                        </div>
                      </div>

                      {app.message && (
                        <p className="text-xs text-muted-foreground bg-deepslate/80 p-3 rounded-lg border border-border/60">
                          {app.message}
                        </p>
                      )}
                    </div>
                  ))}

                {project.applicants.filter((a) => a.status === "PENDING").length === 0 && (
                  <p className="text-xs text-muted-foreground">No pending user applications.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Owner profile, Repos, Team Members */}
        <div className="space-y-8">
          {/* Creator Profile */}
          <div className="bg-deepslate/50 border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Project Lead</h3>
            {ownerProfile ? (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-cobalt/15 border border-cobalt/35 flex items-center justify-center font-bold text-white text-sm">
                  {ownerProfile.fullName.charAt(0)}
                </div>
                <div>
                  <Link href={`/people/${ownerProfile.username}`}>
                    <h4 className="font-bold text-white hover:text-cobalt transition-colors text-sm">
                      {ownerProfile.fullName}
                    </h4>
                  </Link>
                  <p className="text-[11px] text-muted-foreground">{ownerProfile.college}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Lead info not found.</p>
            )}
          </div>

          {/* External Project Links */}
          <div className="bg-deepslate/50 border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Project Assets</h3>
            <div className="space-y-3">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  <Github className="h-5 w-5 text-cloud" />
                  GitHub Repository
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  <Globe className="h-5 w-5 text-mint" />
                  Live Product Demo
                </a>
              )}
              {!project.githubUrl && !project.demoUrl && (
                <p className="text-xs text-muted-foreground">No links provided.</p>
              )}
            </div>
          </div>

          {/* Project Members list */}
          <div className="bg-deepslate/50 border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-cobalt" />
              Active Team ({project.members.length})
            </h3>
            <div className="space-y-3">
              {project.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-3 border-b border-border/40 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-cobalt/15 border border-cobalt/35 flex items-center justify-center font-bold text-white text-xs shrink-0">
                      {member.user.profile!.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/people/${member.user.profile!.username}`}>
                        <h4 className="font-semibold text-white hover:text-cobalt transition-colors text-xs truncate">
                          {member.user.profile!.fullName}
                        </h4>
                      </Link>
                      <p className="text-[10px] text-muted-foreground truncate">
                        @{member.user.profile!.username}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-mint bg-mint/5 border border-mint/20 px-2 py-0.5 rounded uppercase">
                    {member.role.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
