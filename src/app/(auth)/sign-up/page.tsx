"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpAction } from "@/lib/actions/auth";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  // Live password strength
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [fieldErrors, setFieldErrors] = React.useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const passwordStrength = React.useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][
    passwordStrength
  ];
  const strengthColor = [
    "",
    "bg-red-500",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-emerald-400",
    "bg-emerald-500",
  ][passwordStrength];

  const validateFields = (
    email: string,
    pwd: string,
    confirmPwd: string
  ) => {
    const errors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!pwd || pwd.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
    if (pwd !== confirmPwd) {
      errors.confirmPassword = "Passwords do not match.";
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string) || "";
    const pwd = (formData.get("password") as string) || "";
    const confirmPwd = (formData.get("confirmPassword") as string) || "";

    const clientErrors = validateFields(email, pwd, confirmPwd);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    const result = await signUpAction(null, formData);

    if (result.success) {
      toast({
        title: "Account Created!",
        description: result.message,
        type: "success",
      });
      router.push("/onboarding");
    } else {
      setError(result.error || "Failed to create account. Please try again.");
      toast({
        title: "Registration Failed",
        description: result.error,
        type: "error",
      });
      setLoading(false);
    }
  };

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-6 bg-ink relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cobalt/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-deepslate border border-border rounded-2xl p-8 shadow-xl shadow-ink/65 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cobalt text-white font-bold text-xl tracking-wider mb-4 mx-auto">
            A
          </div>
          <h1 className="text-2xl font-bold text-white font-sans">
            Create Your Account
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Join a premium network designed exclusively for college builders
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-coral/10 border border-coral/30 rounded-xl text-sm text-coral font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                <Mail className="h-5 w-5" />
              </span>
              <Input
                name="email"
                type="email"
                placeholder="yourname@gmail.com"
                required
                autoComplete="email"
                className={`pl-10 ${fieldErrors.email ? "border-coral/60 focus-visible:ring-coral/30" : ""}`}
                disabled={loading}
                onChange={() =>
                  fieldErrors.email &&
                  setFieldErrors((p) => ({ ...p, email: undefined }))
                }
              />
            </div>
            {fieldErrors.email ? (
              <p className="text-[11px] text-coral">{fieldErrors.email}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Use any email — Gmail, Outlook, college email, etc.
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">
              Choose Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                <Lock className="h-5 w-5" />
              </span>
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className={`pl-10 pr-10 ${fieldErrors.password ? "border-coral/60 focus-visible:ring-coral/30" : ""}`}
                disabled={loading}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password)
                    setFieldErrors((p) => ({ ...p, password: undefined }));
                }}
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

            {/* Strength bar */}
            {password.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= passwordStrength ? strengthColor : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Strength:{" "}
                  <span
                    className={`font-semibold ${
                      passwordStrength <= 1
                        ? "text-red-400"
                        : passwordStrength <= 2
                          ? "text-orange-400"
                          : passwordStrength <= 3
                            ? "text-yellow-400"
                            : "text-emerald-400"
                    }`}
                  >
                    {strengthLabel}
                  </span>
                </p>
              </div>
            )}

            {fieldErrors.password && (
              <p className="text-[11px] text-coral">{fieldErrors.password}</p>
            )}
            {!fieldErrors.password && !password && (
              <p className="text-xs text-muted-foreground">
                Must be at least 6 characters.
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                <Lock className="h-5 w-5" />
              </span>
              <Input
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className={`pl-10 pr-10 ${fieldErrors.confirmPassword ? "border-coral/60 focus-visible:ring-coral/30" : passwordsMatch ? "border-emerald-500/50" : ""}`}
                disabled={loading}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword)
                    setFieldErrors((p) => ({
                      ...p,
                      confirmPassword: undefined,
                    }));
                }}
              />
              <div className="absolute inset-y-0 right-3 flex items-center gap-1.5">
                {passwordsMatch && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                )}
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="text-muted-foreground hover:text-white transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-[11px] text-coral">
                {fieldErrors.confirmPassword}
              </p>
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
                Creating account…
              </span>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-cobalt font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
