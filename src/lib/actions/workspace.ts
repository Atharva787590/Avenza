"use server";


import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Helper to verify if user is a member of the project
async function verifyMembership(userId: string, projectId: string) {
  const membership = await db.projectMember.findFirst({
    where: { projectId, userId },
  });
  return !!membership;
}

export async function createTaskAction(
  projectId: string,
  title: string,
  description?: string,
  assigneeId?: string,
  priority: string = "MEDIUM",
  dueDateStr?: string
) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const isMember = await verifyMembership(session.userId, projectId);
  if (!isMember) return { success: false, error: "You are not a member of this project." };

  try {
    const dueDate = dueDateStr ? new Date(dueDateStr) : null;

    const task = await db.$transaction(async (tx) => {
      const t = await tx.task.create({
        data: {
          projectId,
          assigneeId: assigneeId || null,
          title,
          description: description || null,
          status: "TODO",
          priority,
          dueDate,
        },
      });

      // Log activity
      const profile = await tx.profile.findUnique({
        where: { userId: session.userId },
      });

      await tx.activityEvent.create({
        data: {
          projectId,
          actorId: session.userId,
          actionType: "TASK_CREATE",
          details: `${profile?.fullName || "A peer"} created task: "${title}".`,
        },
      });

      return t;
    });

    revalidatePath(`/workspace/${projectId}`);
    return { success: true, message: "Task created successfully.", taskId: task.id };
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false, error: "Failed to create task." };
  }
}

export async function updateTaskStatusAction(taskId: string, status: string, projectId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const isMember = await verifyMembership(session.userId, projectId);
  if (!isMember) return { success: false, error: "You are not a member of this project." };

  try {
    const originalTask = await db.task.findUnique({ where: { id: taskId } });
    if (!originalTask) return { success: false, error: "Task not found." };

    await db.$transaction(async (tx) => {
      await tx.task.update({
        where: { id: taskId },
        data: { status },
      });

      // Log activity if completed or moved
      const profile = await tx.profile.findUnique({
        where: { userId: session.userId },
      });

      let details = `${profile?.fullName || "A peer"} moved task "${originalTask.title}" to ${status.replace("_", " ")}.`;
      let actionType = "TASK_MOVE";

      if (status === "DONE") {
        details = `${profile?.fullName || "A peer"} completed task: "${originalTask.title}".`;
        actionType = "TASK_COMPLETE";
      }

      await tx.activityEvent.create({
        data: {
          projectId,
          actorId: session.userId,
          actionType,
          details,
        },
      });
    });

    revalidatePath(`/workspace/${projectId}`);
    return { success: true, message: "Task status updated." };
  } catch (error) {
    console.error("Error updating task:", error);
    return { success: false, error: "Failed to update task status." };
  }
}

export async function createMilestoneAction(projectId: string, title: string, description?: string, dueDateStr?: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const isMember = await verifyMembership(session.userId, projectId);
  if (!isMember) return { success: false, error: "You are not a member of this project." };

  try {
    const dueDate = dueDateStr ? new Date(dueDateStr) : null;

    await db.$transaction(async (tx) => {
      await tx.milestone.create({
        data: {
          projectId,
          title,
          description: description || null,
          dueDate,
        },
      });

      // Log activity
      const profile = await tx.profile.findUnique({
        where: { userId: session.userId },
      });

      await tx.activityEvent.create({
        data: {
          projectId,
          actorId: session.userId,
          actionType: "MILESTONE_CREATE",
          details: `${profile?.fullName || "A peer"} added project milestone: "${title}".`,
        },
      });
    });

    revalidatePath(`/workspace/${projectId}`);
    return { success: true, message: "Milestone added successfully." };
  } catch (error) {
    console.error("Error creating milestone:", error);
    return { success: false, error: "Failed to create milestone." };
  }
}

export async function toggleMilestoneAction(milestoneId: string, isCompleted: boolean, projectId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const isMember = await verifyMembership(session.userId, projectId);
  if (!isMember) return { success: false, error: "You are not a member of this project." };

  try {
    const milestone = await db.milestone.findUnique({ where: { id: milestoneId } });
    if (!milestone) return { success: false, error: "Milestone not found." };

    await db.$transaction(async (tx) => {
      await tx.milestone.update({
        where: { id: milestoneId },
        data: { isCompleted },
      });

      // Log activity
      const profile = await tx.profile.findUnique({
        where: { userId: session.userId },
      });

      const details = isCompleted
        ? `${profile?.fullName || "A peer"} reached milestone: "${milestone.title}"!`
        : `${profile?.fullName || "A peer"} unmarked milestone: "${milestone.title}".`;

      await tx.activityEvent.create({
        data: {
          projectId,
          actorId: session.userId,
          actionType: isCompleted ? "MILESTONE_REACH" : "MILESTONE_UNREACH",
          details,
        },
      });
    });

    revalidatePath(`/workspace/${projectId}`);
    return { success: true, message: "Milestone status updated." };
  } catch (error) {
    console.error("Error toggling milestone:", error);
    return { success: false, error: "Failed to update milestone." };
  }
}

export async function createResourceAction(projectId: string, title: string, url: string, type: string = "LINK") {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const isMember = await verifyMembership(session.userId, projectId);
  if (!isMember) return { success: false, error: "You are not a member of this project." };

  try {
    await db.$transaction(async (tx) => {
      await tx.projectResource.create({
        data: {
          projectId,
          title,
          url,
          type,
        },
      });

      // Log activity
      const profile = await tx.profile.findUnique({
        where: { userId: session.userId },
      });

      await tx.activityEvent.create({
        data: {
          projectId,
          actorId: session.userId,
          actionType: "RESOURCE_ADD",
          details: `${profile?.fullName || "A peer"} uploaded resource asset: "${title}".`,
        },
      });
    });

    revalidatePath(`/workspace/${projectId}`);
    return { success: true, message: "Resource added successfully." };
  } catch (error) {
    console.error("Error creating resource:", error);
    return { success: false, error: "Failed to add resource asset." };
  }
}

export async function deleteResourceAction(resourceId: string, projectId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const isMember = await verifyMembership(session.userId, projectId);
  if (!isMember) return { success: false, error: "You are not a member of this project." };

  try {
    await db.projectResource.delete({
      where: { id: resourceId },
    });

    revalidatePath(`/workspace/${projectId}`);
    return { success: true, message: "Resource asset removed." };
  } catch (error) {
    console.error("Error deleting resource:", error);
    return { success: false, error: "Failed to delete resource asset." };
  }
}
