"use client";

import { useTheme } from "next-themes";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Toaster } from "sonner";

import { ActivePOProvider } from "@/context/ActivePOContext";
import { useFontManager } from "@/hooks/useFontManager";
import { useGlobalHotkeys } from "@/hooks/useGlobalHotkeys";
import { usePathname } from "@/i18n/navigation";
import { useChartAnimationStore } from "@/store/chartAnimationStore";
import { useLayoutStore } from "@/store/layoutStore";

import { BottomNav } from "./bottomNav/BottomNav";
import { FullScreenLoader, LOADER_DURATION_MS } from "./FullScreenLoader";
import { Navbar } from "./navbar/Navbar";
import { SideMenu } from "./sideMenu/SideMenu";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  useFontManager();

  const isMobileMenuOpen = useLayoutStore((s) => s.isMobileMenuOpen);
  const toggleMobileMenu = useLayoutStore((s) => s.toggleMobileMenu);
  const setShouldStartChartAnimations = useChartAnimationStore(
    (s) => s.setShouldStartChartAnimations,
  );

  const [showLoader, setShowLoader] = useState(true);

  const loaderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const currentPathname = usePathname();

  const authPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/error-401",
    "/error-404",
    "/error-500",
  ];

  const isAuthPage = authPaths.includes(currentPathname);

  useGlobalHotkeys({ isAuthPage });

  const { setTheme, themes } = useTheme();

  /** Set dark as default theme if stored theme is not recognized */
  useEffect(() => {
    let storedTheme: string | null = null;
    try {
      storedTheme = localStorage.getItem("theme");
    } catch {}

    if (storedTheme && !themes.includes(storedTheme)) {
      setTheme("dark");
    }
  }, [setTheme, themes]);

  /**
   * Show loader screen for 1 second on first render.
   * Start chart animations at 85% of loader duration so they begin
   * just before the loader disappears (with animationBegin=100ms in the hook,
   * the visual animation starts right as the loader fades out).
   */
  useEffect(() => {
    /** Skip loader entirely on auth pages */
    if (isAuthPage) {
      setShowLoader(false);
      setShouldStartChartAnimations(true);
      return;
    }

    /** Start chart animations at 85% of loader duration */
    animationTimeoutRef.current = setTimeout(() => {
      setShouldStartChartAnimations(true);
    }, LOADER_DURATION_MS * 0.85);

    loaderTimeoutRef.current = setTimeout(() => {
      setShowLoader(false);
    }, LOADER_DURATION_MS);

    return () => {
      if (loaderTimeoutRef.current) {
        clearTimeout(loaderTimeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [isAuthPage, setShouldStartChartAnimations]);

  return (
    <>
      <div className="flex min-h-screen w-full bg-secondaryBg">
        {showLoader && !isAuthPage && (
          <FullScreenLoader key="static-loader-key" />
        )}
        {!isAuthPage && (
          <>
            <SideMenu />
            <Navbar />
          </>
        )}
        <div
          className={`flex flex-col w-full ${CONTENT_MAX_WIDTH} mx-auto relative`}
        >
          <div className="w-full flex justify-center max-w-full px-0 md:px-0 xl:pl-3 xl:pr-2 2xl:px-4 pb-16 xl:pb-0">
            <ActivePOProvider>{children}</ActivePOProvider>
          </div>
        </div>
        {!isAuthPage && <BottomNav />}
        <div
          className={`block xl:hidden fixed inset-0 bg-mobileOverlayBg z-[1] cursor-pointer overflow-hidden overscroll-contain transition-opacity duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={toggleMobileMenu}
          aria-hidden={!isMobileMenuOpen}
        />
      </div>
      <Toaster
        richColors
        closeButton
        position="bottom-center"
        gap={12}
        visibleToasts={4}
        expand
        toastOptions={{
          duration: 4000,
          classNames: {
            toast: "shadow-lg",
            title: "text-sm font-semibold",
            description: "text-xs opacity-80",
          },
        }}
      />
    </>
  );
};

export const CONTENT_MAX_WIDTH =
  "xl:max-w-[80%] 1xl:max-w-[80%] 2xl:max-w-[81vw] 3xl:max-w-[82vw] 5xl:max-w-408";
