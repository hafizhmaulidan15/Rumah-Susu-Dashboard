"use client";

import { useEffect, useRef, useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/common/shadcn/tooltip";
import { useIsFirstRender } from "@/hooks/useIsFirstRender";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Link, usePathname } from "@/i18n/navigation";
import { useLayoutStore } from "@/store/layoutStore";
import { BREAKPOINTS } from "@/styles/breakpoints";

import { MenuItemProps } from "../types";

export const MenuItem = ({ title, icon, path }: MenuItemProps) => {
  const toggleMobileMenu = useLayoutStore((state) => state.toggleMobileMenu);
  const isSideMenuOpen = useLayoutStore((state) => state.isSideMenuOpen);
  const currentPathname = usePathname();
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);
  const [isActive, setIsActive] = useState(false);
  const [hasEnteredSinceCollapse, setHasEnteredSinceCollapse] = useState(false);
  const prevCollapsedRef = useRef(false);

  const isCollapsed = !isSideMenuOpen && isDesktop;

  const handleMenuItemClick = () => {
    if (window.innerWidth < BREAKPOINTS.xl) {
      toggleMobileMenu();
    }
  };

  useEffect(() => {
    const normalizedPathname = currentPathname?.endsWith("/")
      ? currentPathname.slice(0, -1)
      : currentPathname;
    const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;

    setIsActive(normalizedPathname === normalizedPath);
  }, [currentPathname, path]);

  useEffect(() => {
    if (prevCollapsedRef.current !== isCollapsed) {
      prevCollapsedRef.current = isCollapsed;
      setHasEnteredSinceCollapse(false);
    }
  }, [isCollapsed]);

  const isFirstRender = useIsFirstRender();
  if (isFirstRender) return null;

  const showTooltip = isCollapsed && hasEnteredSinceCollapse;

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <Link
          href={path}
          tabIndex={0}
          ref={(el: HTMLAnchorElement | null) => {
            if (el) el.setAttribute("tabindex", "0");
          }}
          onPointerEnter={() => {
            if (isCollapsed) setHasEnteredSinceCollapse(true);
          }}
          onPointerLeave={() => setHasEnteredSinceCollapse(false)}
          onFocus={() => {
            if (isCollapsed) setHasEnteredSinceCollapse(true);
          }}
          onBlur={() => setHasEnteredSinceCollapse(false)}
          className={`block rounded-md focus-visible:outline-offset-[-2px] transition-[margin] duration-200 ease-in-out ${isCollapsed ? "mx-3" : "w-full"}`}
        >
          <div
            onClick={handleMenuItemClick}
            className={`flex relative rounded-md items-center py-2 1xl:py-[0.55rem] 3xl:py-[0.65rem] mb-px 1xl:mb-1 3xl:mb-[0.3125rem] transition-all duration-200 ease-in-out ${
              isCollapsed ? "pl-[0.65rem]" : "pl-4 pr-2"
            } ${
              isActive
                ? "bg-navItemActiveBg hover:bg-navItemActiveBgHover"
                : "bg-navItemBg hover:bg-navItemBgHover"
            }`}
          >
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-mainColor to-mainColor/60" />
            )}
            <div
              className={`menuItemIcon ${isCollapsed ? "" : "pr-3"} ${
                isActive
                  ? "stroke-mainColor fill-mainColor text-mainColor"
                  : "stroke-grayIcon fill-grayIcon text-grayIcon"
              }`}
            >
              {icon}
            </div>
            <div
              className={`text-xs xl:text-xs 3xl:text-sm font-medium tracking-wide whitespace-nowrap overflow-hidden transition-[width,opacity] duration-200 ${
                isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              } ${isActive ? "text-navItemTextActive" : "text-navItemText"}`}
            >
              {title}
            </div>
          </div>
        </Link>
      </TooltipTrigger>
      {showTooltip && (
        <TooltipContent
          side="right"
          alignOffset={3}
          sideOffset={12}
          className="hidden xl:block"
        >
          {title}
        </TooltipContent>
      )}
    </Tooltip>
  );
};
