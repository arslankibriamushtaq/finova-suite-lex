import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { KeyRound } from "lucide-react";

import { Badge } from "../../components/ui/badge";
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
        <div className="d-flex flex-wrap gap-1">
          {modules.map((m) => (
            <Badge key={m} variant="outline" className="border-border font-mono text-xs">
              {m}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default TenantEntitlements;
