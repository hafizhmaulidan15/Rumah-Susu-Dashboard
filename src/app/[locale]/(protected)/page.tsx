"use client";

import { RSIPageWrapper } from "@/components/common/RSIPageWrapper";
import { RSIDashboardView } from "@/components/views/homepage/RSIDashboardView";

export default function Home() {
  return (
    <RSIPageWrapper>
      <h1 className="sr-only">Dashboard RSI</h1>
      <RSIDashboardView />
    </RSIPageWrapper>
  );
}
