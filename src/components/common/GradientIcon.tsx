"use client";

import type { ReactNode } from "react";

interface GradientIconProps {
  children: ReactNode;
  className?: string;
  gradient?: string;
}

export function GradientIcon({
  children,
  className = "",
  gradient = "from-mainColor to-purple-500",
}: GradientIconProps) {
  return (
    <div
      className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-lg shadow-mainColor/20 ${className}`}
    >
      <div className="text-white">{children}</div>
    </div>
  );
}
