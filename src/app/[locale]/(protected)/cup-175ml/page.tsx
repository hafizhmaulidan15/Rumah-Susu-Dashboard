"use client";

import { RSIPageWrapper } from "@/components/common/RSIPageWrapper";
import { RSIInventoryView } from "@/components/views/tables/RSIInventoryView";

export default function Cup175Page() {
  return (
    <RSIPageWrapper pageName="Cup 175 ml">
      <RSIInventoryView
        sheetKey="cup 175 ml"
        sheetLabel="Cup 175 ml"
        sheetUnit="Pcs"
      />
    </RSIPageWrapper>
  );
}
