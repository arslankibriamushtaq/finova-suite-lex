import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "app-theme";

const getInitialTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return "light";
};

export const applyTheme = (theme: "light" | "dark") => {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
  }
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      <style>{`
        .theme-toggle-btn {
          width: 42px;
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid var(--border, #e2e8f0);
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          color: var(--foreground, #0f172a);
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6);
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
          margin-right: 12px;
        }
        .theme-toggle-btn:hover {
          background: linear-gradient(180deg, #ffffff 0%, var(--muted, #f1f5f9) 100%);
          border-color: var(--foreground, #0f172a);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6);
          transform: translateY(-1px);
        }
        .theme-toggle-btn:active { transform: translateY(0); }

        /* Dark-mode swap for the toggle itself */
        html.dark .theme-toggle-btn {
          background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
          border-color: #334155;
          color: #f1f5f9;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
        html.dark .theme-toggle-btn:hover {
          background: linear-gradient(180deg, #334155 0%, #1e293b 100%);
          border-color: #475569;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </button>
  );
};

export default ThemeToggle;
