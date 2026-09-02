import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import { TENANT_SIGNUP_STEPS, type TenantSignupStep } from "../navigation";

/**
 * The vertical stepper down the side of the signup.
 *
 * Five entries, four routes. The flow's last screen covers both waiting for the
 * activation email and the confirmation that follows it, so "Set Password" and
 * "Finish" share the `setup` route — the rail treats Finish as the step the
 * buyer is still on their way to, which is true until the email is acted on.
 * That is why the list is built here rather than from TENANT_SIGNUP_STEPS
 * alone: the rail is what the buyer reads, and the routes are what the router
 * needs, and they are not the same list.
 */
const RAIL: { key: string; step: TenantSignupStep | null }[] = [
  { key: "pricing", step: "pricing" },
  { key: "details", step: "details" },
  { key: "payment", step: "payment" },
  { key: "setup", step: "setup" },
  { key: "finish", step: null },
];

export default function StepRail({ current }: { current: TenantSignupStep }) {
  const { t } = useTranslation("tenantSignup");
  const currentIndex = TENANT_SIGNUP_STEPS.indexOf(current);

  return (
    <ol className="ts-rail" aria-label={t("stepper.label")}>
      {RAIL.map((entry, index) => {
        // `step: null` is Finish, which no route reaches while the buyer is
        // still in the flow — so it is never the current one.
        const position = entry.step ? TENANT_SIGNUP_STEPS.indexOf(entry.step) : RAIL.length;
        const done = position < currentIndex;
        const active = entry.step !== null && position === currentIndex;

        return (
          <li
            key={entry.key}
            aria-current={active ? "step" : undefined}
            data-state={done ? "done" : active ? "active" : "todo"}
            className="ts-rail__item"
          >
            {/* Drawn by the item, running down to the next one, so the last
                entry simply has none — a connector owned by the gap would need
                a wrapper element per gap. */}
            {index < RAIL.length - 1 && <span className="ts-rail__line" aria-hidden="true" />}

            <span className="ts-rail__dot" aria-hidden="true">
              {done ? <Check /> : index + 1}
            </span>
            <span className="ts-rail__label">{t(`step.${entry.key}`)}</span>
          </li>
        );
      })}
    </ol>
  );
}
