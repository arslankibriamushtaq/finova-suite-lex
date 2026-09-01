import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Building2, ChevronDown, Eye, RefreshCw, Search } from "lucide-react";

import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/shared/detailKit";
import { SearchField } from "../../components/shared/filterKit";
import TablePager from "../../components/shared/TablePager";
import { LexPageHeader } from "../../components/shared/lexKit";
import { TenancyStatusBadge } from "../../components/shared/tenancyKit";
import { cn } from "../../lib/utils";
import {
  TENANT_STATUSES,
  getTenants,
  toTenancyError,
  type TenantResponse,
  type TenantStatus,
} from "../../redux/apis/apisTenancyAdmin";


/**
 * The register of customers.
 *
 * Paging is previous/next, not a numbered pager: the endpoint answers with a
 * bare array and no total count, so page numbers would need a total that never
 * arrives. A short page means the end.
 */
const PlatformTenants = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get("status") || "") as TenantStatus | "";

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [submittedQuery, setSubmittedQuery] = useState(searchParams.get("query") || "");
  const [rows, setRows] = useState<TenantResponse[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
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
          size: pageSize,
        });
        setRows((prev) => (append ? [...prev, ...data] : data));
        setPage(nextPage);
        setHasMore(data.length === pageSize);
      } catch (error) {
        toast.error(toTenancyError(error, "Could not load tenants.").message);
        if (!append) setRows([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [submittedQuery, status, pageSize]
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

      {/* The app's standard filter bar: a search that fills the row and the
          actions gathered at its end. Same shape as the ledger screens, built
          on the same shared SearchField. */}
      <div className="pro-card mb-3 p-3">
        <form
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmittedQuery(query.trim());
          }}
        >
          <SearchField
            id="tenant-search"
            className="flex-1"
            placeholder="Search by name, tenant code, CR number or admin email"
            value={query}
            onChange={setQuery}
          />

          <div className="flex items-center gap-2">
            <Button type="submit" variant="outline" className="h-10 flex-1 gap-2 sm:flex-none">
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 flex-1 gap-2 sm:flex-none"
              disabled={isLoading}
              onClick={() => load(0, false)}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </form>
      </div>

      {/* Status is a view of the register rather than a filter you fill in, so
          it sits on its own row as tabs rather than inside the search card.
          `no-card` is the app's class for filter controls that are NOT in a
          card — it applies the same 34px/12px sizing the search bar above
          gets from `.pro-card`. Without it these chips fall back to shadcn's
          own `sm` size and render a size larger than every other filter
          control in the product. */}
      <div
        role="group"
        aria-label="Filter by status"
        className="no-card mb-3 flex flex-wrap items-center gap-1.5"
      >
        <Button
          type="button"
          size="sm"
          aria-pressed={status === ""}
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
            aria-pressed={status === s}
            variant={status === s ? "default" : "outline"}
            onClick={() => setStatus(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      {isLoading && rows.length === 0 ? (
        <div className="grid gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={Building2} text="No tenants match this filter." />
      ) : (
        <div className="no-table overflow-x-auto rounded-[2px] border border-[color-mix(in_srgb,var(--primary)_14%,var(--surface-border))]">
          <table className="w-full min-w-[940px] border-collapse text-sm">
            {/* Same header treatment the LMS and antd tables get elsewhere:
                the brand fill from --theme-table-background-color with white
                labels, so this page reads as part of the same product. */}
            <thead>
              <tr className="bg-[var(--theme-table-background-color)] text-xs uppercase tracking-wide text-white">
                <th className="px-3 py-2.5 text-start font-semibold">Company</th>
                <th className="px-3 py-2.5 text-start font-semibold">Code</th>
                <th className="px-3 py-2.5 text-start font-semibold">CR</th>
                <th className="px-3 py-2.5 text-start font-semibold">Admin</th>
                <th className="px-3 py-2.5 text-start font-semibold">City</th>
                <th className="px-3 py-2.5 text-start font-semibold">Status</th>
                <th className="px-3 py-2.5 text-start font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr
                  key={t.tenantId}
                  className="border-t border-[var(--surface-border)] transition-colors odd:bg-[var(--theme-table-row-alt)] hover:bg-[var(--theme-table-row-hover)]"
                >
                  <td className="px-3 py-2.5">
                    <Link
                      to={`/Platform/Tenants/${t.tenantId}`}
                      className="font-medium hover:underline"
                    >
                      {t.companyName}
                    </Link>
                    {t.companyNameAr && (
                      <div dir="rtl" className="text-xs text-muted-foreground">
                        {t.companyNameAr}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs">{t.tenantCode}</td>
                  <td className="px-3 py-2.5 font-mono text-xs">{t.crNumber || "—"}</td>
                  <td className="px-3 py-2.5">{t.adminEmail || "—"}</td>
                  <td className="px-3 py-2.5">{t.city || "—"}</td>
                  <td className="px-3 py-2.5">
                    <TenancyStatusBadge status={t.status} />
                  </td>
                  {/* The same row-action control the LMS tables use. The look
                      comes from the app's unified rule for action triggers, not
                      from classes here — `dropdown-toggle` inside a `.no-table`
                      wrapper is the hook that rule matches for a plain table,
                      which is why the button carries no colour of its own. */}
                  <td className="px-3 py-2.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" className="dropdown-toggle gap-1.5">
                          Select
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => navigate(`/Platform/Tenants/${t.tenantId}`)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TablePager
        page={page}
        pageSize={pageSize}
        count={rows.length}
        hasMore={hasMore}
        isLoading={isLoading}
        onPageChange={(next) => load(next, false)}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
};

export default PlatformTenants;
