"use client";

import { RSIPageWrapper } from "@/components/common/RSIPageWrapper";
import { PurchaseOrderView } from "@/components/views/purchaseOrder/PurchaseOrderView";

export default function PurchaseOrderPage() {
  return (
    <RSIPageWrapper pageName="Purchase Order">
      <PurchaseOrderView />
    </RSIPageWrapper>
  );
}
