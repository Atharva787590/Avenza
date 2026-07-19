"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getSession, setSessionCookie } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const settingsSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").trim(),
  location: z.string().min(2, "Location is required").trim(),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500).trim(),
  availability: z.string().default("ACTIVE"),
  collabPreferences: z.string().min(10, "Please describe your collaboration preferences").trim(),
  githubUrl: z.string().url("Invalid GitHub URL").or(z.literal("")).optional(),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").or(z.literal("")).optional(),
  portfolioUrl: z.string().url("Invalid Portfolio URL").or(z.literal("")).optional(),
});

export async function updateProfileSettingsAction(formDataJSON: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const rawData = JSON.parse(formDataJSON);
    const result = settingsSchema.safeParse(rawData);

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0].message,
      };
    }

    const data = result.data;

    // Update profile
    const updatedProfile = await db.profile.update({
      where: { userId: session.userId },
      data: {
        fullName: data.fullName,
        location: data.location,
        bio: data.bio,
        availability: data.availability,
        collabPreferences: data.collabPreferences,
        githubUrl: data.githubUrl || null,
        linkedinUrl: data.linkedinUrl || null,
        portfolioUrl: data.portfolioUrl || null,
      },
    });

    // Update session cookie
    await setSessionCookie({
      userId: session.userId,
      email: session.email,
      role: session.role,
      username: updatedProfile.username,
      fullName: updatedProfile.fullName,
    });

    revalidatePath("/settings");
    revalidatePath(`/people/${updatedProfile.username}`);
    return { success: true, message: "Profile settings saved successfully." };
  } catch (error) {
    console.error("Error updating profile settings:", error);
    return { success: false, error: "Failed to update profile settings." };
  }
}
