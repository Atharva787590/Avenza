"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getSession, setSessionCookie } from "@/lib/auth";

const onboardingSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").trim(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .toLowerCase()
    .trim(),
  college: z.string().min(2, "College name must be at least 2 characters").trim(),
  course: z.string().min(2, "Course/Major must be at least 2 characters").trim(),
  gradYear: z.number().int().min(2020).max(2035),
  yearOfStudy: z.number().int().min(1).max(6).optional().nullable(),
  cgpa: z.number().min(0).max(10).optional().nullable(),
  location: z.string().min(2, "Location is required").trim(),
  state: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500).trim(),
  phone: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  hackathonWins: z.number().int().min(0).default(0),
  achievements: z.array(z.string()).default([]),
  availability: z.string().default("ACTIVE"),
  collabPreferences: z
    .string()
    .min(10, "Please describe your collaboration preferences")
    .trim(),
  githubUrl: z.string().url("Invalid GitHub URL").or(z.literal("")).optional(),
  linkedinUrl: z
    .string()
    .url("Invalid LinkedIn URL")
    .or(z.literal(""))
    .optional(),
  portfolioUrl: z
    .string()
    .url("Invalid Portfolio URL")
    .or(z.literal(""))
    .optional(),
  instagramUrl: z
    .string()
    .url("Invalid Instagram URL")
    .or(z.literal(""))
    .optional(),
  twitterUrl: z
    .string()
    .url("Invalid Twitter/X URL")
    .or(z.literal(""))
    .optional(),
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

    // Check username availability — single query
    const existingProfile = await db.profile.findUnique({
      where: { username: data.username },
      select: { id: true },
    });

    if (existingProfile) {
      return {
        success: false,
        error: "This username is already taken. Please choose another.",
      };
    }

    // Create profile with all new Indian fields
    await db.$transaction(async (tx) => {
      await tx.profile.create({
        data: {
          userId: session.userId,
          username: data.username,
          fullName: data.fullName,
          college: data.college,
          course: data.course,
          gradYear: data.gradYear,
          yearOfStudy: data.yearOfStudy ?? null,
          cgpa: data.cgpa ?? null,
          location: data.location,
          state: data.state ?? null,
          city: data.city ?? null,
          bio: data.bio,
          phone: data.phone ?? null,
          gender: data.gender ?? null,
          dateOfBirth: data.dateOfBirth ?? null,
          hackathonWins: data.hackathonWins ?? 0,
          achievements: data.achievements?.length
            ? JSON.stringify(data.achievements)
            : null,
          availability: data.availability,
          collabPreferences: data.collabPreferences,
          githubUrl: data.githubUrl || null,
          linkedinUrl: data.linkedinUrl || null,
          portfolioUrl: data.portfolioUrl || null,
          instagramUrl: data.instagramUrl || null,
          twitterUrl: data.twitterUrl || null,
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
            create: data.interests.map((name) => ({ name })),
          },
        },
      });
    });

    // Refresh session cookie with username + fullName
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
      error: "Failed to save profile. Please check all details and try again.",
    };
  }
}
