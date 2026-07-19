import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getRecommendations } from "@/lib/recommendations";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Compass,
  Folder,
  Calendar,
  Activity,
  CheckCircle,
  Award,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  // 1. Fetch user profile
  const profile = await db.profile.findUnique({
    where: { userId: session.userId },
    include: {
      offers: true,
      learns: true,
      interests: true,
    },
  });

  if (!profile) {
    return null;
  }

  // 2. Fetch recommendations
  const suggestions = await getRecommendations(session.userId);

  // 3. Fetch user's active projects
  const activeProjects = await db.project.findMany({
    where: {
      members: {
        some: { userId: session.userId },
      },
    },
    include: {
      members: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // 4. Fetch upcoming mentorship sessions
  const upcomingSessions = await db.mentorshipSession.findMany({
    where: {
      OR: [{ requesterId: session.userId }, { mentorId: session.userId }],
      status: { in: ["ACCEPTED", "REQUESTED"] },
    },
    include: {
      requester: { include: { profile: true } },
      mentor: { include: { profile: true } },
    },
    orderBy: { scheduledAt: "asc" },
    take: 3,
  });

  // 5. Fetch recent activities from user's projects
  const projectIds = activeProjects.map((p) => p.id);
  const recentActivities = await db.activityEvent.findMany({
    where: {
      projectId: { in: projectIds },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  // 6. Calculate Profile Completion
  let completion = 20; // registered
  if (profile.bio) completion += 20;
  if (profile.college && profile.course) completion += 20;
  if (profile.offers.length > 0) completion += 10;
  if (profile.learns.length > 0) completion += 10;
  if (profile.interests.length > 0) completion += 10;
  if (profile.githubUrl || profile.linkedinUrl || profile.portfolioUrl) completion += 10;

  // 7. National Hackathons & Grants Data (Indian context)
  const hackathons = [
    { name: "Smart India Hackathon 2026", date: "Sept 2026", type: "National Hack", desc: "Solve real-world Indian governance problems." },
    { name: "ETHIndia 2026", date: "Dec 2026", type: "Web3 Hack", desc: "Asia's largest Ethereum build sprint (Bengaluru)." },
    { name: "Bharat BUIDL Grant", date: "Rolling", type: "Grant", desc: "Up to ₹1.5 Lakhs equity-free for student devs." },
    { name: "BITS APOGEE Hack 2027", date: "Mar 2027", type: "College Hack", desc: "Annual technical build clash at BITS Pilani." }
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Banner - Minimalist, no AI glows */}
      <div className="rounded-xl border border-border/40 bg-deepslate/25 p-8 flex flex-col justify-center">
        <span className="text-[10px] font-mono text-mint uppercase tracking-wider">Welcome back</span>
        <h1 className="text-3xl font-bold text-white mt-1.5 mb-2 font-sans">
          Hey, {profile.fullName.split(" ")[0]}!
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed font-sans">
          Find your co-builders and scale team projects. Today you have{" "}
          <span className="text-white font-medium">{upcomingSessions.length} active session(s)</span> and{" "}
          <span className="text-white font-medium">{activeProjects.length} project workspaces</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recommendations & Activities */}
        <div className="lg:col-span-2 space-y-8">
          {/* Suggestions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white font-sans">Suggested Peers</h2>
                <p className="text-xs text-muted-foreground font-sans">Smart Match recommendations based on complementary skills & campus proximity</p>
              </div>
              <Link
                href="/discover"
                className="text-xs font-semibold text-cobalt hover:underline flex items-center gap-1.5 font-sans"
              >
                View Directory
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {suggestions.map((peer) => (
                <div
                  key={peer.userId}
                  className="bg-deepslate/20 border border-border/40 rounded p-5 hover:border-cobalt/40 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-10 w-10 rounded bg-cobalt/10 border border-cobalt/25 flex items-center justify-center font-bold text-white text-sm">
                        {peer.fullName.charAt(0)}
                      </div>
                      <span className="text-[10px] font-mono font-bold text-mint bg-mint/10 border border-mint/20 px-2 py-0.5 rounded-full">
                        {peer.matchScore}% Match
                      </span>
                    </div>

                    <Link href={`/people/${peer.username}`} className="block">
                      <h3 className="font-bold text-white group-hover:text-cobalt transition-colors truncate font-sans">
                        {peer.fullName}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate font-sans">@{peer.username}</p>
                    </Link>

                    <p className="text-xs text-muted-foreground font-medium mt-2 font-sans">
                      {peer.course} • {peer.college}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed font-sans">
                      {peer.bio}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/20">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {peer.matchingSkills.slice(0, 2).map((s) => (
                        <span key={s} className="text-[10px] font-mono bg-cobalt/10 text-indigo-300 px-2 py-0.5 rounded">
                          Offers {s}
                        </span>
                      ))}
                      {peer.sharedInterests.slice(0, 1).map((i) => (
                        <span key={i} className="text-[10px] font-mono bg-deepslate text-cloud border border-border/30 px-2 py-0.5 rounded">
                          #{i}
                        </span>
                      ))}
                    </div>

                    <Link href={`/people/${peer.username}`}>
                      <Button variant="secondary" size="sm" className="w-full text-xs font-semibold rounded font-sans">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}

              {suggestions.length === 0 && (
                <div className="sm:col-span-2 py-10 bg-deepslate/10 border border-border/30 border-dashed rounded text-center">
                  <Compass className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-cloud font-medium font-sans">No suggestions available yet</p>
                  <p className="text-xs text-muted-foreground mt-1 font-sans">Try adding more skills to trade on your profile.</p>
                </div>
              )}
            </div>
          </div>

          {/* Activities Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 font-sans">
              <Activity className="h-5 w-5 text-mint" />
              Workspace Activity
            </h2>

            <div className="bg-deepslate/10 border border-border/40 rounded divide-y divide-border/25">
              {recentActivities.map((act) => (
                <div key={act.id} className="p-4 flex items-start gap-3">
                  <div className="h-8 w-8 rounded bg-mint/10 border border-mint/20 text-mint flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-cloud font-sans">{act.details}</p>
                    <span className="text-[10px] text-muted-foreground mt-1 block font-mono">
                      {new Date(act.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {recentActivities.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground font-sans">
                  No workspace activity logs yet. Launch a project and co-member tasks to see updates here!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Actions, Completion, Upcoming Sessions, Projects, Hackathons */}
        <div className="space-y-8">
          {/* Profile Completion */}
          <div className="bg-deepslate/25 border border-border/40 rounded p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider font-sans">Profile Strength</h3>
              <span className="text-xs font-bold text-cobalt font-mono">{completion}%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-border/40 rounded-full h-1.5">
              <div
                className="bg-cobalt h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              {completion === 100
                ? "Perfect! Your profile is fully complete and indexed by the peer matching search engine."
                : "Add social links, skills you offer/want, and interests to hit 100% and rank higher in student recommendation lists."}
            </p>
          </div>

          {/* Active Projects */}
          <div className="bg-deepslate/25 border border-border/40 rounded p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2 font-sans">
                <Folder className="h-4.5 w-4.5 text-cobalt" />
                Launch Projects ({activeProjects.length})
              </h3>
              <Link href="/projects/new" className="text-xs text-cobalt hover:underline font-semibold font-sans">
                + Create
              </Link>
            </div>

            <div className="space-y-2">
              {activeProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/workspace/${p.id}`}
                  className="flex items-center justify-between p-3 rounded border border-border/30 bg-ink/10 hover:bg-ink/30 hover:border-cobalt/40 transition-all group"
                >
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate group-hover:text-cobalt transition-colors font-sans">
                      {p.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground uppercase mt-0.5 font-mono">
                      {p.category} • {p.members.length} member(s)
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-white shrink-0 ml-2" />
                </Link>
              ))}

              {activeProjects.length === 0 && (
                <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border/30 rounded">
                  Not in any projects yet.
                </div>
              )}
            </div>
          </div>

          {/* India Hackathon & Grants Ledger */}
          <div className="bg-deepslate/25 border border-border/40 rounded p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2 font-sans">
                <Award className="h-4.5 w-4.5 text-mint" />
                India Build Ledger
              </h3>
              <span className="text-[10px] font-mono text-mint uppercase">National</span>
            </div>

            <div className="space-y-3">
              {hackathons.map((h) => (
                <div
                  key={h.name}
                  className="p-3 border border-border/30 rounded bg-ink/10 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate font-sans">
                      {h.name}
                    </span>
                    <span className="text-[9px] font-mono bg-cobalt/10 text-indigo-300 px-1.5 py-0.5 rounded">
                      {h.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed font-sans">
                    {h.desc}
                  </p>
                  <div className="text-[9px] text-mint font-mono mt-1">
                    Timeline: {h.date}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mentorship Sessions */}
          <div className="bg-deepslate/25 border border-border/40 rounded p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2 font-sans">
                <Calendar className="h-4.5 w-4.5 text-cobalt" />
                Sessions ({upcomingSessions.length})
              </h3>
              <Link href="/sessions" className="text-xs text-cobalt hover:underline font-semibold font-sans">
                Manage
              </Link>
            </div>

            <div className="space-y-2.5">
              {upcomingSessions.map((sessionItem) => {
                const isMentor = sessionItem.mentorId === session.userId;
                const otherUser = isMentor ? sessionItem.requester : sessionItem.mentor;

                return (
                  <div
                    key={sessionItem.id}
                    className="p-3 border border-border/30 rounded bg-ink/10 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate font-sans">
                        {sessionItem.topic}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                          sessionItem.status === "ACCEPTED"
                            ? "bg-mint/10 text-mint"
                            : "bg-amber/10 text-amber"
                        }`}
                      >
                        {sessionItem.status.toLowerCase()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span>
                        {isMentor ? "Mentoring" : "Mentored by"} @{otherUser.profile?.username}
                      </span>
                      <span>
                        {new Date(sessionItem.scheduledAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {upcomingSessions.length === 0 && (
                <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border/30 rounded">
                  No upcoming mentorship or skill-exchange sessions.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
