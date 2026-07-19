"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpAction } from "@/lib/actions/auth";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await signUpAction(null, formData);

    if (result.success) {
      toast({
        title: "Account Created!",
        description: result.message,
        type: "success",
      });
      router.push("/onboarding");
      router.refresh();
    } else {
      setError(result.error || "Failed to sign up");
      toast({
        title: "Registration Failed",
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
          <h1 className="text-2xl font-bold text-white font-sans">Create Your Account</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Join a premium network designed exclusively for college builders
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-coral/10 border border-coral/30 rounded-xl text-sm text-coral font-medium text-center">
            {error}
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
                placeholder="alex.chen@stanford.edu"
                required
                className="pl-10"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Please use your official .edu university email address.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">
              Choose Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Lock className="h-5 w-5" />
              </span>
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="pl-10"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Must be at least 6 characters.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full mt-2 font-semibold h-11"
            disabled={loading}
          >
            {loading ? "Registering..." : "Create Account"}
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
