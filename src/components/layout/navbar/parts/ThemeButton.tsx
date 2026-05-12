import { MoonIcon } from "@/assets/icons/MoonIcon";
import { SunIcon } from "@/assets/icons/SunIcon";

import { useThemeChange } from "../hooks/useThemeChange";

interface ThemeButtonProps {
  theme: "light" | "dark" | "system";
  selectTheme: (theme: "light" | "dark" | "system") => void;
}

export const ThemeButton = ({ theme, selectTheme }: ThemeButtonProps) => {
  const { isMounted, currentTheme, sliderDark, toggleTheme } = useThemeChange({
    theme,
    selectTheme,
  });

  return (
    <div
      className="group relative flex items-center bg-themeToggleBg border border-mainBorder rounded-full py-0.5 pr-0.5 pl-0 cursor-pointer"
      onClick={toggleTheme}
      role="button"
      aria-label="Toggle theme"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          toggleTheme();
        }
      }}
    >
      {isMounted && (
        <div
          className="absolute left-0.5 top-0.5 w-9.5 h-[2.1825rem] rounded-full shadow-sm border border-themeToggleActiveBorder bg-themeToggleActiveBg transition-transform-forced"
          style={{
            transform: sliderDark ? "translateX(42px)" : "translateX(0px)",
          }}
        />
      )}
      <div
        className={`relative z-10 w-10.5 h-[2.1825rem] rounded-full flex items-center justify-center ${
          isMounted && currentTheme === "light"
            ? "text-primaryText"
            : "text-grayIcon"
        }`}
      >
        <SunIcon />
      </div>
      <div
        className={`relative z-10 w-10.5 h-[2.1825rem] rounded-full flex items-center justify-center ${
          isMounted && currentTheme === "dark"
            ? "text-primaryText"
            : "text-grayIcon"
        }`}
      >
        <MoonIcon />
      </div>
    </div>
  );
};
