import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getRecommendations } from "@/lib/recommendations";
import { StudentCard } from "@/components/StudentCard";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Compass } from "lucide-react";

interface SearchParams {
  q?: string;
  college?: string;
  availability?: string;
  sortBy?: string;
}

export default async function DiscoverPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const session = await getSession();

  if (!session) return null;

  const query = searchParams.q || "";
  const collegeFilter = searchParams.college || "";

  const sortBy = searchParams.sortBy || "match";

  // 1. Fetch current user saved list & connections
  const saved = await db.savedProfile.findMany({
    where: { userId: session.userId },
  });
  const savedIds = new Set(saved.map((s) => s.targetProfileId));

  const connections = await db.connection.findMany({
    where: {
      OR: [{ senderId: session.userId }, { receiverId: session.userId }],
    },
  });

  // Calculate connection status helper maps
  const connMap = new Map<string, { status: string; id: string; senderId: string }>();
  connections.forEach((c) => {
    const peerId = c.senderId === session.userId ? c.receiverId : c.senderId;
    connMap.set(peerId, { status: c.status, id: c.id, senderId: c.senderId });
  });

  // 2. Fetch recommendations (pre-scored other profiles)
  const allRecs = await getRecommendations(session.userId);

  // 3. Filter recommendations in memory
  const filtered = allRecs.filter((peer) => {
    // Search text matching (name, bio, course, skills, interests)
    if (query) {
      const q = query.toLowerCase();
      const matchName = peer.fullName.toLowerCase().includes(q);
      const matchBio = peer.bio.toLowerCase().includes(q);
      const matchCourse = peer.course.toLowerCase().includes(q);
      const matchSkills = peer.matchingSkills.some((s) => s.toLowerCase().includes(q));
      const matchInterests = peer.sharedInterests.some((i) => i.toLowerCase().includes(q));

      if (!matchName && !matchBio && !matchCourse && !matchSkills && !matchInterests) {
        return false;
      }
    }

    // College filter
    if (collegeFilter && peer.college !== collegeFilter) {
      return false;
    }

    return true;
  });

  // 4. Apply sorting
  if (sortBy === "name") {
    filtered.sort((a, b) => a.fullName.localeCompare(b.fullName));
  } else if (sortBy === "gradYear") {
    filtered.sort((a, b) => a.gradYear - b.gradYear);
  } else {
    // default "match" - recommendation score descending (already sorted, but keep if filtered)
    filtered.sort((a, b) => b.matchScore - a.matchScore);
  }

  // Fetch unique colleges for filter options
  const collegeList = await db.profile.findMany({
    select: { college: true },
    distinct: ["college"],
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">Student Directory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search and match with other student developers, designers, and researchers.
        </p>
      </div>

      {/* Filter Form */}
      <form method="GET" className="bg-deepslate/50 border border-border p-5 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Search className="h-5 w-5" />
            </span>
            <Input
              name="q"
              defaultValue={query}
              placeholder="Search by name, skills, interests, bio (e.g. Next.js, Figma, ML)..."
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:w-[480px]">
            <Select name="college" defaultValue={collegeFilter}>
              <option value="">All Colleges</option>
              {collegeList.map((c) => (
                <option key={c.college} value={c.college}>
                  {c.college}
                </option>
              ))}
            </Select>

            <Select name="sortBy" defaultValue={sortBy}>
              <option value="match">Match Score</option>
              <option value="name">Alphabetical</option>
              <option value="gradYear">Graduation Year</option>
            </Select>

            <Button type="submit" className="col-span-2 sm:col-span-1 font-semibold h-11">
              Apply Filters
            </Button>
          </div>
        </div>
      </form>

      {/* Grid Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((peer) => {
          const isSaved = savedIds.has(peer.userId);
          const conn = connMap.get(peer.userId);

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
              key={peer.userId}
              peer={peer}
              isSaved={isSaved}
              connectionStatus={connectionStatus}
              connectionId={conn?.id}
            />
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center border border-dashed border-border rounded-2xl bg-deepslate/20">
          <Compass className="h-10 w-10 text-muted-foreground mx-auto mb-3 animate-pulse-slow" />
          <h3 className="text-lg font-bold text-white mb-1">No students found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search terms or clearing filters to explore wider peer recommendations.
          </p>
        </div>
      )}
    </div>
  );
}
