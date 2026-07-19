import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Constellation } from "@/components/Constellation";
import { ArrowRight, Code, Compass, Users, Workflow } from "lucide-react";

export default async function LandingPage() {
  const session = await getSession();

  return (
    <div className="flex-1 bg-ink text-cloud flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-ink/75 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-cobalt flex items-center justify-center font-bold text-lg text-white tracking-wider">
              A
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-sans">Avenza</span>
          </div>

          <nav className="flex items-center gap-6">
            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-95 shadow-md shadow-cobalt/20 transition-all cursor-pointer"
              >
                Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-muted-foreground hover:text-cloud transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-95 shadow-md shadow-cobalt/20 transition-all cursor-pointer"
                >
                  Join Now
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center py-20 px-6 border-b border-border bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-deepslate/30 via-ink to-ink">
        {/* Constellation Canvas background */}
        <div className="absolute inset-0 z-0">
          <Constellation />
        </div>

        {/* Soft background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cobalt/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 select-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cobalt/35 bg-cobalt/10 text-cobalt text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulse" />
            The College Builder Network
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Find your people.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cobalt via-indigo-400 to-mint">
              Build what matters.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Avenza is the premium workspace and directory for ambitious college students. 
            Discover talented peers, trade skills, find mentors, and launch products in shared team workspaces.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-cobalt px-8 py-4 text-base font-semibold text-white hover:bg-opacity-90 shadow-lg shadow-cobalt/25 hover:translate-y-[-1px] active:translate-y-[0px] transition-all cursor-pointer"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-cobalt px-8 py-4 text-base font-semibold text-white hover:bg-opacity-90 shadow-lg shadow-cobalt/25 hover:translate-y-[-1px] active:translate-y-[0px] transition-all cursor-pointer"
                >
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/sign-in"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-border bg-deepslate/80 backdrop-blur px-8 py-4 text-base font-semibold text-cloud hover:bg-deepslate transition-all cursor-pointer"
                >
                  Explore Directory
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Designed for the next generation of builders
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            Skip the noise of generic social media. Focus on finding co-founders, building side projects, and sharing hard skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-deepslate/40 border border-border p-6 rounded-2xl hover:border-cobalt/50 hover:bg-deepslate/60 transition-all flex flex-col justify-between group">
            <div>
              <div className="h-12 w-12 rounded-xl bg-cobalt/10 text-cobalt flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Student Directory</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Filter students by college, major, interests, and skills. Connect with co-founders and contributors.
              </p>
            </div>
            <div className="text-xs text-mint font-medium tracking-wide mt-6 uppercase">
              Discovery Engine
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-deepslate/40 border border-border p-6 rounded-2xl hover:border-cobalt/50 hover:bg-deepslate/60 transition-all flex flex-col justify-between group">
            <div>
              <div className="h-12 w-12 rounded-xl bg-mint/10 text-mint flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Skill Exchange</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Trade your expertise. Swap React design skills for machine learning tutorials in focused peer sessions.
              </p>
            </div>
            <div className="text-xs text-mint font-medium tracking-wide mt-6 uppercase">
              Peer-to-Peer
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-deepslate/40 border border-border p-6 rounded-2xl hover:border-cobalt/50 hover:bg-deepslate/60 transition-all flex flex-col justify-between group">
            <div>
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Code className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Launch Teams</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Create project opportunities or apply to existing hackathon ideas. Recuit specialized student roles.
              </p>
            </div>
            <div className="text-xs text-mint font-medium tracking-wide mt-6 uppercase">
              Recruitment
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-deepslate/40 border border-border p-6 rounded-2xl hover:border-cobalt/50 hover:bg-deepslate/60 transition-all flex flex-col justify-between group">
            <div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Workflow className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Shared Workspace</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Manage collaboration using an integrated Kanban board, team milestones, resource listings, and activities.
              </p>
            </div>
            <div className="text-xs text-mint font-medium tracking-wide mt-6 uppercase">
              Workspace Suite
            </div>
          </div>
        </div>
      </section>

      {/* Stats Divider */}
      <section className="border-t border-b border-border bg-deepslate/20 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">25+</div>
            <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider font-semibold">Active Profiles</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">10+</div>
            <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider font-semibold">Active Projects</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">100%</div>
            <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider font-semibold">Student Verified</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">0%</div>
            <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider font-semibold">Recruiter Noise</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-ink py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-cobalt flex items-center justify-center font-bold text-sm text-white tracking-wider">
              A
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">Avenza</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Avenza. Built for ambitious student teams. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
