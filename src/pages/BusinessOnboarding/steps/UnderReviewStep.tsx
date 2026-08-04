import { Clock, FileSearch, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Button } from "../../../components/ui/button";
import StepCard from "../components/StepCard";
import { BUSINESS_ONBOARDING_ROUTES } from "../navigation";
import { useBusinessOnboarding } from "../OnboardingContext";

/**
 * Terminal screen.
 *
 * `COMPLETED` is not `APPROVED`: the business stays KYC-`PENDING` until an
 * admin reviews the documents, so this screen never links to a dashboard.
 */
export default function UnderReviewStep() {
  const { t } = useTranslation("businessOnboarding");
  const { data } = useBusinessOnboarding();

  const timeline = [
    { icon: ShieldCheck, key: "submitted", done: true },
    { icon: FileSearch, key: "review", done: false },
    { icon: Clock, key: "decision", done: false },
  ];

  return (
    <StepCard title={t("underReview.title")} description={t("underReview.description")}>
      <div className="space-y-6">
        <ol className="space-y-4">
          {timeline.map(({ icon: Icon, key, done }) => (
            <li key={key} className="flex items-start gap-[0.75rem]">
              <span
                aria-hidden="true"
                className={
                  done
                    ? "flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                }
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 pt-1">
                <p className="text-sm font-medium text-foreground">
                  {t(`underReview.timeline.${key}.title`)}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {t(`underReview.timeline.${key}.body`)}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {data.businessName ? (
          <dl className="rounded-lg border-[1px] border-border p-[1rem] text-sm">
            <div className="flex items-center justify-between gap-[1rem]">
              <dt className="text-muted-foreground">{t("underReview.businessLabel")}</dt>
              <dd className="truncate font-medium text-foreground">
                {data.businessName}
              </dd>
            </div>
            {data.registrationNumber ? (
              <div className="mt-2 flex items-center justify-between gap-[1rem]">
                <dt className="text-muted-foreground">
                  {t("details.field.registrationNumber")}
                </dt>
                <dd className="truncate font-medium text-foreground" dir="ltr">
                  {data.registrationNumber}
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        <div className="space-y-3 rounded-lg border-[1px] border-border bg-muted/30 p-[1rem]">
          <p className="text-sm font-medium text-foreground">
            {t("underReview.pepTitle")}
          </p>
          <p className="text-sm text-muted-foreground">{t("underReview.pepBody")}</p>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to={BUSINESS_ONBOARDING_ROUTES.pep}>{t("underReview.pepCta")}</Link>
          </Button>
        </div>
      </div>
    </StepCard>
  );
}
