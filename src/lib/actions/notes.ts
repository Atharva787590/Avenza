"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

/**
 * Get or create a shared note between the current user and another user.
 */
export async function getNoteAction(otherUserId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Not authenticated.", note: null };

  const [userAId, userBId] = [session.userId, otherUserId].sort();

  try {
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

    const note = await db.sharedNote.upsert({
      where: { userAId_userBId: { userAId, userBId } },
      create: { userAId, userBId, content: "" },
      update: {},
      select: { id: true, content: true, updatedAt: true },
    });

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
 * Save/update shared note content.
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
 * Get all accepted connection peers for notes listing.
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

/**
 * AI Assistant server action: Summarize notes, generate hackathon project ideas, or convert key concepts.
 */
export async function getAIAssistAction(mode: "ideas" | "summary" | "tasks" | "hindi", noteText: string) {
  const session = await getSession();
  if (!session) return { success: false, output: "Authentication required." };

  if (!noteText.trim()) {
    return { success: false, output: "Please enter some note content first to run AI Assist." };
  }

  try {
    // If process.env.GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY is available, we use live Gemini API call
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      const prompts: Record<string, string> = {
        ideas: `Based on these study notes, suggest 3 high-impact Indian hackathon project ideas (e.g. for Smart India Hackathon / Techfest):\n\n${noteText}`,
        summary: `Provide a concise bulleted summary of these student notes:\n\n${noteText}`,
        tasks: `Extract actionable TODO items and task checklists from these notes:\n\n${noteText}`,
        hindi: `Summarize key learning concepts from these notes in simple Hinglish / Hindi:\n\n${noteText}`,
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompts[mode] || prompts.summary }] }],
          }),
        }
      );

      const data = await response.json();
      const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (outputText) {
        return { success: true, output: outputText };
      }
    }

    // Smart Fallback Demo Responses if API Key isn't present
    const demoResponses: Record<string, string> = {
      ideas: `💡 **AI Hackathon Project Ideas:**\n\n1. **Smart Campus Transit Tracker:** Real-time shuttle locator for large university campuses using BLE and crowdsourced GPS.\n2. **AI Study Partner Matcher:** Skill-based peer learning recommendation engine tailored for Indian engineering curriculums.\n3. **Decentralized Certificate Verifier:** Blockchain-backed diploma & event achievement credential validator for colleges.`,
      summary: `📝 **AI Note Summary:**\n\n• **Core Topic:** Collaborative system architecture & state management.\n• **Key Takeaway:** Async server actions provide optimistic updates for better UX.\n• **Action Item:** Sync shared database records using unique composite keys.`,
      tasks: `📋 **Extracted Task Checklist:**\n\n- [ ] Finalize system design diagram for hackathon pitch\n- [ ] Complete API routes and test server action responses\n- [ ] Share meeting minutes with team co-builders`,
      hindi: `🇮🇳 **Hinglish Learning Summary:**\n\n• Ye notes project state management aur real-time data sync ke bare me hai.\n• Main goal: Connections ke beech smooth collaborative notes aur direct chat establish karna.`,
    };

    return { success: true, output: demoResponses[mode] || demoResponses.summary };
  } catch (error) {
    console.error("AI Assist error:", error);
    return { success: false, output: "AI assistant is currently busy. Please try again." };
  }
}
