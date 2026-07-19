"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const result = await forgotPasswordAction(null, formData);

    if (result.success) {
      setSuccess(result.message || "Password reset successful.");
      toast({
        title: "Password Reset Successfully",
        description: result.message,
        type: "success",
      });
      // Redirect after 2s
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    } else {
      setError(result.error || "Failed to reset password");
      toast({
        title: "Reset Failed",
        description: result.error,
        type: "error",
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-6 bg-ink relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cobalt/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-deepslate border border-border rounded-2xl p-8 shadow-xl shadow-ink/65 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cobalt text-white font-bold text-xl tracking-wider mb-4 mx-auto">
            A
          </div>
          <h1 className="text-2xl font-bold text-white font-sans">Reset Password</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your university email and choose a new password
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-coral/10 border border-coral/30 rounded-xl text-sm text-coral font-medium text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-mint/10 border border-mint/30 rounded-xl text-sm text-mint font-medium text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">
              University Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Mail className="h-5 w-5" />
              </span>
              <Input
                name="email"
                type="email"
                placeholder="aarav.mehta@iitb.ac.in"
                required
                className="pl-10"
                disabled={loading || !!success}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">
              Choose New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Lock className="h-5 w-5" />
              </span>
              <Input
                name="newPassword"
                type="password"
                placeholder="••••••••"
                required
                className="pl-10"
                disabled={loading || !!success}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-2 font-semibold h-11"
            disabled={loading || !!success}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Remembered your password?{" "}
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
