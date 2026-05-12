"use client";

import { RSIPageWrapper } from "@/components/common/RSIPageWrapper";
import { RSIInventoryView } from "@/components/views/tables/RSIInventoryView";

export default function SusuCupPage() {
  return (
    <RSIPageWrapper pageName="Susu Cup">
      <RSIInventoryView
        sheetKey="susu cup"
        sheetLabel="Susu Cup"
        sheetUnit="Pcs"
      />
    </RSIPageWrapper>
  );
}
