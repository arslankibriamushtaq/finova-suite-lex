import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, CircleSlash, Search } from "lucide-react";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { cn } from "../../../lib/utils";
import type { LexReasonCode } from "../../../redux/apis/apisCrudProductManagement";

/**
 * Picks the LEX reason code a workflow condition raises when it matches.
 *
 * A plain select was the obvious choice and the wrong one: the catalogue is
 * thirty-odd codes whose titles all begin with the same handful of words
 * ("SIMAH — …", "Document …"), so finding one by scrolling means reading most
 * of the list. This is a filter over the same data, and it shows the two things
 * that decide whether a code is the right one — how severe the hit is, and
 * where the engine routes it — next to each title rather than in a manual.
 *
 * Codes whose policy parameter matches the condition's own field are pulled to
 * the top under their own heading. That is a suggestion, not a restriction: the
 * catalogue is shared across products and a condition can legitimately raise a
 * code the field mapping never anticipated, so the rest of the list stays
 * reachable underneath.
 */

export interface ReasonCodePickerProps {
  /** The catalogue, already fetched — this component never calls the network. */
  reasonCodes: LexReasonCode[];
  loading?: boolean;
  /** The currently selected `referenceCode`, or null / "" for none. */
  value?: string | null;
  onChange: (referenceCode: string | null) => void;
  /** The condition's field, used only to surface the likely codes first. */
  field?: string;
  disabled?: boolean;
  className?: string;
}

/** `loan_amount` → `LOAN_AMOUNT`, the shape `linkedPolicyParameter` uses. */
const toPolicyParameter = (field: string): string =>
  field
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

/**
 * Severity drives colour and nothing else, so an unknown value from the server
 * has to render as a neutral chip rather than as no chip at all.
 */
const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700 border-red-200",
  HIGH: "bg-orange-100 text-orange-700 border-orange-200",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
  LOW: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const severityClass = (severity: string) =>
  SEVERITY_STYLES[severity?.toUpperCase()] || "bg-muted text-muted-foreground border-border";

/** `APPLICATION_SOURCE` → `Application source`. */
const humanise = (value: string): string => {
  const words = value.replace(/_/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/**
 * Where a reason code sends the case, spelled out for the reader.
 *
 * The routing type is the half of a reason code that is easy to get wrong: two
 * codes can describe the same breach and send the application to different
 * people, and that difference is invisible from the title alone.
 */
const ROUTING_HINTS: Record<string, string> = {
  DELEGATION: "workflows.routingDelegation",
  SUPERVISOR: "workflows.routingSupervisor",
  APPLICATION_SOURCE: "workflows.routingApplicationSource",
};

function SeverityChip({ severity }: { severity: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide",
        severityClass(severity)
      )}
    >
      {severity}
    </span>
  );
}

