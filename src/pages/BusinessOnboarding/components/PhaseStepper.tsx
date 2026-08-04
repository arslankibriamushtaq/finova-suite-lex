import { useTranslation } from "react-i18next";

import { cn } from "../../../lib/utils";
import { ONBOARDING_PHASES, type OnboardingPhase } from "../navigation";

interface PhaseStepperProps {
  current: OnboardingPhase | null;
}

/**
 * Five-phase progress indicator.
 *
 * It reflects where the applicant *is*, not how many API calls remain — the
 * passport screens are skipped on reuse, so a per-screen count would jump
 * backwards. Phases stay constant either way.
 *
 * Drawn as segments rather than a row of labelled circles: five labels do not
 * fit the form column at any width worth designing for, and a segmented track
 * mirrors correctly in RTL for free. The phase name and count carry the
 * orientation the labels would have.
 */
export default function PhaseStepper({ current }: PhaseStepperProps) {
  const { t } = useTranslation("businessOnboarding");

  const currentIndex = current ? ONBOARDING_PHASES.indexOf(current) : -1;
  if (currentIndex < 0) return null;

  const total = ONBOARDING_PHASES.length;

  return (
    <nav aria-label={t("stepper.label")} className="w-full">
      <div className="mb-2 flex items-baseline justify-between gap-[0.75rem]">
        <p className="biz-label text-foreground">{t(`phase.${current}`)}</p>
        <p className="biz-xs text-muted-foreground">
          {t("stepper.progress", { current: currentIndex + 1, total })}
        </p>
      </div>

      <ol className="flex items-center gap-1.5">
        {ONBOARDING_PHASES.map((phase, index) => (
          <li key={phase} className="h-1 flex-1">
            <span
              className={cn(
                "block h-full rounded-full transition-colors duration-300",
                index <= currentIndex
                  ? "bg-[var(--primary)]"
                  : "bg-[color-mix(in_srgb,var(--foreground)_12%,transparent)]"
              )}
            />
            <span className="sr-only">
              {t(`phase.${phase}`)}
              {index === currentIndex ? ` — ${t("stepper.currentSuffix")}` : ""}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
