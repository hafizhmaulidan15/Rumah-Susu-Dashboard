import { useEffect, useRef, useState } from "react";

export const useThemeChange = ({
  theme,
  selectTheme,
}: {
  theme: string | undefined;
  selectTheme: (theme: "light" | "dark" | "system") => void;
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const currentTheme = theme || "light";
  const [sliderDark, setSliderDark] = useState(currentTheme === "dark");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        suppressTooltipRef.current = true;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSliderDark(currentTheme === "dark");
    }, 10);
    return () => clearTimeout(timeout);
  }, [currentTheme]);

  const themeChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (themeChangeTimeoutRef.current) {
        clearTimeout(themeChangeTimeoutRef.current);
      }
    };
  }, []);

  const suppressTooltipRef = useRef(false);

  const toggleTheme = () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setSliderDark(newTheme === "dark");

    if (themeChangeTimeoutRef.current) {
      clearTimeout(themeChangeTimeoutRef.current);
    }
    themeChangeTimeoutRef.current = setTimeout(() => {
      selectTheme(newTheme);
    }, 200);
  };

  return {
    isMounted,
    currentTheme,
    sliderDark,
    suppressTooltipRef,
    toggleTheme,
  };
};
