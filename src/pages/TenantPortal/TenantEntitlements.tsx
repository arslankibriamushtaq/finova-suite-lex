import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Check, KeyRound } from "lucide-react";

import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/shared/detailKit";
import { LexPageHeader } from "../../components/shared/lexKit";
import { getMyEntitlements, toTenancyError } from "../../redux/apis/apisTenancyAdmin";

/** What this company's users can actually reach — the same codes that drive their policies. */
const TenantEntitlements = () => {
  const [modules, setModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyEntitlements()
      .then(setModules)
      .catch((error) => {
        toast.error(toTenancyError(error, "Could not load your entitlements.").message);
        setModules([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <LexPageHeader
        icon={KeyRound}
        title="Entitlements"
        subtitle="Everything your plan gives your users access to."
      />
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : modules.length === 0 ? (
        <EmptyState icon={KeyRound} text="No modules are entitled yet." />
      ) : (
        <section className="pro-card p-4">
          <div className="mb-1 flex flex-wrap items-baseline gap-2">
            <h2 className="pro-card-title">Modules</h2>
            <span className="rounded-full bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] px-2 py-0.5 text-[11px] font-semibold text-[var(--primary)]">
              {modules.length}
            </span>
          </div>
          <p className="mb-3.5 text-xs text-muted-foreground">
            These are the codes your users' permissions are granted against. Changing your plan
            changes this list.
          </p>

          {/* A grid of rows rather than a wrap of tags: twenty codes in a tag
              cloud have no order to scan by, and a reader is looking for one
              module, not reading all of them. Sorted, so it can be found. */}
          <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {[...modules].sort((a, b) => a.localeCompare(b)).map((m) => (
              <li
                key={m}
                className="flex items-center gap-2 rounded-[2px] border border-[var(--surface-border)] bg-[color-mix(in_srgb,var(--primary)_3%,transparent)] px-2.5 py-2"
              >
                <Check
                  className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]"
                  aria-hidden="true"
                />
                <span className="truncate font-mono text-xs text-foreground">{m}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default TenantEntitlements;
