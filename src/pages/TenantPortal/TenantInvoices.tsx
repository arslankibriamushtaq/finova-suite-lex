import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Eye, FileText, Printer, RefreshCw } from "lucide-react";

import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/shared/detailKit";
import { formatDate } from "../../components/shared/detailKitUtils";
import { LexPageHeader } from "../../components/shared/lexKit";
import TablePager from "../../components/shared/TablePager";
import TableView from "../../components/TableView/TableView";
import { InvoiceDocument, TenancyStatusBadge } from "../../components/shared/tenancyKit";
import { money } from "../../components/shared/tenancyKitUtils";
import {
  getMyInvoice,
  getMyInvoices,
  toTenancyError,
  type Invoice,
} from "../../redux/apis/apisTenancyAdmin";

/** A row is an invoice plus the register's own line number. */
type Row = Invoice & { Sr: number };

/**
 * The portal's real value: the documents this customer's accountant files.
 *
 * The printed copy carries the ZATCA QR, both VAT numbers and the per-line VAT
 * breakdown — printing is `window.print()` on the opened document rather than a
 * generated PDF, so what is filed is exactly what the service issued.
 */
const TenantInvoices = () => {
  const [rows, setRows] = useState<Invoice[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState<Invoice | null>(null);

  const load = useCallback(
    async (nextPage: number, append: boolean) => {
      setIsLoading(true);
      try {
        const data = await getMyInvoices({ page: nextPage, size: pageSize });
        setRows((prev) => (append ? [...prev, ...data] : data));
        setPage(nextPage);
        setHasMore(data.length === pageSize);
      } catch (error) {
        toast.error(toTenancyError(error, "Could not load your invoices.").message);
        if (!append) setRows([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    load(0, false);
  }, [load]);

  const openInvoice = async (invoice: Invoice) => {
    setOpen(invoice);
    try {
      setOpen(await getMyInvoice(invoice.invoiceId));
    } catch (error) {
      toast.error(toTenancyError(error, "Could not load the full invoice.").message);
    }
  };

  /**
   * The register's own table, not a hand-rolled one.
   *
   * TableView is what every other list in the product renders, so reusing it is
   * what makes this page look like the rest rather than an approximation that
   * drifts. Its pager is switched off: it needs a row total to say "showing 1
   * to 10 of 40", and /tenant-portal/invoices answers with a bare array — no
   * count, no page metadata. TablePager below numbers only the pages it can
   * prove exist instead of stating a total nobody sent.
   */
  const columns = [
    { name: "#", selector: (row: Row) => row.Sr, width: "60px" },
    {
      name: "Invoice",
      cell: (row: Row) => <span className="font-mono text-xs">{row.invoiceNo}</span>,
    },
    { name: "Type", selector: (row: Row) => row.invoiceType },
    { name: "Issued", selector: (row: Row) => formatDate(row.issueDate) },
    {
      name: "Total",
      cell: (row: Row) => (
        <span className="font-medium tabular-nums">{money(row.totalAmount, row.currency)}</span>
      ),
    },
    { name: "Status", cell: (row: Row) => <TenancyStatusBadge status={row.status} /> },
    {
      name: "Action",
      width: "10%",
      cell: (row: Row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="dropdown-toggle">
              Select
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2" onClick={() => openInvoice(row)}>
              <Eye className="h-3.5 w-3.5" />
              View invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // The row number is the position in the whole list, not on this page, so it
  // keeps counting across pages the way a register's does.
  const mapped: Row[] = rows.map((inv, index) => ({
    ...inv,
    Sr: page * pageSize + index + 1,
  }));

  return (
    <div>
      <LexPageHeader
        icon={FileText}
        title="Billing & Invoices"
        subtitle="Every invoice we have issued you."
      />

      {/* The register pages all carry a control row above the table, and its
          absence here is most of why this one looked like a different product.

          It holds what this endpoint actually supports. The console's invoice
          list filters by status; /tenant-portal/invoices takes only page and
          size, so there is no status filter to offer — and one that filtered
          the page in the browser would silently hide rows that are simply on
          another page, which is worse than not having it. */}
      <div className="no-card mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {rows.length > 0
            ? `Showing ${rows.length} invoice${rows.length === 1 ? "" : "s"}`
            : "No invoices yet"}
        </span>
        <Button size="sm" variant="outline" onClick={() => load(page, false)} disabled={isLoading}>
          <RefreshCw className={`me-1 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isLoading && rows.length === 0 ? (
        <div className="grid gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={FileText} text="No invoices yet." />
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

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        {/* `sm:max-w-3xl` — DialogContent ships `sm:max-w-lg`, which an
            unprefixed `max-w-3xl` does not override. */}
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader className="no-print">
            {/* The print action sits beside the title but clear of the close
                button in the corner. */}
            <DialogTitle className="flex items-center justify-between gap-2 pe-8">
              <span className="min-w-0 truncate">Invoice {open?.invoiceNo}</span>
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                <Printer className="me-1 h-4 w-4" />
                Print
              </Button>
            </DialogTitle>
          </DialogHeader>
          {/* The document scrolls, not the dialog — the close button is
              positioned against DialogContent and would scroll away with it. */}
          <div className="print-area max-h-[70vh] overflow-y-auto pe-1">
            {open && <InvoiceDocument invoice={open} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantInvoices;
