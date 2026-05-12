"use client";

import { RSIPageWrapper } from "@/components/common/RSIPageWrapper";
import { RSIInventoryView } from "@/components/views/tables/RSIInventoryView";

export default function PlastikRollPolosPage() {
  return (
    <RSIPageWrapper pageName="Plastik Roll Polos">
      <RSIInventoryView
        sheetKey="plastik roll polos"
        sheetLabel="Plastik Roll Polos"
        sheetUnit="Pcs"
      />
    </RSIPageWrapper>
  );
}
