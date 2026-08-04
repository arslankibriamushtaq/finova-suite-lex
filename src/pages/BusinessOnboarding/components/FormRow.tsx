import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "../../../lib/utils";

interface FormRowProps {
  id: string;
  label: string;
  /** Marks the field required for both sighted users and screen readers. */
  required?: boolean;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
  className?: string;
}

/**
 * Label + control + hint/error, wired for accessibility.
 *
 * Optional fields are labelled, not required ones: nearly everything here is
 * mandatory, so a column of red asterisks is noise — the handful of fields the
 * applicant may skip is the useful signal.
 *
 * The control it wraps is expected to carry `id={id}`,
 * `aria-describedby={`${id}-hint`}` where relevant, and `aria-invalid` when
 * `error` is set — the caller owns the input so it can be any element.
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
  const { t } = useTranslation("businessOnboarding");

  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className="biz-label flex items-baseline justify-between gap-2 text-foreground"
      >
        <span>{label}</span>
        {required ? null : (
          <span className="biz-xs font-normal text-muted-foreground">
            {t("common.optional")}
          </span>
        )}
      </label>

      {children}

      {error ? (
        <p id={`${id}-error`} role="alert" className="biz-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="biz-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
