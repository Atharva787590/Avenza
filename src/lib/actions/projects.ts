"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const createProjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").trim(),
  description: z.string().min(20, "Description must be at least 20 characters").trim(),
  category: z.string().min(2, "Category is required").trim(),
  timeline: z.string().min(2, "Timeline is required").trim(),
  githubUrl: z.string().url("Invalid GitHub URL").or(z.literal("")).optional(),
  demoUrl: z.string().url("Invalid Demo URL").or(z.literal("")).optional(),
  roles: z.array(z.string()).min(1, "Please enter at least one co-builder role needed"),
});

export async function createProjectAction(formDataJSON: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const rawData = JSON.parse(formDataJSON);
    const result = createProjectSchema.safeParse(rawData);

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0].message,
      };
    }

    const data = result.data;

    // Create project and owner member in transaction
    const project = await db.$transaction(async (tx) => {
      const proj = await tx.project.create({
        data: {
          ownerId: session.userId,
          title: data.title,
          description: data.description,
          category: data.category,
          timeline: data.timeline,
          githubUrl: data.githubUrl || null,
          demoUrl: data.demoUrl || null,
          members: {
            create: {
              userId: session.userId,
              role: "LEAD",
            },
          },
          // Seed initial activity log
          activities: {
            create: {
              actorId: session.userId,
              actionType: "MEMBER_JOIN",
              details: `${session.fullName || "Owner"} created the project opportunity.`,
            },
          },
        },
      });

      return proj;
    });

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { success: true, projectId: project.id, message: "Project opportunity launched successfully!" };
  } catch (error) {
    console.error("Error creating project:", error);
    return { success: false, error: "Failed to create project." };
  }
}

export async function applyToProjectAction(projectId: string, roleApplied: string, message?: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });

    if (!project) {
      return { success: false, error: "Project not found." };
    }

    // Check if user is already a member
    const isMember = project.members.some((m) => m.userId === session.userId);
    if (isMember) {
      return { success: false, error: "You are already a member of this project." };
    }

    // Check if there is already a pending application
    const existing = await db.projectApplication.findFirst({
      where: {
        projectId,
        userId: session.userId,
        status: "PENDING",
      },
    });

    if (existing) {
      return { success: false, error: "You already have a pending application for this project." };
    }

    // Create application
    await db.projectApplication.create({
      data: {
        projectId,
        userId: session.userId,
        roleApplied,
        message,
        status: "PENDING",
      },
    });

    // Notify the project owner
    const applicantProfile = await db.profile.findUnique({
      where: { userId: session.userId },
    });

    await db.notification.create({
      data: {
        userId: project.ownerId,
        title: "New Project Application",
        content: `${applicantProfile?.fullName || "A peer"} applied for ${roleApplied} on ${project.title}.`,
        type: "APPLICATION",
        link: `/projects/${projectId}`,
      },
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true, message: "Application submitted successfully." };
  } catch (error) {
    console.error("Error applying to project:", error);
    return { success: false, error: "Failed to submit project application." };
  }
}

export async function handleProjectApplicationAction(applicationId: string, action: "ACCEPT" | "REJECT") {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const application = await db.projectApplication.findUnique({
      where: { id: applicationId },
      include: {
        project: true,
      },
    });

    if (!application) {
      return { success: false, error: "Application not found." };
    }

    if (application.project.ownerId !== session.userId) {
      return { success: false, error: "Only the project owner can review applications." };
    }

    if (application.status !== "PENDING") {
      return { success: false, error: "This application has already been processed." };
    }

    if (action === "ACCEPT") {
      await db.$transaction(async (tx) => {
        // Update application
        await tx.projectApplication.update({
          where: { id: applicationId },
          data: { status: "ACCEPTED" },
        });

        // Add user as project member
        await tx.projectMember.create({
          data: {
            projectId: application.projectId,
            userId: application.userId,
            role: application.roleApplied,
          },
        });

        // Add project activity log
        const memberProfile = await tx.profile.findUnique({
          where: { userId: application.userId },
        });

        await tx.activityEvent.create({
          data: {
            projectId: application.projectId,
            actorId: application.userId,
            actionType: "MEMBER_JOIN",
            details: `${memberProfile?.fullName || "User"} joined the team as ${application.roleApplied}.`,
          },
        });

        // Notify user
        await tx.notification.create({
          data: {
            userId: application.userId,
            title: "Project Application Accepted",
            content: `You have been accepted into ${application.project.title} as ${application.roleApplied}!`,
            type: "APPLICATION",
            link: `/workspace/${application.projectId}`,
          },
        });
      });

      revalidatePath(`/projects/${application.projectId}`);
      revalidatePath(`/workspace/${application.projectId}`);
      return { success: true, message: "Application accepted. Co-builder added to project workspace!" };
    } else {
      await db.projectApplication.update({
        where: { id: applicationId },
        data: { status: "REJECTED" },
      });

      // Notify user
      await db.notification.create({
        data: {
          userId: application.userId,
          title: "Project Application Update",
          content: `Your application for ${application.roleApplied} on ${application.project.title} was declined.`,
          type: "APPLICATION",
          link: `/projects/${application.projectId}`,
        },
      });

      revalidatePath(`/projects/${application.projectId}`);
      return { success: true, message: "Application declined." };
    }
  } catch (error) {
    console.error("Error handling project application:", error);
    return { success: false, error: "Failed to process application." };
  }
}
