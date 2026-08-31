import { QRCodeSVG } from "qrcode.react";

import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import type { Invoice } from "../../redux/apis/apisTenancyAdmin";
import { TENANCY_TONES, money } from "./tenancyKitUtils";

/**
 * Shared rendering for the tenant console and the tenant portal.
 *
 * The components are shared because the documents are identical — an invoice is
 * the same invoice whoever is looking at it. The COPY is not shared, and lives
 * in the screens.
 */

export const TenancyStatusBadge = ({ status }: { status?: string | null }) => (
  <Badge
    variant="outline"
    className={cn(
      "border font-medium",
      TENANCY_TONES[status || ""] || "border-border bg-muted text-muted-foreground"
    )}
  >
    {status || "—"}
  </Badge>
);

/**
 * The ZATCA QR.
 *
 * `zatcaQr` is a Base64-encoded TLV payload, generated once when the invoice was
 * issued and stored, so the code on the printed document always matches the
 * document. It is passed through **unchanged** — decoding, reformatting or
 * re-encoding it is exactly what ZATCA's tamper check exists to catch.
 */
export const ZatcaQr = ({ payload, size = 128 }: { payload?: string | null; size?: number }) => {
  if (!payload) return null;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="rounded-md bg-white p-2">
        <QRCodeSVG value={payload} size={size} level="M" />
      </div>
      <span className="text-[11px] text-muted-foreground">ZATCA</span>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-b-0">
    <span className="shrink-0 text-muted-foreground">{label}</span>
    <span className="min-w-0 break-words text-end font-medium text-foreground">{value ?? "—"}</span>
  </div>
);

/**
 * The document itself. Everything ZATCA requires on a printed invoice is here:
 * the QR, both VAT numbers and the per-line VAT breakdown. Values are printed
 * as given.
 */
export const InvoiceDocument = ({ invoice }: { invoice: Invoice }) => (
  <div className="space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="font-mono text-sm font-semibold">{invoice.invoiceNo}</div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <TenancyStatusBadge status={invoice.status} />
          <Badge variant="outline" className="border-border font-medium">
            {invoice.invoiceType}
          </Badge>
        </div>
      </div>
      <ZatcaQr payload={invoice.zatcaQr} />
    </div>

    <div className="grid gap-x-6 gap-y-0 md:grid-cols-2">
      <Row label="Seller" value={invoice.sellerName} />
      <Row label="Seller VAT" value={invoice.sellerVatNumber} />
      <Row label="Buyer" value={invoice.buyerName} />
      <Row label="Buyer VAT" value={invoice.buyerVatNumber} />
      <Row label="Issued" value={invoice.issueDate} />
      <Row label="Due" value={invoice.dueDate} />
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-start text-xs uppercase text-muted-foreground">
            <th className="py-2 text-start font-medium">#</th>
            <th className="py-2 text-start font-medium">Description</th>
            <th className="py-2 text-end font-medium">Qty</th>
            <th className="py-2 text-end font-medium">Unit</th>
            <th className="py-2 text-end font-medium">Subtotal</th>
            <th className="py-2 text-end font-medium">VAT</th>
            <th className="py-2 text-end font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines?.map((line) => (
            <tr key={line.lineNo} className="border-b border-border/60">
              <td className="py-2">{line.lineNo}</td>
              <td className="py-2">
                <div>{line.descriptionEn}</div>
                <div dir="rtl" className="text-xs text-muted-foreground">
                  {line.descriptionAr}
                </div>
              </td>
              <td className="py-2 text-end">{line.quantity}</td>
              <td className="py-2 text-end">{money(line.unitPrice)}</td>
              <td className="py-2 text-end">{money(line.lineSubtotal)}</td>
              <td className="py-2 text-end">{money(line.lineVatAmount)}</td>
              <td className="py-2 text-end font-medium">{money(line.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="ms-auto w-full max-w-xs">
      <Row label="Subtotal" value={money(invoice.subtotal, invoice.currency)} />
      <Row
        label={`VAT (${(Number(invoice.vatRate || 0) * 100).toFixed(0)}%)`}
        value={money(invoice.vatAmount, invoice.currency)}
      />
      <Row
        label="Total"
        value={
          <span className="text-base font-semibold">
            {money(invoice.totalAmount, invoice.currency)}
          </span>
        }
      />
    </div>
  </div>
);
