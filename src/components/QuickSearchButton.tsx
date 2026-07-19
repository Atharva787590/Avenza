"use client";

import React from "react";
import { Search } from "lucide-react";

export function QuickSearchButton() {
  const handleClick = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true })
    );
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors cursor-pointer bg-deepslate/50 hover:bg-deepslate px-3 py-1.5 rounded-lg border border-border w-full sm:w-auto"
    >
      <Search className="h-3.5 w-3.5" />
      Quick navigation...
    </button>
  );
}
