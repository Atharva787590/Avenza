import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { StudentCard } from "@/components/StudentCard";
import { getRecommendations } from "@/lib/recommendations";
import { Bookmark, ArrowRight, Folder, Users } from "lucide-react";

export default async function SavedBookmarksPage() {
  const session = await getSession();
  if (!session) return null;

  // 1. Fetch saved profiles
  const savedProfiles = await db.savedProfile.findMany({
    where: { userId: session.userId },
  });
  const savedProfileIds = savedProfiles.map((s) => s.targetProfileId);

  // Fetch full details of saved profiles
  const profilesList = await db.profile.findMany({
    where: { id: { in: savedProfileIds } },
    include: {
      offers: true,
      learns: true,
      interests: true,
    },
  });

  // Calculate scores for saved profiles using getRecommendations helper logic
  const allSuggestions = await getRecommendations(session.userId);
  const suggestionMap = new Map<string, typeof allSuggestions[0]>();
  allSuggestions.forEach((s) => suggestionMap.set(s.userId, s));

  // Connections status map
  const connections = await db.connection.findMany({
    where: {
      OR: [{ senderId: session.userId }, { receiverId: session.userId }],
    },
  });

  const connMap = new Map<string, { status: string; id: string; senderId: string }>();
  connections.forEach((c) => {
    const peerId = c.senderId === session.userId ? c.receiverId : c.senderId;
    connMap.set(peerId, { status: c.status, id: c.id, senderId: c.senderId });
  });

  // 2. Fetch saved projects
  const savedProjects = await db.savedProject.findMany({
    where: { userId: session.userId },
    include: {
      project: {
        include: {
          members: {
            include: {
              user: { include: { profile: true } },
            },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">Saved Bookmarks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Access your co-builders watchlist and projects you want to collaborate on.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Saved Student Profiles */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-mint" />
            Bookmarked Peers ({profilesList.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {profilesList.map((p) => {
              // Get scored recommendation mapping or mock basic
              const peerScoreInfo = suggestionMap.get(p.userId) || {
                userId: p.userId,
                username: p.username,
                fullName: p.fullName,
                college: p.college,
                course: p.course,
                gradYear: p.gradYear,
                bio: p.bio,
                avatarUrl: p.avatarUrl,
                matchScore: 78,
                matchingSkills: p.offers.map((s) => s.skillName),
                sharedInterests: p.interests.map((i) => i.name),
              };

              const conn = connMap.get(p.userId);
              let connectionStatus: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "CONNECTED" = "NONE";
              if (conn) {
                if (conn.status === "ACCEPTED") {
                  connectionStatus = "CONNECTED";
                } else if (conn.status === "PENDING") {
                  connectionStatus = conn.senderId === session.userId ? "PENDING_SENT" : "PENDING_RECEIVED";
                }
              }

              return (
                <StudentCard
                  key={p.id}
                  peer={peerScoreInfo}
                  isSaved={true}
                  connectionStatus={connectionStatus}
                  connectionId={conn?.id}
                />
              );
            })}

            {profilesList.length === 0 && (
              <div className="sm:col-span-2 py-12 text-center border border-dashed border-border rounded-2xl bg-deepslate/20">
                <Bookmark className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-cloud font-medium">No bookmarked student profiles</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Save student profiles in the Directory to monitor co-building candidates.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Saved Projects */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Folder className="h-5 w-5 text-cobalt" />
            Watchlist Projects ({savedProjects.length})
          </h2>

          <div className="space-y-4">
            {savedProjects.map((sp) => {
              const proj = sp.project;

              return (
                <div
                  key={sp.id}
                  className="bg-deepslate/30 border border-border p-5 rounded-2xl flex flex-col justify-between hover:border-cobalt/40 transition-colors group"
                >
                  <div>
                    <span className="text-[10px] bg-border text-cloud px-2 py-0.5 rounded uppercase font-semibold">
                      {proj.category}
                    </span>
                    <Link href={`/projects/${proj.id}`} className="block mt-3">
                      <h4 className="font-bold text-white group-hover:text-cobalt transition-colors truncate">
                        {proj.title}
                      </h4>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-cobalt" />
                      {proj.members.length} member(s)
                    </span>
                    <Link
                      href={`/projects/${proj.id}`}
                      className="text-xs text-cobalt hover:underline font-bold flex items-center gap-1"
                    >
                      Details
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {savedProjects.length === 0 && (
              <div className="py-10 text-center border border-dashed border-border rounded-2xl bg-deepslate/20">
                <Folder className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No watchlisted projects.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
