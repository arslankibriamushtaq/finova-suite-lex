import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  RefreshCw,
  Check,
  Clock,
  Mail,
  Phone,
  Hash,
  CalendarDays,
  User,
  Route as RouteIcon,
  ListChecks,
  AlertTriangle,
} from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { PermissionDenied } from "../../../components/shared/detailKit";
import {
  useProductPermissions,
  ONBOARD_CUSTOMERS_PERMISSIONS,
} from "../../../hooks/useProductPermissions";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";
import {
  getOnboardingSessionDetail,
  OnboardingSession,
  OnboardingSessionStep,
} from "../../../redux/apis/apisUniversalOnboarding";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const TONES: Record<string, string> = {
  emerald:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  amber:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  sky: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30",
  red: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  slate:
    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30",
};

const statusTone = (status?: string): string => {
  switch ((status || "").toUpperCase()) {
    case "COMPLETED":
    case "SUCCESS":
    case "DONE":
    case "APPROVED":
    case "VERIFIED":
      return "emerald";
    case "IN_PROGRESS":
    case "PENDING":
    case "CURRENT":
    case "ACTIVE":
      return "amber";
    case "ABANDONED":
      return "slate";
    case "FAILED":
    case "ERROR":
    case "REJECTED":
    case "DECLINED":
      return "red";
    default:
      return "slate";
  }
};

