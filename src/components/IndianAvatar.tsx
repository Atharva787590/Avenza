import * as React from "react";

interface IndianAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

// Generate deterministic Indian-themed gradient based on user's name
const GRADIENTS = [
  "from-[#FF9933] via-[#FFFFFF] to-[#138808] text-[#000080]", // Tricolor
  "from-[#FF9933] to-[#D84315] text-white",                    // Deep Saffron
  "from-[#000080] via-[#1E3A8A] to-[#138808] text-white",     // Navy to Ashoka Green
  "from-[#138808] to-[#046A38] text-white",                    // Emerald Green
  "from-[#FF9933] via-[#FB8C00] to-[#000080] text-white",     // Sunset Orange Navy
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

const SIZE_MAP = {
  sm: "h-8 w-8 text-xs font-bold border",
  md: "h-10 w-10 text-sm font-bold border-2",
  lg: "h-14 w-14 text-lg font-extrabold border-2",
  xl: "h-20 w-20 text-2xl font-black border-4",
};

export function IndianAvatar({ name, avatarUrl, size = "md", className = "" }: IndianAvatarProps) {
  const initials = (name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const gradientClass = getGradient(name || "User");
  const sizeClass = SIZE_MAP[size];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover border-saffron/40 shadow-sm ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-tr ${gradientClass} border-saffron/40 flex items-center justify-center shadow-md shrink-0 select-none ${className}`}
      title={name}
    >
      <span>{initials}</span>
    </div>
  );
}
