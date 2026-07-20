"use server";

import * as bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth";

// ─── Validation Schemas ──────────────────────────────────────────────────────

const signUpSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address.")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .max(72, "Password must be at most 72 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const signInSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address.")
    .toLowerCase()
    .trim(),
  password: z.string().min(1, "Password is required."),
});

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address.")
    .toLowerCase()
    .trim(),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters.")
    .max(72, "Password must be at most 72 characters."),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Cost factor of 10 is standard; lower means faster but weaker hashing.
// 10 is a good balance for most production apps.
const BCRYPT_COST = 10;

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function signUpAction(prevState: unknown, formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  // If confirmPassword field is not used (legacy form), skip that check
  if (!raw.confirmPassword) {
    raw.confirmPassword = raw.password;
  }

  const result = signUpSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  const { email, password } = result.data;

  try {
    // Hash password before checking for duplicate — parallel-safe
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

    // Use a single CREATE query — catch unique constraint violation
    // instead of two round-trips (findUnique + create).
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        role: "STUDENT",
      },
      select: { id: true, email: true, role: true },
    });

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      success: true,
      message: "Account created! Redirecting to onboarding…",
    };
  } catch (error: unknown) {
    // Prisma unique constraint violation code
    if (
      error !== null &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return {
        success: false,
        error: "An account with this email already exists. Try signing in.",
      };
    }

    console.error("Sign up error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again later.",
    };
  }
}

export async function signInAction(prevState: unknown, formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = signInSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  const { email, password } = result.data;

  try {
    // Fetch user + only the profile fields we need for the session cookie
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        passwordHash: true,
        profile: {
          select: {
            username: true,
            fullName: true,
          },
        },
      },
    });

    // Use constant-time comparison path even when user is not found
    // to prevent timing-based email enumeration.
    const dummyHash =
      "$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012";
    const isPasswordValid = await bcrypt.compare(
      password,
      user?.passwordHash ?? dummyHash
    );

    if (!user || !isPasswordValid) {
      return {
        success: false,
        error: "Invalid email or password.",
      };
    }

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
      message: "Signed in successfully. Redirecting…",
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again later.",
    };
  }
}

export async function forgotPasswordAction(
  prevState: unknown,
  formData: FormData
) {
  const raw = {
    email: formData.get("email") as string,
    newPassword: formData.get("newPassword") as string,
  };

  const result = forgotPasswordSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  const { email, newPassword } = result.data;

  try {
    // Hash before DB lookup to reduce total latency
    const [passwordHash, user] = await Promise.all([
      bcrypt.hash(newPassword, BCRYPT_COST),
      db.user.findUnique({
        where: { email },
        select: { id: true },
      }),
    ]);

    if (!user) {
      return {
        success: false,
        error: "No account found with this email address.",
      };
    }

    await db.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return {
      success: true,
      message: "Password reset successfully. You can now sign in.",
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
