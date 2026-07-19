"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInAction } from "@/lib/actions/auth";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail } from "lucide-react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await signInAction(null, formData);

    if (result.success) {
      toast({
        title: "Signed In Successfully",
        description: result.message,
        type: "success",
      });

      if (result.hasProfile) {
        router.push(callbackUrl);
      } else {
        router.push("/onboarding");
      }
      router.refresh();
    } else {
      setError(result.error || "An error occurred.");
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-cloud uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-cobalt" />
              University Email
            </label>
            <Input
              type="email"
              name="email"
              placeholder="aarav.mehta@iitb.ac.in"
              required
              disabled={loading}
              className="h-11"
            />
          </div>

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
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              disabled={loading}
              className="h-11"
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-2 font-semibold h-11"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
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
      <React.Suspense fallback={<div className="text-center text-xs text-muted-foreground py-10">Loading Avenza Authentication...</div>}>
        <SignInForm />
      </React.Suspense>
    </div>
  );
}
