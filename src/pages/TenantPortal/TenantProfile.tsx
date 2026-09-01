import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Building2, Check, Copy, IdCard, Mail } from "lucide-react";

import { Skeleton } from "../../components/ui/skeleton";
import { formatDate } from "../../components/shared/detailKitUtils";
import { LexPageHeader } from "../../components/shared/lexKit";
import { TenancyStatusBadge } from "../../components/shared/tenancyKit";
import {
  getMyProfile,
  toTenancyError,
  type TenantResponse,
} from "../../redux/apis/apisTenancyAdmin";

/**
 * Label over value, not label-left/value-right. Ten rows of the second kind on
 * a wide card leave the value stranded far from its label, and the customer is
 * reading their own details rather than comparing a column of figures.
 *
 * The hairline is what turns four floating pairs into a list: it separates rows
 * without boxing each field, and is suppressed on the top row of each column so
 * the card's own header rule is not doubled.
 */
const Field = ({ label, value }: { label: string; value?: React.ReactNode }) => {
  const isEmpty = value === null || value === undefined || value === "";
  return (
    <div className="min-w-0 border-t border-[var(--surface-border)] pt-2.5 first:border-t-0 first:pt-0 sm:[&:nth-child(2)]:border-t-0 sm:[&:nth-child(2)]:pt-0">
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div
        className={
          isEmpty
            ? "mt-1 break-words text-[13.5px] leading-snug text-muted-foreground"
            : "mt-1 break-words text-[13.5px] font-medium leading-snug text-foreground"
        }
      >
        {isEmpty ? "—" : value}
      </div>
    </div>
  );
};

/**
 * `pro-card-title` rather than a Tailwind size class: custom.scss centres and
 * enlarges every bare h2 from outside Tailwind's layers, so utilities lose.
 */
const Card = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Building2;
  children: React.ReactNode;
}) => (
  <section className="pro-card flex h-full flex-col p-4">
    <div className="mb-3.5 flex items-center gap-2.5 border-b border-[var(--surface-border)] pb-3">
      <span className="pro-head-badge">
        <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
      </span>
      <h2 className="pro-card-title">{title}</h2>
    </div>
    <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">{children}</div>
  </section>
);

/** The id support asks for down a phone. Copying it beats transcribing it. */
const CopyableId = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access is refused outside a secure context, and the id is the
      // one thing on this page a customer actually needs to hand over.
      toast.error("Could not copy — select the id and copy it manually.");
    }
  };

  return (
    <span className="inline-flex max-w-full items-center gap-1.5">
      <span className="select-all break-all font-mono text-xs">{value}</span>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy tenant ID"}
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[2px] border border-[var(--surface-border)] text-muted-foreground transition-colors hover:border-[color-mix(in_srgb,var(--primary)_40%,var(--surface-border))] hover:text-[var(--primary)]"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </button>
    </span>
  );
};

/**
 * The company, as we hold it. Read-only here.
 *
 * If the tenant is SUSPENDED this page is likely the only one they can still
 * reach, so it leads with the reason rather than rendering a dashboard that
 * does not work.
 */
const TenantProfile = () => {
  const [profile, setProfile] = useState<TenantResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch((error) => {
        toast.error(toTenancyError(error, "Could not load your company profile.").message);
        setProfile(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!profile)
    return <p className="text-sm text-muted-foreground">Your profile could not be loaded.</p>;

  return (
    <div>
      <LexPageHeader
        icon={Building2}
        title={profile.companyName}
        subtitle={<span className="font-mono text-xs tracking-tight">{profile.tenantCode}</span>}
      >
        <TenancyStatusBadge status={profile.status} />
      </LexPageHeader>

      {profile.status === "SUSPENDED" && (
        <div className="mb-3 rounded-[2px] border border-[color-mix(in_srgb,var(--color-warning)_50%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_8%,transparent)] p-3 text-sm">
          <div className="font-semibold">Your workspace is suspended.</div>
          <div className="mt-1">{profile.suspensionReason || "No reason was recorded."}</div>
          <div className="mt-2 text-muted-foreground">
            Settle any outstanding invoice or contact support to have it lifted. Nothing has been
            deleted.
          </div>
        </div>
      )}

      {/* Three groups rather than one column of ten rows: who the company is,
          how to reach it, and the account's own references. The first two are
          stretched to equal height so the pair reads as one band. */}
      <div className="grid items-stretch gap-3 lg:grid-cols-2">
        <Card title="Company" icon={Building2}>
          <Field
            label="Name (AR)"
            value={
              profile.companyNameAr ? (
                <span dir="rtl" className="inline-block">
                  {profile.companyNameAr}
                </span>
              ) : null
            }
          />
          <Field
            label="Country / City"
            value={[profile.countryCode, profile.city].filter(Boolean).join(" · ")}
          />
          <Field
            label="CR number"
            value={
              profile.crNumber ? (
                <span className="font-mono text-xs">{profile.crNumber}</span>
              ) : null
            }
          />
          <Field
            label="VAT number"
            value={
              profile.vatNumber ? (
                <span className="font-mono text-xs">{profile.vatNumber}</span>
              ) : null
            }
          />
        </Card>

        {/* Addresses are actionable — a customer checking their own record is
            often about to use one. */}
        <Card title="Contact" icon={Mail}>
          <Field
            label="Email"
            value={
              profile.companyEmail ? (
                <a className="break-all hover:underline" href={"mailto:" + profile.companyEmail}>
                  {profile.companyEmail}
                </a>
              ) : null
            }
          />
          <Field label="Phone" value={profile.companyPhone} />
          <Field
            label="Website"
            value={
              profile.website ? (
                <a
                  className="break-all hover:underline"
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  {profile.website}
                </a>
              ) : null
            }
          />
          <Field
            label="Administrator"
            value={
              profile.adminEmail ? (
                <a className="break-all hover:underline" href={"mailto:" + profile.adminEmail}>
                  {profile.adminEmail}
                </a>
              ) : null
            }
          />
        </Card>

        <div className="lg:col-span-2">
          <Card title="Account" icon={IdCard}>
            <Field
              label="Customer since"
              value={formatDate(profile.activatedAt || profile.createdAt)}
            />
            <Field label="Tenant ID" value={<CopyableId value={profile.tenantId} />} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TenantProfile;
