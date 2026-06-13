"use client";

import { useMemo } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}

export function Sparkline({
  data,
  width = 72,
  height = 24,
  className,
  color,
}: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return "";

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 2) - 1;
      return `${x},${y}`;
    });

    return `M${points.join(" L")}`;
  }, [data, width, height]);

  const trend = useMemo(() => {
    if (data.length < 2) return "neutral";
    const last = data[data.length - 1];
    const first = data[0];
    if (last > first) return "up";
    if (last < first) return "down";
    return "neutral";
  }, [data]);

  if (data.length < 2) return null;

  const strokeColor =
    color ||
    (trend === "up"
      ? "var(--color-greenBadgeText)"
      : trend === "down"
        ? "var(--color-redBadgeText)"
        : "var(--color-secondaryText)");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
