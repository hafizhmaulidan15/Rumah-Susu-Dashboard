"use client";

import { useEffect, useState } from "react";

/** True only after client mount — avoids SSR/client hydration mismatches. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
