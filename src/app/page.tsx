import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Constellation } from "@/components/Constellation";
import { ArrowRight, Code, Compass, Users, Workflow } from "lucide-react";

export default async function LandingPage() {
  const session = await getSession();

  return (
    <div className="flex-1 bg-ink text-cloud flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="border-b border-border/40 bg-ink/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded bg-cobalt flex items-center justify-center font-bold text-lg text-white tracking-wider">
              A
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-sans">Avenza</span>
          </div>

          <nav className="flex items-center gap-6">
            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded bg-cobalt px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-95 shadow-sm shadow-cobalt/20 transition-all cursor-pointer font-sans"
              >
                Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-muted-foreground hover:text-cloud transition-colors font-sans"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded bg-cobalt px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-95 shadow-sm shadow-cobalt/20 transition-all cursor-pointer font-sans"
                >
                  Join Now
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-20 px-6 border-b border-border/30 bg-ink">
        {/* Constellation Canvas background */}
        <div className="absolute inset-0 z-0">
          <Constellation />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 select-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-border/40 bg-deepslate/30 text-mint text-xs font-mono uppercase tracking-wider mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulse" />
            {"India's"} Premier Student Builder Hub
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight font-sans">
            Find your co-builders.<br />
            <span className="text-cobalt">
              Build what matters.
            </span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-sans font-normal">
            Avenza is a high-utility directory and collaborative workspace tailored specifically for ambitious engineering students in India. Discover peers at IITs, BITS, NITs, and IIITs, trade technical skills, and manage projects in shared workspaces.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded bg-cobalt px-8 py-3.5 text-base font-semibold text-white hover:bg-opacity-90 shadow shadow-cobalt/20 transition-all cursor-pointer font-sans"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded bg-cobalt px-8 py-3.5 text-base font-semibold text-white hover:bg-opacity-90 shadow shadow-cobalt/20 transition-all cursor-pointer font-sans"
                >
                  Create Free Profile
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/sign-in"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded border border-border bg-deepslate/40 backdrop-blur px-8 py-3.5 text-base font-semibold text-cloud hover:bg-deepslate/60 transition-all cursor-pointer font-sans"
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
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4 font-sans">
            Designed for high-utility collaboration
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base font-sans">
            Skip the noise of generic social media. Focus on finding co-founders, building side projects, and sharing hard skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-deepslate/20 border border-border/40 p-6 rounded hover:border-cobalt/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="h-10 w-10 rounded bg-cobalt/10 text-cobalt flex items-center justify-center mb-6">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 font-sans">Student Directory</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Filter students by college (IITs, BITS, NITs), major, interests, and skills. Connect with co-founders and contributors instantly.
              </p>
            </div>
            <div className="text-[10px] text-mint font-mono uppercase tracking-wider mt-6">
              Discovery Engine
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-deepslate/20 border border-border/40 p-6 rounded hover:border-cobalt/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="h-10 w-10 rounded bg-mint/10 text-mint flex items-center justify-center mb-6">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 font-sans">Skill Exchange</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Trade your expertise. Swap React design skills for machine learning tutorials in focused peer-to-peer learning sessions.
              </p>
            </div>
            <div className="text-[10px] text-mint font-mono uppercase tracking-wider mt-6">
              Peer-to-Peer
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-deepslate/20 border border-border/40 p-6 rounded hover:border-cobalt/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="h-10 w-10 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6">
                <Code className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 font-sans">Launch Teams</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Create project opportunities or apply to existing hackathon ideas. Recruit specialized student roles across campuses.
              </p>
            </div>
            <div className="text-[10px] text-mint font-mono uppercase tracking-wider mt-6">
              Recruitment
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-deepslate/20 border border-border/40 p-6 rounded hover:border-cobalt/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="h-10 w-10 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                <Workflow className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 font-sans">Shared Workspace</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Manage collaboration using an integrated Kanban board, team milestones, resource listings, and activities.
              </p>
            </div>
            <div className="text-[10px] text-mint font-mono uppercase tracking-wider mt-6">
              Workspace Suite
            </div>
          </div>
        </div>
      </section>

      {/* Stats Divider */}
      <section className="border-t border-b border-border/30 bg-deepslate/10 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-extrabold text-white mb-1 font-mono">25+</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Profiles</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white mb-1 font-mono">10+</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Projects</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white mb-1 font-mono">100%</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Student Verified</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white mb-1 font-mono">0%</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Recruiter Noise</div>
          </div>
        </div>
      </section>

      {/* System Citations & Architecture */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full border-b border-border/30">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4">
            <h3 className="text-lg font-bold text-white mb-2 font-sans">System Citations</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              Avenza is engineered with a modular directory structure, decoupling user matching from live project collaboration suites. Listed below are the primary technologies and dependency paths backing this workspace.
            </p>
          </div>
          <div className="md:col-span-8 overflow-x-auto">
            <table className="min-w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground">
                  <th className="py-2 pr-4 font-semibold">Module</th>
                  <th className="py-2 pr-4 font-semibold">Dependency / Spec</th>
                  <th className="py-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-muted-foreground">
                <tr>
                  <td className="py-2.5 pr-4 font-semibold text-white">Client Shell</td>
                  <td className="py-2.5 pr-4">React 19, Next.js 16.2.10</td>
                  <td className="py-2.5">App Router architecture utilizing proxy-level routing.</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-semibold text-white">Data Modeling</td>
                  <td className="py-2.5 pr-4">Prisma ORM 6.3.0, SQLite 3</td>
                  <td className="py-2.5">Relational schema handling profile matching and project milestones.</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-semibold text-white">Graphics & Canvas</td>
                  <td className="py-2.5 pr-4">HTML5 Canvas 2D Context</td>
                  <td className="py-2.5">3D perspective projection coordinate rendering without external libraries.</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-semibold text-white">Style Utility</td>
                  <td className="py-2.5 pr-4">Tailwind CSS 4.x</td>
                  <td className="py-2.5">Minimalist color variables mapping core structural tokens.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-ink py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-cobalt flex items-center justify-center font-bold text-sm text-white tracking-wider">
              A
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">Avenza</span>
          </div>
          <p className="text-xs text-muted-foreground font-sans">
            © {new Date().getFullYear()} Avenza. Built for ambitious student teams. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
