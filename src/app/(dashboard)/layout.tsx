import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommandPalette } from "@/components/CommandPalette";
import { signOutAction } from "@/lib/actions/auth";
import { QuickSearchButton } from "@/components/QuickSearchButton";
import {
  Compass,
  Folder,
  Sparkles,
  Users,
  MessageSquare,
  Bell,
  Settings,
  ShieldAlert,
  Bookmark,
  LogOut,
  StickyNote,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: LayoutProps) {
  const session = await getSession();

  // If not authenticated, redirect to sign-in
  if (!session) {
    redirect("/sign-in");
  }

  // Fetch student profile details & notifications count
  const profile = await db.profile.findUnique({
    where: { userId: session.userId },
  });

  // If profile is missing (incomplete onboarding), force user to complete onboarding first
  if (!profile) {
    redirect("/onboarding");
  }

  const unreadNotificationsCount = await db.notification.count({
    where: { userId: session.userId, isRead: false },
  });

  const isAdmin = session.role === "ADMIN" || session.role === "MODERATOR";

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Compass },
    { label: "Discover Peers", href: "/discover", icon: Users },
    { label: "Explore Projects", href: "/projects", icon: Folder },
    { label: "Mentorship Sessions", href: "/sessions", icon: Sparkles },
    { label: "Study Notes", href: "/notes", icon: StickyNote },
    { label: "Saved Bookmarks", href: "/saved", icon: Bookmark },
    {
      label: "Direct Messages",
      href: "/messages",
      icon: MessageSquare,
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
    },
    { label: "Preferences", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-ink text-cloud">
      <CommandPalette />

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-deepslate z-30">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-border gap-2">
            <div className="h-8 w-8 rounded bg-cobalt flex items-center justify-center font-bold text-white tracking-wider">
              A
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Avenza</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-ink/40 transition-all group relative"
                >
                  <Icon className="h-5 w-5 group-hover:text-cobalt transition-colors" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="h-5 min-w-5 px-1 bg-cobalt text-[10px] font-bold text-white flex items-center justify-center rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-ink/40 transition-all group"
              >
                <ShieldAlert className="h-5 w-5 group-hover:text-coral transition-colors" />
                <span>Admin Moderation</span>
              </Link>
            )}
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-border bg-ink/20 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-cobalt/25 border border-cobalt/35 flex items-center justify-center font-bold text-white">
                {profile?.fullName.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate">{profile?.fullName || "User"}</h4>
                <p className="text-xs text-muted-foreground truncate">@{profile?.username || "username"}</p>
              </div>
            </div>
            <form action={signOutAction} className="w-full">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:text-coral hover:bg-coral/5 transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Top Header - Mobile */}
        <header className="sticky top-0 z-20 flex md:hidden items-center justify-between h-16 px-6 bg-deepslate border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-cobalt flex items-center justify-center font-bold text-sm text-white tracking-wider">
              A
            </div>
            <span className="text-base font-bold text-white">Avenza</span>
          </div>

          <div className="flex items-center gap-4">
            {unreadNotificationsCount > 0 && (
              <Link href="/notifications" className="relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-cobalt text-[9px] font-bold text-white flex items-center justify-center rounded-full">
                  {unreadNotificationsCount}
                </span>
              </Link>
            )}
            <form action={signOutAction}>
              <button type="submit" className="text-muted-foreground hover:text-coral cursor-pointer">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </header>

        {/* Floating Quick Action / Search bar at the top of pages */}
        <div className="h-14 border-b border-border bg-ink/35 flex items-center justify-between px-6 md:px-8 select-none">
          <div className="text-xs text-muted-foreground hidden sm:block">
            Press <kbd className="bg-deepslate px-1.5 py-0.5 border border-border rounded text-[10px] font-mono">⌘K</kbd> to search directory
          </div>
          <QuickSearchButton />
        </div>

        {/* Page Inner Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col">
          {children}
        </main>
      </div>

      {/* Bottom Nav Bar - Mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-deepslate border-t border-border flex items-center justify-around h-16">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground hover:text-white">
          <Compass className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link href="/discover" className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground hover:text-white">
          <Users className="h-5 w-5" />
          <span>Peers</span>
        </Link>
        <Link href="/projects" className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground hover:text-white">
          <Folder className="h-5 w-5" />
          <span>Projects</span>
        </Link>
        <Link href="/messages" className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground hover:text-white">
          <MessageSquare className="h-5 w-5" />
          <span>DMs</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground hover:text-white">
          <Settings className="h-5 w-5" />
          <span>Config</span>
        </Link>
      </nav>
    </div>
  );
}
