import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsView } from "@/components/SettingsView";

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // 1. Fetch user profile
  const profile = await db.profile.findUnique({
    where: { userId: session.userId },
  });

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your co-building availability, bio description, and external portfolios.
        </p>
      </div>

      <SettingsView
        email={session.email}
        role={session.role}
        initialProfile={{
          fullName: profile.fullName,
          location: profile.location,
          bio: profile.bio,
          availability: profile.availability,
          collabPreferences: profile.collabPreferences,
          githubUrl: profile.githubUrl,
          linkedinUrl: profile.linkedinUrl,
          portfolioUrl: profile.portfolioUrl,
        }}
      />
    </div>
  );
}
