"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function sendMessageAction(receiverId: string, content: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  if (!content.trim()) return { success: false, error: "Message content is empty." };

  try {
    // 1. Verify that they are accepted connections
    const connection = await db.connection.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { senderId: session.userId, receiverId },
          { senderId: receiverId, receiverId: session.userId },
        ],
      },
    });

    if (!connection) {
      return { success: false, error: "You can only message accepted connections." };
    }

    // 2. Create message
    const msg = await db.message.create({
      data: {
        senderId: session.userId,
        receiverId,
        content: content.trim(),
      },
    });

    // Create a message notification for the receiver
    const senderProfile = await db.profile.findUnique({
      where: { userId: session.userId },
    });

    await db.notification.create({
      data: {
        userId: receiverId,
        title: "New Chat Message",
        content: `New message from ${senderProfile?.fullName || "A peer"}: "${content.substring(0, 30)}..."`,
        type: "MESSAGE",
        link: "/messages",
      },
    });

    revalidatePath("/messages");
    return { success: true, message: msg };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Failed to send message." };
  }
}
