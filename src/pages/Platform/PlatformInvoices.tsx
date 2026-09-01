import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FileText, Loader2 } from "lucide-react";

import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/shared/detailKit";
import { LexPageHeader } from "../../components/shared/lexKit";
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

const PAGE_SIZE = 20;

/** Every invoice the platform has raised, across every tenant. */
const PlatformInvoices = () => {
  const [status, setStatus] = useState<InvoiceStatus | "">("");
  const [rows, setRows] = useState<Invoice[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState<Invoice | null>(null);

  const load = useCallback(
    async (nextPage: number, append: boolean) => {
      setIsLoading(true);
      try {
        const data = await getPlatformInvoices({ status, page: nextPage, size: PAGE_SIZE });
        setRows((prev) => (append ? [...prev, ...data] : data));
        setPage(nextPage);
        setHasMore(data.length === PAGE_SIZE);
      } catch (error) {
        toast.error(toTenancyError(error, "Could not load invoices.").message);
        if (!append) setRows([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [status]
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

  return (
    <div>
      <LexPageHeader icon={FileText} title="Platform Invoices" subtitle="Every invoice raised, across every tenant." />

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
        <div className="overflow-x-auto rounded-[2px] border border-[color-mix(in_srgb,var(--primary)_14%,var(--surface-border))]">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-[var(--theme-table-background-color)] text-xs uppercase tracking-wide text-white">
                <th className="px-3 py-2.5 text-start font-semibold">Invoice</th>
                <th className="px-3 py-2.5 text-start font-semibold">Type</th>
                <th className="px-3 py-2.5 text-start font-semibold">Buyer</th>
                <th className="px-3 py-2.5 text-start font-semibold">Issued</th>
                <th className="px-3 py-2.5 text-end font-semibold">Total</th>
                <th className="px-3 py-2.5 text-start font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((inv) => (
                <tr
                  key={inv.invoiceId}
                  className="cursor-pointer border-t border-[var(--surface-border)] transition-colors odd:bg-[var(--theme-table-row-alt)] hover:bg-[var(--theme-table-row-hover)]"
                  onClick={() => openInvoice(inv)}
                >
                  <td className="px-3 py-2.5 font-mono text-xs">{inv.invoiceNo}</td>
                  <td className="px-3 py-2.5">{inv.invoiceType}</td>
                  <td className="px-3 py-2.5">{inv.buyerName}</td>
                  <td className="px-3 py-2.5">{inv.issueDate}</td>
                  <td className="px-3 py-2.5 text-end">{money(inv.totalAmount, inv.currency)}</td>
                  <td className="px-3 py-2.5">
                    <TenancyStatusBadge status={inv.status} />
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

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        {/* `sm:max-w-3xl`, not `max-w-3xl`: DialogContent's own class carries
            `sm:max-w-lg`, and an unprefixed utility does not override a
            breakpoint-prefixed one — so a plain `max-w-3xl` left the dialog
            capped at 512px and the invoice clipped. */}
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            {/* Clear of the close button in the corner. */}
            <DialogTitle className="pe-8">Invoice {open?.invoiceNo}</DialogTitle>
          </DialogHeader>
          {/* The document scrolls, not the dialog. DialogContent is itself the
              scroll container, and the close button is positioned against it —
              so scrolling the dialog carried the only way out of it off the
              top of the screen. */}
          <div className="max-h-[70vh] overflow-y-auto pe-1">
            {open && <InvoiceDocument invoice={open} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlatformInvoices;
