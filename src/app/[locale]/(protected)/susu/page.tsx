"use client";

import { RSIPageWrapper } from "@/components/common/RSIPageWrapper";
import { RSIInventoryView } from "@/components/views/tables/RSIInventoryView";

export default function SusuPage() {
  return (
    <RSIPageWrapper pageName="Susu">
      <RSIInventoryView sheetKey="susu" sheetLabel="Susu" sheetUnit="Liter" />
    </RSIPageWrapper>
  );
}
