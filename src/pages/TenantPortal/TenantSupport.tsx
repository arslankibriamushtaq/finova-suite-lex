import { useCallback, useEffect, useState } from "react";
import { Headset } from "lucide-react";

import ComplaintRegister from "../../components/shared/ComplaintRegister";
import {
  getCategories,
  getSubCategories,
  getTenantComplaintEvents,
  getTenantComplaints,
  openTenantConsoleSession,
  recordTenantOutcome,
  type ComplaintQuery,
  type SupportCategory,
  type SupportSubCategory,
} from "../../redux/apis/apisSupport";

/**
 * Support — the complaints this tenant's own customers raised.
 *
 * Scoped to the caller's `tenant_id` claim and to level 1, so a tenant's own
 * complaint about the platform never appears in its agents' queue. That is the
 * server's rule, not this screen's; there is no tenant selector here and there
 * cannot be one.
 */
const TenantSupport = () => {
  /**
   * The tenant's own taxonomy, read once for the whole screen: it names the
   * category column and fills the classification picker. Active rows only — a
   * retired category is kept so old complaints still resolve, not so new ones
   * can be filed under it.
   */
  const [categories, setCategories] = useState<SupportCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SupportSubCategory[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCategories(true), getSubCategories({ activeOnly: true })])
      .then(([cats, subs]) => {
        if (cancelled) return;
        setCategories(cats);
        setSubCategories(subs);
      })
      // A taxonomy that will not load costs the queue a column and a picker,
      // not its rows — so this stays quiet rather than shouting over a list
      // that is working.
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchPage = useCallback((params: ComplaintQuery) => getTenantComplaints(params), []);

  return (
    <ComplaintRegister
      icon={Headset}
      title="Support"
      subtitle="Complaints your customers have raised, and the reference number each one carries."
      fetchPage={fetchPage}
      fetchEvents={getTenantComplaintEvents}
      recordOutcome={recordTenantOutcome}
      openConsole={openTenantConsoleSession}
      categories={categories}
      subCategories={subCategories}
      consoleLabel="Open support console"
    />
  );
};

export default TenantSupport;
