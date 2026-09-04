import { useCallback, useEffect, useState } from "react";
import { MessageSquareWarning } from "lucide-react";

import ComplaintRegister from "../../components/shared/ComplaintRegister";
import {
  getPlatformComplaintEvents,
  getPlatformComplaints,
  openPlatformConsoleSession,
  recordPlatformOutcome,
  type ComplaintQuery,
} from "../../redux/apis/apisSupport";
import { getTenants } from "../../redux/apis/apisTenancyAdmin";

/**
 * Tenant Complaints — what tenants raised about the platform.
 *
 * A separate screen from the tenant Support tab, never one with a toggle. The
 * platform may see that a tenant is unhappy, but a tenant's customers'
 * complaints are that tenant's data and PDPL does not let the platform browse
 * them — the API will not serve them here, and nothing below tries to.
 */
const PlatformComplaints = () => {
  /**
   * Rows arrive from every tenant and identify it by UUID alone, which is
   * useless to whoever is triaging. The register is read once and kept as a
   * lookup rather than resolved per row — the queue holds at most a page of
   * ids, and one call beats twenty.
   */
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    getTenants({ size: 200 })
      .then((tenants) => {
        if (cancelled) return;
        setNames(
          Object.fromEntries(tenants.map((tenant) => [tenant.tenantId, tenant.companyName]))
        );
      })
      // A failed lookup costs the column its labels, not the queue its rows —
      // the UUID still renders, so this stays silent.
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchPage = useCallback((params: ComplaintQuery) => getPlatformComplaints(params), []);
  const tenantName = useCallback((tenantId: string) => names[tenantId], [names]);

  return (
    <ComplaintRegister
      icon={MessageSquareWarning}
      title="Tenant Complaints"
      subtitle="Complaints tenants have raised about the platform, across every tenant."
      fetchPage={fetchPage}
      fetchEvents={getPlatformComplaintEvents}
      recordOutcome={recordPlatformOutcome}
      openConsole={openPlatformConsoleSession}
      consoleLabel="Open platform console"
      showTenant
      tenantName={tenantName}
    />
  );
};

export default PlatformComplaints;
