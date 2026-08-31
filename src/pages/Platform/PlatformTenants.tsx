import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Building2, Loader2, Search } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/shared/detailKit";
import { LexPageHeader } from "../../components/shared/lexKit";
import { TenancyStatusBadge } from "../../components/shared/tenancyKit";
import {
  TENANT_STATUSES,
  getTenants,
  toTenancyError,
  type TenantResponse,
  type TenantStatus,
} from "../../redux/apis/apisTenancyAdmin";

const PAGE_SIZE = 20;

/**
 * The register of customers.
 *
 * Paging is "load more", not a numbered pager: the endpoint answers with a bare
 * array and no total count, so page numbers would need a total that never
 * arrives. A short page means the end.
 */
const PlatformTenants = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get("status") || "") as TenantStatus | "";

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [submittedQuery, setSubmittedQuery] = useState(searchParams.get("query") || "");
  const [rows, setRows] = useState<TenantResponse[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(
    async (nextPage: number, append: boolean) => {
      setIsLoading(true);
      try {
        const data = await getTenants({
          query: submittedQuery,
          status,
          page: nextPage,
          size: PAGE_SIZE,
        });
        setRows((prev) => (append ? [...prev, ...data] : data));
        setPage(nextPage);
        setHasMore(data.length === PAGE_SIZE);
      } catch (error) {
        toast.error(toTenancyError(error, "Could not load tenants.").message);
        if (!append) setRows([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [submittedQuery, status]
  );

  useEffect(() => {
    load(0, false);
  }, [load]);

  const setStatus = (next: TenantStatus | "") => {
    const params = new URLSearchParams(searchParams);
    if (next) params.set("status", next);
    else params.delete("status");
    setSearchParams(params, { replace: true });
  };

  return (
    <div>
      <LexPageHeader
        icon={Building2}
        title="Tenants"
        subtitle="Every company on the platform. Search by name, tenant code, CR number or admin email."
      />

      <form
        className="mb-3 d-flex flex-wrap align-items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmittedQuery(query.trim());
        }}
      >
        <div className="position-relative" style={{ maxWidth: 320, flex: "1 1 240px" }}>
          <Search className="pointer-events-none absolute start-0 top-1/2 ms-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tenants"
            className="ps-4"
          />
        </div>
        <Button type="submit" size="sm" variant="outline">
          Search
        </Button>
        <div className="d-flex flex-wrap gap-1">
          <Button
            type="button"
            size="sm"
            variant={status === "" ? "default" : "outline"}
            onClick={() => setStatus("")}
          >
            All
          </Button>
          {TENANT_STATUSES.map((s) => (
            <Button
              key={s}
              type="button"
              size="sm"
              variant={status === s ? "default" : "outline"}
              onClick={() => setStatus(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </form>

      {isLoading && rows.length === 0 ? (
        <div className="d-grid gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={Building2} text="No tenants match this filter." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-2 text-start font-medium">Company</th>
                <th className="p-2 text-start font-medium">Code</th>
                <th className="p-2 text-start font-medium">CR</th>
                <th className="p-2 text-start font-medium">Admin</th>
                <th className="p-2 text-start font-medium">City</th>
                <th className="p-2 text-start font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.tenantId} className="border-t border-border/60 hover:bg-muted/30">
                  <td className="p-2">
                    <Link
                      to={`/Platform/Tenants/${t.tenantId}`}
                      className="fw-medium text-decoration-none"
                    >
                      {t.companyName}
                    </Link>
                    {t.companyNameAr && (
                      <div dir="rtl" className="text-xs text-muted-foreground">
                        {t.companyNameAr}
                      </div>
                    )}
                  </td>
                  <td className="p-2 font-mono text-xs">{t.tenantCode}</td>
                  <td className="p-2 font-mono text-xs">{t.crNumber || "—"}</td>
                  <td className="p-2">{t.adminEmail || "—"}</td>
                  <td className="p-2">{t.city || "—"}</td>
                  <td className="p-2">
                    <TenancyStatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasMore && (
        <div className="mt-3 text-center">
          <Button variant="outline" size="sm" disabled={isLoading} onClick={() => load(page + 1, true)}>
            {isLoading && <Loader2 className="me-1 h-4 w-4 animate-spin" />}
            Load more
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlatformTenants;
