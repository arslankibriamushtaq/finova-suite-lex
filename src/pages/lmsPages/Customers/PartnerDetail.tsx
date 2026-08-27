import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  FileText,
  Fingerprint,
  KeyRound,
  ShieldAlert,
  Users,
  Crown,
  Phone,
  Mail,
  Clock,
  CalendarDays,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
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
import { cn } from "../../../lib/utils";
import { useLanguage } from "../../../hooks/use-language";
import { usePermissions, BUSINESS_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { getCustomer360 } from "../../../redux/apis/apisCrud";
import {
  getBusinessPartnerDetail,
  getCustomerDocumentsBundle,
  getBusinessPermissionsCatalog,
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
} from "../../../components/shared/detailKit";
import {
  formatDate,
  formatDateTime,
  TONES,
  useTabTransition,
  humanizeCode,
  resolveRiskScore,
  resolveRiskLevel,
  chartTooltipStyle,
} from "../../../components/shared/detailKitUtils";

const PERMISSION_CATEGORY_ORDER = ["WALLET", "PAYMENTS", "CARDS", "DOCUMENTS", "PROFILE", "PARTNERS"];
const PERMISSION_CATALOG_FALLBACK: Record<string, string[]> = {
  WALLET: [
    "WALLET_VIEW_BALANCE",
    "WALLET_VIEW_HISTORY",
    "WALLET_SEND_MONEY",
    "WALLET_REQUEST_MONEY",
    "WALLET_TOP_UP",
    "WALLET_EXCHANGE",
  ],
  PAYMENTS: ["PAYMENTS_APPROVE"],
  CARDS: ["CARDS_VIEW", "CARDS_MANAGE"],
  DOCUMENTS: ["STATEMENTS_DOWNLOAD", "DOCUMENTS_UPLOAD"],
  PROFILE: ["PROFILE_VIEW", "PROFILE_UPDATE"],
  PARTNERS: ["PARTNERS_VIEW", "PARTNERS_INVITE"],
};

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

const PartnerHeaderBand = ({ membership, onBack }: any) => {
  const { t } = useTranslation("customerManagement");
  if (!membership) return null;
  const isOwner = membership.role === "OWNER";
  const initials = (membership.memberFullName || "")
    .split(" ")
    .map((p: string) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  const details = [
    { icon: Phone, label: t("onboarding360.field.mobile"), value: membership.memberMobileNumber },
    { icon: Mail, label: t("common:email"), value: membership.memberEmail },
    { icon: CalendarDays, label: t("businessDetail.partner.col.requested"), value: formatDate(membership.requestedAt) },
    { icon: Clock, label: t("businessDetail.partner.col.decided"), value: formatDate(membership.decidedAt) },
  ].filter((d) => d.value && d.value !== "—");

  return (
    <div className="relative overflow-hidden border-b">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent" />
      <div className="relative flex flex-col gap-4 p-4 sm:p-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {t("businessDetail.partner.backToBusiness")}
        </button>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-base font-semibold text-white ring-2 ring-emerald-500/25 shadow-md shadow-emerald-500/20 sm:size-14 sm:text-lg">
              {initials.toUpperCase() || <Users className="size-6" />}
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h2 className="m-0 max-w-full truncate text-start text-sm font-semibold leading-tight text-foreground">
                  {membership.memberFullName || "—"}
                </h2>
                {isOwner && <Crown className="size-4 text-amber-500" />}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="size-3.5" />
                {membership.businessName}
                {membership.businessRegistrationNumber ? ` · ${membership.businessRegistrationNumber}` : ""}
              </div>
              <div className="flex flex-wrap items-center gap-2 [&_[data-slot=badge]]:text-[10px] [&_[data-slot=badge]]:px-2 [&_[data-slot=badge]]:py-0">
                <Badge variant="outline" className={cn("border font-medium", TONES.sky)}>
                  {membership.role}
                </Badge>
                <StatusBadge status={membership.status} />
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-x-6 gap-y-4 min-[420px]:grid-cols-2 sm:gap-x-8 lg:w-auto lg:flex-1 lg:grid-cols-4 xl:max-w-2xl">
            {details.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.label} className="flex w-full min-w-0 items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{d.label}</div>
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
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const PartnerDetail = () => {
  const { t } = useTranslation("customerManagement");
  const params = useParams();
  const navigate = useNavigate();
  const businessId = params.id;
  const membershipId = params.membershipId;
  const { isRTL } = useLanguage();

  const { hasPermission } = usePermissions();
  const canViewBusiness = hasPermission(BUSINESS_PERMISSIONS.VIEW);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [membership, setMembership] = useState<any>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { activeTab, setActiveTab, switching } = useTabTransition("overview");
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);

  const [identity, setIdentity] = useState<any>(null);
  const [risk, setRisk] = useState<any>(null);
  const [identityLoading, setIdentityLoading] = useState(false);
  const [identityError, setIdentityError] = useState<string | null>(null);

  const [permissionCatalog, setPermissionCatalog] = useState<any[]>([]);

  const goBack = () => navigate(`/LOS/CustomerManagement/BusinessDetails/${businessId}`);

  useEffect(() => {
    let active = true;
    if (!businessId || !membershipId) return;
    if (!canViewBusiness) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getBusinessPartnerDetail(String(businessId), String(membershipId))
      .then((res: any) => {
        if (!active) return;
        setMembership(res?.data?.data ?? null);
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.response?.data?.message || err?.message || t("businessDetail.error.loadPartner"));
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, membershipId, reloadKey, canViewBusiness]);

  useEffect(() => {
    let active = true;
    if (!membership?.memberCustomerId) return;
    setIdentityLoading(true);
    setIdentityError(null);
    Promise.allSettled([
      getCustomerDocumentsBundle(membership.memberCustomerId),
      getCustomer360(membership.memberCustomerId),
    ]).then(([bundleRes, riskRes]) => {
      if (!active) return;
      const bundle = bundleRes.status === "fulfilled" ? bundleRes.value?.data?.data ?? null : null;
      const riskData = riskRes.status === "fulfilled" ? riskRes.value?.data?.data ?? null : null;
      if (!bundle && !riskData) {
        setIdentityError(t("businessDetail.partner.loadFailed"));
      }
      setIdentity(bundle);
      setRisk(riskData);
      setIdentityLoading(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membership?.memberCustomerId]);

  useEffect(() => {
    getBusinessPermissionsCatalog()
      .then((res: any) => setPermissionCatalog(res?.data?.data ?? res?.data ?? []))
      .catch(() => setPermissionCatalog([]));
  }, []);

  const groupedPermissions = useMemo(() => {
    const granted = new Set(membership?.permissions || []);
    const catalog = permissionCatalog.length > 0 ? permissionCatalog : null;
    const categories = catalog ? Array.from(new Set(catalog.map((p: any) => p.category))) : PERMISSION_CATEGORY_ORDER;

    return categories.map((category) => {
      const codes = catalog
        ? catalog.filter((p: any) => p.category === category).map((p: any) => p.code)
        : PERMISSION_CATALOG_FALLBACK[category] || [];
      return {
        category,
        items: codes.map((code: string) => {
          const meta = catalog?.find((p: any) => p.code === code);
          return {
            code,
            label: (isRTL ? meta?.labelAr : meta?.labelEn) || meta?.labelEn || code,
            description: meta?.description,
            granted: granted.has(code),
          };
        }),
      };
    });
  }, [membership, permissionCatalog, isRTL]);

  const isOwner = membership?.role === "OWNER";

  // Risk payload shape varies by backend version — read both nestings, same as
  // the business detail page does.
  const riskInfo = risk?.riskInfo || {};
  const scoreComponents =
    risk?.riskCalculation?.scoreComponents || risk?.riskCalculation?.breakdown || [];
  const riskHistory = risk?.riskHistory || risk?.riskCalculation?.history || [];
  const complianceAnswers =
    risk?.complianceQuestionHistory?.slice(-1)?.[0]?.answers ||
    risk?.riskCalculation?.complianceQuestionHistory?.slice(-1)?.[0]?.answers ||
    [];

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
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setReloadKey((k) => k + 1)}>
                {t("onboarding360.retry")}
              </Button>
              <Button variant="ghost" onClick={goBack}>
                {t("businessDetail.partner.backToBusiness")}
              </Button>
            </div>
          </div>
        </Card>
      ) : !membership ? (
        <Card>
          <div className="py-14 text-center text-sm text-muted-foreground">{t("onboarding360.noData")}</div>
        </Card>
      ) : (
        <Card className="gap-0 overflow-hidden py-0">
          <PartnerHeaderBand membership={membership} onBack={goBack} />

          <div className="flex flex-col gap-4 p-4 md:p-5">
            {membership.decisionReason && (
              <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-sm", TONES.amber)}>
                <AlertTriangle className="size-4 shrink-0" />
                {membership.decisionReason}
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <DetailTabsList>
                <DetailTabsTrigger value="overview">{t("onboarding360.tab.overview")}</DetailTabsTrigger>
                <DetailTabsTrigger value="permissions">{t("businessDetail.partner.permissions")}</DetailTabsTrigger>
                <DetailTabsTrigger value="documents">{t("onboarding360.tab.documents")}</DetailTabsTrigger>
                <DetailTabsTrigger value="risk">{t("businessDetail.tab.riskCompliance")}</DetailTabsTrigger>
              </DetailTabsList>

              {/* ---------------- Overview: identity + membership ---------------- */}
              <TabsContent value="overview">
                {switching || identityLoading ? (
                  <div className="pt-4">
                    <TabSkeleton variant="fields" count={2} />
                  </div>
                ) : (
                <div className="grid grid-cols-1 gap-4 pt-4 lg:grid-cols-2">
                  <Block title={t("businessDetail.partner.identity")} icon={Fingerprint}>
                    {(
                      [
                        {
                          label: t("onboarding360.personal.fullName"),
                          value: `${identity?.piiVault?.firstName || ""} ${identity?.piiVault?.lastName || ""}`.trim() || membership.memberFullName,
                        },
                        { label: t("onboarding360.field.dateOfBirth"), value: formatDate(identity?.piiVault?.dateOfBirth) },
                        { label: t("onboarding360.field.nationalId"), value: identity?.piiVault?.nationalId },
                        { label: t("onboarding360.personal.nationality"), value: identity?.piiVault?.nationality },
                        {
                          label: t("businessDetail.field.address"),
                          value: [identity?.piiVault?.addressLine1, identity?.piiVault?.city, identity?.piiVault?.country]
                            .filter(Boolean)
                            .join(", "),
                        },
                      ].map((r) => <Field key={r.label} label={r.label} value={r.value || "—"} />)
                    )}
                  </Block>

                  <Block title={t("businessDetail.partner.membership")} icon={Users}>
                    <Field label={t("businessDetail.partner.col.role")} value={<Badge variant="outline" className={cn("border font-medium", TONES.sky)}>{membership.role}</Badge>} />
                    <Field label={t("common:status")} value={<StatusBadge status={membership.status} />} />
                    <Field label={t("businessDetail.partner.col.requested")} value={formatDateTime(membership.requestedAt)} />
                    <Field label={t("businessDetail.partner.col.decided")} value={formatDateTime(membership.decidedAt)} />
                    {membership.decisionReason && (
                      <Field label={t("businessDetail.partner.decisionReason")} value={membership.decisionReason} />
                    )}
                  </Block>
                </div>
                )}
              </TabsContent>

              {/* ---------------- Permissions ---------------- */}
              <TabsContent value="permissions">
                <div className="pt-4">
                  {switching ? (
                    <TabSkeleton variant="fields" count={1} />
                  ) : (
                  <Block title={t("businessDetail.partner.permissions")} icon={KeyRound}>
                    {isOwner ? (
                      <EmptyState icon={Crown} text={t("businessDetail.partner.unrestricted")} />
                    ) : (
                      <div className="flex flex-col gap-4">
                        {groupedPermissions.map((group) => (
                          <div key={group.category}>
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.category}</div>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              {group.items.map((item) => (
                                <div
                                  key={item.code}
                                  className={cn(
                                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                                    item.granted ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-muted/20 text-muted-foreground"
                                  )}
                                >
                                  {item.granted ? (
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <XCircle className="size-4 shrink-0 text-muted-foreground/50" />
                                  )}
                                  <span className={cn("font-medium", item.granted ? "text-foreground" : "text-muted-foreground")}>
                                    {item.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Block>
                  )}
                </div>
              </TabsContent>

              {/* ---------------- Documents ---------------- */}
              <TabsContent value="documents">
                <div className="pt-4">
                  {switching || identityLoading ? (
                    <TabSkeleton variant="cards" count={1} />
                  ) : (
                  <Block title={t("onboarding360.tab.documents")} icon={FileText}>
                    {identityError ? (
                      <div className="flex flex-col items-center gap-3 py-8 text-center">
                        <AlertTriangle className="size-6 text-red-500" />
                        <p className="text-sm text-muted-foreground">{identityError}</p>
                      </div>
                    ) : !identity?.documents?.length && !identity?.selfie ? (
                      <EmptyState icon={FileText} text={t("onboarding360.empty.noDocuments")} />
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {(identity?.documents || []).map((doc: any, idx: number) => (
                          <div
                            key={doc.documentId ?? idx}
                            className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-3 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md"
                          >
                            <Badge variant="outline" className={cn("w-fit border font-medium", TONES.sky)}>
                              {humanizeCode(doc.kind) || t("onboarding360.doc.documentFallback")}
                            </Badge>
                            <DocImage
                              cacheKey={`${membership.memberCustomerId}:${doc.documentId || doc.kind}`}
                              label={humanizeCode(doc.kind) || t("onboarding360.doc.documentLabel")}
                              onEnlarge={(s, l) => setLightbox({ src: s, label: l })}
                              fetcher={() => Promise.resolve({ base64Image: doc.base64Image, contentType: doc.contentType })}
                            />
                          </div>
                        ))}
                        {identity?.selfie && (
                          <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-3 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md">
                            <Badge variant="outline" className={cn("w-fit border font-medium", TONES.sky)}>
                              {t("onboarding360.doc.selfieLabel")}
                            </Badge>
                            <DocImage
                              cacheKey={`${membership.memberCustomerId}:selfie`}
                              label={t("onboarding360.doc.selfieLabel")}
                              onEnlarge={(s, l) => setLightbox({ src: s, label: l })}
                              fetcher={() =>
                                Promise.resolve({ base64Image: identity.selfie.base64Image, contentType: identity.selfie.contentType })
                              }
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </Block>
                  )}
                </div>
              </TabsContent>

              {/* ---------------- Risk & compliance ---------------- */}
              <TabsContent value="risk">
                <div className="pt-4">
                  {switching || identityLoading ? (
                    <TabSkeleton variant="charts" />
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <Block title={t("onboarding360.risk.score")} icon={ShieldAlert}>
                          <RiskGauge
                            level={resolveRiskLevel(risk) || riskInfo?.riskLevel}
                            score={resolveRiskScore(risk)}
                            flags={
                              <>
                                {riskInfo?.riskGrade && (
                                  <span>{t("onboarding360.risk.grade", { grade: riskInfo.riskGrade })}</span>
                                )}
                                {riskInfo?.complianceStatus && <span>{humanizeCode(riskInfo.complianceStatus)}</span>}
                                {(riskInfo?.isPep || risk?.customer?.pepFlag) && (
                                  <span className="inline-flex items-center gap-1 font-medium text-amber-500">
                                    <AlertTriangle className="size-3" />
                                    {t("onboarding360.badge.pep")}
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

                      {/* Table view — every charted value is also readable as text. */}
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
                                    <td className="px-3 py-2.5 font-medium text-foreground">
                                      {isRTL ? a.questionAr || a.questionEn : a.questionEn}
                                    </td>
                                    <td className="px-3 py-2.5 text-muted-foreground">{a.answer || "—"}</td>
                                    <td className="px-3 py-2.5 text-end tabular-nums">
                                      {a.factorWeightPct != null ? `${a.factorWeightPct}%` : "—"}
                                    </td>
                                    <td className="px-3 py-2.5 text-end font-semibold tabular-nums text-foreground">
                                      {a.scoreContribution ?? "—"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </Block>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      )}

      <Lightbox image={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
};

export default PartnerDetail;
