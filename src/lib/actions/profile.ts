"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleSaveProfileAction(targetProfileId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const existing = await db.savedProfile.findFirst({
      where: { userId: session.userId, targetProfileId },
    });

    if (existing) {
      await db.savedProfile.delete({ where: { id: existing.id } });
      revalidatePath("/saved");
      return { success: true, saved: false, message: "Profile removed from bookmarks." };
    } else {
      await db.savedProfile.create({
        data: { userId: session.userId, targetProfileId },
      });
      revalidatePath("/saved");
      return { success: true, saved: true, message: "Profile saved to bookmarks." };
    }
  } catch (error) {
    console.error("Error toggling saved profile:", error);
    return { success: false, error: "Failed to update bookmark status." };
  }
}

export async function toggleSaveProjectAction(projectId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const existing = await db.savedProject.findFirst({
      where: { userId: session.userId, projectId },
    });

    if (existing) {
      await db.savedProject.delete({ where: { id: existing.id } });
      revalidatePath("/saved");
      return { success: true, saved: false, message: "Project removed from bookmarks." };
    } else {
      await db.savedProject.create({
        data: { userId: session.userId, projectId },
      });
      revalidatePath("/saved");
      return { success: true, saved: true, message: "Project saved to bookmarks." };
    }
  } catch (error) {
    console.error("Error toggling saved project:", error);
    return { success: false, error: "Failed to update bookmark status." };
  }
}

export async function sendConnectionRequestAction(receiverId: string, message?: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  if (session.userId === receiverId) {
    return { success: false, error: "You cannot connect with yourself." };
  }

  try {
    // Check if there's already a connection
    const existing = await db.connection.findFirst({
      where: {
        OR: [
          { senderId: session.userId, receiverId },
          { senderId: receiverId, receiverId: session.userId },
        ],
      },
    });

    if (existing) {
      return {
        success: false,
        error: `A connection request already exists. Status: ${existing.status}`,
      };
    }

    // Create Connection Request
    await db.connection.create({
      data: {
        senderId: session.userId,
        receiverId,
        message,
        status: "PENDING",
      },
    });

    // Create Notification for the receiver
    const senderProfile = await db.profile.findUnique({
      where: { userId: session.userId },
    });

    await db.notification.create({
      data: {
        userId: receiverId,
        title: "New Connection Request",
        content: `${senderProfile?.fullName || "A peer"} wants to connect with you.`,
        type: "CONNECTION",
        link: "/connections",
      },
    });

    revalidatePath("/discover");
    revalidatePath("/connections");
    return { success: true, message: "Connection request sent successfully." };
  } catch (error) {
    console.error("Error sending connection request:", error);
    return { success: false, error: "Failed to send connection request." };
  }
}

export async function handleConnectionRequestAction(connectionId: string, action: "ACCEPT" | "DECLINE" | "CANCEL") {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const request = await db.connection.findUnique({
      where: { id: connectionId },
    });

    if (!request) {
      return { success: false, error: "Connection request not found." };
    }

    if (action === "CANCEL") {
      if (request.senderId !== session.userId) {
        return { success: false, error: "Unauthorized to cancel this request." };
      }
      await db.connection.delete({ where: { id: connectionId } });
      revalidatePath("/connections");
      return { success: true, message: "Connection request cancelled." };
    }

    // Accept or Decline (receiver actions)
    if (request.receiverId !== session.userId) {
      return { success: false, error: "Unauthorized to handle this request." };
    }

    if (action === "ACCEPT") {
      await db.connection.update({
        where: { id: connectionId },
        data: { status: "ACCEPTED" },
      });

      // Notify the sender
      const receiverProfile = await db.profile.findUnique({
        where: { userId: session.userId },
      });

      await db.notification.create({
        data: {
          userId: request.senderId,
          title: "Connection Request Accepted",
          content: `${receiverProfile?.fullName || "A peer"} accepted your connection request.`,
          type: "CONNECTION",
          link: `/people/${receiverProfile?.username}`,
        },
      });

      revalidatePath("/connections");
      revalidatePath("/messages");
      return { success: true, message: "Connection request accepted! You can now send messages." };
    } else {
      await db.connection.update({
        where: { id: connectionId },
        data: { status: "DECLINED" },
      });
      revalidatePath("/connections");
      return { success: true, message: "Connection request declined." };
    }
  } catch (error) {
    console.error("Error handling connection request:", error);
    return { success: false, error: "Failed to process request." };
  }
}

export async function requestMentorshipSessionAction(mentorId: string, topic: string, skillsExchanged: string, scheduledAtStr: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  if (session.userId === mentorId) {
    return { success: false, error: "You cannot schedule a session with yourself." };
  }

  try {
    const scheduledAt = new Date(scheduledAtStr);
    if (isNaN(scheduledAt.getTime()) || scheduledAt < new Date()) {
      return { success: false, error: "Please choose a valid future date and time." };
    }

    await db.mentorshipSession.create({
      data: {
        requesterId: session.userId,
        mentorId,
        topic,
        skillsExchanged,
        status: "REQUESTED",
        scheduledAt,
      },
    });

    const requesterProfile = await db.profile.findUnique({
      where: { userId: session.userId },
    });

    await db.notification.create({
      data: {
        userId: mentorId,
        title: "New Session Request",
        content: `${requesterProfile?.fullName || "A peer"} requested a skill exchange session with you.`,
        type: "SESSION",
        link: "/sessions",
      },
    });

    revalidatePath("/sessions");
    return { success: true, message: "Session request sent successfully." };
  } catch (error) {
    console.error("Error scheduling session:", error);
    return { success: false, error: "Failed to schedule session." };
  }
}
