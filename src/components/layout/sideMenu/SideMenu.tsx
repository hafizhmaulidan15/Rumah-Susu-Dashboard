"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { ArrowLeftIcon } from "@/assets/icons/ArrowLeftIcon";
import { ArrowRightIcon } from "@/assets/icons/ArrowRightIcon";
import { CommandPalette } from "@/components/common/CommandPalette";
import { menuConfig } from "@/config/navigationConfig";
import { useLayoutStore } from "@/store/layoutStore";

import { Logo } from "./parts/Logo";
import { MenuCategory } from "./parts/MenuCategory";
import { MenuItem } from "./parts/MenuItem";
import { MenuItemWithSubmenu } from "./parts/MenuItemWithSubmenu";

export const SideMenu = () => {
  const isSideMenuOpen = useLayoutStore((s) => s.isSideMenuOpen);
  const toggleSideMenu = useLayoutStore((s) => s.toggleSideMenu);
  const t = useTranslations("sideMenu");
  const [search, setSearch] = useState("");
  const [cmdKOpen, setCmdKOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdKOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredConfig = useMemo(() => {
    if (!search.trim()) return menuConfig;

    const q = search.toLowerCase();
    return menuConfig
      .map((entry) => {
        if (entry.type === "category") return entry;
        if (entry.type === "item") {
          const label = t(entry.titleKey).toLowerCase();
          return label.includes(q) ? entry : null;
        }
        if (entry.type === "submenu") {
          const parentMatch = t(entry.titleKey).toLowerCase().includes(q);
          const filteredSub = entry.submenuItems.filter((si) =>
            t(si.titleKey).toLowerCase().includes(q),
          );
          if (parentMatch || filteredSub.length > 0) {
            return {
              ...entry,
              submenuItems: parentMatch ? entry.submenuItems : filteredSub,
            };
          }
          return null;
        }
        return entry;
      })
      .filter(Boolean) as typeof menuConfig;
  }, [search, t]);

  return (
    <>
      <nav
        aria-label="Side navigation"
        className={`hidden xl:flex flex-col h-screen t-resize ${
          isSideMenuOpen
            ? "w-57.5 min-w-57.5 1xl:min-w-62.5 3xl:min-w-67.5"
            : "w-12 min-w-12"
        }`}
      >
        <div
          className={`fixed h-dvh bg-navigationBg border-r border-mainBorder t-resize flex flex-col ${
            isSideMenuOpen
              ? "w-57.5 min-w-57.5 1xl:min-w-62.5 3xl:min-w-67.5"
              : "w-12 min-w-12"
          }`}
        >
          <div
            className={`flex shrink-0 h-18 3xl:h-20 items-center transition-all duration-300 ease-in-out ${
              isSideMenuOpen
                ? "pl-[2.3rem] 1xl:pl-[2.7rem] 3xl:pl-[2.9rem]"
                : "pl-[1.2rem] 3xl:pl-[1.05rem]"
            }`}
          >
            <Logo />
          </div>

          {isSideMenuOpen && (
            <div className="px-3 pb-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-grayIcon pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari menu..."
                  className="w-full h-8 rounded-md bg-navItemBg border border-mainBorder pl-8 pr-7 text-xs text-primaryText outline-none focus:border-mainColor/50 focus:ring-1 focus:ring-mainColor/20 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-grayIcon hover:text-primaryText transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div
            className={`flex-1 overflow-y-auto overflow-x-hidden pb-4 transition-all duration-300 ease-in-out ${
              isSideMenuOpen ? "px-3" : "px-0"
            }`}
          >
            {filteredConfig.map((entry) => {
              switch (entry.type) {
                case "category":
                  return (
                    <MenuCategory
                      key={entry.titleKey}
                      title={t(entry.titleKey)}
                    />
                  );
                case "item":
                  return (
                    <MenuItem
                      key={entry.path}
                      title={t(entry.titleKey)}
                      icon={<entry.Icon />}
                      path={entry.path}
                    />
                  );
                case "submenu":
                  return (
                    <MenuItemWithSubmenu
                      key={entry.titleKey}
                      title={t(entry.titleKey)}
                      icon={<entry.Icon />}
                      submenuItems={entry.submenuItems.map((si) => ({
                        title: t(si.titleKey),
                        path: si.path,
                        icon: si.Icon ? <si.Icon /> : undefined,
                        newTab: si.newTab,
                      }))}
                    />
                  );
              }
            })}
          </div>

          <button
            onClick={toggleSideMenu}
            aria-label={isSideMenuOpen ? "Collapse menu" : "Expand menu"}
            className="absolute h-6 w-6 1xl:w-7 1xl:h-7 bg-primaryBg border border-mainBorder hover:border-mainBorderHover rounded-full top-6 right-0 translate-x-1/2 flex items-center justify-center text-grayIcon cursor-pointer z-10 transition-colors duration-200"
          >
            <span
              className="t-icon-swap"
              data-state={isSideMenuOpen ? "a" : "b"}
            >
              <span
                className="t-icon flex items-center justify-center"
                data-icon="a"
              >
                <ArrowLeftIcon />
              </span>
              <span
                className="t-icon flex items-center justify-center"
                data-icon="b"
              >
                <ArrowRightIcon />
              </span>
            </span>
          </button>
        </div>
      </nav>
      <CommandPalette open={cmdKOpen} onOpenChange={setCmdKOpen} />
    </>
  );
};
