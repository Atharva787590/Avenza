import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileActions } from "@/components/ProfileActions";
import { IndianAvatar } from "@/components/IndianAvatar";
import {
  Globe,
  GraduationCap,
  MapPin,
  Sparkles,
  ArrowRight,
  FolderOpen,
  Trophy,
  Award,
  BookOpen,
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

  // 3. Compute relative Match Score
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

  const activeProjects = profile.user.memberships.map((m) => m.project);

  return (
    <div className="space-y-8 pb-16">
      {/* ── Official Indian Student ID Card Header ── */}
      <div className="bg-deepslate/50 border-2 border-saffron/30 rounded-3xl overflow-hidden shadow-2xl shadow-ink/60 relative">
        {/* Tricolor Top Header Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

        {/* Institution Title Bar */}
        <div className="bg-ink/60 border-b border-border/60 px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏛️</span>
            <span className="text-xs font-bold text-white tracking-widest uppercase font-mono">
              {profile.college} — OFFICIAL STUDENT ID
            </span>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-saffron/10 text-saffron border border-saffron/30">
            ROLL NO: @{profile.username}
          </span>
        </div>

        {/* Profile Identity Area */}
        <div className="px-8 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <IndianAvatar name={profile.fullName} avatarUrl={profile.avatarUrl} size="xl" />

            <div className="text-center sm:text-left min-w-0">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{profile.fullName}</h1>
                {!isOwnProfile && (
                  <span className="text-xs font-bold text-mint bg-mint/10 border border-mint/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {matchScore}% Match
                  </span>
                )}
              </div>
              <p className="text-xs text-saffron/90 font-mono mt-0.5 font-semibold">@{profile.username}</p>

              {/* Badges Bar (CGPA, Hackathon Wins, Year) */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <span className="text-xs font-semibold bg-cobalt/20 text-indigo-300 border border-cobalt/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {profile.course}
                  {profile.yearOfStudy ? ` · Year ${profile.yearOfStudy}` : ""}
                </span>

                {profile.cgpa && (
                  <span className="text-xs font-bold bg-amber/10 text-amber border border-amber/30 px-2.5 py-1 rounded-lg">
                    CGPA: {profile.cgpa}
                  </span>
                )}

                {profile.hackathonWins && profile.hackathonWins > 0 ? (
                  <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5" />
                    {profile.hackathonWins} Hackathon Win{profile.hackathonWins > 1 ? "s" : ""}
                  </span>
                ) : null}

                {profile.location && (
                  <span className="text-xs font-semibold bg-deepslate text-muted-foreground border border-border px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-coral" />
                    {profile.location}
                  </span>
                )}
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
        {/* Left Column: Bio & Projects */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio */}
          <div className="bg-deepslate/50 border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Student Overview & Bio</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">
              {profile.bio}
            </p>
          </div>

          {/* Collaboration Goals */}
          <div className="bg-deepslate/50 border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Collaboration Preferences</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">
              {profile.collabPreferences}
            </p>
          </div>

          {/* Active Projects */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-saffron" />
              Active Projects ({activeProjects.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeProjects.map((p) => (
                <div
                  key={p.id}
                  className="bg-deepslate/50 border border-border rounded-2xl p-5 hover:border-saffron/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[10px] bg-saffron/10 border border-saffron/30 text-saffron px-2 py-0.5 rounded uppercase font-bold tracking-wide">
                      {p.category}
                    </span>
                    <h3 className="font-bold text-white group-hover:text-saffron transition-colors mt-3">
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
                      className="text-xs text-saffron hover:underline font-bold flex items-center gap-1"
                    >
                      Details
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}

              {activeProjects.length === 0 && (
                <div className="sm:col-span-2 py-10 text-center border border-dashed border-border rounded-2xl bg-deepslate/25">
                  <p className="text-xs text-muted-foreground">Not collaborating on any projects yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Skills, Social Handles, Availability */}
        <div className="space-y-8">
          {/* Availability Status */}
          <div className="bg-deepslate/50 border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Availability Status</h3>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${profile.availability === "ACTIVE" ? "bg-mint animate-pulse" : profile.availability === "WEEKENDS" ? "bg-amber" : "bg-coral"}`} />
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
          <div className="bg-deepslate/50 border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Verified Handles & Portfolio</h3>
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
              {profile.instagramUrl && (
                <a
                  href={profile.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-pink-400 transition-colors"
                >
                  <span className="text-pink-400 font-bold">📸</span>
                  Instagram Handle
                </a>
              )}
              {profile.twitterUrl && (
                <a
                  href={profile.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-sky-400 transition-colors"
                >
                  <span className="text-sky-400 font-bold">🐦</span>
                  Twitter / X Profile
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
              {!profile.githubUrl && !profile.linkedinUrl && !profile.portfolioUrl && !profile.instagramUrl && !profile.twitterUrl && (
                <p className="text-xs text-muted-foreground">No portfolio links provided.</p>
              )}
            </div>
          </div>

          {/* Skills Trading details */}
          <div className="bg-deepslate/50 border border-border rounded-2xl p-6 space-y-5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Skills & Interests</h3>

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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
