"use client"

import { Globe, Check, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { languages } from "../lib/i18n"
import { useLanguage } from "../hooks/use-language"

export function LanguageSwitcher() {
  const { currentLanguage, setLanguage } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="lang-switch-btn" aria-label="Change language">
          <Globe size={17} className="lang-switch-globe" />
          <span className="lang-switch-code">{currentLanguage.code.toUpperCase()}</span>
          <ChevronDown size={14} className="lang-switch-chevron" />
          <style>{`
            .lang-switch-btn {
              height: 42px;
              padding: 0 12px;
              display: inline-flex;
              align-items: center;
              gap: 7px;
              border-radius: 999px;
              border: 1px solid var(--border, #e2e8f0);
              background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
              color: var(--foreground, #0f172a);
              font-size: 13px;
              font-weight: 600;
              line-height: 1;
              cursor: pointer;
              box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6);
              transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
              margin-inline-end: 12px;
            }
            .lang-switch-btn:hover {
              background: linear-gradient(180deg, #ffffff 0%, var(--muted, #f1f5f9) 100%);
              border-color: var(--color-action, #e60000);
              box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6);
              transform: translateY(-1px);
            }
            .lang-switch-btn:active { transform: translateY(0); }
            .lang-switch-btn[data-state="open"] { border-color: var(--color-action, #e60000); }
            .lang-switch-globe { color: var(--color-action, #e60000); }
            .lang-switch-code { letter-spacing: 0.4px; }
            .lang-switch-chevron { opacity: 0.5; transition: transform 0.15s ease; }
            .lang-switch-btn[data-state="open"] .lang-switch-chevron { transform: rotate(180deg); }

            html.dark .lang-switch-btn {
              background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
              border-color: #334155;
              color: #f1f5f9;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
            }
            html.dark .lang-switch-btn:hover {
              background: linear-gradient(180deg, #334155 0%, #1e293b 100%);
              border-color: var(--color-action, #e60000);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
            }

            /* Dropdown panel + items */
            .lang-switch-menu { min-width: 232px; }
            .lang-switch-item {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 9px 10px;
              border-radius: 10px;
              cursor: pointer;
            }
            .lang-switch-badge {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              border-radius: 9px;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.4px;
              flex-shrink: 0;
              background: color-mix(in srgb, var(--color-action, #e60000) 12%, transparent);
              color: var(--color-action, #e60000);
            }
            .lang-switch-native { font-size: 14px; font-weight: 600; line-height: 1.2; }
            .lang-switch-name { font-size: 12px; color: var(--muted-foreground, #64748b); line-height: 1.2; }
            .lang-switch-check { color: var(--color-action, #e60000); flex-shrink: 0; }
            .lang-switch-item.is-active {
              background: color-mix(in srgb, var(--color-action, #e60000) 9%, transparent);
            }
            .lang-switch-item.is-active .lang-switch-badge {
              background: var(--color-action, #e60000);
              color: #ffffff;
            }
          `}</style>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="lang-switch-menu rounded-xl p-1.5 shadow-lg"
      >
        {languages.map((language) => {
          const active = currentLanguage.code === language.code
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => setLanguage(language)}
              className={`lang-switch-item ${active ? "is-active" : ""}`}
            >
              <span className="lang-switch-badge">{language.code.toUpperCase()}</span>
              <span className="flex flex-col flex-1 min-w-0">
                <span className="lang-switch-native">{language.nativeName}</span>
                <span className="lang-switch-name">{language.name}</span>
              </span>
              {active && <Check size={16} className="lang-switch-check" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
