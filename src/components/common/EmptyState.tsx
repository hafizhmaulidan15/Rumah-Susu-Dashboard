"use client";

import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  illustration?: "search" | "data" | "error";
};

const illustrations = {
  search: (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="28"
        cy="28"
        r="14"
        stroke="var(--color-secondaryText)"
        strokeWidth="2"
        opacity="0.3"
      />
      <path
        d="M38 38L50 50"
        stroke="var(--color-secondaryText)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.3"
      />
      <circle
        cx="28"
        cy="28"
        r="8"
        fill="var(--color-mainColor)"
        opacity="0.08"
      />
    </svg>
  ),
  data: (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="12"
        y="20"
        width="40"
        height="28"
        rx="4"
        stroke="var(--color-secondaryText)"
        strokeWidth="1.5"
        opacity="0.25"
      />
      <path
        d="M12 28h40"
        stroke="var(--color-secondaryText)"
        strokeWidth="1.5"
        opacity="0.25"
      />
      <circle
        cx="22"
        cy="24"
        r="2"
        fill="var(--color-secondaryText)"
        opacity="0.3"
      />
      <circle
        cx="28"
        cy="24"
        r="2"
        fill="var(--color-secondaryText)"
        opacity="0.3"
      />
      <circle
        cx="34"
        cy="24"
        r="2"
        fill="var(--color-secondaryText)"
        opacity="0.3"
      />
      <rect
        x="18"
        y="34"
        width="10"
        height="6"
        rx="1"
        fill="var(--color-mainColor)"
        opacity="0.1"
      />
      <rect
        x="32"
        y="34"
        width="14"
        height="6"
        rx="1"
        fill="var(--color-mainColor)"
        opacity="0.1"
      />
      <rect
        x="18"
        y="44"
        width="28"
        height="2"
        rx="1"
        fill="var(--color-secondaryText)"
        opacity="0.15"
      />
    </svg>
  ),
  error: (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="32"
        cy="32"
        r="18"
        stroke="var(--color-redBadgeText)"
        strokeWidth="2"
        opacity="0.2"
      />
      <path
        d="M32 22v12"
        stroke="var(--color-redBadgeText)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
      <circle
        cx="32"
        cy="42"
        r="1.5"
        fill="var(--color-redBadgeText)"
        opacity="0.4"
      />
    </svg>
  ),
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  illustration,
}: EmptyStateProps) {
  const IllustrationComponent = illustration
    ? illustrations[illustration]
    : null;

  return (
    <div className="flex flex-col items-center justify-center h-64 px-6 text-center animate-fade-in">
      {IllustrationComponent && (
        <div className="mb-4">{IllustrationComponent}</div>
      )}
      {icon && !IllustrationComponent && (
        <div className="w-14 h-14 rounded-full bg-mainColor/5 flex items-center justify-center mb-4 text-secondaryText">
          {icon}
        </div>
      )}
      <p className="text-sm font-bold text-primaryText mb-1">{title}</p>
      {description && (
        <p className="text-xs text-secondaryText max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
