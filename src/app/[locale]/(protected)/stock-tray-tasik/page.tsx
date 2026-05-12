"use client";

import { RSIPageWrapper } from "@/components/common/RSIPageWrapper";
import { RSIInventoryView } from "@/components/views/tables/RSIInventoryView";

export default function StockTrayTasikPage() {
  return (
    <RSIPageWrapper pageName="Stock Tray Tasik">
      <RSIInventoryView
        sheetKey="Stock Tray Tasik"
        sheetLabel="Stock Tray Tasik"
        sheetUnit="Pcs"
      />
    </RSIPageWrapper>
  );
}
