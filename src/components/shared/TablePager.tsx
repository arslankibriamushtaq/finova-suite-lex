import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "../../lib/utils";

export const PAGE_SIZES = [5, 10, 15, 20] as const;

interface TablePagerProps {
  /** Zero-based, as the endpoints take it. Displayed one-based. */
  page: number;
  pageSize: number;
  /** Rows on the page in hand. */
  count: number;
  /**
   * Total across every page, when the endpoint reports one. Omit it and the
   * pager degrades honestly: no total in the caption, no page numbers beyond
   * the one being read, and no jump-to-last.
   */
  totalRows?: number;
  /** False once a short page comes back — how the end is known without a total. */
  hasMore: boolean;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

/**
 * The table pager, in the shape the rest of the app uses: a caption and page
 * size on one side, first/prev/pages/next/last on the other.
 *
 * It works with or without a total, which matters because the two services
 * behind these screens differ — LEX returns `pagination.totalElements`, the
 * tenancy endpoints answer with a bare array and no count at all. Rather than
 * invent a total for the second case, the numbered strip collapses to the
 * current page and the last-page jump is withheld: both would be guesses.
 * Pass `totalRows` when the endpoint gives one and the full strip appears.
 */
export default function TablePager({
  page,
  pageSize,
  count,
  totalRows,
  hasMore,
  isLoading,
  onPageChange,
  onPageSizeChange,
}: TablePagerProps) {
  const { t } = useTranslation("common");

  const from = count === 0 ? 0 : page * pageSize + 1;
  const to = page * pageSize + count;

  const totalPages =
    totalRows != null && totalRows > 0 ? Math.ceil(totalRows / pageSize) : null;
  const lastPage = totalPages != null ? totalPages - 1 : null;

  /**
   * Which page numbers to offer.
   *
   * With a total it is a window around the current page, as any pager does.
   * Without one, every page up to the current is known to exist — you reached
   * this one through them — and `hasMore` proves there is one more. So the
   * strip fills in as you go rather than claiming a length nobody reported.
   */
  const pageNumbers: number[] = (() => {
    const known = totalPages ?? page + (hasMore ? 2 : 1);
    const start = Math.max(0, Math.min(page - 2, known - 5));
    return Array.from({ length: Math.min(5, known) }, (_, i) => start + i);
  })();

  const first = page === 0;
  const canNext = totalPages != null ? page < totalPages - 1 : hasMore;

  if (first && !canNext && count === 0) return null;

  const btn =
    "flex h-[35px] min-w-[35px] items-center justify-center rounded-[2px] border px-2 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-45";
  const idle =
    "border-[var(--surface-border)] bg-[var(--surface-card)] text-foreground hover:bg-[var(--theme-table-row-hover)]";
  const active =
    "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]";

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[2px] border border-[var(--surface-border)] bg-[var(--surface-card)] px-3 py-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>
          {totalRows != null
            ? t("showingEntries", { from, to, total: totalRows })
            : t("showingRange", { from, to, defaultValue: `Showing ${from} to ${to}` })}
        </span>

        {onPageSizeChange && (
          <select
            aria-label={t("rowsPerPage", { defaultValue: "Rows per page" })}
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-[30px] rounded-[2px] border border-[var(--surface-border)] bg-[var(--surface-card)] px-1.5 text-xs text-foreground"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="First page"
          className={cn(btn, idle)}
          disabled={first || isLoading}
          onClick={() => onPageChange(0)}
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Previous page"
          className={cn(btn, idle)}
          disabled={first || isLoading}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {pageNumbers.map((n) => (
          <button
            key={n}
            type="button"
            aria-current={n === page ? "page" : undefined}
            className={cn(btn, n === page ? active : idle)}
            disabled={isLoading}
            onClick={() => onPageChange(n)}
          >
            {n + 1}
          </button>
        ))}

        <button
          type="button"
          aria-label="Next page"
          className={cn(btn, idle)}
          disabled={!canNext || isLoading}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {/* Only offered when the last page is actually known. */}
        {lastPage != null && (
          <button
            type="button"
            aria-label="Last page"
            className={cn(btn, idle)}
            disabled={page >= lastPage || isLoading}
            onClick={() => onPageChange(lastPage)}
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
