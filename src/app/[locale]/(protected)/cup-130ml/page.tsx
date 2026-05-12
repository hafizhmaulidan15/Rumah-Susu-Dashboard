"use client";

import { RSIPageWrapper } from "@/components/common/RSIPageWrapper";
import { RSIInventoryView } from "@/components/views/tables/RSIInventoryView";

export default function Cup130Page() {
  return (
    <RSIPageWrapper pageName="Cup 130 ml">
      <RSIInventoryView
        sheetKey="cup 130 ml"
        sheetLabel="Cup 130 ml"
        sheetUnit="Pcs"
      />
    </RSIPageWrapper>
  );
}
