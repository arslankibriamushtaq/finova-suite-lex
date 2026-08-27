import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, SaudiRiyal, Phone, Calendar, RefreshCw, Receipt, ListChecks } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { getCostReportByApplication } from "../../redux/apis/apisMiddlewareProviders";

const ENV_OPTIONS = [
  { value: "test", label: "Test" },
  { value: "dev", label: "Dev" },
  { value: "prod", label: "Prod" },
];

const formatNumber = (n: number | undefined | null, fractionDigits = 4) => {
  if (n == null || isNaN(Number(n))) return "-";
  return Number(n).toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const CostByApplication = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const envParam = searchParams.get("env") || "test";

  const [env, setEnv] = useState(envParam);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const loadReport = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await getCostReportByApplication(id, env);
      const result = response?.data?.data || null;
      setReport(result);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch cost report");
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSearchParams({ env }, { replace: true });
    loadReport();
  }, [id, env]);

  const totals = report?.totals || {};
  const items: any[] = report?.items || [];
  const currency = totals?.currency || "SAR";

  return (
    <div className="service application-cost-page">
      <div className="page-header mb-3 pb-2 border-bottom">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="page-header-back gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h3 className="page-header-title mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
          <span className="pro-head-badge">
            <Receipt className="h-4 w-4" />
          </span>
          Cost By Application
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="filter-row">
          <div className="filter-field">
            <label className="filter-label">Environment</label>
            <Select value={env} onValueChange={(v) => setEnv(v)}>
              <SelectTrigger className="filter-select-trigger">
                <SelectValue placeholder="Select env" />
              </SelectTrigger>
              <SelectContent>
                {ENV_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            type="button"
            onClick={loadReport}
            disabled={isLoading}
            className="refresh-btn"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="historical-note mb-3">
        Costs shown reflect historical pricing at the time each call was made. Updating a provider API's cost only affects future calls — past calls keep the rate they were billed at.
      </div>

      {/* Totals cards */}
      <div className="totals-grid mb-3">
        <Card className="pro-card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Total Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {totals?.call_count ?? 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="pro-card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <SaudiRiyal className="h-4 w-4" />
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold break-words">
                {formatNumber(totals?.total_cost, 4)}{" "}
                <span className="text-base font-medium text-muted-foreground">
                  {currency}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="pro-card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              First Call
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              <div className="text-sm font-medium break-words">
                {formatDateTime(totals?.first_call)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="pro-card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Last Call
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              <div className="text-sm font-medium break-words">
                {formatDateTime(totals?.last_call)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card className="mb-3 pro-card-glow">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
              <ListChecks className="h-4 w-4" />
            </span>
            Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="cost-table">
            <TableHeader>
              <TableRow>
                <TableHead>API Code</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-end">API Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No data
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row, idx) => {
                  const status = (row.status || "").toUpperCase();
                  const statusColor =
                    status === "SUCCESS"
                      ? "var(--color-success)"
                      : status === "FAILED" || status === "ERROR"
                      ? "var(--color-error)"
                      : status === "PENDING"
                      ? "var(--color-warning)"
                      : "var(--muted)";
                  const rowCurrency = row.cost_currency || currency;
                  return (
                    <TableRow key={`${row.api_code || idx}-${idx}`}>
                      <TableCell className="font-medium">{row.api_code || "-"}</TableCell>
                      <TableCell>{row.provider_code || "-"}</TableCell>
                      <TableCell>
                        {status ? (
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "32px",
                              fontSize: "12px",
                              fontWeight: 500,
                              backgroundColor: statusColor,
                              color: "var(--primary-foreground)",
                              display: "inline-block",
                            }}
                          >
                            {status}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{formatDateTime(row.created_at)}</TableCell>
                      <TableCell className="text-end">
                        {row.api_cost != null ? `${formatNumber(row.api_cost, 4)} ${rowCurrency}` : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <style>{`
        .application-cost-page .page-header {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        .application-cost-page .page-header-back {
          height: 36px;
          line-height: 1;
          display: inline-flex;
          align-items: center;
        }
        .application-cost-page .page-header-title {
          margin: 0;
          line-height: 1.2;
        }
        .application-cost-page .filter-row {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          width: 100%;
        }
        .application-cost-page .filter-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1 1 280px;
          min-width: 200px;
          max-width: 360px;
        }
        .application-cost-page .filter-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--muted-foreground);
        }
        .application-cost-page .filter-select-trigger {
          width: 100%;
          height: 42px;
          border-radius: 2px;
        }
        .application-cost-page .refresh-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 42px;
          padding: 0 18px;
          border-radius: 2px;
          background-color: #e60000;
          color: #ffffff;
          border: 1px solid #e60000;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          transition: background-color 0.15s ease, opacity 0.15s ease;
          align-self: flex-end;
          flex-shrink: 0;
        }
        .application-cost-page .refresh-btn:hover:not(:disabled) {
          background-color: #c00000;
        }
        .application-cost-page .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .application-cost-page .refresh-btn svg {
          color: #ffffff;
        }
        @media (max-width: 575.98px) {
          .application-cost-page .filter-field {
            flex: 1 1 100%;
            max-width: 100%;
          }
          .application-cost-page .refresh-btn {
            width: 100%;
          }
        }
        .application-cost-page .historical-note {
          background-color: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-left: 4px solid var(--color-warning, #f59e0b);
          border-radius: 2px;
          padding: 10px 14px;
          font-size: 13px;
          color: var(--foreground);
          line-height: 1.5;
        }
        .application-cost-page .totals-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }
        @media (max-width: 480px) {
          .application-cost-page .totals-grid {
            grid-template-columns: 1fr;
          }
        }
        .application-cost-page .cost-table {
          border-collapse: separate;
          border-spacing: 0;
          width: 100%;
        }
        .application-cost-page .cost-table thead tr {
          background-color: var(--theme-table-background-color);
        }
        .application-cost-page .cost-table thead th {
          color: #ffffff !important;
          font-weight: 600;
          font-size: 13.5px;
          padding: 12px 14px !important;
          border-bottom: 1px solid var(--border);
          text-align: left;
        }
        .application-cost-page .cost-table thead th.text-right {
          text-align: right;
        }
        .application-cost-page .cost-table tbody tr {
          background-color: var(--background, #fff);
          transition: background-color 0.15s ease;
        }
        .application-cost-page .cost-table tbody tr:nth-child(even) {
          background-color: var(--muted, #f7f7f8);
        }
        .application-cost-page .cost-table tbody tr:hover {
          background-color: rgba(0, 0, 0, 0.04);
        }
        .application-cost-page .cost-table tbody td {
          padding: 12px 14px !important;
          border-bottom: 1px solid var(--border);
          font-size: 13.5px;
          color: var(--foreground);
        }
        .application-cost-page .cost-table tbody tr:last-child td {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
};

export default CostByApplication;
