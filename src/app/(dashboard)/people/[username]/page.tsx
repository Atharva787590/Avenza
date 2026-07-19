import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileActions } from "@/components/ProfileActions";
import {
  Globe,
  GraduationCap,
  MapPin,
  Sparkles,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import { Github, Linkedin } from "@/components/BrandIcons";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function PublicProfilePage(props: ProfilePageProps) {
  const params = await props.params;
  const { username } = params;
  const session = await getSession();

  if (!session) return null;

  // 1. Fetch target student profile
  const profile = await db.profile.findUnique({
    where: { username },
    include: {
      offers: true,
      learns: true,
      interests: true,
      user: {
        include: {
          memberships: {
            include: {
              project: {
                include: {
                  members: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!profile) {
    notFound();
  }

  const isOwnProfile = profile.userId === session.userId;

  // 2. Fetch viewer bookmarks & connection status
  const isSaved = await db.savedProfile.findFirst({
    where: { userId: session.userId, targetProfileId: profile.id },
  });

  const connection = await db.connection.findFirst({
    where: {
      OR: [
        { senderId: session.userId, receiverId: profile.userId },
        { senderId: profile.userId, receiverId: session.userId },
      ],
    },
  });

  let connectionStatus: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "CONNECTED" = "NONE";
  if (connection) {
    if (connection.status === "ACCEPTED") {
      connectionStatus = "CONNECTED";
    } else if (connection.status === "PENDING") {
      connectionStatus = connection.senderId === session.userId ? "PENDING_SENT" : "PENDING_RECEIVED";
    }
  }

  // 3. Compute relative Match Score in-memory
  let matchScore = 50;
  if (!isOwnProfile) {
    const viewerProfile = await db.profile.findUnique({
      where: { userId: session.userId },
      include: { offers: true, learns: true, interests: true },
    });

    if (viewerProfile) {
      const viewerOffers = viewerProfile.offers.map((s) => s.skillName.toLowerCase());
      const viewerLearns = viewerProfile.learns.map((s) => s.skillName.toLowerCase());
      const viewerInterests = viewerProfile.interests.map((i) => i.name.toLowerCase());

      const targetOffers = profile.offers.map((s) => s.skillName.toLowerCase());
      const targetLearns = profile.learns.map((s) => s.skillName.toLowerCase());
      const targetInterests = profile.interests.map((i) => i.name.toLowerCase());

      viewerLearns.forEach((skill) => {
        if (targetOffers.includes(skill)) matchScore += 25;
      });
      targetLearns.forEach((skill) => {
        if (viewerOffers.includes(skill)) matchScore += 15;
      });
      viewerInterests.forEach((interest) => {
        if (targetInterests.includes(interest)) matchScore += 10;
      });
      if (viewerProfile.college.toLowerCase() === profile.college.toLowerCase()) matchScore += 15;
      if (viewerProfile.availability === profile.availability) matchScore += 8;

      matchScore = Math.min(99, Math.max(50, matchScore));
    }
  }

  // Extract active project memberships
  const activeProjects = profile.user.memberships.map((m) => m.project);

  return (
    <div className="space-y-8 pb-16">
      {/* Profile Header Card */}
      <div className="bg-deepslate/35 border border-border rounded-2xl overflow-hidden shadow-lg shadow-ink/40">
        {/* Banner Geometric CSS Background */}
        <div className="h-32 bg-gradient-to-r from-deepslate via-indigo-950/20 to-cobalt/20 relative" />

        {/* Profile Details area */}
        <div className="px-8 pb-8 pt-0 relative flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 -mt-10 md:-mt-8">
            {/* Avatar Circle */}
            <div className="h-24 w-24 rounded-full bg-cobalt border-4 border-ink flex items-center justify-center font-bold text-3xl text-white shadow-xl relative z-10">
              {profile.fullName.charAt(0)}
            </div>

            <div className="text-center md:text-left min-w-0">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">{profile.fullName}</h1>
                {!isOwnProfile && (
                  <span className="text-xs font-bold text-mint bg-mint/10 border border-mint/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {matchScore}% Match
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">@{profile.username}</p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5 text-xs text-muted-foreground mt-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-cobalt" />
                  {profile.college} ({profile.course})
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-coral" />
                  {profile.location}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full md:w-auto shrink-0">
            <ProfileActions
              userId={profile.userId}
              fullName={profile.fullName}
              isSaved={!!isSaved}
              connectionStatus={connectionStatus}
              isOwnProfile={isOwnProfile}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Bio & Core Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio */}
          <div className="bg-deepslate/50 border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">About Me</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {profile.bio}
            </p>
          </div>

          {/* Collaboration Preferences */}
          <div className="bg-deepslate/50 border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Collaboration Style & Goals</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {profile.collabPreferences}
            </p>
          </div>

          {/* Projects Co-Authored */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-cobalt" />
              Active Collaborations ({activeProjects.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeProjects.map((p) => (
                <div
                  key={p.id}
                  className="bg-deepslate/50 border border-border rounded-xl p-5 hover:border-cobalt/45 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[10px] bg-cobalt/10 border border-cobalt/20 text-indigo-300 px-2 py-0.5 rounded uppercase font-bold tracking-wide">
                      {p.category}
                    </span>
                    <h3 className="font-bold text-white group-hover:text-cobalt transition-colors mt-3">
                      {p.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {p.status.toLowerCase()} • {p.timeline}
                    </span>
                    <Link
                      href={`/projects/${p.id}`}
                      className="text-xs text-cobalt hover:underline font-bold flex items-center gap-1"
                    >
                      Details
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}

              {activeProjects.length === 0 && (
                <div className="sm:col-span-2 py-10 text-center border border-dashed border-border rounded-xl bg-deepslate/25">
                  <p className="text-xs text-muted-foreground">Not collaborating on any projects yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Skills, Availability, Social Links */}
        <div className="space-y-8">
          {/* Availability Status */}
          <div className="bg-deepslate/50 border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Availability Status</h3>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${profile.availability === "ACTIVE" ? "bg-mint" : profile.availability === "WEEKENDS" ? "bg-amber" : "bg-coral"}`} />
              <span className="text-sm font-semibold text-white">
                {profile.availability === "ACTIVE"
                  ? "Active (Open for co-building)"
                  : profile.availability === "WEEKENDS"
                  ? "Available on Weekends"
                  : "Busy (Advisory role only)"}
              </span>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-deepslate/50 border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Portfolio & Connect</h3>
            <div className="space-y-3">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  <Github className="h-5 w-5 text-cloud" />
                  GitHub Repository
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  <Linkedin className="h-5 w-5 text-indigo-400" />
                  LinkedIn Profile
                </a>
              )}
              {profile.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  <Globe className="h-5 w-5 text-mint" />
                  Personal Portfolio
                </a>
              )}
              {!profile.githubUrl && !profile.linkedinUrl && !profile.portfolioUrl && (
                <p className="text-xs text-muted-foreground">No social portfolio links provided.</p>
              )}
            </div>
          </div>

          {/* Skills Trading details */}
          <div className="bg-deepslate/50 border border-border rounded-xl p-6 space-y-5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Skills Exchange</h3>

            {/* Offered Skills */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Skills I can teach/offer:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile.offers.map((s) => (
                  <span
                    key={s.id}
                    className="text-xs font-semibold bg-cobalt/15 text-indigo-300 border border-cobalt/20 px-2.5 py-1 rounded-full"
                  >
                    {s.skillName} ({s.level.toLowerCase()})
                  </span>
                ))}
                {profile.offers.length === 0 && (
                  <p className="text-xs text-muted-foreground">None listed.</p>
                )}
              </div>
            </div>

            {/* Learned Skills */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Skills I want to learn:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile.learns.map((s) => (
                  <span
                    key={s.id}
                    className="text-xs font-semibold bg-mint/10 text-mint border border-mint/20 px-2.5 py-1 rounded-full"
                  >
                    {s.skillName} ({s.level.toLowerCase()})
                  </span>
                ))}
                {profile.learns.length === 0 && (
                  <p className="text-xs text-muted-foreground">None listed.</p>
                )}
              </div>
            </div>

            {/* Interest Topics */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Interests & Topics:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile.interests.map((i) => (
                  <span
                    key={i.id}
                    className="text-xs font-semibold bg-deepslate text-cloud border border-border px-2.5 py-1 rounded-full"
                  >
                    #{i.name}
                  </span>
                ))}
                {profile.interests.length === 0 && (
                  <p className="text-xs text-muted-foreground">None listed.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
