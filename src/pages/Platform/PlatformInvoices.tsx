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

      <div className="mb-3 d-flex flex-wrap gap-1">
        <Button size="sm" variant={status === "" ? "default" : "outline"} onClick={() => setStatus("")}>
          All
        </Button>
        {INVOICE_STATUSES.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? "default" : "outline"}
            onClick={() => setStatus(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      {isLoading && rows.length === 0 ? (
        <div className="d-grid gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={FileText} text="No invoices match this filter." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-2 text-start font-medium">Invoice</th>
                <th className="p-2 text-start font-medium">Type</th>
                <th className="p-2 text-start font-medium">Buyer</th>
                <th className="p-2 text-start font-medium">Issued</th>
                <th className="p-2 text-end font-medium">Total</th>
                <th className="p-2 text-start font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((inv) => (
                <tr
                  key={inv.invoiceId}
                  className="cursor-pointer border-t border-border/60 hover:bg-muted/30"
                  onClick={() => openInvoice(inv)}
                >
                  <td className="p-2 font-mono text-xs">{inv.invoiceNo}</td>
                  <td className="p-2">{inv.invoiceType}</td>
                  <td className="p-2">{inv.buyerName}</td>
                  <td className="p-2">{inv.issueDate}</td>
                  <td className="p-2 text-end">{money(inv.totalAmount, inv.currency)}</td>
                  <td className="p-2">
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice {open?.invoiceNo}</DialogTitle>
          </DialogHeader>
          {open && <InvoiceDocument invoice={open} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlatformInvoices;
