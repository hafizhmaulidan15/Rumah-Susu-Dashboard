"use client";

import {
  CupSoda,
  Layers,
  LayoutGrid,
  Milk,
  MoreHorizontal,
  Package,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { useLayoutStore } from "@/store/layoutStore";

const navItems = [
  { key: "allStocks", icon: LayoutGrid, path: "/" },
  { key: "susu", icon: Milk, path: "/susu" },
  { key: "susuCup", icon: CupSoda, path: "/susu-cup" },
  { key: "packaging", icon: Layers, path: "/plastik-logo-2line" },
  { key: "inventoryItems", icon: Package, path: "/stock-box-tasik" },
] as const;

export const BottomNav = () => {
  const currentPathname = usePathname();
  const toggleMobileMenu = useLayoutStore((s) => s.toggleMobileMenu);
  const t = useTranslations("sideMenu");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 xl:hidden bg-primaryBg border-t border-mainBorder">
      <div className="flex items-center justify-around h-14 px-1">
        {navItems.map(({ key, icon: Icon, path }) => {
          const normalizedPathname = currentPathname?.endsWith("/")
            ? currentPathname.slice(0, -1)
            : currentPathname;
          const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;
          const isActive = normalizedPathname === normalizedPath;

          return (
            <Link
              key={key}
              href={path}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-all duration-200 min-w-[48px] min-h-[44px] ${
                isActive
                  ? "text-mainColor"
                  : "text-grayIcon hover:text-primaryText"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? "stroke-mainColor fill-mainColor" : ""}`}
              />
              <span className="text-[8px] font-semibold tracking-tight leading-none">
                {t(key)}
              </span>
            </Link>
          );
        })}

        <button
          onClick={toggleMobileMenu}
          aria-label="Open menu"
          className="flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-all duration-200 min-w-[48px] min-h-[44px] text-grayIcon hover:text-primaryText"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[8px] font-semibold tracking-tight leading-none">
            More
          </span>
        </button>
      </div>
    </nav>
  );
};
