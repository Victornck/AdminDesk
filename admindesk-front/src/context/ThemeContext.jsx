/**
 * ThemeContext — estado global de tema (dark, accent, density)
 * Envolve toda a aplicação em App.jsx
 */

import { createContext, useContext, useState, useEffect } from "react";


const ACCENT_MAP = {
  blue:    { hex: "#3b82f6", muted: "#eff6ff",  ring: "#bfdbfe", shadow: "0 4px 14px #3b82f640" },
  purple:  { hex: "#8b5cf6", muted: "#f5f3ff",  ring: "#ddd6fe", shadow: "0 4px 14px #8b5cf640" },
  emerald: { hex: "#10b981", muted: "#ecfdf5",  ring: "#a7f3d0", shadow: "0 4px 14px #10b98140" },
  rose:    { hex: "#f43f5e", muted: "#fff1f2",  ring: "#fecdd3", shadow: "0 4px 14px #f43f5e40" },
  amber:   { hex: "#f59e0b", muted: "#fffbeb",  ring: "#fde68a", shadow: "0 4px 14px #f59e0b40" },
};

const DENSITY_MAP = { Compacto: 0.75, Normal: 1, Confortável: 1.25 };


function applyDark(dark) {
  document.documentElement.classList.toggle("dark", dark);
}

function applyAccent(id) {
  const c = ACCENT_MAP[id] ?? ACCENT_MAP.blue;
  const r = document.documentElement;
  r.style.setProperty("--accent",            c.hex);
  r.style.setProperty("--accent-muted",      c.muted);
  r.style.setProperty("--accent-ring",       c.ring);
  r.style.setProperty("--accent-shadow-css", c.shadow);
}

function applyDensity(d) {
  document.documentElement.style.setProperty("--ui-density", DENSITY_MAP[d] ?? 1);
}

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}


const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [darkMode,    setDarkMode]    = useState(() => load("theme-dark",    false));
  const [accentColor, setAccentColor] = useState(() => load("theme-accent",  "blue"));
  const [density,     setDensity]     = useState(() => load("theme-density", "Normal"));

  useEffect(() => { applyDark(darkMode);       localStorage.setItem("theme-dark",    JSON.stringify(darkMode));    }, [darkMode]);
  useEffect(() => { applyAccent(accentColor);  localStorage.setItem("theme-accent",  JSON.stringify(accentColor)); }, [accentColor]);
  useEffect(() => { applyDensity(density);     localStorage.setItem("theme-density", JSON.stringify(density));     }, [density]);

  return (
    <ThemeContext.Provider value={{
      darkMode,
      toggleDark:     () => setDarkMode(d => !d),
      accentColor,
      setAccentColor,
      density,
      setDensity,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de <ThemeProvider>");
  return ctx;
}