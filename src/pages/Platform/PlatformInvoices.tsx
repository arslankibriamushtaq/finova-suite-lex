import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Eye, FileText } from "lucide-react";

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
import { LexPageHeader } from "../../components/shared/lexKit";
import TablePager from "../../components/shared/TablePager";
import TableView from "../../components/TableView/TableView";
import { InvoiceDocument, TenancyStatusBadge } from "../../components/shared/tenancyKit";
import { money } from "../../components/shared/tenancyKitUtils";
import {
  INVOICE_STATUSES,
  getPlatformInvoice,
  getPlatformInvoices,
  toTenancyError,
  type Invoice,
  type InvoiceStatus,
} from "../../redux/apis/apisTenancyAdmin";

/** Every invoice the platform has raised, across every tenant. */
/** A row is an invoice plus the register's own line number. */
type Row = Invoice & { Sr: number };

const PlatformInvoices = () => {
  const [status, setStatus] = useState<InvoiceStatus | "">("");
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
        const data = await getPlatformInvoices({ status, page: nextPage, size: pageSize });
        setRows((prev) => (append ? [...prev, ...data] : data));
        setPage(nextPage);
        setHasMore(data.length === pageSize);
      } catch (error) {
        toast.error(toTenancyError(error, "Could not load invoices.").message);
        if (!append) setRows([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [status, pageSize]
  );

  useEffect(() => {
    load(0, false);
  }, [load]);

  // The list rows are enough for a scan; the full document (lines + QR) is one
  // fetch away, so it is fetched when opened rather than for every row.
  const openInvoice = async (invoice: Invoice) => {
    setOpen(invoice);
    try {
      setOpen(await getPlatformInvoice(invoice.invoiceId));
    } catch (error) {
      toast.error(toTenancyError(error, "Could not load the full invoice.").message);
    }
  };

  /**
   * The register's own table, as on Tenants and the tenant portal.
   *
   * The pager stays off: TableView needs a row total to say "showing 1 to 10 of
   * 40", and /platform/invoices answers with a bare array. TablePager below
   * numbers only the pages it can prove exist.
   */
  const columns = [
    { name: "#", selector: (row: Row) => row.Sr, width: "60px" },
    {
      name: "Invoice",
      cell: (row: Row) => <span className="font-mono text-xs">{row.invoiceNo}</span>,
    },
    { name: "Type", selector: (row: Row) => row.invoiceType },
    { name: "Buyer", selector: (row: Row) => row.buyerName || "—" },
    { name: "Issued", selector: (row: Row) => row.issueDate },
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
            {/* No icon of our own: `dropdown-toggle` is a Bootstrap class and
                draws its own caret through ::after. */}
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

  // The line number counts across pages, the way a register's does.
  const mapped: Row[] = rows.map((invoice, index) => ({
    ...invoice,
    Sr: page * pageSize + index + 1,
  }));

  return (
    <div>
      <LexPageHeader
        icon={FileText}
        title="Platform Invoices"
        subtitle="Every invoice raised, across every tenant."
      />

      <div
        role="group"
        aria-label="Filter by status"
        className="no-card mb-3 flex flex-wrap items-center gap-1.5"
      >
        <Button
          size="sm"
          aria-pressed={status === ""}
          variant={status === "" ? "default" : "outline"}
          onClick={() => setStatus("")}
        >
          All
        </Button>
        {INVOICE_STATUSES.map((s) => (
          <Button
            key={s}
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
        <EmptyState icon={FileText} text="No invoices match this filter." />
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
        {/* `sm:max-w-3xl`, not `max-w-3xl`: DialogContent's own class carries
            `sm:max-w-lg`, and an unprefixed utility does not override a
            breakpoint-prefixed one — so a plain `max-w-3xl` left the dialog
            capped at 512px and the invoice clipped. */}
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader className="no-print">
            {/* Clear of the close button in the corner. */}
            <DialogTitle className="pe-8">Invoice {open?.invoiceNo}</DialogTitle>
          </DialogHeader>
          {/* The document scrolls, not the dialog. DialogContent is itself the
              scroll container, and the close button is positioned against it —
              so scrolling the dialog carried the only way out of it off the
              top of the screen. */}
          <div className="print-area max-h-[70vh] overflow-y-auto pe-1">
            {open && <InvoiceDocument invoice={open} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlatformInvoices;
