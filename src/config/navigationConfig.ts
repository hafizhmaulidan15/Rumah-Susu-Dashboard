import {
  CupIcon,
  DropletIcon,
  LayersIcon,
  LayoutGridIcon,
  PackageIcon,
} from "../assets/icons/RSIIcons";
import type { MenuConfigEntry } from "../components/layout/sideMenu/types";

export const menuConfig: MenuConfigEntry[] = [
  { type: "category", titleKey: "inventory" },
  {
    type: "item",
    titleKey: "allStocks",
    Icon: LayoutGridIcon,
    path: "/",
    sections: [{ id: "allStocks", titleKey: "allStocks" }],
  },
  {
    type: "item",
    titleKey: "susu",
    Icon: DropletIcon,
    path: "/susu",
    sections: [{ id: "susu", titleKey: "susu" }],
  },
  {
    type: "submenu",
    titleKey: "cupProducts",
    Icon: CupIcon,
    submenuItems: [
      {
        titleKey: "susuCup",
        path: "/susu-cup",
        sections: [{ id: "susuCup", titleKey: "susuCup" }],
      },
      {
        titleKey: "cup130ml",
        path: "/cup-130ml",
        sections: [{ id: "cup130ml", titleKey: "cup130ml" }],
      },
      {
        titleKey: "cup175ml",
        path: "/cup-175ml",
        sections: [{ id: "cup175ml", titleKey: "cup175ml" }],
      },
    ],
  },
  {
    type: "submenu",
    titleKey: "packaging",
    Icon: LayersIcon,
    submenuItems: [
      {
        titleKey: "plastikLogo2Line",
        path: "/plastik-logo-2line",
        sections: [{ id: "plastikLogo2Line", titleKey: "plastikLogo2Line" }],
      },
      {
        titleKey: "plastikLogo4Line",
        path: "/plastik-logo-4line",
        sections: [{ id: "plastikLogo4Line", titleKey: "plastikLogo4Line" }],
      },
      {
        titleKey: "plastikRollPolos",
        path: "/plastik-roll-polos",
        sections: [{ id: "plastikRollPolos", titleKey: "plastikRollPolos" }],
      },
      {
        titleKey: "plastikRollLogo",
        path: "/plastik-roll-logo",
        sections: [{ id: "plastikRollLogo", titleKey: "plastikRollLogo" }],
      },
    ],
  },
  {
    type: "submenu",
    titleKey: "inventoryItems",
    Icon: PackageIcon,
    submenuItems: [
      {
        titleKey: "stockBoxTasik",
        path: "/stock-box-tasik",
        sections: [{ id: "stockBoxTasik", titleKey: "stockBoxTasik" }],
      },
      {
        titleKey: "stockTrayTasik",
        path: "/stock-tray-tasik",
        sections: [{ id: "stockTrayTasik", titleKey: "stockTrayTasik" }],
      },
    ],
  },
];

export const RSI_SHEETS = [
  { key: "summary", label: "All Stocks" },
  { key: "susu", label: "Susu" },
  { key: "susu cup", label: "Susu Cup" },
  { key: "cup 130 ml", label: "Cup 130 ml" },
  { key: "cup 175 ml", label: "Cup 175 ml" },
  { key: "plastik logo 2 line", label: "Plastik Logo 2 Line" },
  { key: "plastik logo 4 line", label: "Plastik Logo 4 Line" },
  { key: "plastik roll logo", label: "Plastik Roll Logo" },
  { key: "plastik roll polos", label: "Plastik Roll Polos" },
  { key: "Stock Box Tasik", label: "Stock Box Tasik" },
  { key: "Stock Tray Tasik", label: "Stock Tray Tasik" },
];
