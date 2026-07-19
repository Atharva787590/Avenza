import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleConnectionRequestAction } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Users, Mail, UserCheck, MessageSquare, X } from "lucide-react";

export default async function ConnectionsPage() {
  const session = await getSession();
  if (!session) return null;

  // 1. Fetch pending received requests
  const receivedRequests = await db.connection.findMany({
    where: { receiverId: session.userId, status: "PENDING" },
    include: {
      sender: {
        include: { profile: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch pending sent requests
  const sentRequests = await db.connection.findMany({
    where: { senderId: session.userId, status: "PENDING" },
    include: {
      receiver: {
        include: { profile: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 3. Fetch accepted connections
  const acceptedConnections = await db.connection.findMany({
    where: {
      OR: [
        { senderId: session.userId, status: "ACCEPTED" },
        { receiverId: session.userId, status: "ACCEPTED" },
      ],
    },
    include: {
      sender: { include: { profile: true } },
      receiver: { include: { profile: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Helper to extract connection details relative to active user
  const network = acceptedConnections.map((c) => {
    const isSender = c.senderId === session.userId;
    const peer = isSender ? c.receiver : c.sender;
    return {
      connectionId: c.id,
      userId: peer.id,
      username: peer.profile!.username,
      fullName: peer.profile!.fullName,
      college: peer.profile!.college,
      course: peer.profile!.course,
      bio: peer.profile!.bio,
      joinedAt: c.createdAt,
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">My Connections</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your incoming collaboration invites, sent requests, and active student network.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Lists */}
        <div className="lg:col-span-2 space-y-8">
          {/* Received Requests */}
          <div className="bg-deepslate/30 border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-mint" />
              Received Invitations ({receivedRequests.length})
            </h2>

            <div className="space-y-4">
              {receivedRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-deepslate/50 border border-border p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-cobalt/15 border border-cobalt/35 flex items-center justify-center font-bold text-white text-sm">
                        {req.sender.profile!.fullName.charAt(0)}
                      </div>
                      <div>
                        <Link href={`/people/${req.sender.profile!.username}`}>
                          <h3 className="font-bold text-white hover:text-cobalt transition-colors">
                            {req.sender.profile!.fullName}
                          </h3>
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {req.sender.profile!.course} • {req.sender.profile!.college}
                        </p>
                      </div>
                    </div>
                    {req.message && (
                      <p className="text-xs italic bg-ink/30 border border-border/80 px-3 py-2 rounded-lg mt-3 text-muted-foreground leading-relaxed">
                        &quot;{req.message}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    <form action={async () => {
                      "use server";
                      await handleConnectionRequestAction(req.id, "ACCEPT");
                    }} className="flex-1 md:flex-none">
                      <Button type="submit" variant="success" size="sm" className="w-full text-xs font-semibold">
                        Accept
                      </Button>
                    </form>
                    <form action={async () => {
                      "use server";
                      await handleConnectionRequestAction(req.id, "DECLINE");
                    }} className="flex-1 md:flex-none">
                      <Button type="submit" variant="outline" size="sm" className="w-full text-xs font-semibold hover:border-coral hover:text-coral">
                        Decline
                      </Button>
                    </form>
                  </div>
                </div>
              ))}

              {receivedRequests.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                  No pending connection requests.
                </div>
              )}
            </div>
          </div>

          {/* Connected Network */}
          <div className="bg-deepslate/30 border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-mint" />
              Connected Peers ({network.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {network.map((friend) => (
                <div
                  key={friend.userId}
                  className="bg-deepslate/50 border border-border p-4 rounded-xl flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-cobalt/15 border border-cobalt/35 flex items-center justify-center font-bold text-white text-sm">
                        {friend.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/people/${friend.username}`}>
                          <h4 className="font-bold text-white group-hover:text-cobalt transition-colors truncate">
                            {friend.fullName}
                          </h4>
                        </Link>
                        <p className="text-[10px] text-muted-foreground truncate">@{friend.username}</p>
                      </div>
                    </div>

                    <p className="text-[11px] text-cloud font-medium mt-3">
                      {friend.course} • {friend.college}
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {friend.bio}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/40 flex gap-2">
                    <Link href={`/people/${friend.username}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-[11px] font-semibold h-9">
                        Profile
                      </Button>
                    </Link>
                    <Link href="/messages" className="flex-1">
                      <Button variant="primary" size="sm" className="w-full text-[11px] font-semibold h-9 flex items-center justify-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Chat
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}

              {network.length === 0 && (
                <div className="sm:col-span-2 py-10 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                  You haven&apos;t connected with any peers yet. Explore the directory!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sent Requests */}
        <div className="space-y-6">
          <div className="bg-deepslate/30 border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-cobalt" />
              Sent Invitations ({sentRequests.length})
            </h2>

            <div className="space-y-3">
              {sentRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-deepslate/50 border border-border p-3 rounded-xl flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <Link href={`/people/${req.receiver.profile!.username}`}>
                      <h4 className="font-semibold text-white group-hover:text-cobalt transition-colors text-xs truncate">
                        {req.receiver.profile!.fullName}
                      </h4>
                    </Link>
                    <p className="text-[10px] text-muted-foreground truncate">
                      @{req.receiver.profile!.username}
                    </p>
                  </div>

                  <form action={async () => {
                    "use server";
                    await handleConnectionRequestAction(req.id, "CANCEL");
                  }}>
                    <button
                      type="submit"
                      className="p-1.5 border border-border rounded-lg text-muted-foreground hover:text-coral hover:bg-coral/5 transition-colors cursor-pointer"
                      title="Cancel invitation"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              ))}

              {sentRequests.length === 0 && (
                <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  No active sent invitations.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
