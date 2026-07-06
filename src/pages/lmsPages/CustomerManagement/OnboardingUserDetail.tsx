import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, RefreshCw, Check, Clock, X, CircleDot } from "lucide-react";

import { Button } from "../../../components/ui/button";
import {
  getOnboardingSessionDetail,
  OnboardingSession,
  OnboardingSessionStep,
} from "../../../redux/apis/apisUniversalOnboarding";

const STATUS_BADGE: Record<string, string> = {
  IN_PROGRESS:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 dark:border dark:border-blue-500/30",
  COMPLETED:
    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300 dark:border dark:border-green-500/30",
  PENDING:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 dark:border dark:border-amber-500/30",
  ABANDONED:
    "bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300 dark:border dark:border-gray-500/30",
  FAILED:
    "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300 dark:border dark:border-red-500/30",
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const stepStatusVisual = (status?: string) => {
  const s = (status || "").toUpperCase();
  if (s === "COMPLETED" || s === "DONE" || s === "SUCCESS")
    return { Icon: Check, ring: "bg-emerald-500 text-white border-emerald-500" };
  if (s === "IN_PROGRESS" || s === "CURRENT" || s === "ACTIVE")
    return { Icon: CircleDot, ring: "bg-blue-500 text-white border-blue-500" };
  if (s === "FAILED" || s === "ERROR" || s === "REJECTED")
    return { Icon: X, ring: "bg-red-500 text-white border-red-500" };
  return { Icon: Clock, ring: "bg-muted text-muted-foreground border-border" };
};

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value ?? "-"}</span>
  </div>
);

const OnboardingUserDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
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
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to load onboarding session"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const steps: OnboardingSessionStep[] = useMemo(() => {
    const raw = session?.steps || (session as any)?.timeline || (session as any)?.history || [];
    if (!Array.isArray(raw)) return [];
    return [...raw].sort(
      (a, b) => (Number(a?.orderIndex ?? 0) - Number(b?.orderIndex ?? 0))
    );
  }, [session]);

  const name =
    session?.fullName || session?.name || session?.email || session?.phone || "Onboarding User";
  const contact = session?.email || session?.phone || session?.mobile || "-";
  const flow = session?.flow || session?.countryCode || "-";

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h3 className="mb-0 fw-bold text-dark ps-0">{name}</h3>
          {session?.status && (
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                STATUS_BADGE[session.status] || "bg-muted text-foreground"
              }`}
            >
              {session.status}
            </span>
          )}
        </div>
        <Button variant="outline" className="gap-2" onClick={loadDetail} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isLoading && !session ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Loading session…</div>
      ) : !session ? (
        <div className="text-sm text-muted-foreground py-8 text-center">No session found.</div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {/* Summary card */}
          <div
            className="bg-white p-4"
            style={{ borderRadius: 8, border: "1px solid var(--border)" }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Contact" value={contact} />
              <Field label="Flow" value={flow} />
              <Field label="Workflow ID" value={<span className="font-mono text-xs">{workflowId}</span>} />
              <Field label="Current Step" value={session.currentStepName || session.currentStep || "-"} />
              <Field label="Started" value={formatDate(session.createdAt)} />
              <Field label="Last Updated" value={formatDate(session.updatedAt)} />
              {typeof session.totalSteps === "number" && (
                <Field
                  label="Steps Completed"
                  value={`${session.completedSteps ?? session.currentStepIndex ?? 0} / ${session.totalSteps}`}
                />
              )}
            </div>
          </div>

          {/* Timeline */}
          <div
            className="bg-white p-4"
            style={{ borderRadius: 8, border: "1px solid var(--border)" }}
          >
            <h5 className="fw-bold text-dark mb-3">Step Timeline</h5>
            {steps.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4">
                No step timeline available for this session.
              </div>
            ) : (
              <ol className="relative">
                {steps.map((step, index) => {
                  const { Icon, ring } = stepStatusVisual(step.status);
                  const isLast = index === steps.length - 1;
                  return (
                    <li key={step.stepId ?? index} className="relative flex gap-4 pb-6">
                      {/* connector line */}
                      {!isLast && (
                        <span
                          className="absolute left-[15px] top-8 bottom-0 w-px bg-border"
                          aria-hidden
                        />
                      )}
                      <span
                        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${ring}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex flex-col gap-1 pt-1 flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">
                            {step.stepName || `Step ${step.orderIndex ?? index + 1}`}
                          </span>
                          {step.status && (
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                                STATUS_BADGE[step.status] || "bg-muted text-foreground"
                              }`}
                            >
                              {step.status}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          {step.startedAt && <span>Started: {formatDate(step.startedAt)}</span>}
                          {step.completedAt && <span>Completed: {formatDate(step.completedAt)}</span>}
                        </div>
                        {step.data && Object.keys(step.data).length > 0 && (
                          <pre className="mt-1 max-w-full overflow-x-auto rounded-md bg-muted/50 p-2 text-[11px] text-muted-foreground">
                            {JSON.stringify(step.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingUserDetail;
