"use client";

import { RSIPageWrapper } from "@/components/common/RSIPageWrapper";
import { RSIInventoryView } from "@/components/views/tables/RSIInventoryView";

export default function PlastikRollLogoPage() {
  return (
    <RSIPageWrapper pageName="Plastik Roll Logo">
      <RSIInventoryView
        sheetKey="plastik roll logo"
        sheetLabel="Plastik Roll Logo"
        sheetUnit="Pcs"
      />
    </RSIPageWrapper>
  );
}
