"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function handleSessionAction(sessionId: string, action: "ACCEPT" | "DECLINE" | "COMPLETE") {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const mentorship = await db.mentorshipSession.findUnique({
      where: { id: sessionId },
    });

    if (!mentorship) {
      return { success: false, error: "Session request not found." };
    }

    // Accept / Decline are mentor-only actions
    if (action === "ACCEPT" || action === "DECLINE") {
      if (mentorship.mentorId !== session.userId) {
        return { success: false, error: "Only the requested mentor can accept or decline this session." };
      }

      const status = action === "ACCEPT" ? "ACCEPTED" : "DECLINED";
      await db.mentorshipSession.update({
        where: { id: sessionId },
        data: { status },
      });

      const mentorProfile = await db.profile.findUnique({
        where: { userId: session.userId },
      });

      // Notify the requester
      await db.notification.create({
        data: {
          userId: mentorship.requesterId,
          title: action === "ACCEPT" ? "Session Request Approved" : "Session Request Update",
          content: `${mentorProfile?.fullName || "A peer"} has ${action.toLowerCase()}ed your mentorship session request regarding "${mentorship.topic}".`,
          type: "SESSION",
          link: "/sessions",
        },
      });

      revalidatePath("/sessions");
      return { success: true, message: `Session request successfully ${action.toLowerCase()}ed.` };
    }

    // Complete can be done by either participant if session is ACCEPTED
    if (action === "COMPLETE") {
      if (mentorship.status !== "ACCEPTED") {
        return { success: false, error: "Only accepted sessions can be marked completed." };
      }

      if (mentorship.requesterId !== session.userId && mentorship.mentorId !== session.userId) {
        return { success: false, error: "You are not a participant in this session." };
      }

      await db.mentorshipSession.update({
        where: { id: sessionId },
        data: { status: "COMPLETED" },
      });

      // Notify the other participant
      const otherUserId = mentorship.requesterId === session.userId ? mentorship.mentorId : mentorship.requesterId;
      const actorProfile = await db.profile.findUnique({
        where: { userId: session.userId },
      });

      await db.notification.create({
        data: {
          userId: otherUserId,
          title: "Session Marked Completed",
          content: `${actorProfile?.fullName || "A peer"} marked your session on "${mentorship.topic}" as completed.`,
          type: "SESSION",
          link: "/sessions",
        },
      });

      revalidatePath("/sessions");
      return { success: true, message: "Session marked completed. Keep co-building!" };
    }

    return { success: false, error: "Invalid action." };
  } catch (error) {
    console.error("Error updating mentorship session:", error);
    return { success: false, error: "Failed to update session." };
  }
}
