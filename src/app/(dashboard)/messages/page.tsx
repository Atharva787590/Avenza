import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { MessagesView, Message } from "@/components/MessagesView";

export default async function MessagesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // 1. Fetch accepted connections
  const connections = await db.connection.findMany({
    where: {
      status: "ACCEPTED",
      OR: [
        { senderId: session.userId },
        { receiverId: session.userId },
      ],
    },
    include: {
      sender: { include: { profile: true } },
      receiver: { include: { profile: true } },
    },
  });

  // Extract profiles of connected peers
  const peers = connections.map((c) => {
    const isSender = c.senderId === session.userId;
    const peerUser = isSender ? c.receiver : c.sender;
    const profile = peerUser.profile!;

    return {
      userId: peerUser.id,
      username: profile.username,
      fullName: profile.fullName,
      college: profile.college,
      course: profile.course,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
    };
  });

  // 2. Fetch all messages associated with active user
  const messages = await db.message.findMany({
    where: {
      OR: [
        { senderId: session.userId },
        { receiverId: session.userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6 flex-1 flex flex-col pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">Inbox Chat</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Coordinate hackathons, trade tech stack tips, or swap mentorship meetings.
        </p>
      </div>

      <MessagesView
        currentUserId={session.userId}
        peers={peers}
        initialMessages={messages as Message[]}
      />
    </div>
  );
}
