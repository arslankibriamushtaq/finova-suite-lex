import { useCallback, useEffect, useState, type ReactNode } from "react";
import { BarChart3, RefreshCw } from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FilterField } from "./filterKit";
import { LexNotice, LexTile } from "./lexKit";
import {
  formatAverageMinutes,
  formatRate,
  UNFILED_CATEGORY_LABEL,
} from "./supportKitUtils";
import {
  toSupportError,
  type SupportReportQuery,
  type SupportReportSummary,
} from "../../redux/apis/apisSupport";

export interface ComplaintReportPanelProps {
  /** Tenant-scoped or platform-wide. The platform report is pinned to level 2 in SQL. */
  fetchSummary: (query?: SupportReportQuery) => Promise<SupportReportSummary>;
}

/** A `<input type="date">` value as the instant the API wants. */
const startOfDay = (value: string) => (value ? `${value}T00:00:00Z` : undefined);

/**
 * One band of the report.
 *
 * Sixteen tiles in one flat grid read as a wall rather than a report: nothing
 * says which figures answer the same question, and the last row is always
 * ragged. Grouping them puts the volume, the outcome, the clock and the timings
 * side by side with their own peers, which is how anyone reads them anyway.
 */
const ReportBand = ({ label, children }: { label: string; children: ReactNode }) => (
  <section>
    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{children}</div>
  </section>
);

/**
 * The complaint numbers over a window.
 *
 * Both bounds are optional and apply to **when the complaint was opened** —
 * `from` inclusive, `to` exclusive. Left empty, this is everything on record,
 * which is the right default for a register that starts small.
 *
 * Nothing here is computed from the queue: a page of rows is not a month, and
 * a tile that quietly counted only what was loaded would be wrong in exactly
 * the way nobody checks.
 */
export default function ComplaintReportPanel({ fetchSummary }: ComplaintReportPanelProps) {
  const [summary, setSummary] = useState<SupportReportSummary | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setSummary(await fetchSummary({ from: startOfDay(from), to: startOfDay(to) }));
      setError(null);
    } catch (err) {
      setSummary(null);
      // A report that will not load costs the screen its numbers, not its
      // queue — so it says so in place rather than over the rows.
      setError(toSupportError(err, "Could not load the complaint report.").message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchSummary, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="pro-card mb-3 p-3">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BarChart3 className="h-4 w-4" />
          Report
          <span className="font-normal text-xs text-muted-foreground">
            by when the complaint was opened
          </span>
        </h4>
        <div className="flex flex-wrap items-end gap-2">
          <FilterField label="From" htmlFor="report-from" className="w-40">
            <Input
              id="report-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </FilterField>
          <FilterField label="To (exclusive)" htmlFor="report-to" className="w-40">
            <Input id="report-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </FilterField>
          <Button size="sm" variant="outline" onClick={load} disabled={isLoading}>
            <RefreshCw className={`me-1 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <LexNotice tone="amber" className="mb-0">
          {error}
        </LexNotice>
      ) : (
        <>
          <div className="space-y-3">
            <ReportBand label="Volume">
              <LexTile label="Total" value={summary?.total ?? "—"} loading={isLoading} />
              <LexTile label="Open" value={summary?.open ?? "—"} loading={isLoading} />
              <LexTile label="Pending" value={summary?.pending ?? "—"} loading={isLoading} />
              <LexTile label="Resolved" value={summary?.resolved ?? "—"} loading={isLoading} />
              <LexTile label="Reopened" value={summary?.reopened ?? "—"} loading={isLoading} />
            </ReportBand>

            <ReportBand label="Outcome">
              <LexTile
                label="Upheld"
                value={summary?.upheld ?? "—"}
                hint="Something was wrong and it was put right."
                loading={isLoading}
              />
              <LexTile
                label="Not upheld"
                value={summary?.rejected ?? "—"}
                hint="Considered and rejected."
                loading={isLoading}
              />
              <LexTile
                label="Awaiting classification"
                value={summary?.unclassifiedOutcome ?? "—"}
                hint="Resolved by the console, classified by nobody. The register's paperwork backlog."
                loading={isLoading}
              />
            </ReportBand>

            <ReportBand label="SLA and escalation">
              <LexTile
                label="With an SLA target"
                value={summary?.withSlaTarget ?? "—"}
                hint="Only a sub-category carries a priority, so a complaint filed at category level has no target."
                loading={isLoading}
              />
              <LexTile
                // Null when nothing had a target: no data, not perfect
                // compliance. A 0% here would read as the opposite of the truth.
                label="Acknowledgement met"
                value={formatRate(summary?.acknowledgementMetRate)}
                hint="— when no complaint in this window had a target: that is no data, not 100% or 0%."
                loading={isLoading}
              />
              <LexTile
                label="Acknowledgement breached"
                value={summary?.acknowledgementBreached ?? "—"}
                loading={isLoading}
              />
              <LexTile
                label="Resolution breached"
                value={summary?.resolutionBreached ?? "—"}
                loading={isLoading}
              />
              <LexTile label="Escalated" value={summary?.escalated ?? "—"} loading={isLoading} />
            </ReportBand>

            <ReportBand label="Timing and satisfaction">
              <LexTile
                label="Avg to first response"
                value={formatAverageMinutes(summary?.averageMinutesToFirstResponse)}
                hint="Over complaints that were actually answered, so a slow month does not look fast."
                loading={isLoading}
              />
              <LexTile
                label="Avg to resolution"
                value={formatAverageMinutes(summary?.averageMinutesToResolution)}
                hint="Over complaints that were actually resolved."
                loading={isLoading}
              />
              <LexTile
                label="Satisfaction"
                value={
                  summary?.averageCsat == null ? "—" : `${+summary.averageCsat.toFixed(2)} / 5`
                }
                hint={`1 worst, 5 best. ${summary?.csatResponses ?? 0} response(s).`}
                loading={isLoading}
              />
            </ReportBand>
          </div>

          {/* The null-code bucket is labelled rather than dropped — it is
              usually the most interesting row on the table. */}
          {summary && summary.byCategory.length > 0 && (
            <div className="mt-3 border-t border-[var(--surface-border)] pt-3">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                By category
              </p>
              <div className="flex flex-wrap gap-1.5">
                {summary.byCategory.map((row) => (
                  <span
                    key={row.categoryCode ?? "__unfiled__"}
                    className="rounded-[2px] border border-[var(--surface-border)] bg-muted/40 px-2 py-1 text-xs text-muted-foreground"
                    title={row.categoryCode ? undefined : "Nobody has filed these under a category."}
                  >
                    {row.categoryNameEn || UNFILED_CATEGORY_LABEL}
                    <strong className="ms-1.5 text-foreground">{row.count}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
