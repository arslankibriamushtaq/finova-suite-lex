import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { TenantSignupStep } from "../navigation";
import { useTenantSignup, type WizardPart } from "../TenantSignupContext";

/**
 * The vertical stepper down the side of the signup.
 *
 * The four parts of the details wizard are listed as steps of their own rather
 * than hidden behind one "Business Info" entry. They are four separate saves
 * against the server and the buyer moves between them one at a time, so a rail
 * that showed them as a single step would under-report how far along someone is
 * and over-report how much is left.
 *
 * There is no "Set Password" entry. Setting a password happens days later, from
 * a link in an email, on a route this flow never navigates to — a step nobody
 * can reach from the screen they are looking at is not a step.
 */
const RAIL: { label: string; route: TenantSignupStep; part?: WizardPart }[] = [
  { label: "step.pricing", route: "pricing" },
  { label: "wizard.section.business", route: "details", part: "company" },
  { label: "wizard.section.verify", route: "details", part: "verify" },
  { label: "wizard.section.company", route: "details", part: "details" },
  { label: "wizard.section.you", route: "details", part: "you" },
  { label: "step.payment", route: "payment" },
  { label: "step.finish", route: "setup" },
];

export default function StepRail({ current }: { current: TenantSignupStep }) {
  const { t } = useTranslation("tenantSignup");
  const { wizardPart } = useTenantSignup();

  // The first entry matching both the route and — inside the wizard — the part.
  // An entry with no part matches on its route alone.
  const activeIndex = RAIL.findIndex(
    (entry) => entry.route === current && (!entry.part || entry.part === wizardPart)
  );

  return (
    <ol className="ts-rail" aria-label={t("stepper.label")}>
      {RAIL.map((entry, index) => {
        const done = activeIndex >= 0 && index < activeIndex;
        const active = index === activeIndex;

        return (
          <li
            key={entry.label}
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
            <span className="ts-rail__label">{t(entry.label)}</span>
          </li>
        );
      })}
    </ol>
  );
}