export default function ReasonCodePicker({
  reasonCodes,
  loading = false,
  value,
  onChange,
  field,
  disabled = false,
  className,
}: ReasonCodePickerProps) {
  const { t } = useTranslation("productManagement2");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => reasonCodes.find((code) => code.referenceCode === value) || null,
    [reasonCodes, value]
  );

  const { suggested, others } = useMemo(() => {
    const needle = query.trim().toLowerCase();
    // Searched over the code as well as the title: the reference code is what
    // appears in LEX's own screens and in the payload, so it is what somebody
    // comparing the two will type.
    const matches = reasonCodes.filter(
      (code) =>
        !needle ||
        code.title.toLowerCase().includes(needle) ||
        code.referenceCode.toLowerCase().includes(needle)
    );

    if (!field) return { suggested: [] as LexReasonCode[], others: matches };

    const parameter = toPolicyParameter(field);
    const isRelevant = (code: LexReasonCode) =>
      code.linkedPolicyParameter === parameter ||
      code.referenceCode === parameter ||
      code.referenceCode.startsWith(`${parameter}_`);

    return {
      suggested: matches.filter(isRelevant),
      others: matches.filter((code) => !isRelevant(code)),
    };
  }, [reasonCodes, query, field]);

  const choose = (referenceCode: string | null) => {
    onChange(referenceCode);
    setOpen(false);
    setQuery("");
  };

  const renderItem = (code: LexReasonCode) => (
    <button
      key={code.referenceCode}
      type="button"
      onClick={() => choose(code.referenceCode)}
      className={cn(
        "flex w-full items-start gap-2 rounded px-2 py-2 text-start transition-colors hover:bg-accent",
        code.referenceCode === value && "bg-accent"
      )}
    >
      <Check
        className={cn(
          "mt-0.5 h-3.5 w-3.5 shrink-0",
          code.referenceCode === value ? "opacity-100 text-primary" : "opacity-0"
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-medium leading-tight">{code.title}</span>
          <SeverityChip severity={code.severity} />
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
          <span className="font-mono">{code.referenceCode}</span>
          {code.routingType && (
            <span>{t("workflows.routesTo", { target: humanise(code.routingType) })}</span>
          )}
        </span>
      </span>
    </button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || loading}
          className={cn("h-9 w-full justify-between gap-2 px-3 font-normal", className)}
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="truncate">{selected.title}</span>
              <SeverityChip severity={selected.severity} />
            </span>
          ) : value ? (
            // A saved code the catalogue cannot describe — it failed to load,
            // or the engine has since retired the code. Showing the placeholder
            // here would read as "no reason code" while the condition is still
            // holding one and would still save it.
            <span className="truncate font-mono text-xs">{value}</span>
          ) : (
            <span className="truncate text-muted-foreground">
              {loading ? t("workflows.reasonCodeLoading") : t("workflows.reasonCodePlaceholder")}
            </span>
          )}
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[min(28rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("workflows.reasonCodeSearch")}
            className="h-8 border-0 p-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="max-h-72 overflow-y-auto p-1">
          {/* Clearing is a first-class choice, not the absence of one: an
              auto-approval condition that passes has no reason to give. */}
          <button
            type="button"
            onClick={() => choose(null)}
            className="flex w-full items-center gap-2 rounded px-2 py-2 text-start text-sm transition-colors hover:bg-accent"
          >
            <CircleSlash className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className={cn(!value && "font-medium")}>{t("workflows.reasonCodeNone")}</span>
          </button>

          {suggested.length > 0 && (
            <>
              <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("workflows.reasonCodeSuggested")}
              </p>
              {suggested.map(renderItem)}
            </>
          )}

          {others.length > 0 && (
            <>
              <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {suggested.length > 0
                  ? t("workflows.reasonCodeOther")
                  : t("workflows.reasonCodeAll")}
              </p>
              {others.map(renderItem)}
            </>
          )}

          {suggested.length === 0 && others.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              {t("workflows.reasonCodeEmpty")}
            </p>
          )}
        </div>

        {/* What a reason code is for, said where somebody is choosing one.
            Printed under every condition instead, it was the longest line on
            each card and became wallpaper. */}
        <p className="border-t px-3 py-2 text-[11px] leading-snug text-muted-foreground">
          {t("workflows.reasonCodeHelp")}
        </p>
      </PopoverContent>
    </Popover>
  );
}

/**
 * The one-line explanation that sits under a chosen code.
 *
 * It lives beside the picker rather than in the tab because it is the same
 * knowledge — a code's severity and where it routes — said in a different
 * place, and splitting the two across files is how they drift apart.
 */
export function ReasonCodeSummary({ code }: { code: LexReasonCode }) {
  const { t } = useTranslation("productManagement2");
  const hintKey = ROUTING_HINTS[code.routingType];

  return (
    <p className="text-xs text-muted-foreground">
      <span className="font-mono">{code.referenceCode}</span>
      {code.routingType && (
        <>
          {" — "}
          {hintKey ? t(hintKey) : t("workflows.routesTo", { target: humanise(code.routingType) })}
        </>
      )}
    </p>
  );
}
