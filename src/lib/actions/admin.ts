"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Helper to verify if user is authorized for admin actions
async function verifyAdminAccess() {
  const session = await getSession();
  if (!session) return null;
  const isAuthorized = session.role === "ADMIN" || session.role === "MODERATOR";
  return isAuthorized ? session : null;
}

export async function resolveReportAction(reportId: string) {
  const session = await verifyAdminAccess();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db.moderationReport.update({
      where: { id: reportId },
      data: { status: "RESOLVED" },
    });

    revalidatePath("/admin");
    return { success: true, message: "Moderation report marked as resolved." };
  } catch (error) {
    console.error("Error resolving report:", error);
    return { success: false, error: "Failed to resolve report." };
  }
}

export async function toggleUserRoleAction(targetUserId: string, newRole: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Only admins can change user roles." };
  }

  try {
    await db.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });

    revalidatePath("/admin");
    return { success: true, message: `User role updated to ${newRole}.` };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role." };
  }
}
