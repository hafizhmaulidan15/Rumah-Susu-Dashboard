"use client";

import { ThemeProvider } from "next-themes";
import { useEffect } from "react";

import { TooltipProvider } from "@/components/common/shadcn/tooltip";
import { Layout } from "@/components/layout/Layout";
import { APP_DEFAULTS } from "@/config/appDefaults";
import { usePWA } from "@/hooks/usePWA";

export const THEMES_ARRAY = ["light", "dark"];

const origWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const msg = args.map((a) => (typeof a === "string" ? a : "")).join(" ");
  if (msg.includes("Lit is in dev mode")) return;
  origWarn.call(console, ...args);
};

const origError = console.error;
console.error = (...args: unknown[]) => {
  const msgs = args.map((a) => (typeof a === "string" ? a : ""));
  const combined = msgs.join(" ");
  if (
    (combined.includes("hydrated") && combined.includes("match")) ||
    combined.includes("hydration") ||
    combined.includes("Encountered a script tag") ||
    combined.includes("tree hydrated") ||
    combined.includes("<phantom-ui>") ||
    combined.includes("<tbody> cannot contain")
  )
    return;
  origError.call(console, ...args);
};

export const Providers = ({ children }: { children: React.ReactNode }) => {
  usePWA();
  useEffect(() => {
    import("@aejkatappaja/phantom-ui");
  }, []);

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
