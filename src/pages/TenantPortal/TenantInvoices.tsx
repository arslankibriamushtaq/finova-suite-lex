import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Eye, FileText, Printer } from "lucide-react";

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
import { InvoiceDocument, TenancyStatusBadge } from "../../components/shared/tenancyKit";
import { money } from "../../components/shared/tenancyKitUtils";
import {
  getMyInvoice,
  getMyInvoices,
  toTenancyError,
  type Invoice,
} from "../../redux/apis/apisTenancyAdmin";


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

  const load = useCallback(async (nextPage: number, append: boolean) => {
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
  }, [pageSize]);

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
        <div className="grid gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={FileText} text="No invoices yet." />
      ) : (
        <div className="no-table overflow-x-auto rounded-[2px] border border-[color-mix(in_srgb,var(--primary)_14%,var(--surface-border))]">
          <table className="w-full min-w-[800px] border-collapse text-sm">
            {/* The brand header the rest of the product's tables carry. */}
            <thead>
              <tr className="bg-[var(--theme-table-background-color)] text-xs uppercase tracking-wide text-white">
                <th className="px-3 py-2.5 text-start font-semibold">Invoice</th>
                <th className="px-3 py-2.5 text-start font-semibold">Type</th>
                <th className="px-3 py-2.5 text-start font-semibold">Issued</th>
                <th className="px-3 py-2.5 text-end font-semibold">Total</th>
                <th className="px-3 py-2.5 text-start font-semibold">Status</th>
                <th className="px-3 py-2.5 text-start font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((inv) => (
                <tr
                  key={inv.invoiceId}
                  className="group cursor-pointer border-t border-[var(--surface-border)] transition-colors odd:bg-[var(--theme-table-row-alt)] hover:bg-[var(--theme-table-row-hover)]"
                  onClick={() => openInvoice(inv)}
                >
                  <td className="px-3 py-2.5 font-mono text-xs">{inv.invoiceNo}</td>
                  <td className="px-3 py-2.5">{inv.invoiceType}</td>
                  <td className="px-3 py-2.5">{formatDate(inv.issueDate)}</td>
                  <td className="px-3 py-2.5 text-end font-medium tabular-nums">
                    {money(inv.totalAmount, inv.currency)}
                  </td>
                  <td className="px-3 py-2.5">
                    <TenancyStatusBadge status={inv.status} />
                  </td>
                  {/* The row opens the document, but nothing said so. The same
                      Select trigger the other tables use — `dropdown-toggle`
                      inside the `no-table` wrapper is what puts it under the
                      app's unified rule for row actions, so it carries no
                      colour or caret of its own. */}
                  <td className="px-3 py-2.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          className="dropdown-toggle"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Select
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            openInvoice(inv);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
