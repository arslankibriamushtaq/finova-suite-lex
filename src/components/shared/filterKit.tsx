import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";

import { Input } from "../ui/input";
import { Label } from "../ui/label";

/**
 * One filter: its label above its control, sized by the grid it sits in rather
 * than a fixed pixel width, so nothing overflows or is orphaned as the page
 * narrows. Drop these into a `grid ... sm:grid-cols-2 lg:grid-cols-3` and the
 * filter panel reflows on its own.
 */
export const FilterField = ({
  label,
  htmlFor,
  className = "",
  children,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) => (
  <div className={`flex min-w-0 flex-col gap-1 ${className}`}>
    <Label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
      {label}
    </Label>
    {children}
  </div>
);

/**
 * The list-page search box: leading magnifier, inline clear, 40px tall, 2px
 * radius — the same field the Notification Orchestrator page uses, so every
 * listing searches the same way.
 */
export const SearchField = ({
  id,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const { t } = useTranslation("common");
  return (
    <div className={`relative min-w-0 ${className}`}>
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        aria-label={t("search")}
        placeholder={placeholder ?? t("search")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // px-9, not ps-9/pe-9: the base Input sets px-3, and tailwind-merge only
        // drops that for another px-* — a ps-* longhand would just lose the
        // cascade and let the text run under the magnifier.
        className="h-10 rounded-sm px-9"
      />
      {value && (
        <button
          type="button"
          aria-label={t("clear")}
          onClick={() => onChange("")}
          className="absolute end-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
