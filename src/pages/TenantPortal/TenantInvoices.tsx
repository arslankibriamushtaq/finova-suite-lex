import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FileText, Loader2, Printer } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/shared/detailKit";
import { LexPageHeader } from "../../components/shared/lexKit";
import { InvoiceDocument, TenancyStatusBadge } from "../../components/shared/tenancyKit";
import { money } from "../../components/shared/tenancyKitUtils";
import {
  getMyInvoice,
  getMyInvoices,
  toTenancyError,
  type Invoice,
} from "../../redux/apis/apisTenancyAdmin";

const PAGE_SIZE = 20;

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
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState<Invoice | null>(null);

  const load = useCallback(async (nextPage: number, append: boolean) => {
    setIsLoading(true);
    try {
      const data = await getMyInvoices({ page: nextPage, size: PAGE_SIZE });
      setRows((prev) => (append ? [...prev, ...data] : data));
      setPage(nextPage);
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      toast.error(toTenancyError(error, "Could not load your invoices.").message);
      if (!append) setRows([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  return (
    <div>
      <LexPageHeader icon={FileText} title="Billing & Invoices" subtitle="Every invoice we have issued you." />

      {isLoading && rows.length === 0 ? (
        <div className="d-grid gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={FileText} text="No invoices yet." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-2 text-start font-medium">Invoice</th>
                <th className="p-2 text-start font-medium">Type</th>
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
        {/* `sm:max-w-3xl` — DialogContent ships `sm:max-w-lg`, which an
            unprefixed `max-w-3xl` does not override. */}
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
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
          <div className="max-h-[70vh] overflow-y-auto pe-1">
            {open && <InvoiceDocument invoice={open} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantInvoices;
