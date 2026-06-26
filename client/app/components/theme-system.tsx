"use client";

import { useEffect, useMemo, useState } from "react";

export const colorThemes = [
  {
    key: "hostin-coral",
    label: "HostIn",
    shortLabel: "Coral",
    swatch: "#ff6f61",
  },
  {
    key: "forge-violet",
    label: "1Forge",
    shortLabel: "Studio",
    swatch: "#7c5cff",
  },
] as const;

export type ColorThemeKey = (typeof colorThemes)[number]["key"];

const defaultTheme: ColorThemeKey = "hostin-coral";
const storageKey = "hostin-color-theme";

function isColorTheme(value: string | null): value is ColorThemeKey {
  return colorThemes.some((theme) => theme.key === value);
}

export function applyColorTheme(theme: ColorThemeKey) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(storageKey, theme);
}

export function useColorTheme() {
  const [themeKey, setThemeKey] = useState<ColorThemeKey>(defaultTheme);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(storageKey);
    const nextTheme = isColorTheme(storedTheme) ? storedTheme : defaultTheme;
    document.documentElement.dataset.theme = nextTheme;
    setThemeKey(nextTheme);
  }, []);

  function changeTheme(nextTheme: ColorThemeKey) {
    applyColorTheme(nextTheme);
    setThemeKey(nextTheme);
  }

  return { themeKey, setThemeKey: changeTheme };
}

export function ColorThemeToggle({
  themeKey,
  onChange,
}: {
  themeKey: ColorThemeKey;
  onChange: (theme: ColorThemeKey) => void;
}) {
  const activeIndex = useMemo(
    () => colorThemes.findIndex((theme) => theme.key === themeKey),
    [themeKey]
  );

  return (
    <div className="themeToggle" aria-label="Dashboard colour theme">
      <span
        className="themeToggleKnob"
        style={{ transform: `translateX(${Math.max(activeIndex, 0) * 100}%)` }}
      />
      {colorThemes.map((theme) => (
        <button
          aria-pressed={theme.key === themeKey}
          className={theme.key === themeKey ? "active" : ""}
          key={theme.key}
          onClick={() => onChange(theme.key)}
          type="button"
        >
          <i style={{ background: theme.swatch }} />
          <span>{theme.shortLabel}</span>
        </button>
      ))}
    </div>
  );
}
