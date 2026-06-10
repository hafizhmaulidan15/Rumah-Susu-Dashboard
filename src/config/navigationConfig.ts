import { Box, CupSoda, ScrollText } from "lucide-react";

import {
  CupIcon,
  DropletIcon,
  LayersIcon,
  LayoutGridIcon,
  PackageIcon,
  ShoppingCartIcon,
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
        Icon: CupSoda,
        path: "/susu-cup",
        sections: [{ id: "susuCup", titleKey: "susuCup" }],
      },
      {
        titleKey: "cup130ml",
        Icon: CupSoda,
        path: "/cup-130ml",
        sections: [{ id: "cup130ml", titleKey: "cup130ml" }],
      },
      {
        titleKey: "cup175ml",
        Icon: CupSoda,
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
        Icon: ScrollText,
        path: "/plastik-logo-2line",
        sections: [{ id: "plastikLogo2Line", titleKey: "plastikLogo2Line" }],
      },
      {
        titleKey: "plastikLogo4Line",
        Icon: ScrollText,
        path: "/plastik-logo-4line",
        sections: [{ id: "plastikLogo4Line", titleKey: "plastikLogo4Line" }],
      },
      {
        titleKey: "plastikRollPolos",
        Icon: ScrollText,
        path: "/plastik-roll-polos",
        sections: [{ id: "plastikRollPolos", titleKey: "plastikRollPolos" }],
      },
      {
        titleKey: "plastikRollLogo",
        Icon: ScrollText,
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
        Icon: Box,
        path: "/stock-box-tasik",
        sections: [{ id: "stockBoxTasik", titleKey: "stockBoxTasik" }],
      },
      {
        titleKey: "stockTrayTasik",
        Icon: Box,
        path: "/stock-tray-tasik",
        sections: [{ id: "stockTrayTasik", titleKey: "stockTrayTasik" }],
      },
    ],
  },
  { type: "category", titleKey: "management" },
  {
    type: "item",
    titleKey: "purchaseOrder",
    Icon: ShoppingCartIcon,
    path: "/purchase-order",
    sections: [{ id: "purchaseOrder", titleKey: "purchaseOrder" }],
  },
];
