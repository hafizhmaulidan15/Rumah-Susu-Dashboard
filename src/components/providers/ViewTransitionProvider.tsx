"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import { usePathname } from "@/i18n/navigation";

export function ViewTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    if (typeof document !== "undefined" && "startViewTransition" in document) {
      document.startViewTransition(() => {
        setDisplayChildren(children);
      });
    } else {
      setDisplayChildren(children);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div style={{ viewTransitionName: "page-content" }}>{displayChildren}</div>
  );
}
