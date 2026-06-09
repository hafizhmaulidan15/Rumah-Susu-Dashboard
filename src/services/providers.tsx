"use client";

import { ThemeProvider } from "next-themes";
import { useEffect } from "react";

import { TooltipProvider } from "@/components/common/shadcn/tooltip";
import { Layout } from "@/components/layout/Layout";
import { APP_DEFAULTS } from "@/config/appDefaults";
import { usePWA } from "@/hooks/usePWA";

export const THEMES_ARRAY = ["light", "dark"];

function suppressHydrationWarnings() {
  const original = console.error;
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (msg.includes("hydrated") && msg.includes("did not match")) return;
    original.call(console, ...args);
  };
  return () => {
    console.error = original;
  };
}

export const Providers = ({ children }: { children: React.ReactNode }) => {
  usePWA();
  useEffect(() => suppressHydrationWarnings(), []);

  return (
    <ThemeProvider
      enableSystem={false}
      attribute="class"
      themes={THEMES_ARRAY}
      defaultTheme={APP_DEFAULTS.defaultTheme}
      disableTransitionOnChange
    >
      <TooltipProvider delayDuration={APP_DEFAULTS.tooltipDelayMs}>
        <Layout>{children}</Layout>
      </TooltipProvider>
    </ThemeProvider>
  );
};
