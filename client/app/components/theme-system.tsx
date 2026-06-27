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
  {
    key: "custom",
    label: "Custom colour",
    shortLabel: "Custom",
    swatch: "#22a06b",
  },
] as const;

export type ColorThemeKey = (typeof colorThemes)[number]["key"];

const defaultTheme: ColorThemeKey = "hostin-coral";
const storageKey = "hostin-color-theme";
const customStorageKey = "hostin-custom-color";

function isColorTheme(value: string | null): value is ColorThemeKey {
  return colorThemes.some((theme) => theme.key === value);
}

export function applyColorTheme(theme: ColorThemeKey) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(storageKey, theme);
  if (theme !== "custom") clearCustomVariables();
}

function mix(hex: string, target: string, weight: number) {
  const parse = (value: string) => [1, 3, 5].map((index) => parseInt(value.slice(index, index + 2), 16));
  const [r, g, b] = parse(hex);
  const [tr, tg, tb] = parse(target);
  return `#${[r, g, b].map((value, index) => Math.round(value + ([tr, tg, tb][index] - value) * weight).toString(16).padStart(2, "0")).join("")}`;
}

function customVariables(hex: string) {
  const rgb = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16)).join(", ");
  return {
    "--accent": hex,
    "--accent-strong": mix(hex, "#000000", 0.2),
    "--accent-soft": mix(hex, "#ffffff", 0.9),
    "--accent-soft-border": mix(hex, "#ffffff", 0.68),
    "--accent-gradient-start": mix(hex, "#ffffff", 0.18),
    "--accent-gradient-end": mix(hex, "#000000", 0.16),
    "--accent-shadow": `rgba(${rgb}, 0.22)`,
    "--accent-focus": `rgba(${rgb}, 0.16)`,
    "--nav-active-start": mix(hex, "#ffffff", 0.92),
    "--nav-active-end": mix(hex, "#ffffff", 0.96),
  };
}

function clearCustomVariables() {
  Object.keys(customVariables("#000000")).forEach((name) => document.documentElement.style.removeProperty(name));
}

export function applyCustomColor(hex: string) {
  document.documentElement.dataset.theme = "custom";
  Object.entries(customVariables(hex)).forEach(([name, value]) => document.documentElement.style.setProperty(name, value));
  window.localStorage.setItem(storageKey, "custom");
  window.localStorage.setItem(customStorageKey, hex);
}

export function useColorTheme() {
  const [themeKey, setThemeKey] = useState<ColorThemeKey>(defaultTheme);
  const [customColor, setCustomColor] = useState("#22a06b");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(storageKey);
    const nextTheme = isColorTheme(storedTheme) ? storedTheme : defaultTheme;
    const storedCustom = window.localStorage.getItem(customStorageKey) || "#22a06b";
    if (nextTheme === "custom") applyCustomColor(storedCustom); else document.documentElement.dataset.theme = nextTheme;
    setCustomColor(storedCustom);
    setThemeKey(nextTheme);
  }, []);

  function changeTheme(nextTheme: ColorThemeKey) {
    applyColorTheme(nextTheme);
    setThemeKey(nextTheme);
  }

  function changeCustomColor(nextColor: string) {
    applyCustomColor(nextColor);
    setCustomColor(nextColor);
    setThemeKey("custom");
  }

  return { customColor, setCustomColor: changeCustomColor, themeKey, setThemeKey: changeTheme };
}

export function ColorThemeToggle({
  themeKey,
  onChange,
  customColor,
  onCustomColor,
}: {
  themeKey: ColorThemeKey;
  onChange: (theme: ColorThemeKey) => void;
  customColor: string;
  onCustomColor: (color: string) => void;
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
      {colorThemes.map((theme) => theme.key === "custom" ? (
        <label className={themeKey === "custom" ? "active customThemePicker" : "customThemePicker"} key={theme.key}>
          <input
            aria-label="Custom theme colour"
            onChange={(event) => onCustomColor(event.currentTarget.value)}
            onInput={(event) => onCustomColor(event.currentTarget.value)}
            type="color"
            value={customColor}
          />
          <i aria-hidden="true" style={{ background: customColor }} />
          <span>{theme.shortLabel}</span>
        </label>
      ) : (
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
