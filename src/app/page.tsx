import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Constellation } from "@/components/Constellation";
import { ArrowRight, Code, Compass, Users, Workflow, Sparkles, CheckCircle2, BookOpen, UserPlus, ShieldCheck, Lock } from "lucide-react";

export default async function LandingPage() {
  const session = await getSession();

  return (
    <div className="flex-1 bg-[#FBF9F5] text-[#18181B] flex flex-col relative overflow-hidden font-sans">
      {/* Background SVG Grid Overlay matching screenshot */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `radial-gradient(#E2DFD7 1px, transparent 1px), linear-gradient(to right, #F3F0E8 1px, transparent 1px), linear-gradient(to bottom, #F3F0E8 1px, transparent 1px)`,
          backgroundSize: "24px 24px, 48px 48px, 48px 48px",
        }}
      />

      {/* ── Top Header Navigation Bar ── */}
      <header className="border-b border-[#EAE7DF] bg-[#FBF9F5]/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 group">
            <span className="text-2xl font-black tracking-tight text-[#FF3B30] font-sans lowercase">avenza</span>
            <div className="h-4 w-4 bg-[#FF3B30] clip-path-triangle flex items-center justify-center text-[10px] text-white font-bold rounded-sm shadow-sm group-hover:scale-110 transition-transform">
              ▲
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-8 text-sm font-medium text-[#52525B]">
            <a href="#features" className="hover:text-[#18181B] transition-colors hidden sm:block">
              Services
            </a>
            <a href="#how-it-works" className="hover:text-[#18181B] transition-colors hidden sm:block">
              How it works
            </a>
            <Link href="/discover" className="hover:text-[#18181B] transition-colors">
              Discover Peers
            </Link>
            <a href="#process" className="hover:text-[#18181B] transition-colors hidden md:block">
              Process
            </a>

            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-[#FF3B30] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#E03126] shadow-md shadow-red-500/20 transition-all cursor-pointer"
              >
                Dashboard →
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/sign-in"
                  className="text-sm font-semibold text-[#18181B] hover:text-[#FF3B30] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded-full bg-[#FF3B30] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#E03126] shadow-md shadow-red-500/20 transition-all cursor-pointer"
                >
                  Create Account
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative min-h-[82vh] flex items-center py-16 px-6 max-w-7xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          {/* Left Column: Headline & Action Buttons */}
          <div className="lg:col-span-7 space-y-8 text-left z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E2DFD7] bg-[#F3F0E8] text-[#FF3B30] text-xs font-mono font-semibold tracking-wider">
              <span className="h-2 w-2 rounded-full bg-[#FF3B30] animate-pulse" />
              India&apos;s Premier Student Builder Hub
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tight text-[#18181B] leading-[1.1] font-sans">
              From idea<br />
              to <span className="text-[#FF3B30] font-normal italic">production</span>
            </h1>

            <p className="text-base sm:text-lg text-[#52525B] max-w-xl leading-relaxed font-normal">
              A compact, premier engineering network for Indian student developers, researchers, and co-builders. Modular architecture, practical AI, and collaborative tools in every delivery.
            </p>

            {/* Action Buttons matching screenshot */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {session ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-full bg-[#FF3B30] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[#E03126] shadow-lg shadow-red-500/20 transition-all cursor-pointer"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center rounded-full bg-[#FF3B30] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[#E03126] shadow-lg shadow-red-500/20 transition-all cursor-pointer"
                  >
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href="/sign-in"
                    className="inline-flex items-center justify-center rounded-full bg-[#27272A] px-8 py-3.5 text-sm font-semibold text-white hover:bg-black transition-all cursor-pointer"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Interactive 3D Wireframe Sphere Graphic */}
          <div className="lg:col-span-5 h-[480px] relative flex items-center justify-center">
            <div className="w-full h-full relative">
              <Constellation />
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom Metrics Strip (Matching screenshot footer metrics) ── */}
      <section className="border-t border-b border-[#EAE7DF] bg-[#F5F2EA]/80 py-8 px-6 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="border-r border-[#E2DFD7] last:border-r-0 pr-4">
            <div className="text-3xl font-extrabold text-[#18181B] font-mono">72h</div>
            <div className="text-xs text-[#71717A] uppercase tracking-wider font-semibold mt-1">
              Custom Hackathon Sprint
            </div>
          </div>
          <div className="border-r border-[#E2DFD7] last:border-r-0 pr-4">
            <div className="text-3xl font-extrabold text-[#FF3B30] font-mono">100%</div>
            <div className="text-xs text-[#71717A] uppercase tracking-wider font-semibold mt-1">
              Student Verified ID
            </div>
          </div>
          <div className="border-r border-[#E2DFD7] last:border-r-0 pr-4">
            <div className="text-3xl font-extrabold text-[#18181B] font-mono">~2h</div>
            <div className="text-xs text-[#71717A] uppercase tracking-wider font-semibold mt-1">
              Response Time
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#18181B] font-mono">40+</div>
            <div className="text-xs text-[#71717A] uppercase tracking-wider font-semibold mt-1">
              Indian Campuses
            </div>
          </div>
        </div>
      </section>

      {/* ── MANDATORY STEP-BY-STEP USER JOURNEY SECTION ── */}
      <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto w-full z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-bold text-[#FF3B30] uppercase tracking-widest">
            Step-by-Step Access Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#18181B]">
            How Every Student Joins Avenza
          </h2>
          <p className="text-sm text-[#71717A] leading-relaxed">
            To maintain a high-trust builder network, every individual user completes a mandatory 3-step onboarding before accessing the platform dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="bg-[#FFFFFF] border border-[#EAE7DF] p-8 rounded-3xl shadow-sm space-y-4 relative hover:border-[#FF3B30]/40 transition-all group">
            <div className="h-12 w-12 rounded-2xl bg-[#FF3B30]/10 text-[#FF3B30] font-bold text-lg flex items-center justify-center font-mono">
              01
            </div>
            <h3 className="text-lg font-bold text-[#18181B]">1. Register & Sign Up</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Create your account with any email address (Gmail, Outlook, or official university email).
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center text-xs font-bold text-[#FF3B30] hover:underline pt-2"
            >
              Sign Up Now →
            </Link>
          </div>

          {/* Step 2 */}
          <div className="bg-[#FFFFFF] border border-[#EAE7DF] p-8 rounded-3xl shadow-sm space-y-4 relative hover:border-[#FF3B30]/40 transition-all group">
            <div className="h-12 w-12 rounded-2xl bg-[#18181B]/10 text-[#18181B] font-bold text-lg flex items-center justify-center font-mono">
              02
            </div>
            <h3 className="text-lg font-bold text-[#18181B]">2. Authenticate Sign In</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Log in securely with encrypted session tokens. If onboarding is incomplete, you are automatically directed to setup.
            </p>
            <Link
              href="/sign-in"
              className="inline-flex items-center text-xs font-bold text-[#18181B] hover:underline pt-2"
            >
              Sign In →
            </Link>
          </div>

          {/* Step 3 */}
          <div className="bg-[#FFFFFF] border border-[#EAE7DF] p-8 rounded-3xl shadow-sm space-y-4 relative hover:border-[#FF3B30]/40 transition-all group">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold text-lg flex items-center justify-center font-mono">
              03
            </div>
            <h3 className="text-lg font-bold text-[#18181B]">3. Provide All Info & Launch ID</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Fill out your 5-step Indian Student ID profile (college, CGPA, hackathon wins, skills, social handles) to unlock the dashboard.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center text-xs font-bold text-emerald-600 hover:underline pt-2"
            >
              Complete Profile →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features Services Grid Section ── */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto w-full z-10 border-t border-[#EAE7DF]">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-bold text-[#FF3B30] uppercase tracking-widest">
            Core Platform Features
          </span>
          <h2 className="text-3xl font-bold text-[#18181B]">Designed For Campus Builders</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#FFFFFF] border border-[#EAE7DF] p-6 rounded-2xl shadow-sm hover:border-[#FF3B30]/40 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#18181B]">Student Directory & @Username Search</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Connect with students across IITs, BITS, NITs using Instagram/LinkedIn style `@username` searches and skill filters.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#FFFFFF] border border-[#EAE7DF] p-6 rounded-2xl shadow-sm hover:border-[#FF3B30]/40 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#18181B]">WhatsApp-Style In-App Messaging</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Direct in-app chat with WhatsApp-style emerald bubbles, IST timestamps, double checkmarks, and emoji shortcuts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#FFFFFF] border border-[#EAE7DF] p-6 rounded-2xl shadow-sm hover:border-[#FF3B30]/40 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#18181B]">Shared Study Notes & Notepad</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Private collaborative notepad per connected pair for study resources, meeting minutes, and code snippets with auto-save.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#FFFFFF] border border-[#EAE7DF] p-6 rounded-2xl shadow-sm hover:border-[#FF3B30]/40 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#18181B]">Digital Ideas Canvas & Gemini AI</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Post hackathon idea cards and run Gemini AI to generate project ideas, checklists, and Hinglish concept summaries.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-[#FFFFFF] border border-[#EAE7DF] p-6 rounded-2xl shadow-sm hover:border-[#FF3B30]/40 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Code className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#18181B]">Hackathon Team Recruitment</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Find teammates for Smart India Hackathon (SIH) and college fests by filtering skills offered and needed.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-[#FFFFFF] border border-[#EAE7DF] p-6 rounded-2xl shadow-sm hover:border-[#FF3B30]/40 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#18181B]/10 text-[#18181B] flex items-center justify-center">
              <Workflow className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#18181B]">Project Kanban Workspaces</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Integrated project management suite with task boards, milestone tracking, resource links, and team activity feeds.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#EAE7DF] bg-[#F5F2EA] py-12 px-6 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black tracking-tight text-[#FF3B30] lowercase">avenza</span>
            <div className="h-3 w-3 bg-[#FF3B30] text-[8px] text-white font-bold flex items-center justify-center rounded-sm">
              ▲
            </div>
          </div>
          <p className="text-xs text-[#71717A]">
            © {new Date().getFullYear()} Avenza. Built for Indian student engineering teams & co-builders.
          </p>
        </div>
      </footer>
    </div>
  );
}
