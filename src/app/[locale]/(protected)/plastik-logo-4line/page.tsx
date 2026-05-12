"use client";

import { RSIPageWrapper } from "@/components/common/RSIPageWrapper";
import { RSIInventoryView } from "@/components/views/tables/RSIInventoryView";

export default function PlastikLogo4LinePage() {
  return (
    <RSIPageWrapper pageName="Plastik Logo 4 Line">
      <RSIInventoryView
        sheetKey="plastik logo 4 line"
        sheetLabel="Plastik Logo 4 Line"
        sheetUnit="Pcs"
      />
    </RSIPageWrapper>
  );
}
