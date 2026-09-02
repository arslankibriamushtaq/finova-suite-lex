import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Building2, Eye, RefreshCw } from "lucide-react";

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
import TableView from "../../components/TableView/TableView";
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
/** A row is a tenant plus the register's own line number. */
type Row = TenantResponse & { Sr: number };

const PlatformTenants = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get("status") || "") as TenantStatus | "";

  const [query, setQuery] = useState(searchParams.get("query") || "");
  // What the last request was actually made with. It trails `query` by the
  // debounce below, which is the whole point: every keystroke would otherwise
  // be a round trip, and the answers can come back out of order.
  const [submittedQuery, setSubmittedQuery] = useState(searchParams.get("query") || "");
  const [rows, setRows] = useState<TenantResponse[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
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

  /**
   * Search as you type.
   *
   * 350ms after the last keystroke, not on every one: a search that fires per
   * character sends a request the typist has already invalidated, and the
   * replies race — the answer to "ac" can land after the answer to "acme" and
   * leave the wrong rows on screen.
   *
   * Skipped when the value has not actually changed, so returning to a query
   * from the URL does not re-fetch what is already shown.
   */
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === submittedQuery) return;

    const timer = window.setTimeout(() => setSubmittedQuery(trimmed), 350);
    return () => window.clearTimeout(timer);
  }, [query, submittedQuery]);

  const setStatus = (next: TenantStatus | "") => {
    const params = new URLSearchParams(searchParams);
    if (next) params.set("status", next);
    else params.delete("status");
    setSearchParams(params, { replace: true });
  };

  /**
   * The register's own table, not a hand-rolled one.
   *
   * TableView is what every other list in the product renders, so reusing it is
   * what makes this page look like the rest rather than an approximation that
   * drifts away from it. Its pager stays off: it needs a row total to say
   * "showing 1 to 10 of 40", and /platform/tenants answers with a bare array.
   * TablePager below numbers only the pages it can prove exist.
   */
  const columns = [
    { name: "#", selector: (row: Row) => row.Sr, width: "60px" },
    {
      name: "Company",
      cell: (row: Row) => (
        <div className="min-w-0">
          <Link to={`/Platform/Tenants/${row.tenantId}`} className="font-medium hover:underline">
            {row.companyName}
          </Link>
          {row.companyNameAr && (
            <div dir="rtl" className="text-xs text-muted-foreground">
              {row.companyNameAr}
            </div>
          )}
        </div>
      ),
    },
    {
      name: "Code",
      cell: (row: Row) => <span className="font-mono text-xs">{row.tenantCode}</span>,
    },
    {
      name: "CR",
      cell: (row: Row) => <span className="font-mono text-xs">{row.crNumber || "—"}</span>,
    },
    { name: "Admin", selector: (row: Row) => row.adminEmail || "—" },
    { name: "City", selector: (row: Row) => row.city || "—" },
    { name: "Status", cell: (row: Row) => <TenancyStatusBadge status={row.status} /> },
    {
      name: "Action",
      width: "10%",
      cell: (row: Row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {/* No icon of our own: `dropdown-toggle` is a Bootstrap class and
                draws its own caret through ::after. A lucide chevron as well
                put two carets on the button. */}
            <Button size="sm" className="dropdown-toggle">
              Select
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="gap-2"
              onClick={() => navigate(`/Platform/Tenants/${row.tenantId}`)}
            >
              <Eye className="h-3.5 w-3.5" />
              View details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // The line number counts across pages, the way a register's does.
  const mapped: Row[] = rows.map((tenant, index) => ({
    ...tenant,
    Sr: page * pageSize + index + 1,
  }));

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
          // Enter still commits immediately rather than waiting out the
          // debounce; there is no Search button because typing is the search.
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
        <div className="pro-card overflow-hidden">
          <TableView header={columns} data={mapped} isLoading={isLoading} paginationShow={false} />
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
