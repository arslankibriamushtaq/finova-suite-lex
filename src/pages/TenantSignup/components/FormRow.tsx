import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "../../../lib/utils";

interface FormRowProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
  className?: string;
}

/**
 * Label + control + hint/error, wired for accessibility.
 *
 * This form is the reverse of the applicant journey's: most fields here are
 * optional, so the *required* ones carry the marker. The control it wraps is
 * expected to carry `id={id}`, `aria-describedby` where relevant and
 * `aria-invalid` when `error` is set — the caller owns the input so it can be
 * any element.
 */
export default function FormRow({
  id,
  label,
  required,
  hint,
  error,
  children,
  className,
}: FormRowProps) {
  const { t } = useTranslation("tenantSignup");

  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className="ts-label flex items-baseline justify-between gap-2 text-foreground"
      >
        <span>
          {label}
          {required ? (
            <span aria-hidden="true" className="ms-0.5 text-[var(--primary)]">
              *
            </span>
          ) : null}
        </span>
        {required ? null : (
          <span className="ts-xs font-normal text-muted-foreground">
            {t("common.optional")}
          </span>
        )}
      </label>

      {children}

      {error ? (
        <p id={`${id}-error`} role="alert" className="ts-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="ts-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
