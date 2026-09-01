import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Building2 } from "lucide-react";

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
 */
const Field = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="min-w-0">
    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </div>
    <div className="mt-0.5 break-words text-sm font-medium text-foreground">
      {value === null || value === undefined || value === "" ? "—" : value}
    </div>
  </div>
);

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="pro-card p-4">
    <h2 className="mb-3 text-sm font-semibold text-foreground">{title}</h2>
    <div className="grid gap-3 sm:grid-cols-2">{children}</div>
  </section>
);

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
  if (!profile) return <p className="text-sm text-muted-foreground">Your profile could not be loaded.</p>;

  return (
    <div>
      <LexPageHeader icon={Building2} title={profile.companyName} subtitle={<span className="font-mono text-xs tracking-tight">{profile.tenantCode}</span>}>
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
          how to reach it, and the account's own references. */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card title="Company">
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

        <Card title="Contact">
          <Field label="Email" value={profile.companyEmail} />
          <Field label="Phone" value={profile.companyPhone} />
          <Field label="Website" value={profile.website} />
          <Field label="Administrator" value={profile.adminEmail} />
        </Card>

        <div className="lg:col-span-2">
          <Card title="Account">
            <Field
              label="Customer since"
              value={formatDate(profile.activatedAt || profile.createdAt)}
            />
            {/* The id support will ask for. Mono and selectable so it can be
                read down a phone or copied without transcription errors. */}
            <Field
              label="Tenant ID"
              value={
                <span className="select-all font-mono text-xs">{profile.tenantId}</span>
              }
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TenantProfile;
