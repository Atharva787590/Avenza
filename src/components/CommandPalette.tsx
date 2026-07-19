"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Compass, Folder, Search, Sparkles, User, Settings, ShieldAlert, MessageSquare, Bell } from "lucide-react";

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Monitor keys
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const items = [
    { label: "Go to Dashboard", href: "/dashboard", icon: Compass, category: "Navigation" },
    { label: "Discover Students", href: "/discover", icon: User, category: "Navigation" },
    { label: "Explore Projects", href: "/projects", icon: Folder, category: "Navigation" },
    { label: "Mentorship Sessions", href: "/sessions", icon: Sparkles, category: "Navigation" },
    { label: "Messages & DMs", href: "/messages", icon: MessageSquare, category: "Navigation" },
    { label: "Notifications Center", href: "/notifications", icon: Bell, category: "Navigation" },
    { label: "Account Settings", href: "/settings", icon: Settings, category: "Account" },
    { label: "Admin Panel", href: "/admin", icon: ShieldAlert, category: "Admin" },
  ];

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length + 1) % (filteredItems.length + 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex === 0 && query.trim()) {
        // Search students
        router.push(`/discover?q=${encodeURIComponent(query)}`);
        setIsOpen(false);
      } else {
        const itemIdx = query.trim() ? selectedIndex - 1 : selectedIndex;
        const targetItem = filteredItems[itemIdx];
        if (targetItem) {
          router.push(targetItem.href);
          setIsOpen(false);
        }
      }
    }
  };

  const handleItemClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} className="p-0 overflow-hidden max-w-xl">
      <DialogTitle className="sr-only">Command Palette</DialogTitle>
      <div className="border-b border-border p-4 flex items-center gap-3">
        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
        <Input
          placeholder="Search students, projects, or navigate... (e.g. React, EcoTrack)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          className="border-0 bg-transparent px-0 py-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground w-full h-auto"
          autoFocus
        />
      </div>

      <div className="max-h-[350px] overflow-y-auto p-2 space-y-2">
        {query.trim() && (
          <div
            onClick={() => {
              router.push(`/discover?q=${encodeURIComponent(query)}`);
              setIsOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer select-none ${
              selectedIndex === 0 ? "bg-cobalt text-white font-medium" : "text-cloud hover:bg-deepslate/80"
            }`}
          >
            <Search className="h-4 w-4 shrink-0" />
            <div className="flex-1 truncate">
              Search students for <span className="font-semibold">&quot;{query}&quot;</span>
            </div>
            <span className="text-[10px] bg-border px-1.5 py-0.5 rounded font-mono">ENTER</span>
          </div>
        )}

        {filteredItems.map((item, idx) => {
          const actualIdx = query.trim() ? idx + 1 : idx;
          const isSelected = selectedIndex === actualIdx;
          const Icon = item.icon;

          return (
            <div
              key={item.href}
              onClick={() => handleItemClick(item.href)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer select-none ${
                isSelected ? "bg-cobalt text-white font-medium" : "text-cloud hover:bg-deepslate/80"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-white" : "text-muted-foreground"}`} />
              <span className="flex-1 truncate">{item.label}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                {item.category}
              </span>
            </div>
          );
        })}

        {filteredItems.length === 0 && (!query.trim()) && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No matching navigation items found.
          </div>
        )}
      </div>

      <div className="border-t border-border p-3 flex justify-between text-[11px] text-muted-foreground bg-ink/35">
        <div className="flex gap-4">
          <span><kbd className="font-mono bg-border px-1 py-0.5 rounded">↑↓</kbd> to navigate</span>
          <span><kbd className="font-mono bg-border px-1 py-0.5 rounded">⏎</kbd> to select</span>
        </div>
        <span>ESC to close</span>
      </div>
    </Dialog>
  );
}
