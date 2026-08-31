import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "../../../lib/utils";
import { TENANT_SIGNUP_STEPS, type TenantSignupStep } from "../navigation";

/**
 * Four dots and three connectors: choose → details → payment → setup.
 *
 * The order really is fixed here (unlike the applicant journey, where the
 * server decides the next screen), so showing it is honest rather than a
 * guess the buyer might be pulled out of.
 */
export default function StepBar({ current }: { current: TenantSignupStep }) {
  const { t } = useTranslation("tenantSignup");
  const currentIndex = TENANT_SIGNUP_STEPS.indexOf(current);

  return (
    <ol
      aria-label={t("stepper.label")}
      className="flex items-center justify-between gap-1"
    >
      {TENANT_SIGNUP_STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;

        return (
          <li
            key={step}
            aria-current={active ? "step" : undefined}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2",
              index < TENANT_SIGNUP_STEPS.length - 1 && "after:h-px after:flex-1",
              index < TENANT_SIGNUP_STEPS.length - 1 &&
                (done
                  ? "after:bg-[var(--primary)]"
                  : "after:bg-[var(--surface-border)]")
            )}
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                done && "bg-[var(--primary)] text-[var(--primary-foreground)]",
                active &&
                  "bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-[var(--primary)] ring-1 ring-[var(--primary)]",
                !done && !active && "bg-[var(--muted)] text-muted-foreground"
              )}
            >
              {done ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>

            <span
              className={cn(
                "ts-xs truncate font-medium",
                active ? "text-foreground" : "text-muted-foreground",
                // The labels crowd a phone; the numbered dots carry the meaning
                // on their own at that width.
                "hidden sm:inline"
              )}
            >
              {t(`step.${step}`)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
