"use client";

import { useEffect, useRef } from "react";

import { useLayoutStore } from "@/store/layoutStore";
import { BREAKPOINTS } from "@/styles/breakpoints";

import { CONTENT_MAX_WIDTH } from "../Layout";
import { Logo } from "../sideMenu/parts/Logo";
import { SideMenuMobile } from "../sideMenu/SideMenuMobile";
import { useNavbar } from "./hooks/useNavbar";
import { SearchInput } from "./parts/SearchInput";
import { ThemeButton } from "./parts/ThemeButton";

export const Navbar = () => {
  const setIsLoggingOut = useLayoutStore((state) => state.setIsLoggingOut);
  const setIsLoggingIn = useLayoutStore((state) => state.setIsLoggingIn);
  const fixedNavbar = useLayoutStore((state) => state.fixedNavbar);
  const navbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsLoggingOut(false);
    setIsLoggingIn(false);
  }, [setIsLoggingOut, setIsLoggingIn]);

  useEffect(() => {
    if (fixedNavbar || typeof window === "undefined") return;

    const isDesktop = () => window.innerWidth >= BREAKPOINTS.xl;

    const handleScroll = () => {
      if (!navbarRef.current || !isDesktop()) return;
      navbarRef.current.style.transform = `translateY(-${Math.max(0, window.scrollY)}px)`;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    const navbarNode = navbarRef.current;
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (navbarNode) {
        navbarNode.style.transform = "";
      }
    };
  }, [fixedNavbar]);

  const {
    theme,
    isMobileMenuOpen,
    toggleMobileMenu,
    isSideMenuOpen,
    closeMobileMenu,
    themeDropdown,
    selectTheme,
    searchDropdown,
  } = useNavbar();

  return (
    <>
      <header
        ref={navbarRef}
        className="w-full flex items-center z-30 fixed h-18 bg-primaryBg 3xl:h-20 border-b border-solid border-mainBorder"
        style={{ willChange: fixedNavbar ? "auto" : "transform" }}
      >
        <div
          className={`hidden xl:block xl:w-57.5 1xl:min-w-62.5 3xl:min-w-67.5 h-12 transition-all duration-200 ease-in-out ${
            !isSideMenuOpen && "xl:!max-w-12 !w-12 xl:!min-w-18"
          }`}
        ></div>
        <div
          className={`px-6 xsm:pr-8 md:px-6 md:pr-8 xl:pl-3 xl:pr-2 2xl:px-4 z-40 w-full flex justify-between xl:mx-auto items-center gap-4 xl:gap-7 ${CONTENT_MAX_WIDTH}`}
        >
          <div className="flex items-center gap-10">
            <div className="flex xsm:pl-2  xl:hidden">
              <Logo />
            </div>
            <SearchInput
              isOpen={searchDropdown.isOpen}
              ref={searchDropdown.ref}
              open={searchDropdown.open}
              close={searchDropdown.close}
              closeOthers={() => {
                themeDropdown.close();
                closeMobileMenu();
              }}
            />
          </div>
          <div className="flex items-center gap-2 md:gap-2 xl:gap-3.5 z-[99]">
            <div className="hidden xl:flex">
              <ThemeButton
                theme={(theme || "dark") as "light" | "dark" | "system"}
                selectTheme={selectTheme}
              />
            </div>
          </div>
        </div>
      </header>
      <SideMenuMobile isMobileMenuOpen={isMobileMenuOpen} />
    </>
  );
};
