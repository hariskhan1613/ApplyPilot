import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const KEY = "theme";
const OPTIONS = ["light", "dark", "system"];
const ThemeCtx = createContext(null);
const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

function readPref() {
  try {
    const v = localStorage.getItem(KEY);
    return OPTIONS.includes(v) ? v : "system";
  } catch {
    return "system";
  }
}

function applyTheme(pref) {
  const dark = pref === "dark" || (pref === "system" && darkQuery().matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0B1220" : "#F7F8FB");
}

// One shared state so topbar toggle and Settings tiles never disagree.
export function ThemeProvider({ children }) {
  const [pref, setPrefState] = useState(readPref);

  useEffect(() => {
    applyTheme(pref);
    if (pref !== "system") return;
    const mq = darkQuery();
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  const setPref = useCallback((v) => {
    try { localStorage.setItem(KEY, v); } catch { /* storage blocked: still apply for this session */ }
    setPrefState(v);
  }, []);

  const value = useMemo(() => ({ pref, setPref }), [pref, setPref]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

const ICONS = { light: Sun, dark: Moon, system: Monitor };
const LABELS = { light: "Light", dark: "Dark", system: "System" };

// Topbar: icon button cycling Light -> Dark -> System
export function ThemeToggle() {
  const { pref, setPref } = useTheme();
  const next = OPTIONS[(OPTIONS.indexOf(pref) + 1) % OPTIONS.length];
  const Icon = ICONS[pref];
  return (
    <button
      type="button"
      className="btn btn-ghost btn-icon"
      onClick={() => setPref(next)}
      aria-label={`Theme: ${LABELS[pref]}. Switch to ${LABELS[next]}`}
      title={`Theme: ${LABELS[pref]}`}
    >
      <Icon size={18} strokeWidth={1.75} />
    </button>
  );
}

// Settings page: three visual tiles instead of a <select>
export function ThemeOptions() {
  const { pref, setPref } = useTheme();
  return (
    <div className="theme-options" role="radiogroup" aria-label="Theme">
      {OPTIONS.map((o) => {
        const Icon = ICONS[o];
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={pref === o}
            className="theme-tile"
            onClick={() => setPref(o)}
          >
            <Icon size={18} strokeWidth={1.75} />
            {LABELS[o]}
          </button>
        );
      })}
    </div>
  );
}
