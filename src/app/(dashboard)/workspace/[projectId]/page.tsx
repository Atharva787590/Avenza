import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { WorkspaceView } from "@/components/WorkspaceView";

interface WorkspacePageProps {
  params: Promise<{ projectId: string }>;
}

export default async function WorkspacePage(props: WorkspacePageProps) {
  const params = await props.params;
  const { projectId } = params;
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // 1. Verify user membership in project
  const membership = await db.projectMember.findFirst({
    where: {
      projectId,
      userId: session.userId,
    },
  });

  if (!membership) {
    // Redirect to project details page with warning
    redirect(`/projects/${projectId}?error=unauthorized`);
  }

  // 2. Fetch project workspace details
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      tasks: {
        include: {
          assignee: {
            include: { profile: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      milestones: {
        orderBy: { dueDate: "asc" },
      },
      resources: {
        orderBy: { title: "asc" },
      },
      members: {
        include: {
          user: {
            include: { profile: true },
          },
        },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 15,
      },
    },
  });

  if (!project) {
    redirect("/dashboard");
  }

  return (
    <WorkspaceView
      projectId={project.id}
      projectTitle={project.title}
      initialTasks={project.tasks}
      initialMilestones={project.milestones}
      initialResources={project.resources}
      members={project.members}
      activities={project.activities}
    />
  );
}
