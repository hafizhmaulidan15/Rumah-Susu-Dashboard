"use client";

import { RSIPageWrapper } from "@/components/common/RSIPageWrapper";
import { RSIInventoryView } from "@/components/views/tables/RSIInventoryView";

export default function PlastikLogo2LinePage() {
  return (
    <RSIPageWrapper pageName="Plastik Logo 2 Line">
      <RSIInventoryView
        sheetKey="plastik logo 2 line"
        sheetLabel="Plastik Logo 2 Line"
        sheetUnit="Pcs"
      />
    </RSIPageWrapper>
  );
}
