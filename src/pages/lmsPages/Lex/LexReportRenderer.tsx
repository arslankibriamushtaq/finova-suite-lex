import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { chartTooltipStyle } from "../../../components/shared/detailKitUtils";
import type { LexReportResult, LexReportRow } from "../../../redux/apis/apisLexBi";

/**
 * One renderer for standard and custom reports.
 *
 * The response shape is identical for both, so building two would guarantee
 * they drift. Everything on screen is driven by the payload:
 *
 * - `unit` formats the axis and the values. Guessing from the measure name is
 *   how a percentage ends up rendered as a count.
 * - `note` is always rendered. It usually says what was excluded and why, and a
 *   number whose exclusions are invisible is a number that gets misquoted.
 * - a row with a null `drillKey` has nothing behind it, so it is not a link.
 */

const PALETTE = ["#e60000", "#3b82f6", "#f59e0b", "#8b5cf6", "#db2777", "#0ea5e9", "#6366f1"];

const formatValue = (value: number | string | undefined, unit?: string): string => {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  if (unit === "percent") return `${n.toFixed(1)}%`;
  if (unit === "minutes") {
    const total = Math.round(n);
    const hours = Math.floor(total / 60);
    return hours ? `${hours}h ${total % 60}m` : `${total}m`;
  }
  return n.toLocaleString();
};

const LexReportRenderer = ({
  report,
  onDrill,
}: {
  report: LexReportResult;
  onDrill?: (row: LexReportRow) => void;
}) => {
  const { t } = useTranslation("lex");
  const rows = report.rows || [];
  const clickable = (row: LexReportRow) => !!row.drillKey && !!onDrill;

  const axisFormatter = (value: number) => formatValue(value, report.unit);
  // Recharts types its tooltip formatter loosely; this keeps the cast in one
  // place instead of at four call sites.
  const tooltipFormatter = (value: unknown) =>
    formatValue(value as number | string | undefined, report.unit);

  const chart = () => {
    switch (report.visualization) {
      case "BAR":
        return (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={axisFormatter} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={tooltipFormatter} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {rows.map((row, index) => (
                  <Cell
                    key={row.label}
                    fill={PALETTE[index % PALETTE.length]}
                    cursor={clickable(row) ? "pointer" : "default"}
                    onClick={() => clickable(row) && onDrill?.(row)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "LINE":
        return (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={axisFormatter} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={tooltipFormatter} />
              <Line type="monotone" dataKey="value" stroke={PALETTE[0]} strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        );

      case "PIE":
        return (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Tooltip contentStyle={chartTooltipStyle} formatter={tooltipFormatter} />
              <Pie data={rows} dataKey="value" nameKey="label" outerRadius={110} label>
                {rows.map((row, index) => (
                  <Cell
                    key={row.label}
                    fill={PALETTE[index % PALETTE.length]}
                    cursor={clickable(row) ? "pointer" : "default"}
                    onClick={() => clickable(row) && onDrill?.(row)}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );

      case "FUNNEL":
        return (
          <ResponsiveContainer width="100%" height={320}>
            <FunnelChart>
              <Tooltip contentStyle={chartTooltipStyle} formatter={tooltipFormatter} />
              <Funnel dataKey="value" data={rows} isAnimationActive>
                <LabelList position="right" dataKey="label" fill="var(--foreground)" fontSize={11} />
                {rows.map((row, index) => (
                  <Cell
                    key={row.label}
                    fill={PALETTE[index % PALETTE.length]}
                    cursor={clickable(row) ? "pointer" : "default"}
                    onClick={() => clickable(row) && onDrill?.(row)}
                  />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {(report.summaryValue !== undefined || report.summaryLabel) && (
        <div className="pro-tile">
          <span className="pro-tile__label">{report.summaryLabel}</span>
          <span className="pro-tile__value pro-tile__value--accent">
            {formatValue(report.summaryValue, report.unit)}
          </span>
        </div>
      )}

      {report.visualization !== "TABLE" && <div className="pro-card p-3">{chart()}</div>}

      {/* The table is always present, chart or not: it is the only view that
          carries the per-row count and the drill affordance for every row. */}
      <div className="pro-card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-start">
              <th className="px-3 py-2 text-start font-medium text-muted-foreground">
                {report.dimensionLabel || t("bi.col.dimension")}
              </th>
              <th className="px-3 py-2 text-end font-medium text-muted-foreground">
                {report.measure}
              </th>
              <th className="px-3 py-2 text-end font-medium text-muted-foreground">
                {t("bi.col.count")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                  {t("bi.noRows")}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.label} className="border-b border-border/60 last:border-b-0">
                  <td className="px-3 py-2">
                    {clickable(row) ? (
                      <button
                        type="button"
                        className="underline underline-offset-2"
                        onClick={() => onDrill?.(row)}
                      >
                        {row.label}
                      </button>
                    ) : (
                      // Null drillKey: nothing behind it, so not a link that errors.
                      <span>{row.label}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-end">{formatValue(row.value, report.unit)}</td>
                  <td className="px-3 py-2 text-end text-muted-foreground">{row.count ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {report.note && (
        <p className="m-0 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground ring-1 ring-border">
          {report.note}
        </p>
      )}
    </div>
  );
};

export default LexReportRenderer;
