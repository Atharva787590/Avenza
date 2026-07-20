import { db } from "./db";

export interface RecommendedUser {
  userId: string;
  username: string;
  fullName: string;
  college: string;
  course: string;
  gradYear: number;
  yearOfStudy?: number | null;
  cgpa?: number | null;
  hackathonWins?: number;
  location?: string | null;
  state?: string | null;
  city?: string | null;
  bio: string;
  avatarUrl: string | null;
  matchScore: number;
  matchingSkills: string[];
  sharedInterests: string[];
}

export async function getRecommendations(userId: string): Promise<RecommendedUser[]> {
  try {
    // 1. Fetch current user's profile details
    const currentUser = await db.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            offers: true,
            learns: true,
            interests: true,
          },
        },
      },
    });

    if (!currentUser || !currentUser.profile) {
      return [];
    }

    const currentProfile = currentUser.profile;
    const currentOffers = currentProfile.offers.map((s) => s.skillName.toLowerCase());
    const currentLearns = currentProfile.learns.map((s) => s.skillName.toLowerCase());
    const currentInterests = currentProfile.interests.map((i) => i.name.toLowerCase());

    // 2. Fetch all other users
    const otherUsers = await db.user.findMany({
      where: {
        id: { not: userId },
        profile: { isNot: null },
      },
      include: {
        profile: {
          include: {
            offers: true,
            learns: true,
            interests: true,
          },
        },
      },
    });

    // 3. Score each user
    const recommendations: RecommendedUser[] = otherUsers
      .map((user) => {
        const prof = user.profile!;
        let score = 50; // base score

        const otherOffers = prof.offers.map((s) => s.skillName.toLowerCase());
        const otherLearns = prof.learns.map((s) => s.skillName.toLowerCase());
        const otherInterests = prof.interests.map((i) => i.name.toLowerCase());

        // A. Complementary Skills (Current learns what other offers)
        const skillMatches: string[] = [];
        currentLearns.forEach((skill) => {
          if (otherOffers.includes(skill)) {
            score += 25;
            skillMatches.push(skill);
          }
        });

        // B. Complementary Skills Reverse (Other learns what current offers)
        otherLearns.forEach((skill) => {
          if (currentOffers.includes(skill)) {
            score += 15;
            if (!skillMatches.includes(skill)) {
              skillMatches.push(skill);
            }
          }
        });

        // C. Shared Interests
        const sharedInts: string[] = [];
        currentInterests.forEach((interest) => {
          if (otherInterests.includes(interest)) {
            score += 10;
            sharedInts.push(interest);
          }
        });

        // D. Same College
        if (currentProfile.college.toLowerCase() === prof.college.toLowerCase()) {
          score += 15;
        }

        // E. Availability Match
        if (currentProfile.availability === prof.availability) {
          score += 8;
        }

        // Cap score at 99%, minimum 50%
        const finalScore = Math.min(99, Math.max(50, score));

        // Get nice casing for display
        const displaySkills = prof.offers
          .filter((o) => currentLearns.includes(o.skillName.toLowerCase()))
          .map((o) => o.skillName);

        const displayInterests = prof.interests
          .filter((i) => currentInterests.includes(i.name.toLowerCase()))
          .map((i) => i.name);

        return {
          userId: user.id,
          username: prof.username,
          fullName: prof.fullName,
          college: prof.college,
          course: prof.course,
          gradYear: prof.gradYear,
          yearOfStudy: prof.yearOfStudy,
          cgpa: prof.cgpa,
          hackathonWins: prof.hackathonWins,
          location: prof.location,
          state: prof.state,
          city: prof.city,
          bio: prof.bio,
          avatarUrl: prof.avatarUrl,
          matchScore: finalScore,
          matchingSkills: displaySkills,
          sharedInterests: displayInterests,
        };
      })
      // Sort descending by matchScore
      .sort((a, b) => b.matchScore - a.matchScore)
      // Take top 4 suggestions
      .slice(0, 4);

    return recommendations;
  } catch (error) {
    console.error("Error calculating recommendations:", error);
    return [];
  }
}
