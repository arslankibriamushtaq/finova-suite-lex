import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  Building2,
  FileText,
  Camera,
  Phone,
  Mail,
  Hash,
  CalendarDays,
  Clock,
  Lock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BarChart3,
  Users,
  UserCircle,
  Crown,
  KeyRound,
  MoreVertical,
  Eye,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts";

import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { Tabs, TabsContent } from "../../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Tooltip, TooltipTrigger, TooltipContent } from "../../../components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { cn } from "../../../lib/utils";
import { useLanguage } from "../../../hooks/use-language";
import { usePermissions, BUSINESS_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { getCustomer360 } from "../../../redux/apis/apisCrud";
import {
  getBusinessDetail,
  approveBusinessDocument,
  rejectBusinessDocument,
  getCustomerDocumentsBundle,
  getCustomerOnboardingDocumentImage,
  getBusinessPartners,
} from "../../../redux/apis/apisEddReferenceData";
import {
  StatusBadge,
  Field,
  Block,
  EmptyState,
  DocImage,
  Lightbox,
  DetailTabsList,
  DetailTabsTrigger,
  TabSkeleton,
  PermissionDenied,
  RiskGauge,
  OnboardingStepper,
} from "../../../components/shared/detailKit";
import {
  formatDate,
  formatDateTime,
  TONES,
  statusTone,
  riskTone,
  chartTooltipStyle,
  useTabTransition,
  humanizeCode,
  resolveRiskScore,
  resolveRiskLevel,
} from "../../../components/shared/detailKitUtils";

/* The admin partners endpoints (`GET /admin/businesses/{id}/partners*`) 403 today —
   they're owner-scoped on the backend. Enabled for UI review; the tab will show
   an error/empty state until the admin variant ships on the backend. */
const BUSINESS_PARTNERS_ENABLED = true;

/* Anything not in this set is treated as a business document — safer than an
   allow-list of business kinds, so an unlisted `kind` still surfaces for review
   instead of silently disappearing. */
const OWNER_DOC_KINDS = new Set(["PASSPORT", "SELFIE"]);

const LoadingState = () => (
  <Card className="gap-0 overflow-hidden py-0">
    <Skeleton className="h-28 w-full rounded-none" />
    <div className="p-5">
      <Skeleton className="mb-4 h-9 w-80" />
      <Skeleton className="h-72 w-full" />
    </div>
  </Card>
);

/* ------------------------------------------------------------------ */
/* Header band                                                         */
/* ------------------------------------------------------------------ */

const BusinessHeaderBand = ({ business }: any) => {
  const { t } = useTranslation("customerManagement");
  const customer = business?.customer;
  if (!business || !customer) return null;

  const displayName = business.businessName || customer.fullName || "—";

  const details = [
    { icon: Hash, label: t("businessDetail.field.registrationNo"), value: business.businessRegistrationNumber },
    { icon: Building2, label: t("businessDetail.field.type"), value: business.businessTypeCode },
    { icon: Hash, label: t("onboarding360.field.cifNumber"), value: customer.cifNumber },
    { icon: Phone, label: t("onboarding360.field.mobile"), value: customer.mobileNumber },
    { icon: Mail, label: t("common:email"), value: customer.email },
    { icon: Clock, label: t("onboarding360.field.onboarded"), value: formatDate(customer.createdAt) },
  ].filter((d) => d.value && d.value !== "—");

  return (
    <div className="relative overflow-hidden border-b">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent" />
      <div className="relative flex flex-col gap-6 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white ring-2 ring-emerald-500/25 shadow-md shadow-emerald-500/20 sm:size-14">
            <Building2 className="size-6" />
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2 className="m-0 max-w-full truncate text-start text-sm font-semibold leading-tight text-foreground">
                {displayName}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 [&_[data-slot=badge]]:text-[10px] [&_[data-slot=badge]]:px-2 [&_[data-slot=badge]]:py-0">
              {customer.kycStatus && <StatusBadge status={customer.kycStatusLabel || customer.kycStatus} />}
              {customer.riskGrade && (
                <Badge variant="outline" className={cn("border font-medium", TONES[riskTone(customer.riskGrade)])}>
                  {t("onboarding360.risk.grade", { grade: customer.riskGradeLabel || customer.riskGrade })}
                </Badge>
              )}
              {customer.lifecycleStage && (
                <Badge variant="outline" className={cn("border font-medium", TONES.sky)}>
                  {customer.lifecycleStageLabel || customer.lifecycleStage}
                </Badge>
              )}
              {customer.pepFlag && (
                <Badge variant="outline" className={cn("border font-medium", TONES.amber)}>
                  {t("onboarding360.badge.pep")}
                </Badge>
              )}
              {customer.sanctionsFlag && (
                <Badge variant="outline" className={cn("border font-medium", TONES.red)}>
                  {t("onboarding360.badge.sanctioned")}
                </Badge>
              )}
              {customer.isBlocked && (
                <Badge variant="outline" className={cn("gap-1 border font-medium", TONES.red)}>
                  <Lock className="size-3" /> {t("onboarding360.badge.blocked")}
                  {Array.isArray(customer.blockCodes) && customer.blockCodes.length > 0
                    ? ` · ${customer.blockCodes.join(", ")}`
                    : ""}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-x-6 gap-y-4 min-[420px]:grid-cols-2 sm:gap-x-8 lg:w-auto lg:flex-1 lg:grid-cols-3 xl:max-w-3xl">
          {details.map((d) => {
            const Icon = d.icon;
            return (
              <div key={d.label} className="flex w-full min-w-0 items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {d.label}
                  </div>
                  <div className="truncate text-xs font-semibold text-foreground" title={d.value}>
                    {d.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const BusinessDetail = () => {
  const { t } = useTranslation("customerManagement");
  const params = useParams();
  const navigate = useNavigate();
  const customerId = params.id || params.customerId;
  const { isRTL } = useLanguage();

  const { hasPermission } = usePermissions();
  const canViewBusiness = hasPermission(BUSINESS_PERMISSIONS.VIEW);
  const canReviewDocuments = hasPermission(BUSINESS_PERMISSIONS.REVIEW);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [business, setBusiness] = useState<any>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { activeTab, setActiveTab, switching } = useTabTransition("overview");
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);
  const [verifiedBanner, setVerifiedBanner] = useState(false);

  const [reviewTarget, setReviewTarget] = useState<{ doc: any; action: "approve" | "reject" } | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const [ownerData, setOwnerData] = useState<any>(null);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerError, setOwnerError] = useState<string | null>(null);
  const [ownerLoaded, setOwnerLoaded] = useState(false);

  const [riskData, setRiskData] = useState<any>(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState<string | null>(null);
  const [riskLoaded, setRiskLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    if (!canViewBusiness) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      if (!customerId) return;
      try {
        setLoading(true);
        setError(null);
        const response = await getBusinessDetail(String(customerId));
        if (!active) return;
        setBusiness(response?.data?.data ?? null);
      } catch (err: any) {
        if (!active) return;
        setError(err?.response?.data?.message || err?.message || t("businessDetail.error.loadBusiness"));
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, reloadKey, canViewBusiness]);

  useEffect(() => {
    if (activeTab !== "owner" || ownerLoaded || !customerId) return;
    let active = true;
    setOwnerLoading(true);
    setOwnerError(null);
    getCustomerDocumentsBundle(String(customerId))
      .then((res: any) => {
        if (!active) return;
        setOwnerData(res?.data?.data ?? null);
        setOwnerLoaded(true);
      })
      .catch((err: any) => {
        if (!active) return;
        setOwnerError(err?.response?.data?.message || err?.message || t("businessDetail.error.loadOwner"));
      })
      .finally(() => active && setOwnerLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, ownerLoaded, customerId]);

  useEffect(() => {
    if (activeTab !== "risk" || riskLoaded || !customerId) return;
    let active = true;
    setRiskLoading(true);
    setRiskError(null);
    getCustomer360(String(customerId))
      .then((res: any) => {
        if (!active) return;
        setRiskData(res?.data?.data ?? null);
        setRiskLoaded(true);
      })
      .catch((err: any) => {
        if (!active) return;
        setRiskError(err?.response?.data?.message || err?.message || t("businessDetail.error.loadRisk"));
      })
      .finally(() => active && setRiskLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, riskLoaded, customerId]);

  const [partnersData, setPartnersData] = useState<any[] | null>(null);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [partnersError, setPartnersError] = useState<string | null>(null);
  const [partnersLoaded, setPartnersLoaded] = useState(false);

  useEffect(() => {
    if (!BUSINESS_PARTNERS_ENABLED || activeTab !== "partners" || partnersLoaded || !customerId) return;
    let active = true;
    setPartnersLoading(true);
    setPartnersError(null);
    getBusinessPartners(String(customerId))
      .then((res: any) => {
        if (!active) return;
        const list = res?.data?.data ?? res?.data ?? [];
        setPartnersData(Array.isArray(list) ? list : []);
        setPartnersLoaded(true);
      })
      .catch((err: any) => {
        if (!active) return;
        setPartnersError(err?.response?.data?.message || err?.message || t("businessDetail.error.loadPartners"));
      })
      .finally(() => active && setPartnersLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, partnersLoaded, customerId]);

  const sortedPartners = useMemo(
    () => [...(partnersData || [])].sort((a, b) => (a.role === "OWNER" ? -1 : b.role === "OWNER" ? 1 : 0)),
    [partnersData]
  );

  const customer = business?.customer;
  const documents: any[] = useMemo(() => business?.documents || [], [business]);
  const businessDocs = useMemo(
    () => documents.filter((d) => !OWNER_DOC_KINDS.has((d.kind || "").toUpperCase())),
    [documents]
  );
  const ownerIdentityDocs = useMemo(
    () => documents.filter((d) => OWNER_DOC_KINDS.has((d.kind || "").toUpperCase())),
    [documents]
  );
  const approvedCount = businessDocs.filter((d) => (d.reviewStatus || "").toUpperCase() === "APPROVED").length;

  /**
   * Human label for a document kind. Prefers an explicit translation when one
   * exists for the code, otherwise falls back to humanizing the enum so a new
   * backend kind still reads properly instead of leaking SCREAMING_SNAKE.
   */
  const docKindLabel = (kind?: string) =>
    kind
      ? t(`onboarding360.docKind.${kind}`, { defaultValue: humanizeCode(kind) })
      : t("onboarding360.doc.documentFallback");

  const openReview = (doc: any, action: "approve" | "reject") => {
    if (!canReviewDocuments) return;
    setReviewNote("");
    setReviewTarget({ doc, action });
  };

  const submitReview = async () => {
    if (!reviewTarget || !customerId || !canReviewDocuments) return;
    const { doc, action } = reviewTarget;
    const note = reviewNote.trim();
    if (action === "reject" && !note) {
      toast.error(t("onboarding360.review.reasonRequired"));
      return;
    }
    try {
      setSubmittingReview(true);
      const res =
        action === "approve"
          ? await approveBusinessDocument(String(customerId), doc.documentId, note)
          : await rejectBusinessDocument(String(customerId), doc.documentId, note);
      const result = res?.data?.data ?? res?.data ?? {};
      const prevKycStatus = customer?.kycStatus;
      setBusiness((prev: any) => {
        if (!prev) return prev;
        const nextDocuments = (prev.documents || []).map((d: any) =>
          d.documentId === doc.documentId
            ? {
                ...d,
                reviewStatus: result.reviewStatus || (action === "approve" ? "APPROVED" : "REJECTED"),
                rejectionReason: action === "reject" ? note : result.rejectionReason ?? d.rejectionReason,
              }
            : d
        );
        return {
          ...prev,
          documents: nextDocuments,
          customer: result.kycStatus ? { ...prev.customer, kycStatus: result.kycStatus } : prev.customer,
        };
      });
      if (result.kycStatus === "VERIFIED" && prevKycStatus !== "VERIFIED") {
        setVerifiedBanner(true);
      }
      toast.success(
        action === "approve" ? t("onboarding360.review.approveSuccess") : t("onboarding360.review.rejectSuccess")
      );
      setReviewTarget(null);
      setReviewNote("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || t("onboarding360.review.failed"));
    } finally {
      setSubmittingReview(false);
    }
  };

  /**
   * Onboarding steps, if the admin business payload carries them. The endpoint
   * is auth-gated so the exact nesting couldn't be confirmed — accept the
   * shapes the customer APIs already use (`onboarding.steps`, or a bare
   * `steps`/`onboardingSteps` array) and render nothing when absent.
   */
  const onboardingSteps = useMemo(() => {
    if (!business) return null;
    if (Array.isArray(business.onboarding?.steps) && business.onboarding.steps.length) {
      return business.onboarding;
    }
    const bare = [business.onboardingSteps, business.steps].find(
      (v: any) => Array.isArray(v) && v.length
    );
    return bare ? { steps: bare } : null;
  }, [business]);

  const addressLine = [business?.addressLine1, business?.city, business?.postalCode].filter(Boolean).join(", ");

  const businessRows = business
    ? [
        { label: t("businessDetail.field.businessName"), value: business.businessName },
        { label: t("businessDetail.field.registrationNo"), value: business.businessRegistrationNumber },
        { label: t("businessDetail.field.type"), value: business.businessTypeCode },
        {
          label: t("businessDetail.field.website"),
          value: business.businessWebsite ? (
            <a
              href={business.businessWebsite}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 hover:underline dark:text-emerald-400"
            >
              {business.businessWebsite}
            </a>
          ) : (
            "—"
          ),
        },
        { label: t("businessDetail.field.address"), value: addressLine || "—" },
        { label: t("businessDetail.field.description"), value: business.businessDescription },
      ]
    : [];

  const statusRows = customer
    ? [
        { label: t("onboarding360.field.cifNumber"), value: customer.cifNumber },
        { label: t("businessDetail.field.kycStatus"), value: customer.kycStatusLabel || customer.kycStatus },
        { label: t("businessDetail.field.lifecycleStage"), value: customer.lifecycleStageLabel || customer.lifecycleStage },
        { label: t("businessDetail.field.riskGrade"), value: customer.riskGradeLabel || customer.riskGrade },
        { label: t("onboarding360.contact.created"), value: formatDateTime(customer.createdAt) },
        { label: t("onboarding360.contact.updated"), value: formatDateTime(customer.updatedAt) },
      ]
    : [];

  const complianceAnswers =
    riskData?.complianceQuestionHistory?.slice(-1)?.[0]?.answers ||
    riskData?.riskCalculation?.complianceQuestionHistory?.slice(-1)?.[0]?.answers ||
    [];
  const scoreComponents = riskData?.riskCalculation?.scoreComponents || riskData?.riskCalculation?.breakdown || [];
  const riskHistory = riskData?.riskHistory || riskData?.riskCalculation?.history || [];
  const riskInfo = riskData?.riskInfo || {};

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="onb360-page flex flex-col gap-4 p-4 md:p-6">
      <style>{`
        .onb360-page [data-slot="card"],
        .onb360-page .onb-card {
          background-color: var(--surface-card) !important;
          background-image: none !important;
          border-color: color-mix(in srgb, #e60000 16%, var(--surface-border)) !important;
          color: var(--foreground) !important;
        }
        .onb360-page [data-slot="card"] {
          box-shadow: 0 1px 2px rgba(230, 0, 0,0.05),
                      0 8px 20px -16px color-mix(in srgb, #e60000 35%, transparent) !important;
        }
        .onb360-page h1 { font-size: 1.125rem !important; line-height: 1.3 !important; margin: 0 !important; }
        .onb360-page h2 { font-size: 0.875rem !important; line-height: 1.3 !important; margin: 0 !important; }
        .onb360-page h3 { font-size: 0.875rem !important; line-height: 1.3 !important; margin: 0 !important; }
        .onb360-page h4 { font-size: 0.8125rem !important; line-height: 1.3 !important; margin: 0 !important; }
      `}</style>

      {!canViewBusiness ? (
        <Card>
          <PermissionDenied message={t("permission.businessDenied")} />
        </Card>
      ) : loading ? (
        <LoadingState />
      ) : error ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <AlertTriangle className="size-8 text-red-500" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => setReloadKey((k) => k + 1)}>
              {t("onboarding360.retry")}
            </Button>
          </div>
        </Card>
      ) : !business ? (
        <Card>
          <div className="py-14 text-center text-sm text-muted-foreground">{t("onboarding360.noData")}</div>
        </Card>
      ) : (
        <Card className="gap-0 overflow-hidden py-0">
          <BusinessHeaderBand business={business} />

          <div className="flex flex-col gap-4 p-4 md:p-5">
            {verifiedBanner && (
              <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-sm", TONES.emerald)}>
                <CheckCircle2 className="size-4 shrink-0" />
                {t("businessDetail.banner.verified")}
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <DetailTabsList>
                <DetailTabsTrigger value="overview">{t("onboarding360.tab.overview")}</DetailTabsTrigger>
                <DetailTabsTrigger value="documents">{t("onboarding360.tab.documents")}</DetailTabsTrigger>
                <DetailTabsTrigger value="owner">{t("businessDetail.tab.owner")}</DetailTabsTrigger>
                {BUSINESS_PARTNERS_ENABLED && (
                  <DetailTabsTrigger value="partners">{t("businessDetail.tab.partners")}</DetailTabsTrigger>
                )}
                <DetailTabsTrigger value="risk">{t("businessDetail.tab.riskCompliance")}</DetailTabsTrigger>
              </DetailTabsList>

              {/* ---------------- Overview ---------------- */}
              <TabsContent value="overview">
                {switching ? (
                  <div className="pt-4">
                    <TabSkeleton variant="fields" count={2} />
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 pt-4">
                    {/* Onboarding rail — only rendered when the business payload
                        actually carries steps, so it costs nothing if the admin
                        endpoint doesn't return them. */}
                    {onboardingSteps && (
                      <Block title={t("onboarding360.block.onboardingProgress")} icon={ShieldCheck}>
                        <OnboardingStepper onboarding={onboardingSteps} isAr={isRTL} hideWhenEmpty />
                      </Block>
                    )}

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <Block title={t("businessDetail.block.businessIdentity")} icon={Building2}>
                        {businessRows.map((r) => (
                          <Field key={r.label} label={r.label} value={r.value || "—"} />
                        ))}
                      </Block>
                      <Block title={t("businessDetail.block.status")} icon={ShieldCheck}>
                        {statusRows.map((r) => (
                          <Field key={r.label} label={r.label} value={r.value || "—"} />
                        ))}
                      </Block>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ---------------- Documents ---------------- */}
              <TabsContent value="documents">
                {switching ? (
                  <div className="pt-4">
                    <TabSkeleton variant="cards" count={1} />
                  </div>
                ) : (
                <div className="flex flex-col gap-4 pt-4">
                  <Block
                    title={t("businessDetail.block.businessDocuments")}
                    icon={FileText}
                    right={
                      businessDocs.length > 0 && (
                        <span className="text-xs font-medium text-muted-foreground">
                          {t("businessDetail.progress.approved", { approved: approvedCount, total: businessDocs.length })}
                        </span>
                      )
                    }
                  >
                    {businessDocs.length === 0 ? (
                      <EmptyState icon={FileText} text={t("onboarding360.empty.noDocuments")} />
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {businessDocs.map((doc, idx) => {
                          const reviewStatus = (doc.reviewStatus || "").toUpperCase();
                          const isApproved = reviewStatus === "APPROVED";
                          const isRejected = reviewStatus === "REJECTED";
                          return (
                            <div
                              key={doc.documentId ?? idx}
                              className="flex h-full flex-col gap-3 rounded-xl border bg-muted/20 p-3 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md"
                            >
                              {/* Fixed-height header keeps every tile's image, rows and
                                  buttons on the same baseline even when a doc kind is
                                  long enough to wrap. */}
                              <div className="flex min-h-9 items-start justify-between gap-2">
                                <Badge
                                  variant="outline"
                                  className={cn("min-w-0 shrink whitespace-normal border text-[11px] font-medium leading-tight", TONES.sky)}
                                  title={docKindLabel(doc.kind)}
                                >
                                  <span className="line-clamp-2 break-words">{docKindLabel(doc.kind)}</span>
                                </Badge>
                                <span className="flex shrink-0 items-center gap-1 whitespace-nowrap pt-0.5 text-[11px] text-muted-foreground">
                                  <CalendarDays className="size-3 shrink-0" />
                                  {formatDate(doc.createdAt)}
                                </span>
                              </div>
                              <DocImage
                                cacheKey={`${customerId}:${doc.documentId}`}
                                label={docKindLabel(doc.kind)}
                                onEnlarge={(s, l) => setLightbox({ src: s, label: l })}
                                fetcher={() =>
                                  getCustomerOnboardingDocumentImage(String(customerId), doc.documentId).then(
                                    (res: any) => res?.data?.data ?? res?.data ?? null
                                  )
                                }
                              />
                              <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-2 text-xs">
                                <span className="shrink-0 text-muted-foreground">{t("onboarding360.doc.documentNo")}</span>
                                <span className="truncate font-mono font-medium text-foreground">{doc.documentNumber || "—"}</span>
                              </div>

                              <div className="flex flex-col gap-2 border-t border-border/60 pt-2">
                                <div className="flex items-center justify-between gap-2 text-xs">
                                  <span className="shrink-0 text-muted-foreground">{t("onboarding360.review.status")}</span>
                                  <Badge variant="outline" className={cn("border text-[11px] font-medium", TONES[statusTone(reviewStatus || "PENDING_REVIEW")])}>
                                    {humanizeCode(reviewStatus) || t("common:pending")}
                                  </Badge>
                                </div>

                                {isRejected && doc.rejectionReason && (
                                  <div className={cn("rounded-md border px-2 py-1.5 text-xs", TONES.red)}>{doc.rejectionReason}</div>
                                )}

                                {canReviewDocuments && (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={isApproved || !doc.documentId}
                                      onClick={() => openReview(doc, "approve")}
                                      className="h-7 flex-1 gap-1 px-2 text-[11px] border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
                                    >
                                      <CheckCircle2 className="size-3" />
                                      {t("onboarding360.review.approve")}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={isRejected || !doc.documentId}
                                      onClick={() => openReview(doc, "reject")}
                                      className="h-7 flex-1 gap-1 px-2 text-[11px] border-red-500/40 text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400"
                                    >
                                      <XCircle className="size-3" />
                                      {t("onboarding360.review.reject")}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Block>

                  <Block title={t("businessDetail.block.ownerIdentity")} icon={Camera}>
                    {ownerIdentityDocs.length === 0 ? (
                      <EmptyState icon={Camera} text={t("onboarding360.empty.noDocuments")} />
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {ownerIdentityDocs.map((doc, idx) => (
                          <div
                            key={doc.documentId ?? idx}
                            className="flex h-full flex-col gap-3 rounded-xl border bg-muted/20 p-3 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md"
                          >
                            <div className="flex min-h-9 items-start justify-between gap-2">
                              <Badge
                                variant="outline"
                                className={cn("min-w-0 shrink whitespace-normal border text-[11px] font-medium leading-tight", TONES.sky)}
                                title={docKindLabel(doc.kind)}
                              >
                                <span className="line-clamp-2 break-words">{docKindLabel(doc.kind)}</span>
                              </Badge>
                              <span className="flex shrink-0 items-center gap-1 whitespace-nowrap pt-0.5 text-[11px] text-muted-foreground">
                                <CalendarDays className="size-3 shrink-0" />
                                {formatDate(doc.createdAt)}
                              </span>
                            </div>
                            <DocImage
                              cacheKey={`${customerId}:${doc.documentId}`}
                              label={docKindLabel(doc.kind)}
                              onEnlarge={(s, l) => setLightbox({ src: s, label: l })}
                              fetcher={() =>
                                getCustomerOnboardingDocumentImage(String(customerId), doc.documentId).then(
                                  (res: any) => res?.data?.data ?? res?.data ?? null
                                )
                              }
                            />
                            <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-2 text-xs">
                              <span className="shrink-0 text-muted-foreground">{t("onboarding360.doc.verification")}</span>
                              <Badge variant="outline" className={cn("border text-[11px] font-medium", TONES.emerald)}>
                                {t("onboarding360.doc.verified")}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Block>
                </div>
                )}
              </TabsContent>

              {/* ---------------- Owner ---------------- */}
              <TabsContent value="owner">
                <div className="flex flex-col gap-4 pt-4">
                  {switching ? (
                    <TabSkeleton variant="fields" count={2} />
                  ) : ownerError ? (
                    <Block title={t("businessDetail.tab.owner")} icon={UserCircle}>
                      <div className="flex flex-col items-center gap-3 py-8 text-center">
                        <AlertTriangle className="size-6 text-red-500" />
                        <p className="text-sm text-muted-foreground">{ownerError}</p>
                        <Button variant="outline" size="sm" onClick={() => setOwnerLoaded(false)}>
                          {t("onboarding360.retry")}
                        </Button>
                      </div>
                    </Block>
                  ) : (
                    <>
                      {(() => {
                        // Header renders from data already on the page, so the
                        // owner's identity is readable immediately — only the
                        // vaulted PII rows below wait on the documents bundle.
                        const pii = ownerData?.piiVault || {};
                        const ownerName =
                          `${pii.firstName || ""} ${pii.lastName || ""}`.trim() || customer?.fullName || "—";
                        const initials = (
                          (pii.firstName?.[0] || customer?.fullName?.[0] || "") +
                          (pii.lastName?.[0] || "")
                        ).toUpperCase();
                        const mobile = pii.mobileNumber || pii.mobile || customer?.mobileNumber;
                        return (
                          <div className="onb-card relative overflow-hidden rounded-xl border p-4 md:p-5">
                            <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-emerald-500/[0.07] blur-2xl" />
                            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex min-w-0 items-center gap-4">
                                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-semibold text-white ring-2 ring-emerald-500/25 shadow-md shadow-emerald-500/20">
                                  {initials || <UserCircle className="size-7" />}
                                </div>
                                <div className="flex min-w-0 flex-col gap-1.5">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="m-0 truncate text-base font-semibold text-foreground">{ownerName}</h3>
                                    <Badge variant="outline" className={cn("gap-1 border font-medium", TONES.emerald)}>
                                      <CheckCircle2 className="size-3" />
                                      {t("businessDetail.owner.verified")}
                                    </Badge>
                                  </div>
                                  <p className="m-0 text-xs text-muted-foreground">{t("businessDetail.owner.subtitle")}</p>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    {mobile && (
                                      <span className="inline-flex items-center gap-1.5">
                                        <Phone className="size-3.5" /> {mobile}
                                      </span>
                                    )}
                                    {(pii.email || customer?.email) && (
                                      <span className="inline-flex items-center gap-1.5">
                                        <Mail className="size-3.5" /> {pii.email || customer?.email}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <Block title={t("businessDetail.owner.personalDetails")} icon={UserCircle}>
                          {ownerLoading
                            ? [0, 1, 2].map((i) => (
                                <div key={i} className="flex items-center justify-between gap-4 py-2.5">
                                  <Skeleton className="h-3.5 w-28" />
                                  <Skeleton className="h-3.5 w-36" />
                                </div>
                              ))
                            : [
                                { label: t("onboarding360.field.dateOfBirth"), value: formatDate(ownerData?.piiVault?.dateOfBirth) },
                                { label: t("onboarding360.field.nationalId"), value: ownerData?.piiVault?.nationalId || customer?.nationalId },
                                { label: t("onboarding360.personal.nationality"), value: ownerData?.piiVault?.nationality || customer?.nationality },
                              ].map((r) => <Field key={r.label} label={r.label} value={r.value || "—"} />)}
                        </Block>
                        <Block title={t("businessDetail.field.address")} icon={MapPin}>
                          {ownerLoading ? (
                            <div className="flex items-center justify-between gap-4 py-2.5">
                              <Skeleton className="h-3.5 w-28" />
                              <Skeleton className="h-3.5 w-44" />
                            </div>
                          ) : (
                            <Field
                              label={t("businessDetail.field.address")}
                              value={
                                [ownerData?.piiVault?.addressLine1, ownerData?.piiVault?.city, ownerData?.piiVault?.country]
                                  .filter(Boolean)
                                  .join(", ") || "—"
                              }
                            />
                          )}
                        </Block>
                      </div>

                      <Block
                        title={t("businessDetail.owner.identityDocuments")}
                        icon={FileText}
                        right={
                          <Badge variant="outline" className={cn("gap-1 border font-medium", TONES.emerald)}>
                            <CheckCircle2 className="size-3" />
                            {t("onboarding360.doc.verified")}
                          </Badge>
                        }
                      >
                        {/* Rendered from the document metadata already loaded with the
                            business, fetching each image lazily — the same path the
                            Documents tab uses. Waiting on `documents-bundle` here meant
                            the whole tab sat behind one response that inlines every
                            image as base64. The bundle is only a fallback now. */}
                        {ownerIdentityDocs.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {ownerIdentityDocs.map((doc: any, idx: number) => (
                              <div
                                key={doc.documentId ?? idx}
                                className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-3 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md"
                              >
                                <Badge variant="outline" className={cn("w-fit border font-medium", TONES.sky)}>
                                  {docKindLabel(doc.kind)}
                                </Badge>
                                <DocImage
                                  cacheKey={`${customerId}:${doc.documentId}`}
                                  label={docKindLabel(doc.kind)}
                                  onEnlarge={(s, l) => setLightbox({ src: s, label: l })}
                                  fetcher={() =>
                                    getCustomerOnboardingDocumentImage(String(customerId), doc.documentId).then(
                                      (res: any) => res?.data?.data ?? res?.data ?? null
                                    )
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        ) : ownerLoading ? (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[0, 1].map((i) => (
                              <Skeleton key={i} className="h-48 w-full rounded-lg" />
                            ))}
                          </div>
                        ) : !ownerData?.documents?.length && !ownerData?.selfie ? (
                          <EmptyState icon={FileText} text={t("onboarding360.empty.noDocuments")} />
                        ) : (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {(ownerData?.documents || []).map((doc: any, idx: number) => (
                              <div
                                key={doc.documentId ?? idx}
                                className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-3 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md"
                              >
                                <Badge variant="outline" className={cn("w-fit border font-medium", TONES.sky)}>
                                  {docKindLabel(doc.kind)}
                                </Badge>
                                <DocImage
                                  cacheKey={`${customerId}:owner:${doc.documentId || doc.kind}`}
                                  label={docKindLabel(doc.kind)}
                                  onEnlarge={(s, l) => setLightbox({ src: s, label: l })}
                                  fetcher={() => Promise.resolve({ base64Image: doc.base64Image, contentType: doc.contentType })}
                                />
                              </div>
                            ))}
                            {ownerData?.selfie && (
                              <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-3 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md">
                                <Badge variant="outline" className={cn("w-fit border font-medium", TONES.sky)}>
                                  {t("onboarding360.doc.selfieLabel")}
                                </Badge>
                                <DocImage
                                  cacheKey={`${customerId}:owner:selfie`}
                                  label={t("onboarding360.doc.selfieLabel")}
                                  onEnlarge={(s, l) => setLightbox({ src: s, label: l })}
                                  fetcher={() =>
                                    Promise.resolve({
                                      base64Image: ownerData.selfie.base64Image,
                                      contentType: ownerData.selfie.contentType,
                                    })
                                  }
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </Block>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* ---------------- Partners (behind flag — admin endpoint 403s until it ships) ---------------- */}
              {BUSINESS_PARTNERS_ENABLED && (
                <TabsContent value="partners">
                  <div className="pt-4">
                    {switching || partnersLoading ? (
                      <TabSkeleton variant="table" count={1} />
                    ) : (
                    <Block title={t("businessDetail.tab.partners")} icon={Users}>
                      {partnersError ? (
                        <div className="flex flex-col items-center gap-3 py-8 text-center">
                          <AlertTriangle className="size-6 text-red-500" />
                          <p className="text-sm text-muted-foreground">{partnersError}</p>
                          <Button variant="outline" size="sm" onClick={() => setPartnersLoaded(false)}>
                            {t("onboarding360.retry")}
                          </Button>
                        </div>
                      ) : sortedPartners.length === 0 ? (
                        <EmptyState icon={Users} text={t("businessDetail.empty.noPartners")} />
                      ) : (
                        <div className="overflow-x-auto rounded-lg border">
                          <Table>
                            <TableHeader style={{ background: "var(--theme-table-background-color)" }}>
                              <TableRow className="border-0 hover:bg-transparent [&>th]:h-9 [&>th]:px-4 [&>th]:text-[12px] [&>th]:font-semibold [&>th]:tracking-[0.2px] [&>th]:text-white">
                                <TableHead>{t("businessDetail.partner.col.name")}</TableHead>
                                <TableHead>{t("businessDetail.partner.col.contact")}</TableHead>
                                <TableHead>{t("businessDetail.partner.col.role")}</TableHead>
                                <TableHead>{t("common:status")}</TableHead>
                                <TableHead>{t("businessDetail.partner.col.permissions")}</TableHead>
                                <TableHead>{t("businessDetail.partner.col.requested")}</TableHead>
                                <TableHead>{t("businessDetail.partner.col.decided")}</TableHead>
                                <TableHead className="text-end">{t("common:actions")}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sortedPartners.map((partner, idx) => {
                                const isOwner = partner.role === "OWNER";
                                return (
                                  <TableRow
                                    key={partner.membershipId ?? idx}
                                    className="border-b border-[var(--surface-border)] odd:bg-[var(--theme-table-row-alt)] hover:bg-[var(--theme-table-row-hover)] [&>td]:px-4 [&>td]:py-2 [&>td]:text-[12px]"
                                  >
                                    <TableCell className="font-medium">
                                      <span className="inline-flex items-center gap-1.5">
                                        {isOwner && <Crown className="size-3.5 text-amber-500" />}
                                        {partner.memberFullName || "—"}
                                        {isOwner && (
                                          <Badge variant="outline" className={cn("border font-medium", TONES.amber)}>
                                            {t("businessDetail.partner.owner")}
                                          </Badge>
                                        )}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      <div className="flex flex-col">
                                        <span>{partner.memberEmail || "—"}</span>
                                        <span className="text-xs">{partner.memberMobileNumber || "—"}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>{partner.role || "—"}</TableCell>
                                    <TableCell>
                                      <StatusBadge status={partner.status} />
                                      {partner.decisionReason && (
                                        <div className="mt-1 max-w-[180px] truncate text-xs text-muted-foreground" title={partner.decisionReason}>
                                          {partner.decisionReason}
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {isOwner ? (
                                        <span className="text-xs font-medium text-muted-foreground">{t("businessDetail.partner.unrestricted")}</span>
                                      ) : (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span className="inline-flex cursor-default items-center gap-1 text-xs font-medium">
                                              <KeyRound className="size-3" />
                                              {t("businessDetail.partner.permCount", { count: (partner.permissions || []).length })}
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            {(partner.permissions || []).join(", ") || t("businessDetail.partner.noPermissions")}
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{formatDate(partner.requestedAt)}</TableCell>
                                    <TableCell className="text-muted-foreground">{formatDate(partner.decidedAt)}</TableCell>
                                    <TableCell className="text-end">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="size-8">
                                            <MoreVertical className="size-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            onClick={() =>
                                              navigate(`/LOS/CustomerManagement/BusinessDetails/${customerId}/Partners/${partner.membershipId}`)
                                            }
                                          >
                                            <Eye className="size-4" />
                                            {t("common:viewDetails")}
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </Block>
                    )}
                  </div>
                </TabsContent>
              )}

              {/* ---------------- Risk & compliance ---------------- */}
              <TabsContent value="risk">
                <div className="flex flex-col gap-4 pt-4">
                  {switching || riskLoading ? (
                    <TabSkeleton variant="charts" />
                  ) : riskError ? (
                    <Block title={t("businessDetail.tab.riskCompliance")} icon={ShieldAlert}>
                      <div className="flex flex-col items-center gap-3 py-8 text-center">
                        <AlertTriangle className="size-6 text-red-500" />
                        <p className="text-sm text-muted-foreground">{riskError}</p>
                        <Button variant="outline" size="sm" onClick={() => setRiskLoaded(false)}>
                          {t("onboarding360.retry")}
                        </Button>
                      </div>
                    </Block>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <Block title={t("onboarding360.risk.score")} icon={ShieldAlert}>
                          <RiskGauge
                            level={resolveRiskLevel(riskData) || riskInfo?.riskLevel}
                            score={resolveRiskScore(riskData)}
                            flags={
                              <>
                                {(riskInfo?.riskGrade || customer?.riskGrade) && (
                                  <span>
                                    {t("onboarding360.risk.grade", {
                                      grade: riskInfo?.riskGrade || customer?.riskGrade,
                                    })}
                                  </span>
                                )}
                                {riskInfo?.complianceStatus && <span>{humanizeCode(riskInfo.complianceStatus)}</span>}
                                {customer?.pepFlag && (
                                  <span className="inline-flex items-center gap-1 font-medium text-amber-500">
                                    <AlertTriangle className="size-3" />
                                    {t("onboarding360.badge.pep")}
                                  </span>
                                )}
                                {customer?.sanctionsFlag && (
                                  <span className="inline-flex items-center gap-1 font-medium text-red-500">
                                    <ShieldAlert className="size-3" />
                                    {t("onboarding360.badge.sanctioned")}
                                  </span>
                                )}
                              </>
                            }
                          />
                        </Block>

                        <Block title={t("onboarding360.block.scoreTrend")} icon={TrendingUp} className="lg:col-span-2">
                          {riskHistory.length === 0 ? (
                            <EmptyState icon={ShieldAlert} text={t("onboarding360.empty.noRiskAssessment")} />
                          ) : (
                            // Single series: the block title names it, so no legend.
                            <ResponsiveContainer width="100%" height={200}>
                              <LineChart data={riskHistory} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
                                <CartesianGrid stroke="var(--border)" vertical={false} />
                                <XAxis
                                  dataKey="date"
                                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                                  tickFormatter={(v) => formatDate(v)}
                                  tickLine={false}
                                  axisLine={{ stroke: "var(--border)" }}
                                />
                                <YAxis
                                  domain={[0, 100]}
                                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                                  tickLine={false}
                                  axisLine={false}
                                  width={34}
                                />
                                <ReTooltip
                                  contentStyle={chartTooltipStyle}
                                  labelFormatter={(v) => formatDate(v as string)}
                                  formatter={(v: any) => [v, t("onboarding360.risk.score")]}
                                />
                                {/* Neutral series colour, not the current risk status:
                                    painting the whole history with today's level would
                                    mis-state what the earlier points were. */}
                                <Line
                                  type="monotone"
                                  dataKey="score"
                                  stroke="var(--chart-series-1)"
                                  strokeWidth={2}
                                  dot={{ r: 3 }}
                                  activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          )}
                        </Block>
                      </div>

                      <Block title={t("onboarding360.block.scoreBreakdown")} icon={BarChart3}>
                        {scoreComponents.length === 0 ? (
                          <EmptyState icon={ShieldAlert} text={t("onboarding360.empty.noBreakdown")} />
                        ) : (
                          // Nominal categories -> one hue for every bar. A darker-where-
                          // bigger ramp would double-encode the bar length as colour.
                          <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={scoreComponents} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
                              <CartesianGrid stroke="var(--border)" vertical={false} />
                              <XAxis
                                dataKey="category"
                                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                                interval={0}
                                angle={-15}
                                textAnchor="end"
                                height={56}
                                tickLine={false}
                                axisLine={{ stroke: "var(--border)" }}
                              />
                              <YAxis
                                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                                tickLine={false}
                                axisLine={false}
                                width={34}
                              />
                              <ReTooltip contentStyle={chartTooltipStyle} cursor={{ fill: "var(--muted)" }} />
                              <Bar
                                dataKey="scoreContribution"
                                fill="var(--chart-series-1)"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={44}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </Block>

                      {complianceAnswers.length > 0 && (
                        <Block title={t("onboarding360.block.complianceQuestionnaire")} icon={ShieldCheck}>
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] border-collapse text-sm">
                              <thead>
                                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                                  <th className="px-3 py-2 text-start font-medium">{t("onboarding360.compliance.question")}</th>
                                  <th className="px-3 py-2 text-start font-medium">{t("onboarding360.compliance.answer")}</th>
                                  <th className="px-3 py-2 text-end font-medium">{t("onboarding360.breakdown.factorWeight")}</th>
                                  <th className="px-3 py-2 text-end font-medium">{t("onboarding360.breakdown.score")}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {complianceAnswers.map((a: any, i: number) => (
                                  <tr key={i} className="border-b border-border/60 transition-colors hover:bg-muted/40">
                                    <td className="px-3 py-2.5 font-medium text-foreground">{isRTL ? a.questionAr || a.questionEn : a.questionEn}</td>
                                    <td className="px-3 py-2.5 text-muted-foreground">{a.answer || "—"}</td>
                                    <td className="px-3 py-2.5 text-end tabular-nums">{a.factorWeightPct != null ? `${a.factorWeightPct}%` : "—"}</td>
                                    <td className="px-3 py-2.5 text-end font-semibold tabular-nums text-foreground">{a.scoreContribution ?? "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </Block>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      )}

      {/* Business document review — approve (note optional) / reject (reason required) */}
      <Dialog
        open={!!reviewTarget}
        onOpenChange={(open: boolean) => {
          if (!open && !submittingReview) {
            setReviewTarget(null);
            setReviewNote("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewTarget?.action === "approve" ? t("onboarding360.review.approveTitle") : t("onboarding360.review.rejectTitle")}
            </DialogTitle>
            <DialogDescription>
              {reviewTarget?.action === "approve" ? t("onboarding360.review.approveHint") : t("onboarding360.review.rejectHint")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/20 px-3 py-2 text-xs">
              <span className="text-muted-foreground">{t("onboarding360.doc.documentLabel")}</span>
              <span className="font-medium text-foreground">
                {docKindLabel(reviewTarget?.doc?.kind)}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="business-doc-review-note">
                {reviewTarget?.action === "approve" ? t("onboarding360.review.noteOptional") : t("onboarding360.review.reasonRequiredLabel")}
              </Label>
              <Textarea
                id="business-doc-review-note"
                rows={4}
                value={reviewNote}
                onChange={(e: any) => setReviewNote(e.target.value)}
                placeholder={
                  reviewTarget?.action === "approve" ? t("onboarding360.review.notePlaceholder") : t("onboarding360.review.reasonPlaceholder")
                }
              />
              {reviewTarget?.action === "reject" && (
                <p className="text-xs text-muted-foreground">{t("businessDetail.review.sentToApplicant")}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={submittingReview}
              onClick={() => {
                setReviewTarget(null);
                setReviewNote("");
              }}
            >
              {t("common:cancel")}
            </Button>
            <Button
              onClick={submitReview}
              disabled={submittingReview || (reviewTarget?.action === "reject" && !reviewNote.trim())}
              className={cn(reviewTarget?.action === "reject" && "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/40")}
            >
              {submittingReview
                ? t("onboarding360.review.submitting")
                : reviewTarget?.action === "approve"
                ? t("onboarding360.review.approve")
                : t("onboarding360.review.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Lightbox image={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
};

export default BusinessDetail;
