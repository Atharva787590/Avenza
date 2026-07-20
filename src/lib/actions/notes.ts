"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

/**
 * Get or create a shared note between the current user and another user.
 * The note is keyed by the sorted pair of userIds to ensure uniqueness
 * regardless of who initiates.
 */
export async function getNoteAction(otherUserId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Not authenticated.", note: null };

  const [userAId, userBId] = [session.userId, otherUserId].sort();

  try {
    // Verify these two users are connected (ACCEPTED connection)
    const connection = await db.connection.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { senderId: session.userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: session.userId },
        ],
      },
      select: { id: true },
    });

    if (!connection) {
      return {
        success: false,
        error: "You can only share notes with connected peers.",
        note: null,
      };
    }

    // Upsert note record — create if doesn't exist
    const note = await db.sharedNote.upsert({
      where: { userAId_userBId: { userAId, userBId } },
      create: { userAId, userBId, content: "" },
      update: {},
      select: { id: true, content: true, updatedAt: true },
    });

    // Fetch the other user's profile for display
    const otherProfile = await db.profile.findUnique({
      where: { userId: otherUserId },
      select: { username: true, fullName: true, college: true },
    });

    return {
      success: true,
      note,
      peer: otherProfile,
    };
  } catch (error) {
    console.error("getNoteAction error:", error);
    return { success: false, error: "Failed to load note.", note: null };
  }
}

/**
 * Save/update the shared note content between two users.
 */
export async function saveNoteAction(otherUserId: string, content: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Not authenticated." };

  const [userAId, userBId] = [session.userId, otherUserId].sort();

  try {
    await db.sharedNote.upsert({
      where: { userAId_userBId: { userAId, userBId } },
      create: { userAId, userBId, content },
      update: { content },
    });

    return { success: true };
  } catch (error) {
    console.error("saveNoteAction error:", error);
    return { success: false, error: "Failed to save note." };
  }
}

/**
 * Get all accepted connections with their shared note (if any) for the
 * current user, for display on the notes index page.
 */
export async function getMyNotePeersAction() {
  const session = await getSession();
  if (!session) return { success: false, peers: [] };

  try {
    const connections = await db.connection.findMany({
      where: {
        status: "ACCEPTED",
        OR: [
          { senderId: session.userId },
          { receiverId: session.userId },
        ],
      },
      select: {
        senderId: true,
        receiverId: true,
        sender: {
          select: {
            id: true,
            profile: {
              select: { username: true, fullName: true, college: true },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            profile: {
              select: { username: true, fullName: true, college: true },
            },
          },
        },
      },
    });

    const peers = connections.map((conn) => {
      const isReceiver = conn.receiverId === session.userId;
      const peer = isReceiver ? conn.sender : conn.receiver;
      return {
        userId: peer.id,
        username: peer.profile?.username ?? "",
        fullName: peer.profile?.fullName ?? "Unknown",
        college: peer.profile?.college ?? "",
      };
    });

    return { success: true, peers };
  } catch (error) {
    console.error("getMyNotePeersAction error:", error);
    return { success: false, peers: [] };
  }
}
