"use client";

import { RSIPageWrapper } from "@/components/common/RSIPageWrapper";
import { RSIInventoryView } from "@/components/views/tables/RSIInventoryView";

export default function StockBoxTasikPage() {
  return (
    <RSIPageWrapper pageName="Stock Box Tasik">
      <RSIInventoryView
        sheetKey="Stock Box Tasik"
        sheetLabel="Stock Box Tasik"
        sheetUnit="Pcs"
      />
    </RSIPageWrapper>
  );
}
