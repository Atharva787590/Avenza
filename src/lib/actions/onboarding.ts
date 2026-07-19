"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getSession, setSessionCookie } from "@/lib/auth";

const onboardingSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").trim(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .toLowerCase()
    .trim(),
  college: z.string().min(2, "College name must be at least 2 characters").trim(),
  course: z.string().min(2, "Course/Major must be at least 2 characters").trim(),
  gradYear: z.number().int().min(2020).max(2035),
  location: z.string().min(2, "Location is required").trim(),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500).trim(),
  availability: z.string().default("ACTIVE"),
  collabPreferences: z.string().min(10, "Please describe your collaboration preferences").trim(),
  githubUrl: z.string().url("Invalid GitHub URL").or(z.literal("")).optional(),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").or(z.literal("")).optional(),
  portfolioUrl: z.string().url("Invalid Portfolio URL").or(z.literal("")).optional(),
  skillsOffer: z.array(
    z.object({
      skillName: z.string().min(1, "Skill name required"),
      level: z.string().default("INTERMEDIATE"),
    })
  ),
  skillsLearn: z.array(
    z.object({
      skillName: z.string().min(1, "Skill name required"),
      level: z.string().default("INTERMEDIATE"),
    })
  ),
  interests: z.array(z.string()),
});

export async function completeOnboardingAction(formDataJSON: string) {
  const session = await getSession();

  if (!session) {
    return {
      success: false,
      error: "You must be signed in to complete onboarding.",
    };
  }

  try {
    const rawData = JSON.parse(formDataJSON);
    const result = onboardingSchema.safeParse(rawData);

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0].message,
      };
    }

    const data = result.data;

    // Check if username is already taken
    const existingProfile = await db.profile.findUnique({
      where: { username: data.username },
    });

    if (existingProfile) {
      return {
        success: false,
        error: "This username is already taken. Please choose another.",
      };
    }

    // Create profile
    await db.$transaction(async (tx) => {
      const profile = await tx.profile.create({
        data: {
          userId: session.userId,
          username: data.username,
          fullName: data.fullName,
          college: data.college,
          course: data.course,
          gradYear: data.gradYear,
          location: data.location,
          bio: data.bio,
          availability: data.availability,
          collabPreferences: data.collabPreferences,
          githubUrl: data.githubUrl || null,
          linkedinUrl: data.linkedinUrl || null,
          portfolioUrl: data.portfolioUrl || null,
          offers: {
            create: data.skillsOffer.map((s) => ({
              skillName: s.skillName,
              level: s.level,
            })),
          },
          learns: {
            create: data.skillsLearn.map((l) => ({
              skillName: l.skillName,
              level: l.level,
            })),
          },
          interests: {
            create: data.interests.map((name) => ({
              name,
            })),
          },
        },
      });

      return profile;
    });

    // Update active session cookie to include username and fullName
    await setSessionCookie({
      userId: session.userId,
      email: session.email,
      role: session.role,
      username: data.username,
      fullName: data.fullName,
    });

    return {
      success: true,
      message: "Onboarding complete! Welcome to Avenza.",
    };
  } catch (error) {
    console.error("Onboarding action error:", error);
    return {
      success: false,
      error: "Failed to save profile. Please check details and try again.",
    };
  }
}
