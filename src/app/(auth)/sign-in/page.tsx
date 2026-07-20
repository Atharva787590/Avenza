"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInAction } from "@/lib/actions/auth";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  // Client-side field errors for instant feedback
  const [fieldErrors, setFieldErrors] = React.useState<{
    email?: string;
    password?: string;
  }>({});

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const validateFields = (email: string, password: string) => {
    const errors: { email?: string; password?: string } = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!password) {
      errors.password = "Password is required.";
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string) || "";
    const password = (formData.get("password") as string) || "";

    // Client-side validation before hitting the server
    const clientErrors = validateFields(email, password);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    const result = await signInAction(null, formData);

    if (result.success) {
      toast({
        title: "Signed In",
        description: result.message,
        type: "success",
      });
      // Push then refresh — router.refresh() is intentionally removed
      // to avoid a race condition where both compete.
      router.push(result.hasProfile ? callbackUrl : "/onboarding");
    } else {
      setError(result.error || "An error occurred. Please try again.");
      toast({
        title: "Sign In Failed",
        description: result.error,
        type: "error",
      });
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-deepslate/35 border border-border p-8 rounded-2xl shadow-xl shadow-ink/50 relative z-10 backdrop-blur-md">
      <div className="flex flex-col items-center mb-8">
        <div className="h-12 w-12 rounded-xl bg-cobalt flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-cobalt/20">
          A
        </div>
        <h1 className="text-2xl font-extrabold text-white mt-4 tracking-tight">
          Welcome back to Avenza
        </h1>
        <p className="text-xs text-muted-foreground mt-1.5 text-center leading-relaxed">
          Log in to collaborate, build projects, and exchange skills.
        </p>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-coral/10 border border-coral/20 rounded-lg text-xs font-semibold text-coral text-center leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-cobalt" />
              Email Address
            </label>
            <Input
              type="email"
              name="email"
              placeholder="yourname@gmail.com"
              required
              autoComplete="email"
              disabled={loading}
              className={`h-11 ${fieldErrors.email ? "border-coral/60 focus-visible:ring-coral/30" : ""}`}
              onChange={() =>
                fieldErrors.email &&
                setFieldErrors((p) => ({ ...p, email: undefined }))
              }
            />
            {fieldErrors.email && (
              <p className="text-[11px] text-coral">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-cloud uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-cobalt" />
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[10px] font-semibold text-muted-foreground hover:text-white hover:underline uppercase tracking-wider"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={loading}
                className={`h-11 pr-10 ${fieldErrors.password ? "border-coral/60 focus-visible:ring-coral/30" : ""}`}
                onChange={() =>
                  fieldErrors.password &&
                  setFieldErrors((p) => ({ ...p, password: undefined }))
                }
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-white transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[11px] text-coral">{fieldErrors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full mt-2 font-semibold h-11"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in…
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="text-cobalt font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-20 px-6 bg-ink relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cobalt/5 rounded-full blur-[100px] pointer-events-none" />
      <React.Suspense
        fallback={
          <div className="text-center text-xs text-muted-foreground py-10">
            Loading Avenza Authentication…
          </div>
        }
      >
        <SignInForm />
      </React.Suspense>
    </div>
  );
}
