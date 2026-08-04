import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../../../lib/utils";

type StatusTone = "error" | "warning" | "info" | "success";

interface StatusMessageProps {
  tone?: StatusTone;
  title?: string;
  children: ReactNode;
  className?: string;
}

const TONE_STYLES: Record<StatusTone, { wrapper: string; icon: typeof Info }> = {
  error: {
    wrapper:
      "border-[var(--color-error-border)] bg-[var(--color-error-bg)] text-[var(--color-error-text)]",
    icon: AlertCircle,
  },
  warning: {
    wrapper:
      "border-[color-mix(in_srgb,var(--color-warning)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-text-dark)]",
    icon: TriangleAlert,
  },
  info: {
    wrapper:
      "border-[color-mix(in_srgb,var(--color-info)_30%,transparent)] bg-[var(--color-info-bg)] text-[var(--foreground)]",
    icon: Info,
  },
  success: {
    wrapper:
      "border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success-text)]",
    icon: CheckCircle2,
  },
};

/**
 * Inline feedback for the two soft failure modes the contract defines: a step
 * error (HTTP 4xx) and a retryable `failureReason` on an otherwise-200 response.
 * `role="alert"` on the error tone so it is announced when it appears.
 */
export default function StatusMessage({
  tone = "error",
  title,
  children,
  className,
}: StatusMessageProps) {
  const { wrapper, icon: Icon } = TONE_STYLES[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-[0.75rem] rounded-lg border-[1px] px-[1rem] py-[0.75rem] text-sm",
        wrapper,
        className
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 space-y-0.5">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className="leading-relaxed break-words">{children}</div>
      </div>
    </div>
  );
}
