"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function markAllNotificationsReadAction() {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db.notification.updateMany({
      where: { userId: session.userId, isRead: false },
      data: { isRead: true },
    });

    revalidatePath("/notifications");
    revalidatePath("/dashboard");
    return { success: true, message: "All notifications marked as read." };
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return { success: false, error: "Failed to update notifications." };
  }
}

export async function markSingleNotificationReadAction(notificationId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db.notification.update({
      where: { id: notificationId, userId: session.userId },
      data: { isRead: true },
    });

    revalidatePath("/notifications");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating single notification:", error);
    return { success: false, error: "Failed to mark notification read." };
  }
}
