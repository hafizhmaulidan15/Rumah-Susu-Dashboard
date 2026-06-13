import type Lenis from "lenis";

export function scrollToSection(
  lenis: Lenis | null | undefined,
  target: string | HTMLElement | number,
  options?: { offset?: number; duration?: number },
) {
  if (!lenis) return;

  const offset = options?.offset ?? 0;
  const duration = options?.duration ?? 1.2;

  lenis.scrollTo(target, {
    offset,
    duration,
    easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
  });
}

export function scrollToTop(
  lenis: Lenis | null | undefined,
  options?: { duration?: number },
) {
  scrollToSection(lenis, 0, { duration: options?.duration ?? 0.6 });
}
