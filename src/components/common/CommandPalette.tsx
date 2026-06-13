"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/common/shadcn/dialog";
import type { MenuConfigEntry } from "@/components/layout/sideMenu/types";
import { menuConfig } from "@/config/navigationConfig";
import { useRouter } from "@/i18n/navigation";

function flattenMenu(
  items: MenuConfigEntry[],
  parentLabel?: string,
): { label: string; path?: string; parent?: string }[] {
  const result: { label: string; path?: string; parent?: string }[] = [];
  for (const item of items) {
    if (item.type === "category") continue;
    if (item.type === "item") {
      result.push({
        label: item.titleKey,
        path: item.path,
        parent: parentLabel,
      });
    }
    if (item.type === "submenu") {
      for (const sub of item.submenuItems) {
        result.push({
          label: sub.titleKey,
          path: sub.path,
          parent: item.titleKey,
        });
      }
    }
  }
  return result;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const items = useMemo(() => flattenMenu(menuConfig), []);
  const filtered = useMemo(
    () =>
      query
        ? items.filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase()),
          )
        : items,
    [items, query],
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]?.path) {
      e.preventDefault();
      router.push(filtered[selectedIndex].path!);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg top-[15%] translate-y-0 p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Pencarian Menu</DialogTitle>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-mainBorder">
          <Search className="w-4 h-4 text-secondaryText shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cari menu..."
            className="flex-1 bg-transparent text-sm text-primaryText placeholder:text-secondaryText focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex text-[10px] font-mono text-secondaryText bg-secondaryBg px-1.5 py-0.5 rounded border border-mainBorder">
            ESC
          </kbd>
        </div>
        <div className="max-h-72 overflow-y-auto py-2" role="listbox">
          {filtered.length === 0 ? (
            <p className="text-sm text-secondaryText text-center py-6">
              Tidak ada hasil
            </p>
          ) : (
            filtered.map((item, i) => (
              <button
                key={item.label + (item.path ?? "")}
                role="option"
                aria-selected={i === selectedIndex}
                onClick={() => {
                  if (item.path) {
                    router.push(item.path);
                    onOpenChange(false);
                  }
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                  i === selectedIndex
                    ? "bg-mainColor/10 text-primaryText"
                    : "text-primaryText hover:bg-secondaryBg"
                }`}
              >
                <span className="font-medium">{item.label}</span>
                {item.parent && (
                  <span className="text-[10px] text-secondaryText">
                    {item.parent}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