const StatusBadge = ({ status, className }: { status?: string; className?: string }) => (
  <Badge variant="outline" className={cn("border font-medium", TONES[statusTone(status)], className)}>
    {status || "—"}
  </Badge>
);

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* Section card with emerald glow + icon badge — matches the customer 360 look */
const Block = ({
  title,
  right,
  children,
  className,
  icon: Icon,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  icon?: React.ElementType;
}) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-xl border bg-card p-4 transition-shadow duration-200 hover:shadow-md md:p-5",
      className
    )}
  >
    <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-emerald-500/[0.07] blur-2xl" />
    <div className="relative mb-4 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        {Icon && (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
            <Icon className="size-4" />
          </span>
        )}
        <h3 className="m-0 flex items-center text-sm font-bold leading-none tracking-tight text-foreground">
          {title}
        </h3>
      </div>
      {right}
    </div>
    <div className="relative">{children}</div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const OnboardingUserDetail = () => {
  const { t, i18n } = useTranslation("customerManagement");
  // Hiding the menu entry is not access control — this route is reachable by
  // URL, so the page has to make the same decision the sidebar did.
  const { hasPermission } = useProductPermissions();
  const canRead = hasPermission(ONBOARD_CUSTOMERS_PERMISSIONS.LIST);
  // When Arabic is active, prefer the API's Arabic step label (labelAr).
  const isArabic = i18n.language === "ar";
  const params = useParams();
  const workflowId = params.workflowId || params.id || "";

  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (workflowId) loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId]);

  const loadDetail = async () => {
    setIsLoading(true);
    try {
      const res = await getOnboardingSessionDetail(workflowId);
      const body = res?.data?.data ?? res?.data ?? null;
      setSession(body);
    } catch (error) {
      console.error(error);
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      toast.error(message || t("onboardingUserDetail.toast.loadFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const steps: OnboardingSessionStep[] = useMemo(() => {
    const raw = session?.steps || session?.timeline || session?.history || [];
    if (!Array.isArray(raw)) return [];
    return [...raw].sort((a, b) => Number(a?.orderIndex ?? 0) - Number(b?.orderIndex ?? 0));
  }, [session]);

  /* Accessors — primary keys match the live payload, legacy keys as fallback */
  const name =
    session?.customerName ||
    session?.fullName ||
    session?.name ||
    session?.maskedEmail ||
    session?.maskedMobile ||
    session?.email ||
    t("onboardingUserDetail.defaultName");
  const email = session?.maskedEmail || session?.email || "";
  const mobile = session?.maskedMobile || session?.phone || session?.mobile || "";
  const flow = session?.flowType || session?.flow || session?.countryCode || "—";
  const startedAt = session?.startedAt || session?.createdAt;
  const failureReason = session?.failureReason;

  const initials = /^[A-Za-z]/.test(name)
    ? name
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "";

  const headerFacts = [
    { icon: Mail, label: t("common:email"), value: email },
    { icon: Phone, label: t("onboardingUserDetail.fact.mobile"), value: mobile },
    { icon: RouteIcon, label: t("onboardingUserDetail.fact.flow"), value: flow },
    { icon: Hash, label: t("onboardingUserDetail.fact.workflowId"), value: workflowId },
    { icon: CalendarDays, label: t("onboardingUserDetail.fact.started"), value: formatDateTime(startedAt) },
    { icon: Clock, label: t("onboardingUserDetail.fact.lastUpdated"), value: formatDateTime(session?.updatedAt) },
  ].filter((f) => f.value && f.value !== "—");

  if (!canRead) return <PermissionDenied />;

  return (
    <div className="service customer-list-page onb-detail-page">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-lg"
          onClick={loadDetail}
          disabled={isLoading}
          title={t("common:refresh")}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common:refresh")}
        </Button>
      </div>

      {isLoading && !session ? (
        <div className="text-sm text-muted-foreground py-8 text-center">{t("onboardingUserDetail.loading")}</div>
      ) : !session ? (
        <div className="text-sm text-muted-foreground py-8 text-center">{t("onboardingUserDetail.noSession")}</div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Header band */}
          <div className="relative overflow-hidden rounded-xl border bg-card">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent" />
            <div className="relative flex flex-col gap-6 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
              {/* Identity */}
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-base font-semibold text-white ring-2 ring-emerald-500/25 shadow-md shadow-emerald-500/20 sm:size-14 sm:text-lg">
                  {initials || <User className="size-6" />}
                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  <h2 className="m-0 max-w-full truncate text-start text-base font-semibold leading-tight text-foreground">
                    {name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={session.status} />
                    {flow !== "—" && (
                      <Badge variant="outline" className={cn("border font-medium", TONES.sky)}>
                        {flow}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Fact grid */}
              <div className="grid w-full grid-cols-1 gap-x-6 gap-y-4 min-[420px]:grid-cols-2 sm:gap-x-8 lg:w-auto lg:flex-1 lg:grid-cols-3 xl:max-w-3xl">
                {headerFacts.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label} className="flex w-full min-w-0 items-center gap-2.5">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          {f.label}
                        </div>
                        <div
                          className="truncate text-xs font-semibold text-foreground"
                          title={String(f.value)}
                        >
                          {f.value}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {failureReason && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm",
                TONES.red
              )}
            >
              <AlertTriangle className="size-4 shrink-0" />
              {failureReason}
            </div>
          )}

          {/* Onboarding steps — horizontal animated stepper (matches Customer 360) */}
          <Block title={t("onboardingUserDetail.stepsTitle")} icon={ListChecks} className="order-first">
            {steps.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                {t("onboardingUserDetail.noSteps")}
              </p>
            ) : (
              <div className="relative flex items-start overflow-x-auto pb-2">
                {steps.map((step, idx) => {
                  const status = (step.status || "PENDING").toUpperCase();
                  const isFirst = idx === 0;
                  const done = ["COMPLETED", "SUCCESS", "DONE", "APPROVED", "VERIFIED"].includes(
                    status
                  );
                  const failed = ["FAILED", "ERROR", "REJECTED", "DECLINED"].includes(status);
                  const current = ["CURRENT", "IN_PROGRESS", "ACTIVE"].includes(status);
                  const prevStatus = (steps[idx - 1]?.status || "PENDING").toUpperCase();
                  const prevDone = idx > 0 &&
                    ["COMPLETED", "SUCCESS", "DONE", "APPROVED", "VERIFIED"].includes(prevStatus);
                  const label =
                    (isArabic ? step.labelAr : "") ||
                    step.stepName ||
                    step.label ||
                    step.currentStepLabel ||
                    t("onboardingUserDetail.stepFallback", { number: step.orderIndex ?? idx + 1 });
                  const when =
                    step.completedAt || step.startedAt || step.occurredAt || null;
                  const circle = done
                    ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                    : failed
                      ? "border-red-500 bg-red-500 text-white shadow-sm shadow-red-500/30"
                      : current
                        ? "border-emerald-500 text-emerald-600 ring-4 ring-emerald-500/15"
                        : "border-border text-muted-foreground";
                  return (
                    <div
                      key={step.stepId ?? idx}
                      className="relative flex min-w-[92px] flex-1 flex-col items-center"
                    >
                      {!isFirst && (
                        <div
                          className={cn(
                            "onb-connector absolute top-5 z-0 h-0.5 rounded-full transition-colors duration-500",
                            prevDone ? "bg-emerald-500" : "bg-border"
                          )}
                          style={{ animationDelay: `${idx * 0.18 + 0.1}s` }}
                        />
                      )}
                      <div
                        className={cn(
                          "onb-step-circle relative z-10 flex size-10 items-center justify-center rounded-full border-2 bg-background transition-all duration-300",
                          circle
                        )}
                        style={{ animationDelay: `${idx * 0.18}s` }}
                      >
                        {done ? (
                          <Check className="size-5" strokeWidth={3} />
                        ) : failed ? (
                          <AlertTriangle className="size-5" />
                        ) : (
                          <span className="text-sm font-semibold">{idx + 1}</span>
                        )}
                      </div>
                      <div className="mt-2 w-full px-1 text-center leading-tight">
                        <div
                          className="onb-label"
                          style={{ animationDelay: `${idx * 0.18 + 0.15}s` }}
                        >
                          <span
                            className={cn(
                              "block break-words text-xs",
                              done || current
                                ? "font-semibold text-foreground"
                                : "font-medium text-muted-foreground"
                            )}
                          >
                            {label}
                          </span>
                          {when && (
                            <div className="text-[10px] text-muted-foreground">
                              {formatDateTime(when)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Block>
        </div>
      )}

      {/* Stepper entrance animations — same as the Customer 360 detail page */}
      <style>{`
        /* A global heading rule oversizes h2/h3 — clamp this page's headings so
           the section titles align with their icon badges (matches Customer 360). */
        .onb-detail-page h2 { font-size: 1rem !important; line-height: 1.3 !important; margin: 0 !important; }
        .onb-detail-page h3 { padding: 0; line-height: 1.3 !important; margin: 0 !important; }

        @keyframes onbStepPop {
          0%   { opacity: 0; transform: scale(0.4); }
          60%  { opacity: 1; transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes onbConnGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes onbLabelIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .onb-detail-page .onb-step-circle {
          animation: onbStepPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          z-index: 1;
        }
        .onb-detail-page .onb-connector {
          /* Logical insets so the line connects to the PREVIOUS step and mirrors
             automatically in RTL (end=right in LTR / left in RTL). */
          inset-inline-end: 50%;
          inset-inline-start: -50%;
          transform-origin: left center;
          animation: onbConnGrow 0.45s ease-out both;
        }
        .onb-detail-page[dir="rtl"] .onb-connector { transform-origin: right center; }
        .onb-detail-page .onb-label {
          animation: onbLabelIn 0.4s ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .onb-detail-page .onb-step-circle,
          .onb-detail-page .onb-connector,
          .onb-detail-page .onb-label { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

export default OnboardingUserDetail;
