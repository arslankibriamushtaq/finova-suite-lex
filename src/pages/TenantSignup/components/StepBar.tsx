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

        const last = index === TENANT_SIGNUP_STEPS.length - 1;

        return (
          <li
            key={step}
            aria-current={active ? "step" : undefined}
            className={cn(
              "flex min-w-0 items-center gap-2.5",
              // The last step owns no connector, so it only claims the width
              // its label needs and the rails share the rest evenly.
              last ? "shrink-0" : "flex-1"
            )}
          >
            <span
              data-state={done ? "done" : active ? "active" : "todo"}
              className={cn(
                "ts-step-dot flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors",
                done && "bg-[var(--primary)] text-[var(--primary-foreground)]",
                active &&
                  "bg-[var(--primary)] text-[var(--primary-foreground)]",
                !done &&
                  !active &&
                  "bg-[var(--muted)] text-muted-foreground ring-1 ring-[var(--surface-border)]"
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
                active
                  ? "text-foreground"
                  : done
                    ? "text-[var(--primary)]"
                    : "text-muted-foreground",
                // The labels crowd a phone; the numbered dots carry the meaning
                // on their own at that width. `ts-sm-up` rather than Tailwind's
                // `hidden sm:inline` — see tenant-signup.css for why that pair
                // silently hides at every width in this app.
                "ts-sm-up"
              )}
            >
              {t(`step.${step}`)}
            </span>

            {!last ? (
              <span
                aria-hidden="true"
                data-done={done}
                // Visible at every width: with the labels hidden on a phone,
                // the connectors are what stop the dots bunching together.
                className="ts-track mx-1"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
