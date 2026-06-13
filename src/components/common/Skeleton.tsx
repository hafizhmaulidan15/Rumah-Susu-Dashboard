"use client";

import type { CSSProperties } from "react";

type SkeletonProps = {
  className?: string;
  style?: CSSProperties;
};

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-skeletonBg ${className}`}
      aria-hidden="true"
      style={style}
    />
  );
}

type SkeletonCardProps = {
  rows?: number;
  className?: string;
};

export function SkeletonCard({ rows = 4, className = "" }: SkeletonCardProps) {
  return (
    <div className={`space-y-3 p-5 ${className}`}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <div className="space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    </div>
  );
}

type SkeletonTableProps = {
  rows?: number;
  cols?: number;
  className?: string;
};

export function SkeletonTable({
  rows = 5,
  cols = 4,
  className = "",
}: SkeletonTableProps) {
  return (
    <div className={`p-4 ${className}`}>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton
                key={j}
                className="h-4 flex-1"
                style={{
                  width: j === cols - 1 ? "60%" : undefined,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
