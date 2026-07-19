"use server";

import * as bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth";

const signUpSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export async function signUpAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = signUpSchema.safeParse({ email, password });
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists.",
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        role: "STUDENT",
      },
    });

    // Create session cookie
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      success: true,
      message: "Account created successfully. Redirecting to onboarding...",
    };
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again later.",
    };
  }
}

export async function signInAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = signInSchema.safeParse({ email, password });
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Invalid email or password.",
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        success: false,
        error: "Invalid email or password.",
      };
    }

    // Set cookie, include username/fullname if onboarding is completed
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
      username: user.profile?.username,
      fullName: user.profile?.fullName,
    });

    return {
      success: true,
      hasProfile: !!user.profile,
      message: "Successfully signed in. Redirecting...",
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again later.",
    };
  }
}

export async function forgotPasswordAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const newPassword = formData.get("newPassword") as string;

  const result = forgotPasswordSchema.safeParse({ email, newPassword });
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, don't reveal if email exists, but since this is a demo, we can notify clearly
      return {
        success: false,
        error: "No account found with this email address.",
      };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return {
      success: true,
      message: "Your password has been reset successfully. You can now sign in.",
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again later.",
    };
  }
}

export async function signOutAction() {
  await clearSessionCookie();
}
