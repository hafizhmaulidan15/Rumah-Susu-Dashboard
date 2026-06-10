"use client";

import { RSIPageWrapper } from "@/components/common/RSIPageWrapper";
import { AIAssistantView } from "@/components/views/ai/AIAssistantView";

export default function AIPage() {
  return (
    <RSIPageWrapper pageName="AI Assistant">
      <AIAssistantView />
    </RSIPageWrapper>
  );
}
