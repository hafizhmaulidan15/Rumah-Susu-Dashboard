"use client";

import { ThemeProvider } from "next-themes";

import { TooltipProvider } from "@/components/common/shadcn/tooltip";
import { Layout } from "@/components/layout/Layout";
import { APP_DEFAULTS } from "@/config/appDefaults";
import { usePWA } from "@/hooks/usePWA";

export const THEMES_ARRAY = ["light", "dark"];

export const Providers = ({ children }: { children: React.ReactNode }) => {
  usePWA();

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
