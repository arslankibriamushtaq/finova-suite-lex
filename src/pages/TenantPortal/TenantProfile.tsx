import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Building2 } from "lucide-react";

import { Skeleton } from "../../components/ui/skeleton";
import { LexPageHeader } from "../../components/shared/lexKit";
import { TenancyStatusBadge } from "../../components/shared/tenancyKit";
import {
  getMyProfile,
  toTenancyError,
  type TenantResponse,
} from "../../redux/apis/apisTenancyAdmin";

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-b-0">
    <span className="shrink-0 text-muted-foreground">{label}</span>
    <span className="min-w-0 break-words text-end font-medium text-foreground">{value ?? "—"}</span>
  </div>
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
      <LexPageHeader icon={Building2} title={profile.companyName} subtitle={profile.tenantCode}>
        <TenancyStatusBadge status={profile.status} />
      </LexPageHeader>

      {profile.status === "SUSPENDED" && (
        <div className="mb-3 rounded-lg border border-orange-500/50 bg-orange-500/5 p-3 text-sm">
          <div className="fw-semibold">Your workspace is suspended.</div>
          <div className="mt-1">{profile.suspensionReason || "No reason was recorded."}</div>
          <div className="mt-2 text-muted-foreground">
            Settle any outstanding invoice or contact support to have it lifted. Nothing has been
            deleted.
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-3" style={{ maxWidth: 640 }}>
        <Row
          label="Name (AR)"
          value={profile.companyNameAr ? <span dir="rtl">{profile.companyNameAr}</span> : "—"}
        />
        <Row label="CR number" value={profile.crNumber} />
        <Row label="VAT number" value={profile.vatNumber} />
        <Row
          label="Country / City"
          value={[profile.countryCode, profile.city].filter(Boolean).join(" · ") || "—"}
        />
        <Row label="Email" value={profile.companyEmail} />
        <Row label="Phone" value={profile.companyPhone} />
        <Row label="Website" value={profile.website} />
        <Row label="Administrator" value={profile.adminEmail} />
        <Row label="Customer since" value={profile.activatedAt || profile.createdAt} />
      </div>
    </div>
  );
};

export default TenantProfile;
