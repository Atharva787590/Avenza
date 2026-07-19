import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleSessionAction } from "@/lib/actions/sessions";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2 } from "lucide-react";

export default async function SessionsPage() {
  const session = await getSession();
  if (!session) return null;

  // 1. Fetch sessions where user is requested as Mentor
  const receivedSessions = await db.mentorshipSession.findMany({
    where: { mentorId: session.userId },
    include: {
      requester: { include: { profile: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  // 2. Fetch sessions where user requested peer
  const requestedSessions = await db.mentorshipSession.findMany({
    where: { requesterId: session.userId },
    include: {
      mentor: { include: { profile: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25";
      case "COMPLETED":
        return "bg-mint/10 text-mint border border-mint/20";
      case "DECLINED":
        return "bg-coral/10 text-coral border border-coral/20";
      default:
        return "bg-amber/10 text-amber border border-amber/20";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">Mentorship & Skill Exchange</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Coordinate peer tutoring chats, design reviews, and study swaps with connected students.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Received Session Requests */}
        <div className="bg-deepslate/30 border border-border p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-mint" />
            Incoming Requests ({receivedSessions.length})
          </h2>

          <div className="space-y-4">
            {receivedSessions.map((s) => (
              <div
                key={s.id}
                className="bg-deepslate/50 border border-border p-4 rounded-xl flex flex-col justify-between gap-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${getStatusBadge(s.status)}`}>
                      {s.status.toLowerCase()}
                    </span>
                    <h3 className="font-bold text-white mt-2 text-sm md:text-base leading-snug">{s.topic}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Skills: <span className="text-cloud font-medium">{s.skillsExchanged}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Proposed for:{" "}
                      <span className="text-white font-semibold">
                        {new Date(s.scheduledAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>
                  </div>

                  {/* Requester Profile */}
                  <div className="text-right shrink-0">
                    <div className="h-8 w-8 rounded-full bg-cobalt/15 border border-cobalt/35 flex items-center justify-center font-bold text-white text-xs ml-auto">
                      {s.requester.profile!.fullName.charAt(0)}
                    </div>
                    <Link href={`/people/${s.requester.profile!.username}`} className="text-[10px] text-cobalt hover:underline block mt-1">
                      @{s.requester.profile!.username}
                    </Link>
                  </div>
                </div>

                {/* Actions */}
                {s.status === "REQUESTED" && (
                  <div className="flex gap-2 pt-2 border-t border-border/40">
                    <form action={async () => {
                      "use server";
                      await handleSessionAction(s.id, "ACCEPT");
                    }} className="flex-1">
                      <Button type="submit" variant="success" size="sm" className="w-full text-xs font-semibold">
                        Accept Request
                      </Button>
                    </form>
                    <form action={async () => {
                      "use server";
                      await handleSessionAction(s.id, "DECLINE");
                    }} className="flex-1">
                      <Button type="submit" variant="outline" size="sm" className="w-full text-xs font-semibold hover:border-coral hover:text-coral">
                        Decline
                      </Button>
                    </form>
                  </div>
                )}

                {s.status === "ACCEPTED" && (
                  <form action={async () => {
                    "use server";
                    await handleSessionAction(s.id, "COMPLETE");
                  }} className="pt-2 border-t border-border/40">
                    <Button type="submit" variant="primary" size="sm" className="w-full text-xs font-semibold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Completed
                    </Button>
                  </form>
                )}
              </div>
            ))}

            {receivedSessions.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                No incoming mentorship requests. Keep sharing skills!
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Requested Sessions */}
        <div className="bg-deepslate/30 border border-border p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-cobalt" />
            My Sent Requests ({requestedSessions.length})
          </h2>

          <div className="space-y-4">
            {requestedSessions.map((s) => (
              <div
                key={s.id}
                className="bg-deepslate/50 border border-border p-4 rounded-xl flex flex-col justify-between gap-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${getStatusBadge(s.status)}`}>
                      {s.status.toLowerCase()}
                    </span>
                    <h3 className="font-bold text-white mt-2 text-sm md:text-base leading-snug">{s.topic}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Skills: <span className="text-cloud font-medium">{s.skillsExchanged}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Proposed for:{" "}
                      <span className="text-white font-semibold">
                        {new Date(s.scheduledAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>
                  </div>

                  {/* Mentor Profile */}
                  <div className="text-right shrink-0">
                    <div className="h-8 w-8 rounded-full bg-cobalt/15 border border-cobalt/35 flex items-center justify-center font-bold text-white text-xs ml-auto">
                      {s.mentor.profile!.fullName.charAt(0)}
                    </div>
                    <Link href={`/people/${s.mentor.profile!.username}`} className="text-[10px] text-cobalt hover:underline block mt-1">
                      @{s.mentor.profile!.username}
                    </Link>
                  </div>
                </div>

                {/* Mark Complete action */}
                {s.status === "ACCEPTED" && (
                  <form action={async () => {
                    "use server";
                    await handleSessionAction(s.id, "COMPLETE");
                  }} className="pt-2 border-t border-border/40">
                    <Button type="submit" variant="primary" size="sm" className="w-full text-xs font-semibold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Completed
                    </Button>
                  </form>
                )}
              </div>
            ))}

            {requestedSessions.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                You haven&apos;t requested any skill swaps yet. Find peers in the directory!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
